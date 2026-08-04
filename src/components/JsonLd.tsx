import type { JsonLdNode } from '@/lib/structured-data'
import { serializeJsonLd } from '@/lib/structured-data'

/**
 * Renders one or more JSON-LD nodes as a single `<script type="application/ld+json">`.
 *
 * Serialisation goes through serializeJsonLd rather than hand-built strings —
 * it is what escapes the quotes, backslashes, control characters and angle
 * brackets that a tutor bio or a subject name can legitimately contain.
 *
 * Multiple nodes are emitted as a `@graph`, which is how JSON-LD expresses
 * "several things described by this page". That keeps one script tag per page
 * instead of one per node, and lets the nodes cross-reference each other by
 * `@id` — the Service on each landing page points at the organisation that way.
 */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const nodes = Array.isArray(data) ? data : [data]

  const payload =
    nodes.length === 1
      ? nodes[0]
      : {
          '@context': 'https://schema.org',
          // Each builder stamps its own @context; inside a @graph that is
          // redundant, and a per-node @context is not valid there.
          '@graph': nodes.map((node) => {
            const copy = { ...node }
            delete copy['@context']
            return copy
          }),
        }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
    />
  )
}
