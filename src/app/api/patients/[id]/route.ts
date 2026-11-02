import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  dob: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  contact: z.string().min(5).optional(),
  email: z.string().email().optional(),
  address: z.string().min(3).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergencyContact: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          include: { doctor: true, department: true },
          orderBy: { appointmentDate: 'desc' },
        },
        prescriptions: {
          include: { doctor: true, items: true },
          orderBy: { issueDate: 'desc' },
        },
        labReports: {
          orderBy: { testDate: 'desc' },
        },
        aiAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!patient || patient.isDeleted) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Failed to get patient:', error);
    return NextResponse.json({ error: 'Failed to retrieve patient details' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateSchema.parse(body);

    const data: any = { ...validated };
    if (validated.dob) {
      data.dob = new Date(validated.dob);
    }

    const updated = await prisma.patient.update({
      where: { id: params.id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'UPDATE_PATIENT',
        entity: 'PATIENT',
        entityId: updated.id,
        details: `Updated demographics for patient ${updated.patientId}`,
      },
    });

    return NextResponse.json({ patient: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to update patient:', error);
    return NextResponse.json({ error: 'Failed to update patient record' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can soft-delete patient records' }, { status: 403 });
    }

    const deleted = await prisma.patient.update({
      where: { id: params.id },
      data: { isDeleted: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'DELETE_PATIENT',
        entity: 'PATIENT',
        entityId: deleted.id,
        details: `Soft-deleted patient ${deleted.patientId} (${deleted.fullName})`,
      },
    });

    return NextResponse.json({ message: 'Patient removed successfully' });
  } catch (error) {
    console.error('Failed to delete patient:', error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
