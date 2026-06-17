import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Genera el token de subida directa a Vercel Blob para el avatar del usuario.
// La subida la hace el cliente (sin pasar por el límite de body de las server
// actions); la URL resultante se persiste al guardar el formulario de perfil.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session) throw new Error("Unauthorized")
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        }
      },
      // En local este webhook no se dispara (no hay URL pública). La URL se
      // persiste vía la server action updateProfile al guardar el formulario.
      onUploadCompleted: async () => {},
    })

    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
