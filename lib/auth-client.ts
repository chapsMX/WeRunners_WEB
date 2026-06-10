import { createAuthClient } from "better-auth/react"
 
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
})
 
// Exporta los hooks directamente para uso cómodo en componentes
export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient