import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const patientSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dob: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  contact: z.string().min(5, 'Valid contact number is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(3, 'Address is required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
  emergencyContactRelation: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const bloodGroup = searchParams.get('bloodGroup') || '';
    const gender = searchParams.get('gender') || '';

    const where: any = { isDeleted: false };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { patientId: { contains: search } },
        { email: { contains: search } },
        { contact: { contains: search } },
      ];
    }

    if (bloodGroup && bloodGroup !== 'ALL') {
      where.bloodGroup = bloodGroup;
    }

    if (gender && gender !== 'ALL') {
      where.gender = gender;
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { registrationDate: 'desc' },
      include: {
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
            labReports: true,
          },
        },
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Failed to get patients:', error);
    return NextResponse.json({ error: 'Failed to retrieve patients' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole === 'PATIENT') {
      return NextResponse.json({ error: 'Patients cannot register other patients' }, { status: 403 });
    }

    const body = await req.json();
    const validated = patientSchema.parse(body);

    const count = await prisma.patient.count();
    const patientId = `PAT-${2000 + count + 1}`;

    const newPatient = await prisma.patient.create({
      data: {
        patientId,
        fullName: validated.fullName,
        dob: new Date(validated.dob),
        gender: validated.gender,
        contact: validated.contact,
        email: validated.email,
        address: validated.address,
        bloodGroup: validated.bloodGroup,
        emergencyContact: validated.emergencyContact,
        emergencyContactRelation: validated.emergencyContactRelation || null,
        medicalHistory: validated.medicalHistory || null,
        allergies: validated.allergies || null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'CREATE_PATIENT',
        entity: 'PATIENT',
        entityId: newPatient.id,
        details: `Created patient record ${newPatient.patientId} (${newPatient.fullName})`,
      },
    });

    return NextResponse.json({ patient: newPatient }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
