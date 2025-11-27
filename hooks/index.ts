/**
 * Centralized Hooks Export
 * All application hooks should be imported from this file
 * 
 * React 19 Best Practices:
 * - useOptimisticCrud: CRUD with useTransition + useOptimistic
 * - useDeferredSearch: Search with useDeferredValue
 * - useFilteredList: Multi-filter with deferred values
 */

// Mobile detection
export { useIsMobile } from "./use-mobile"

// Toast notifications
export { useToast, toast } from "./use-toast"

// Auth animations
export { useAuthAnimation, type AuthAnimationConfig } from "./use-auth-animation"

// React 19: Optimistic CRUD pattern
export { 
  useOptimisticCrud, 
  type CrudConfig, 
  type CrudMessages 
} from "./use-optimistic-crud"

// React 19: Deferred search and filtering
export { 
  useDeferredSearch, 
  useFilteredList,
  type DeferredSearchConfig,
  type FilterConfig,
} from "./use-deferred-search"

