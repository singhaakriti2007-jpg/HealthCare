import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            doctors: true,
            appointments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error('Failed to get departments:', error);
    return NextResponse.json({ error: 'Failed to retrieve departments' }, { status: 500 });
  }
}
