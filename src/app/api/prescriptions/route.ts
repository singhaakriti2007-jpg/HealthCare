import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const prescriptionItemSchema = z.object({
  medicineId: z.string().optional(),
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required (e.g. 500mg)'),
  frequency: z.string().min(1, 'Frequency is required (e.g. Twice daily)'),
  duration: z.string().min(1, 'Duration is required (e.g. 7 days)'),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().optional(),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one medicine must be prescribed'),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const where: any = {};
    if (role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({ where: { userId } });
      if (patient) where.patientId = patient.id;
    } else if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findFirst({ where: { userId } });
      if (doctor) where.doctorId = doctor.id;
    }

    if (patientId && patientId !== 'ALL') where.patientId = patientId;
    if (doctorId && doctorId !== 'ALL') where.doctorId = doctorId;

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: { department: true },
        },
        items: {
          include: { medicine: true },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error('Failed to get prescriptions:', error);
    return NextResponse.json({ error: 'Failed to retrieve prescriptions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'DOCTOR' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only licensed doctors or admins can issue prescriptions' }, { status: 403 });
    }

    const body = await req.json();
    const validated = prescriptionSchema.parse(body);

    let docId = validated.doctorId;
    if (!docId && userRole === 'DOCTOR') {
      const doctor = await prisma.doctor.findFirst({ where: { userId: (session.user as any).id } });
      if (doctor) docId = doctor.id;
    }

    if (!docId) {
      const defaultDoc = await prisma.doctor.findFirst();
      docId = defaultDoc?.id;
    }

    const count = await prisma.prescription.count();
    const prescriptionId = `RX-${5000 + count + 1}`;

    // ACID Transaction for Prescription header and items
    const createdPrescription = await prisma.$transaction(async (tx) => {
      const rx = await tx.prescription.create({
        data: {
          prescriptionId,
          patientId: validated.patientId,
          doctorId: docId!,
          appointmentId: validated.appointmentId || null,
          diagnosis: validated.diagnosis,
          notes: validated.notes || null,
          status: 'ACTIVE',
        },
      });

      for (const item of validated.items) {
        await tx.prescriptionItem.create({
          data: {
            prescriptionId: rx.id,
            medicineId: item.medicineId || null,
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions || null,
          },
        });
      }

      return rx;
    });

    const fullRx = await prisma.prescription.findUnique({
      where: { id: createdPrescription.id },
      include: {
        patient: true,
        doctor: { include: { department: true } },
        items: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'GENERATE_PRESCRIPTION',
        entity: 'PRESCRIPTION',
        entityId: fullRx?.id,
        details: `Issued Prescription ${fullRx?.prescriptionId} for ${fullRx?.patient.fullName} with ${validated.items.length} medications`,
      },
    });

    return NextResponse.json({ prescription: fullRx }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create prescription:', error);
    return NextResponse.json({ error: 'Failed to issue prescription' }, { status: 500 });
  }
}
