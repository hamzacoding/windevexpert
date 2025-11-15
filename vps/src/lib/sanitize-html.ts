// Client-side HTML sanitizer: strips dangerous tags/attributes while keeping common formatting
export type SanitizeOptions = {
  allowIframesFrom?: string[]
}

const DEFAULT_IFRAME_SOURCES = [
  'https://www.youtube.com/embed/',
  'https://player.vimeo.com/video/',
]

export function sanitizeHtml(input: string, opts: SanitizeOptions = {}): string {
  if (!input || typeof window === 'undefined') return input || ''

  const allowIframesFrom = opts.allowIframesFrom || DEFAULT_IFRAME_SOURCES

  const template = document.createElement('template')
  template.innerHTML = input

  const ALLOWED_TAGS = new Set([
    'P','BR','H1','H2','H3','H4','H5','H6','STRONG','B','EM','I','U','S',
    'OL','UL','LI','BLOCKQUOTE','CODE','PRE','HR','A','IMG',
    'TABLE','THEAD','TBODY','TR','TD','TH','COLGROUP','COL',
    'SPAN','DIV','IFRAME'
  ])

  const ALLOWED_GLOBAL_ATTRS = new Set(['class'])
  const ALLOWED_ATTRS: Record<string, Set<string>> = {
    A: new Set(['href','target','rel','class']),
    IMG: new Set(['src','alt','title','width','height','class']),
    TABLE: new Set(['class']),
    TD: new Set(['colspan','rowspan','class']),
    TH: new Set(['colspan','rowspan','class']),
    CODE: new Set(['class']),
    PRE: new Set(['class']),
    IFRAME: new Set(['src','width','height','frameborder','allow','allowfullscreen','referrerpolicy'])
  }

  const isAllowedTag = (el: Element) => ALLOWED_TAGS.has(el.tagName)

  const sanitizeUrl = (url: string): string | null => {
    if (!url) return null
    const s = url.trim()
    if (s.startsWith('javascript:')) return null
    if (s.startsWith('data:image/')) return s
    if (s.startsWith('http://') || s.startsWith('https://')) return s
    if (s.startsWith('/')) return s
    return null
  }

  const sanitizeIframeSrc = (src: string): string | null => {
    if (!src) return null
    const s = src.trim()
    for (const prefix of allowIframesFrom) {
      if (s.startsWith(prefix)) return s
    }
    return null
  }

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes)
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element
        if (!isAllowedTag(el)) {
          // unwrap disallowed element (keep children)
          const inner = Array.from(el.childNodes)
          el.replaceWith(...inner)
          inner.forEach(walk)
          continue
        }

        // remove event handlers and non-whitelisted attributes
        const allowed = new Set([...(ALLOWED_GLOBAL_ATTRS), ...Array.from(ALLOWED_ATTRS[el.tagName] || [])])
        const toRemove: string[] = []
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase()
          if (name.startsWith('on')) { toRemove.push(attr.name); continue }
          if (!allowed.has(attr.name)) { toRemove.push(attr.name); continue }
        }
        toRemove.forEach((name) => el.removeAttribute(name))

        // special cases
        if (el.tagName === 'A') {
          const href = sanitizeUrl(el.getAttribute('href') || '')
          if (!href) { el.removeAttribute('href') } else {
            el.setAttribute('href', href)
            el.setAttribute('target', '_blank')
            el.setAttribute('rel', 'noopener noreferrer')
          }
        }
        if (el.tagName === 'IMG') {
          const src = sanitizeUrl(el.getAttribute('src') || '')
          if (!src) { el.remove() } else { el.setAttribute('src', src) }
        }
        if (el.tagName === 'IFRAME') {
          const src = sanitizeIframeSrc(el.getAttribute('src') || '')
          if (!src) { el.remove() } else { el.setAttribute('src', src) }
          // enforce safe defaults
          el.setAttribute('referrerpolicy', 'no-referrer')
          el.setAttribute('allowfullscreen', '')
        }

        // recurse
        walk(el)
      } else if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child)
      }
    }
  }

  walk(template.content)
  // return sanitized HTML
  const wrapper = document.createElement('div')
  wrapper.appendChild(template.content.cloneNode(true))
  return wrapper.innerHTML
}