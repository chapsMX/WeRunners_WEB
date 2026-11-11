import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
 
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
    },
  },
})
 
export type Session = typeof auth.$Infer.Session