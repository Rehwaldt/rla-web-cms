import type { PayloadRequest } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { websiteGlobalPreview, websitePreview } from '@/websitePreview'

const options = (locale: string) => ({ locale, req: {} as PayloadRequest, token: null })

describe('websitePreview', () => {
  afterEach(() => vi.unstubAllEnvs())

  it("links the website's /go route in the admin's locale", () => {
    vi.stubEnv('WEBSITE_URL', 'https://staging.rehwaldt.de/')
    expect(websitePreview('news')({ id: 226 }, options('en'))).toBe(
      'https://staging.rehwaldt.de/en/go/news/226',
    )
  })

  it('uses the website\'s "cz" for Czech', () => {
    vi.stubEnv('WEBSITE_URL', 'https://staging.rehwaldt.de')
    expect(websitePreview('projects')({ id: 423 }, options('cs'))).toBe(
      'https://staging.rehwaldt.de/cz/go/projects/423',
    )
  })

  it('links globals without an id', () => {
    vi.stubEnv('WEBSITE_URL', 'http://webserver/website_rla/1_php_payload')
    expect(websiteGlobalPreview('project-gallery')({}, options('de'))).toBe(
      'http://webserver/website_rla/1_php_payload/de/go/project-gallery',
    )
  })

  it('shows no button without WEBSITE_URL or before the first save', () => {
    vi.stubEnv('WEBSITE_URL', '')
    expect(websitePreview('news')({ id: 1 }, options('de'))).toBeNull()
    vi.stubEnv('WEBSITE_URL', 'https://staging.rehwaldt.de')
    expect(websitePreview('news')({}, options('de'))).toBeNull()
  })
})
