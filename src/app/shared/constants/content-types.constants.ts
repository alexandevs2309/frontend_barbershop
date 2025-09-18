/**
 * Content Types para Django ContentType framework
 */
export const CONTENT_TYPES = {
  PRODUCT: 27,
  SERVICE: 25
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];