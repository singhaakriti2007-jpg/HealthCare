import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runClinicalDecisionSupport } from '@/lib/ai-engine';
import { z } from 'zod';

const aiAnalysisSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  doctorId: z.string().optional(),
  symptoms: z.string().min(3, 'Symptoms description is required'),
  symptomDuration: z.string().min(1, 'Duration is required'),
  vitals: z.object({
    temp: z.coerce.number().optional(),
    bpSystolic: z.coerce.number().optional(),
    bpDiastolic: z.coerce.number().optional(),
    hr: z.coerce.number().optional(),
    spo2: z.coerce.number().optional(),
    respiratoryRate: z.coerce.number().optional(),
  }),
  existingConditions: z.string().optional(),
  allergies: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    const where: any = {};
    if (patientId && patientId !== 'ALL') where.patientId = patientId;

    const analyses = await prisma.aIAnalysis.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { department: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Failed to get AI analyses:', error);
    return NextResponse.json({ error: 'Failed to retrieve analysis records' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'DOCTOR' && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'AI Healthcare Decision Support module is restricted to licensed physicians and administrators.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = aiAnalysisSchema.parse(body);

    const patient = await prisma.patient.findUnique({
      where: { id: validated.patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient EHR not found' }, { status: 404 });
    }

    let doctorId = validated.doctorId;
    if (!doctorId && role === 'DOCTOR') {
      const doc = await prisma.doctor.findFirst({ where: { userId: (session.user as any).id } });
      if (doc) doctorId = doc.id;
    }

    if (!doctorId) {
      const defaultDoc = await prisma.doctor.findFirst();
      doctorId = defaultDoc?.id;
    }

    // Calculate age from DOB
    const age = Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Run Clinical AI Expert Engine
    const decisionSupport = runClinicalDecisionSupport({
      patientId: patient.patientId,
      patientName: patient.fullName,
      age,
      gender: patient.gender,
      symptoms: validated.symptoms,
      symptomDuration: validated.symptomDuration,
      vitals: validated.vitals,
      existingConditions: validated.existingConditions || patient.medicalHistory || undefined,
      allergies: validated.allergies || patient.allergies || undefined,
    });

    // Persist AI Analysis Record in 3NF schema
    const savedRecord = await prisma.aIAnalysis.create({
      data: {
        patientId: patient.id,
        doctorId: doctorId!,
        symptoms: validated.symptoms,
        symptomDuration: validated.symptomDuration,
        vitals: JSON.stringify({
          temp: validated.vitals.temp,
          bp: `${validated.vitals.bpSystolic || '-'}/${validated.vitals.bpDiastolic || '-'}`,
          hr: validated.vitals.hr,
          spo2: validated.vitals.spo2,
          respiratoryRate: validated.vitals.respiratoryRate,
        }),
        existingConditions: validated.existingConditions || patient.medicalHistory || null,
        allergies: validated.allergies || patient.allergies || null,
        patientSummary: decisionSupport.patientSummary,
        differentialSuggestions: JSON.stringify(decisionSupport.differentialSuggestions),
        clinicalObservations: decisionSupport.clinicalObservations,
        recommendedNextSteps: JSON.stringify(decisionSupport.recommendedNextSteps),
        redFlags: JSON.stringify(decisionSupport.redFlags),
        disclaimer: decisionSupport.disclaimer,
        reviewedByDoctor: false,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'AI_ANALYSIS_RUN',
        entity: 'AI_ANALYSIS',
        entityId: savedRecord.id,
        details: `Generated AI Clinical Decision Support for patient ${patient.fullName} (${patient.patientId})`,
      },
    });

    return NextResponse.json({
      analysisId: savedRecord.id,
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        fullName: patient.fullName,
        age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
      },
      result: decisionSupport,
      createdAt: savedRecord.createdAt,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to run AI analysis:', error);
    return NextResponse.json({ error: 'Clinical AI inference failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, reviewedByDoctor, clinicianNotes } = await req.json();

    const updated = await prisma.aIAnalysis.update({
      where: { id },
      data: {
        reviewedByDoctor: Boolean(reviewedByDoctor),
        clinicianNotes: clinicianNotes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'CLINICIAN_REVIEW_AI',
        entity: 'AI_ANALYSIS',
        entityId: updated.id,
        details: `Clinician signed off on AI Decision Analysis ${updated.id}`,
      },
    });

    return NextResponse.json({ analysis: updated });
  } catch (error) {
    console.error('Failed to update clinician review:', error);
    return NextResponse.json({ error: 'Failed to record doctor review' }, { status: 500 });
  }
}
