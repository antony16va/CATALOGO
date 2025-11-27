import { AuthScreen } from "@/components/auth/auth-screen"
import { use } from "react"

interface PageProps {
  searchParams: Promise<{ auth?: string }>
}

export default function LoginPage({ searchParams }: PageProps) {
  const params = use(searchParams)
  const initialMode = params?.auth === "register" ? "register" : "login"
  return <AuthScreen initialMode={initialMode} />
}
