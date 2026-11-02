import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const labReportSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  testName: z.string().min(2, 'Test name is required'),
  category: z.string().min(2, 'Category is required'),
  testParameters: z.string().min(2, 'Test parameters JSON is required'),
  summary: z.string().optional(),
  technicianName: z.string().optional(),
  referredByDoctor: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']).default('COMPLETED'),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const category = searchParams.get('category');

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const where: any = {};
    if (role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({ where: { userId } });
      if (patient) where.patientId = patient.id;
    }

    if (patientId && patientId !== 'ALL') where.patientId = patientId;
    if (category && category !== 'ALL') where.category = category;

    const labReports = await prisma.labReport.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: { testDate: 'desc' },
    });

    return NextResponse.json({ labReports });
  } catch (error) {
    console.error('Failed to get lab reports:', error);
    return NextResponse.json({ error: 'Failed to retrieve laboratory reports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = labReportSchema.parse(body);

    const count = await prisma.labReport.count();
    const reportId = `LAB-${6000 + count + 1}`;

    const report = await prisma.labReport.create({
      data: {
        reportId,
        patientId: validated.patientId,
        testName: validated.testName,
        category: validated.category,
        testParameters: validated.testParameters,
        summary: validated.summary || null,
        technicianName: validated.technicianName || 'Clinical Laboratory Technologist',
        referredByDoctor: validated.referredByDoctor || 'Attending Physician',
        status: validated.status,
        resultDate: new Date(),
      },
      include: { patient: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'CREATE_LAB_REPORT',
        entity: 'LAB_REPORT',
        entityId: report.id,
        details: `Published laboratory investigation ${report.reportId} (${report.testName}) for ${report.patient.fullName}`,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create lab report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
