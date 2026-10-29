import type { CmsEmployee, EmployeeData } from './plan'

// The CMS as the WerkX import sees it: its REST API, logged in as an editor. Going through the API
// (rather than the database) keeps hooks, access and version history, and works against the
// production server from the office.

type Doc = Record<string, unknown>

export class Cms {
  private constructor(
    readonly url: string,
    private readonly token: string,
  ) {}

  // A token copied from the admin's `payload-token` cookie, or an email and password.
  static async connect(url: string, auth: { token?: string; email?: string; password?: string }) {
    const base = url.replace(/\/$/, '')
    if (auth.token) return new Cms(base, auth.token)
    if (!auth.email || !auth.password) throw new Error('Set CMS_TOKEN, or CMS_EMAIL and CMS_PASSWORD')
    const response = await fetch(`${base}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: auth.email, password: auth.password }),
    })
    const body = (await response.json()) as { token?: string; errors?: { message: string }[] }
    if (!response.ok || !body.token) {
      throw new Error(`Login failed: ${body.errors?.map((error) => error.message).join('; ') ?? response.status}`)
    }
    return new Cms(base, body.token)
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.url}/api/${path}`, {
      method,
      headers: { Authorization: `JWT ${this.token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const json = (await response.json().catch(() => ({}))) as T & { errors?: { message: string }[] }
    if (!response.ok) {
      const message = json.errors?.map((error) => error.message).join('; ') ?? response.statusText
      throw new Error(`${method} ${path}: ${response.status} ${message}`)
    }
    return json
  }

  async offices(): Promise<Record<string, number>> {
    const { docs } = await this.request<{ docs: Doc[] }>('GET', 'offices?pagination=false&depth=0&locale=de')
    return Object.fromEntries(docs.map((office) => [String(office.name), Number(office.id)]))
  }

  async employees(): Promise<CmsEmployee[]> {
    const officeNames = Object.fromEntries(Object.entries(await this.offices()).map(([name, id]) => [id, name]))
    const { docs } = await this.request<{ docs: Doc[] }>('GET', 'employees?pagination=false&depth=0')
    // Latest versions: a published employee whose latest version is a draft has unpublished changes.
    const versions = await this.request<{ docs: Doc[] }>(
      'GET',
      'employees/versions?pagination=false&depth=0&where[latest][equals]=true',
    )
    const latestStatus = new Map(
      versions.docs.map((version) => [Number(version.parent), (version.version as Doc)?._status]),
    )
    const text = (value: unknown) => (typeof value === 'string' && value ? value : null)
    return docs.map((doc) => {
      const status = doc._status === 'published' ? 'published' : 'draft'
      return {
        id: Number(doc.id),
        firstName: String(doc.firstName ?? ''),
        lastName: String(doc.lastName ?? ''),
        email: text(doc.email),
        code: text(doc.code),
        office: doc.office == null ? null : (officeNames[Number(doc.office)] ?? null),
        entryDate: text(doc.entryDate),
        exitDate: text(doc.exitDate),
        birthDate: text(doc.birthDate),
        status,
        pendingDraft: status === 'published' && latestStatus.get(Number(doc.id)) === 'draft',
      }
    })
  }

  // The status goes along, so a draft stays a draft and a published employee stays published.
  async update(id: number, status: CmsEmployee['status'], data: EmployeeData) {
    await this.request('PATCH', `employees/${id}?depth=0`, { ...data, _status: status })
  }

  async createDraft(data: EmployeeData) {
    await this.request('POST', 'employees?depth=0', { ...data, _status: 'draft' })
  }
}
