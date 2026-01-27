/**
 * Centralized TanStack Query Keys
 *
 * This file provides a type-safe factory pattern for all query keys used in the application.
 * Using centralized keys ensures:
 * - Consistent key references across queries and invalidations
 * - Type-safety to prevent typos
 * - Single source of truth for cache management
 * - Easy refactoring when keys need changes
 */

export const queryKeys = {
  events: {
    byId: (id: string) => ['event', id],
  },
  tickets: {
    view: (token: string) => ['tickets', 'view', token],
    validate: (token: string) => ['tickets', 'validate', token],
  },
};