/**
 * Centralized API Export
 * All API functions should be imported from this file
 */

// Client utilities
export {
  apiFetch,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  type ApiErrorPayload,
} from "./client"

// Authentication
export {
  login,
  register,
  logout,
  fetchCurrentUser,
} from "./auth"

// Catalog operations
export {
  // Categories
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchPublicCategories,
  fetchSubcategories,
  // SLAs
  fetchSlas,
  createSlaRecord,
  updateSlaRecord,
  deleteSlaRecord,
  type SlaRequestPayload,
  // Services
  fetchServices,
  fetchPublicServices,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
  type ServiceRecordPayload,
  // Templates
  fetchTemplate,
  fetchTemplatesByService,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type TemplatePayload,
  // Template Fields
  createTemplateField,
  updateTemplateField,
  deleteTemplateField,
  type TemplateFieldPayload,
  // Requests
  fetchRequests,
  createServiceRequest,
  updateRequestStatus,
  deleteRequest,
  type ServiceRequestPayload,
  // Audit
  fetchAuditLogs,
} from "./catalog"

