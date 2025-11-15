import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { queryOne } from './db'

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 NextAuth authorize called with:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null
        }

        try {
          console.log('🔍 Looking up user:', credentials.email);
          
          // Requête MySQL directe pour récupérer l'utilisateur
          const user = await queryOne(
            `SELECT id, email, name, password, role, emailVerified, isBlocked, blockedReason 
             FROM User 
             WHERE email = ?`,
            [credentials.email]
          );

          console.log('🔍 User found:', !!user);
          console.log('🔍 User details:', user ? {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hasPassword: !!user.password,
            emailVerified: user.emailVerified,
            isBlocked: user.isBlocked
          } : 'No user');

          if (!user) {
            console.log('❌ User not found');
            return null
          }

          // For OAuth users, password might not be set
          if (!user.password) {
            console.log('❌ No password set for user');
            return null
          }

          console.log('🔍 Verifying password...');
          console.log('🔍 Stored password hash:', user.password.substring(0, 20) + '...');
          console.log('🔍 Input password:', credentials.password);
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('🔍 Password valid:', isPasswordValid);
          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return null
          }

          // Vérifier si l'email est vérifié
          console.log('🔍 Email verified:', !!user.emailVerified);
          if (!user.emailVerified) {
            console.log('❌ Email not verified - but allowing for admin');
            // Pour l'admin, on permet même si l'email n'est pas vérifié
            if (user.role !== 'ADMIN') {
              return null
            }
          }

          // Vérifier si l'utilisateur est bloqué
          console.log('🔍 User blocked:', user.isBlocked);
          if (user.isBlocked) {
            console.log('❌ User is blocked:', user.blockedReason);
            return null
          }

          console.log('✅ Authentication successful for user:', user.email);
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('❌ Error in authorize function:', error);
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('🔍 SignIn callback:', { 
        user: user?.email, 
        provider: account?.provider 
      });
      
      // Permettre la connexion pour tous les utilisateurs authentifiés
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  }
}