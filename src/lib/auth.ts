import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            doctor: true,
            patient: true,
            staff: true,
          },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account has been deactivated. Please contact administrator.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Record audit log for login
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN',
              entity: 'USER',
              entityId: user.id,
              details: `User ${user.email} logged in with role ${user.role}`,
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
        } catch (e) {
          console.error('Failed to log login event:', e);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          doctorId: user.doctor?.id,
          patientId: user.patient?.id,
          staffId: user.staff?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
        token.doctorId = (user as any).doctorId;
        token.patientId = (user as any).patientId;
        token.staffId = (user as any).staffId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
        (session.user as any).doctorId = token.doctorId;
        (session.user as any).patientId = token.patientId;
        (session.user as any).staffId = token.staffId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'mednexus-secret-key-healthcare-production-2026',
};
