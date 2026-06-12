"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"

type Mode = "signin" | "signup"

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setLoading(true)
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "signup") {
      const { error: err } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: callbackUrl,
      })
      if (err) {
        setError(err.message ?? "Error al crear la cuenta")
        setLoading(false)
      } else {
        router.push(callbackUrl)
      }
    } else {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      })
      if (err) {
        setError(err.message ?? "Email o contraseña incorrectos")
        setLoading(false)
      } else {
        router.push(callbackUrl)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-lime-400 font-bold text-3xl tracking-tight">W3</span>
          <span className="text-white font-bold text-3xl tracking-tight">RUNN3RS</span>
          <p className="text-slate-400 text-sm mt-1">Pick your running club, make it count.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">

          <h1 className="text-white text-2xl font-bold text-center">
            {mode === "signin" ? "Bienvenido de vuelta" : "Únete a W3Runn3rs"}
          </h1>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-500 text-sm">o</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Tu nombre"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-400 hover:bg-lime-300 text-slate-900 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading
                ? "..."
                : mode === "signin"
                ? "Iniciar sesión"
                : "Crear cuenta"}
            </button>
          </form>

          {/* Mode toggle */}
          <p className="text-center text-slate-400 text-sm">
            {mode === "signin" ? "¿Primera vez aquí?" : "¿Ya tienes cuenta?"}
            {" "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError("") }}
              className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
            >
              {mode === "signin" ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          </p>

          {/* Legal */}
          <p className="text-center text-slate-600 text-xs">
            Al continuar aceptas nuestros{" "}
            <a href="https://www.w3runn3rs.com/terms-of-service" className="underline hover:text-slate-400">
              Términos
            </a>{" "}
            y{" "}
            <a href="https://www.w3runn3rs.com/privacy-policy" className="underline hover:text-slate-400">
              Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
