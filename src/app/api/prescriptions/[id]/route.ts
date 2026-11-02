import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        doctor: {
          include: { department: true },
        },
        items: {
          include: { medicine: true },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error('Failed to get prescription:', error);
    return NextResponse.json({ error: 'Failed to retrieve prescription' }, { status: 500 });
  }
}
