import { Clock } from "lucide-react"

export default function AuditoriaLoading() {
  return (
    <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mb-4">
          <Clock className="w-6 h-6 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando auditoría...</p>
      </div>
    </div>
  )
}
