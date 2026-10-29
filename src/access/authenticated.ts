import type { FieldAccess } from 'payload'

// For personal data the website must not see: only logged-in users read the field, and anonymous
// queries can't filter by it either.
export const authenticated: FieldAccess = ({ req }) => Boolean(req.user)
