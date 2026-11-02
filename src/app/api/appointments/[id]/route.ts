import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
  timeSlot: z.string().optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        doctor: { include: { department: true } },
        department: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Failed to get appointment:', error);
    return NextResponse.json({ error: 'Failed to retrieve appointment' }, { status: 500 });
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

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: validated,
      include: {
        patient: true,
        doctor: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'UPDATE_APPOINTMENT_STATUS',
        entity: 'APPOINTMENT',
        entityId: updated.id,
        details: `Updated appointment ${updated.appointmentId} status to ${updated.status}`,
      },
    });

    return NextResponse.json({ appointment: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to update appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment status' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
