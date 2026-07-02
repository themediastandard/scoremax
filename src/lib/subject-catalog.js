const CATEGORY_ORDER = ['test-prep', 'high-school', 'college', 'middle-school', 'elementary']

const UNSUPPORTED_HIGH_SCHOOL_SLUGS = new Set([
  'biology',
  'environmental-science',
  'spanish',
  'history',
  'french',
  'english',
])

const VIRTUAL_SUBJECTS = [
  {
    id: 'virtual-gmat-prep',
    name: 'GMAT Prep',
    slug: 'gmat-prep',
    category: 'test-prep',
    hourly_rate_cents: 25000,
    is_virtual: true,
  },
  {
    id: 'virtual-gre-prep',
    name: 'GRE Prep',
    slug: 'gre-prep',
    category: 'test-prep',
    hourly_rate_cents: 25000,
    is_virtual: true,
  },
  {
    id: 'virtual-college-pre-calculus',
    name: 'College Pre-Calculus',
    slug: 'college-pre-calculus',
    category: 'college',
    hourly_rate_cents: 15000,
    is_virtual: true,
  },
]

const AP_SUBJECTS = [
  {
    id: 'virtual-ap-chemistry',
    name: 'AP Chemistry',
    slug: 'ap-chemistry',
    category: 'test-prep',
    hourly_rate_cents: 20000,
    is_virtual: true,
  },
  {
    id: 'virtual-ap-physics',
    name: 'AP Physics',
    slug: 'ap-physics',
    category: 'test-prep',
    hourly_rate_cents: 20000,
    is_virtual: true,
  },
  {
    id: 'virtual-ap-calculus',
    name: 'AP Calculus',
    slug: 'ap-calculus',
    category: 'test-prep',
    hourly_rate_cents: 20000,
    is_virtual: true,
  },
  {
    id: 'virtual-ap-statistics',
    name: 'AP Statistics',
    slug: 'ap-statistics',
    category: 'test-prep',
    hourly_rate_cents: 20000,
    is_virtual: true,
  },
]

const AP_SLUGS = new Set(AP_SUBJECTS.map((subject) => subject.slug))

function sortByName(subjects) {
  return [...subjects].sort((a, b) => a.name.localeCompare(b.name))
}

function normalizeDbSubject(subject) {
  if (subject.slug === 'in-person-sat' || /in[- ]person/i.test(subject.name)) return null

  if (subject.category === 'high-school' && UNSUPPORTED_HIGH_SCHOOL_SLUGS.has(subject.slug)) {
    return null
  }

  const category = subject.name.startsWith('Middle School') ? 'middle-school' : subject.category
  const hourlyRate =
    category === 'test-prep' && !AP_SLUGS.has(subject.slug) ? 25000 :
    category === 'high-school' ? 17500 :
    category === 'middle-school' ? 17500 :
    category === 'elementary' ? 15000 :
    subject.hourly_rate_cents

  return {
    ...subject,
    category,
    hourly_rate_cents: hourlyRate,
  }
}

function addSubject(acc, subject) {
  if (!acc[subject.category]) acc[subject.category] = []
  acc[subject.category].push(subject)
}

function buildSubjectCatalog(subjects) {
  const grouped = {}
  const apSubjects = []

  for (const subject of subjects) {
    const normalized = normalizeDbSubject(subject)
    if (!normalized) continue
    if (AP_SLUGS.has(normalized.slug)) {
      apSubjects.push(normalized)
    } else {
      addSubject(grouped, normalized)
    }
  }

  const hasSubjectSlug = (slug) =>
    Object.values(grouped).flat().some((item) => item.slug === slug) ||
    apSubjects.some((item) => item.slug === slug)

  for (const subject of VIRTUAL_SUBJECTS) {
    if (!hasSubjectSlug(subject.slug)) addSubject(grouped, subject)
  }

  const apChildren = AP_SUBJECTS.map((fallbackSubject) =>
    apSubjects.find((subject) => subject.slug === fallbackSubject.slug) ?? fallbackSubject
  )

  grouped['test-prep'] = [
    ...sortByName(grouped['test-prep'] ?? []),
    {
      id: 'ap-preparation',
      name: 'AP Preparation',
      slug: 'ap-preparation',
      category: 'test-prep',
      is_group: true,
      children: apChildren,
    },
  ]

  const ordered = {}
  for (const category of CATEGORY_ORDER) {
    const subjectsForCategory = grouped[category]
    if (!subjectsForCategory?.length) continue
    ordered[category] = category === 'test-prep' ? subjectsForCategory : sortByName(subjectsForCategory)
  }

  return ordered
}

function flattenSubjectCatalog(catalog) {
  return Object.values(catalog).flatMap((subjects) =>
    subjects.flatMap((subject) => subject.children ? subject.children : subject)
  )
}

function getSubjectMap(catalog) {
  return Object.fromEntries(flattenSubjectCatalog(catalog).map((subject) => [subject.id, subject]))
}

function resolveSubjectNames(catalog, ids) {
  const subjectMap = getSubjectMap(catalog)
  return ids.map((id) => subjectMap[id]?.name).filter(Boolean)
}

function getSubjectNameMap(catalog) {
  return Object.fromEntries(flattenSubjectCatalog(catalog).map((subject) => [subject.id, subject.name]))
}

module.exports = {
  AP_SUBJECTS,
  VIRTUAL_SUBJECTS,
  buildSubjectCatalog,
  flattenSubjectCatalog,
  getSubjectMap,
  getSubjectNameMap,
  resolveSubjectNames,
}
