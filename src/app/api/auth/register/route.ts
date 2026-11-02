import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PATIENT', 'RECEPTIONIST', 'DOCTOR', 'ADMIN']).default('PATIENT'),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dob: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase().trim(),
        password: hashedPassword,
        role: validated.role,
        phone: validated.phone || null,
      },
    });

    // If registering as a patient, also auto-create the Patient EHR profile
    if (validated.role === 'PATIENT') {
      const patientCount = await prisma.patient.count();
      const patientId = `PAT-${2000 + patientCount + 1}`;

      await prisma.patient.create({
        data: {
          patientId,
          userId: user.id,
          fullName: validated.name,
          email: validated.email.toLowerCase().trim(),
          contact: validated.phone || '+1 (555) 000-0000',
          dob: validated.dob ? new Date(validated.dob) : new Date('1990-01-01'),
          gender: validated.gender || 'MALE',
          bloodGroup: validated.bloodGroup || 'O+',
          address: validated.address || 'Address on file',
          emergencyContact: validated.phone || '+1 (555) 000-0000',
          emergencyContactRelation: 'Self / Contact',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'USER',
        entityId: user.id,
        details: `New user registered with role ${user.role} and email ${user.email}`,
      },
    });

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error occurred during registration' }, { status: 500 });
  }
}
