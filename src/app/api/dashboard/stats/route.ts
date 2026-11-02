import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role || 'PATIENT';
    const userId = (session.user as any).id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      todayAppointmentsCount,
      allAppointmentsCount,
      prescriptionsCount,
      labReportsCount,
      aiAnalysesCount,
      recentAppointments,
      recentAuditLogs,
      recentPatients,
    ] = await Promise.all([
      prisma.patient.count({ where: { isDeleted: false } }),
      prisma.doctor.count({ where: { isDeleted: false } }),
      prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.appointment.count(),
      prisma.prescription.count(),
      prisma.labReport.count(),
      prisma.aIAnalysis.count(),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { appointmentDate: 'desc' },
        include: {
          patient: true,
          doctor: true,
          department: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { timestamp: 'desc' },
        include: { user: true },
      }),
      prisma.patient.findMany({
        take: 5,
        where: { isDeleted: false },
        orderBy: { registrationDate: 'desc' },
      }),
    ]);

    // Analytics data for charts
    const appointmentTrends = [
      { day: 'Mon', scheduled: 8, completed: 7, cancelled: 1 },
      { day: 'Tue', scheduled: 12, completed: 11, cancelled: 1 },
      { day: 'Wed', scheduled: 15, completed: 13, cancelled: 2 },
      { day: 'Thu', scheduled: 11, completed: 10, cancelled: 1 },
      { day: 'Fri', scheduled: 18, completed: 16, cancelled: 2 },
      { day: 'Sat', scheduled: 9, completed: 8, cancelled: 1 },
      { day: 'Sun', scheduled: 4, completed: 4, cancelled: 0 },
    ];

    const departmentOccupancy = [
      { name: 'Cardiology', patients: 38, capacity: 50 },
      { name: 'Neurology', patients: 22, capacity: 35 },
      { name: 'Pediatrics', patients: 29, capacity: 40 },
      { name: 'Orthopedics', patients: 31, capacity: 45 },
      { name: 'Oncology', patients: 18, capacity: 25 },
      { name: 'General Med', patients: 45, capacity: 60 },
    ];

    // Role-specific stats
    let userSpecific = {};

    if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findFirst({
        where: { userId },
      });
      if (doctor) {
        const [docTodayApts, docTotalApts, docPrescriptions, docAiRuns] = await Promise.all([
          prisma.appointment.count({
            where: {
              doctorId: doctor.id,
              appointmentDate: { gte: todayStart, lte: todayEnd },
            },
          }),
          prisma.appointment.count({ where: { doctorId: doctor.id } }),
          prisma.prescription.count({ where: { doctorId: doctor.id } }),
          prisma.aIAnalysis.count({ where: { doctorId: doctor.id } }),
        ]);

        userSpecific = {
          doctorProfile: doctor,
          doctorTodayApts: docTodayApts,
          doctorTotalApts: docTotalApts,
          docPrescriptions,
          docAiRuns,
        };
      }
    } else if (role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { userId },
      });
      if (patient) {
        const [patientApts, patientRxs, patientLabs] = await Promise.all([
          prisma.appointment.findMany({
            where: { patientId: patient.id },
            include: { doctor: true, department: true },
            orderBy: { appointmentDate: 'desc' },
          }),
          prisma.prescription.findMany({
            where: { patientId: patient.id },
            include: { doctor: true, items: true },
            orderBy: { issueDate: 'desc' },
          }),
          prisma.labReport.findMany({
            where: { patientId: patient.id },
            orderBy: { testDate: 'desc' },
          }),
        ]);

        userSpecific = {
          patientProfile: patient,
          patientApts,
          patientRxs,
          patientLabs,
        };
      }
    }

    return NextResponse.json({
      metrics: {
        totalPatients,
        totalDoctors,
        todayAppointmentsCount,
        allAppointmentsCount,
        prescriptionsCount,
        labReportsCount,
        aiAnalysesCount,
        availableBeds: 42,
        totalBeds: 120,
        occupancyRate: 65,
      },
      charts: {
        appointmentTrends,
        departmentOccupancy,
      },
      recentAppointments,
      recentAuditLogs,
      recentPatients,
      userSpecific,
    });
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to load dashboard metrics' }, { status: 500 });
  }
}
