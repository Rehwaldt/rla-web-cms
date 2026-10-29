import type { PayloadRequest } from 'payload'

// For internal or personal data the website must not see: only logged-in users read it, and
// anonymous queries can't filter by it either. Works as collection and as field access.
export const authenticated = ({ req }: { req: PayloadRequest }) => Boolean(req.user)
