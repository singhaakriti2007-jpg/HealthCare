import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const doctorSchema = z.object({
  name: z.string().min(2, 'Doctor name is required'),
  email: z.string().email('Valid email is required'),
  contact: z.string().min(5, 'Valid contact is required'),
  departmentId: z.string().min(1, 'Department is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  experience: z.coerce.number().min(0),
  consultationFee: z.coerce.number().min(0).default(60),
  consultationTimings: z.string().default('09:00 AM - 01:00 PM, 04:00 PM - 07:00 PM'),
  availabilityStatus: z.enum(['AVAILABLE', 'ON_LEAVE', 'BUSY']).default('AVAILABLE'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    const where: any = { isDeleted: false };
    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId;
    }
    if (status && status !== 'ALL') {
      where.availabilityStatus = status;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error('Failed to get doctors:', error);
    return NextResponse.json({ error: 'Failed to retrieve doctors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can onboard doctors' }, { status: 403 });
    }

    const body = await req.json();
    const validated = doctorSchema.parse(body);

    const docCount = await prisma.doctor.count();
    const doctorId = `DOC-${1000 + docCount + 1}`;

    const newDoctor = await prisma.doctor.create({
      data: {
        doctorId,
        name: validated.name,
        email: validated.email,
        contact: validated.contact,
        departmentId: validated.departmentId,
        specialization: validated.specialization,
        qualification: validated.qualification,
        experience: validated.experience,
        consultationFee: validated.consultationFee,
        consultationTimings: validated.consultationTimings,
        availabilityStatus: validated.availabilityStatus,
      },
      include: { department: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'CREATE_DOCTOR',
        entity: 'DOCTOR',
        entityId: newDoctor.id,
        details: `Onboarded doctor ${newDoctor.doctorId} (${newDoctor.name}) in ${newDoctor.department.name}`,
      },
    });

    return NextResponse.json({ doctor: newDoctor }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create doctor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
