import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error('Failed to get medicines:', error);
    return NextResponse.json({ error: 'Failed to retrieve formulary medicines' }, { status: 500 });
  }
}
