import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // @ts-ignore - Prisma adapter types are compatible
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // Credentials Provider for Email-only login (Demo Mode)
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@midas.app" },
      },
      async authorize(credentials) {
        // Demo mode: Accept any email and find/create user
        if (credentials?.email) {
          // Try to find existing user
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // Create user if doesn't exist (with default 100k balance)
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split("@")[0],
                balance: 100000, // Default balance
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
        return null;
      },
    }),
  ],
  
  pages: {
    signIn: "/login",
  },
  
  callbacks: {
    async session({ session, token, user }) {
      // Add user ID to session from token (JWT) or user object (Database)
      if (session.user) {
        if (token?.sub) {
          (session.user as { id?: string }).id = token.sub;
        } else if (user?.id) {
          (session.user as { id?: string }).id = user.id;
        }
      }
      return session;
    },
    
    async jwt({ token, user }) {
      // Persist user ID in JWT token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  
  session: {
    strategy: "jwt",
  },
  
  secret: process.env.NEXTAUTH_SECRET || "midas-demo-secret-key-change-in-production",
};

