import type { GeneratePreviewURL } from 'payload'

// The edit view's Preview button: opens the document on the website, in the admin's locale.
// The website's /go route redirects to wherever the document lives there today, or tells
// editors it isn't public, so this is the only website route the CMS knows (#31,
// rla-website#28). It shows the published version; drafts come with #32. Without
// WEBSITE_URL there's no button.

// The website calls Czech `cz` in its URLs, Payload's locale is `cs` (rla-website#21)
const websiteLanguage = (locale: string) => (locale === 'cs' ? 'cz' : locale)

const goUrl = (locale: string, path: string): null | string => {
  const website = process.env.WEBSITE_URL?.replace(/\/+$/, '')
  return website ? `${website}/${websiteLanguage(locale)}/go/${path}` : null
}

export const websitePreview =
  (collectionSlug: string): GeneratePreviewURL =>
  (doc, { locale }) =>
    doc.id === undefined ? null : goUrl(locale, `${collectionSlug}/${doc.id}`)

export const websiteGlobalPreview =
  (globalSlug: string): GeneratePreviewURL =>
  (_doc, { locale }) =>
    goUrl(locale, globalSlug)
