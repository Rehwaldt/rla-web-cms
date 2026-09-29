import type { Access } from 'payload'

// Anonymous visitors (the public website) only see published documents; logged-in editors see
// drafts too.
export const publishedOrAuthenticated: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

export const anyone: Access = () => true
