"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { FormTemplate, TemplateFieldType } from "@/types/form-template"

interface FormPreviewProps {
  template: FormTemplate
}

const mapInputType = (type: TemplateFieldType): string => {
  if (type === "texto") return "text"
  if (type === "numero") return "number"
  if (type === "fecha") return "date"
  return type
}

export function FormPreview({ template }: FormPreviewProps) {
  if (template.fields.length === 0) {
    return (
      <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <p className="text-muted-foreground">No hay campos en esta plantilla</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-card to-card/50 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">{template.name}</h3>
      <form className="space-y-4">
        {template.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-foreground mb-2">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            {field.description && <p className="text-xs text-muted-foreground mb-2">{field.description}</p>}

            {field.type === "textarea" ? (
              <textarea
                placeholder={field.placeholder}
                disabled
                className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
            ) : field.type === "select" ? (
              <select
                disabled
                className="w-full px-3 py-2 bg-secondary/50 border border-primary/20 rounded-lg text-foreground"
              >
                <option value="">{field.placeholder || "Selecciona una opcion"}</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <div className="space-y-2">
                {(field.options || []).map((opt) => (
                  <div key={opt} className="flex items-center">
                    <input type="checkbox" id={`${field.id}-${opt}`} disabled className="mr-2" />
                    <label htmlFor={`${field.id}-${opt}`} className="text-sm text-foreground">
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            ) : field.type === "archivo" ? (
              <Input type="file" disabled className="bg-secondary/50 border-primary/20" />
            ) : field.type === "email" ? (
              <Input type="email" placeholder={field.placeholder} disabled className="bg-secondary/50 border-primary/20" />
            ) : (
              <Input
                type={mapInputType(field.type)}
                placeholder={field.placeholder}
                disabled
                className="bg-secondary/50 border-primary/20"
              />
            )}
          </div>
        ))}
      </form>
    </Card>
  )
}
