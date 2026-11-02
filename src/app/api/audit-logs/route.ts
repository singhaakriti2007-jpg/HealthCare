import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const action = searchParams.get('action');

    const where: any = {};
    if (action && action !== 'ALL') where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit trail' }, { status: 500 });
  }
}
