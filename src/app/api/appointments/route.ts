import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  departmentId: z.string().min(1, 'Department is required'),
  appointmentDate: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  type: z.enum(['GENERAL', 'FOLLOW_UP', 'EMERGENCY', 'CONSULTATION']).default('GENERAL'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const where: any = {};

    // Role-based scoping
    if (role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({ where: { userId } });
      if (patient) {
        where.patientId = patient.id;
      }
    } else if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findFirst({ where: { userId } });
      if (doctor) {
        where.doctorId = doctor.id;
      }
    }

    if (doctorId && doctorId !== 'ALL') where.doctorId = doctorId;
    if (patientId && patientId !== 'ALL') where.patientId = patientId;
    if (status && status !== 'ALL') where.status = status;

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.appointmentDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: { department: true },
        },
        department: true,
      },
      orderBy: { appointmentDate: 'desc' },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Failed to get appointments:', error);
    return NextResponse.json({ error: 'Failed to retrieve appointments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = appointmentSchema.parse(body);

    const bookingDate = new Date(validated.appointmentDate);
    // Standardize date to midnight for slot matching
    const dayStart = new Date(bookingDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(bookingDate);
    dayEnd.setHours(23, 59, 59, 999);

    // CRITICAL: Double-Booking Prevention Rule
    // Check if the doctor already has an active appointment at that date & timeSlot
    const existingConflict = await prisma.appointment.findFirst({
      where: {
        doctorId: validated.doctorId,
        appointmentDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        timeSlot: validated.timeSlot,
        status: {
          notIn: ['CANCELLED'],
        },
      },
      include: { doctor: true },
    });

    if (existingConflict) {
      return NextResponse.json(
        {
          error: `Time Slot Conflict: ${existingConflict.doctor.name} already has a booked appointment for ${validated.timeSlot} on this date. Please select a different slot.`,
        },
        { status: 409 }
      );
    }

    const count = await prisma.appointment.count();
    const appointmentId = `APT-${4000 + count + 1}`;

    const newAppointment = await prisma.appointment.create({
      data: {
        appointmentId,
        patientId: validated.patientId,
        doctorId: validated.doctorId,
        departmentId: validated.departmentId,
        appointmentDate: bookingDate,
        timeSlot: validated.timeSlot,
        type: validated.type,
        reason: validated.reason || null,
        notes: validated.notes || null,
        status: 'CONFIRMED',
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'BOOK_APPOINTMENT',
        entity: 'APPOINTMENT',
        entityId: newAppointment.id,
        details: `Booked appointment ${newAppointment.appointmentId} for Patient ${newAppointment.patient.fullName} with ${newAppointment.doctor.name} on ${validated.timeSlot}`,
      },
    });

    return NextResponse.json({ appointment: newAppointment }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to book appointment:', error);
    return NextResponse.json({ error: 'Failed to process appointment booking' }, { status: 500 });
  }
}
