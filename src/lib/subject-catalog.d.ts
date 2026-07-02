export type SubjectCatalogEntry = {
  id: string
  name: string
  slug: string
  category: string
  hourly_rate_cents?: number | null
  is_virtual?: boolean
  is_group?: boolean
  children?: SubjectCatalogEntry[]
}

export type SubjectCatalog = Record<string, SubjectCatalogEntry[]>

export const AP_SUBJECTS: SubjectCatalogEntry[]
export const VIRTUAL_SUBJECTS: SubjectCatalogEntry[]
export function buildSubjectCatalog(subjects: SubjectCatalogEntry[]): SubjectCatalog
export function flattenSubjectCatalog(catalog: SubjectCatalog): SubjectCatalogEntry[]
export function getSubjectMap(catalog: SubjectCatalog): Record<string, SubjectCatalogEntry>
export function getSubjectNameMap(catalog: SubjectCatalog): Record<string, string>
export function resolveSubjectNames(catalog: SubjectCatalog, ids: string[]): string[]
