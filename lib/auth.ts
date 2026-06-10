import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"
 
const prisma = new PrismaClient()
 
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
 
  // URL base de la app — usa la variable de entorno
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
 
  // Providers habilitados
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
 
  emailAndPassword: {
    enabled: true,         // fallback para usuarios sin Google
    requireEmailVerification: false, // simplificado para beta
  },
 
  // Campos extra que Better Auth debe guardar en el modelo User
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "RUNNER",
        input: false,       // solo editable por admins
      },
      preferredUnit: {
        type: "string",
        required: false,
        defaultValue: "KM",
        input: true,
      },
      locale: {
        type: "string",
        required: false,
        defaultValue: "es",
        input: true,
      },
      timezone: {
        type: "string",
        required: false,
        defaultValue: "America/Mexico_City",
        input: true,
      },
      betaAccess: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,       // solo se activa internamente al validar waitlist
      },
    },
  },
 
  // Callbacks
  callbacks: {
    // Se ejecuta después de que un usuario se registra
    // Aquí validamos si el email está en la waitlist con betaAccess = true
    after: [
      {
        pathMatcher(path) {
          return path === "/sign-up/email" || path === "/callback/google"
        },
        async handler(ctx) {
          // El email del usuario recién registrado
          const email = ctx.context.newSession?.user?.email
          if (!email) return
 
          // Buscar en WaitlistEntry
          const waitlistEntry = await prisma.waitlistEntry.findUnique({
            where: { email },
          })
 
          if (waitlistEntry?.betaAccess) {
            // Tiene acceso — actualizar User y marcar convertedAt en waitlist
            await Promise.all([
              prisma.user.update({
                where: { email },
                data: { betaAccess: true },
              }),
              prisma.waitlistEntry.update({
                where: { email },
                data: { convertedAt: new Date() },
              }),
            ])
          }
        },
      },
    ],
  },
})
 
export type Session = typeof auth.$Infer.Session