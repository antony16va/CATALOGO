export type TemplateFieldType =
  | 'texto'
  | 'textarea'
  | 'email'
  | 'numero'
  | 'fecha'
  | 'select'
  | 'checkbox'
  | 'archivo'

export interface FormField {
  id: string
  persistedId?: number
  templateId?: number
  fieldName: string
  label: string
  type: TemplateFieldType
  placeholder?: string
  description?: string
  options?: string[]
  required: boolean
  order: number
  validationPattern?: string | null
  errorMessage?: string | null
}

export interface FormTemplate {
  id?: number
  serviceId: number | null
  serviceName?: string
  name: string
  description: string
  active: boolean
  version: number
  fields: FormField[]
  createdAt?: Date
  updatedAt?: Date
}
