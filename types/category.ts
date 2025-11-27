export interface Category {
  id: number
  name: string
  description: string
  icon: string
  color: string
  active: boolean
  servicesCount: number
  createdAt: Date
}

export interface Subcategory {
  id: number
  categoryId: number
  name: string
  description: string
  active: boolean
  createdAt: Date
}
