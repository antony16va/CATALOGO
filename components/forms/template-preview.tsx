"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormTemplate, TemplateFieldType } from "@/types/form-template"

const fieldLabelMap: Record<TemplateFieldType, string> = {
  texto: "Texto corto",
  textarea: "Texto largo",
  email: "Correo electronico",
  numero: "Numero",
  fecha: "Fecha",
  select: "Lista desplegable",
  checkbox: "Casillas",
  archivo: "Archivo",
}

export function TemplatePreview({ template }: { template: FormTemplate }) {
  const orderedFields = useMemo(() => [...template.fields].sort((a, b) => a.order - b.order), [template.fields])
  const hasFields = orderedFields.length > 0
  const [generatedAt, setGeneratedAt] = useState("")

  useEffect(() => {
    setGeneratedAt(
      new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    )
  }, [])

  const reference = template.id ? `TPL-${String(template.id).padStart(4, "0")}` : "SIN-REF"

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white text-slate-900 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.6)] overflow-hidden">
      <div className="bg-slate-900 text-slate-100 px-8 py-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.6em] uppercase text-slate-300/70">Documento de plantilla</p>
          <h3 className="text-2xl md:text-3xl font-semibold">{template.name || "Plantilla sin titulo"}</h3>
          <p className="text-sm text-slate-300">ERP Service Desk / Oficina de Operaciones</p>
        </div>
        <div className="text-right text-xs leading-relaxed">
          <p className="font-semibold tracking-wide">Referencia: {reference}</p>
          <p>{generatedAt || "-"}</p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <section className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50">
          <h4 className="text-sm font-semibold tracking-widest text-slate-500 mb-4 uppercase">Resumen ejecutivo</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Descripcion", value: template.description || "Sin descripcion" },
              { label: "Servicio", value: template.serviceName || "Sin asignar" },
              { label: "Total de campos", value: orderedFields.length || "0" },
            ].map((meta) => (
              <div key={meta.label} className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 shadow-inner">
                <p className="text-[11px] uppercase tracking-[0.5em] text-slate-400">{meta.label}</p>
                <p className="text-base font-semibold text-slate-900 mt-2">{meta.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Detalle estructural del formulario</p>
              <p className="text-xs text-slate-500">Listado formal de los campos que conforman la plantilla</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full border border-primary/30 text-primary font-semibold">
              {orderedFields.length} campos
            </span>
          </div>

          {hasFields ? (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold text-left">Descripcion</th>
                  <th className="px-4 py-3 font-semibold text-left">Tipo</th>
                  <th className="px-4 py-3 font-semibold text-left">Obligatorio</th>
                  <th className="px-4 py-3 font-semibold text-left">Placeholder / Opciones</th>
                </tr>
              </thead>
              <tbody>
                {orderedFields.map((field) => (
                  <tr key={field.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{field.label || "-"}</p>
                      {field.description ? <p className="text-xs text-slate-500">{field.description}</p> : null}
                      <p className="text-xs text-slate-400 mt-1 font-mono">{field.fieldName}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{fieldLabelMap[field.type]}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-[11px] font-semibold ${
                          field.required
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {field.required ? "Si" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {field.type === "select" || field.type === "checkbox"
                        ? field.options?.join(", ") || "Sin opciones configuradas"
                        : field.placeholder || field.description || "Sin ayuda configurada"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-10 text-center text-slate-500 text-sm">
              No hay campos configurados. Agrega campos para visualizar la estructura del formulario.
            </div>
          )}
        </section>

        <section className="border border-slate-200 rounded-2xl p-5 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Notas</h4>
              <p>
                Esta vista previa representa la version oficial que se compartira con las areas solicitantes y con Service
                Desk. Las modificaciones posteriores deberan pasar por un proceso de aprobacion formal.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Firmas responsables</h4>
              <div className="flex flex-col gap-2 text-xs">
                <p>___________________________</p>
                <p>Coordinacion de Servicios</p>
                <p className="text-slate-400">Fecha: {generatedAt || "-"}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
