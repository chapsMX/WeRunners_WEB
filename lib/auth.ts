import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { sendVerificationEmail, sendWelcomeEmails } from "./auth-emails"
 
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
    enabled: true, // alternativa para quien no usa Google
    // Sin verificar no hay sesión: evita registros con correos ajenos.
    requireEmailVerification: true,
  },

  // Verificación de correo (solo cuentas email/password; Google ya llega verificado).
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user, url)
    },
    sendOnSignUp: true,
    sendOnSignIn: true, // reenvía el link si intenta entrar sin verificar
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 h
    // Bienvenida para email/password: solo después de verificar.
    afterEmailVerification: async (user) => {
      await sendWelcomeEmails(user, "email")
    },
  },

  // Bienvenida para Google: la cuenta nace con el correo ya verificado.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.emailVerified) await sendWelcomeEmails(user, "google")
        },
      },
    },
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