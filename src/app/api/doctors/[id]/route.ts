import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  contact: z.string().min(5).optional(),
  departmentId: z.string().optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.coerce.number().optional(),
  consultationFee: z.coerce.number().optional(),
  consultationTimings: z.string().optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'ON_LEAVE', 'BUSY']).optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        appointments: {
          include: { patient: true },
          orderBy: { appointmentDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!doctor || doctor.isDeleted) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error('Failed to get doctor:', error);
    return NextResponse.json({ error: 'Failed to retrieve doctor' }, { status: 500 });
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

    const updated = await prisma.doctor.update({
      where: { id: params.id },
      data: validated,
      include: { department: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'UPDATE_DOCTOR',
        entity: 'DOCTOR',
        entityId: updated.id,
        details: `Updated profile for doctor ${updated.doctorId} (${updated.name})`,
      },
    });

    return NextResponse.json({ doctor: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to update doctor:', error);
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can remove doctors' }, { status: 403 });
    }

    await prisma.doctor.update({
      where: { id: params.id },
      data: { isDeleted: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'DELETE_DOCTOR',
        entity: 'DOCTOR',
        entityId: params.id,
        details: `Deactivated doctor profile ${params.id}`,
      },
    });

    return NextResponse.json({ message: 'Doctor deactivated successfully' });
  } catch (error) {
    console.error('Failed to delete doctor:', error);
    return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
  }
}
