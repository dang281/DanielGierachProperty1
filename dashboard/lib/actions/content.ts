'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ContentItem, ContentItemUpdate, Status } from '@/types/content'

export async function checkVisualMigration(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('content_items')
      .select('visual_status')
      .limit(1)
    return !error
  } catch {
    return false
  }
}

export async function getContentItems(): Promise<ContentItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .order('scheduled_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  return (data ?? []) as ContentItem[]
}

export async function getContentItem(id: string): Promise<ContentItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as ContentItem
}

export async function updateStatus(id: string, status: Status) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ status })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/social')
  revalidatePath('/app/calendar')
}

export async function updateItem(id: string, updates: ContentItemUpdate) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/calendar')
  revalidatePath(`/app/content/${id}`)
}

export async function createItem(item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/app')
  return data as ContentItem
}

export async function saveVisualFeedback(id: string, feedback: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ visual_feedback: feedback, visual_status: 'needs_revision' })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath(`/app/content/${id}`)
}

export async function approveVisual(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ visual_status: 'approved', visual_feedback: null })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath(`/app/content/${id}`)
}

export async function saveCanvaUrl(id: string, canva_url: string, visual_thumbnail?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ canva_url, visual_thumbnail: visual_thumbnail ?? null, visual_status: 'draft' })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath(`/app/content/${id}`)
}

export async function rescheduleItem(id: string, newDate: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ scheduled_date: newDate })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app/calendar')
}

export async function saveReviewRequest(id: string, notes: string) {
  const supabase = await createClient()

  // Fetch title so we can create the Paperclip issue in the same call
  const { data: item, error: fetchErr } = await supabase
    .from('content_items')
    .select('title')
    .eq('id', id)
    .single()
  if (fetchErr) throw fetchErr

  const { error } = await supabase
    .from('content_items')
    .update({ visual_feedback: notes, status: 'idea' })
    .eq('id', id)
  if (error) throw error

  // Immediately dispatch a critical Paperclip issue to the social agent.
  // This is fire-and-forget — a failure here does not block the save.
  const { sendChangeRequestToAgent } = await import('@/lib/actions/paperclip')
  sendChangeRequestToAgent(id, item.title, notes).catch(() => {})

  revalidatePath(`/app/content/${id}`)
  revalidatePath('/app/social')
  revalidatePath('/app')
}

export async function clearReviewRequest(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ visual_feedback: null })
    .eq('id', id)
  if (error) throw error
  revalidatePath(`/app/content/${id}`)
  revalidatePath('/app/social')
  revalidatePath('/app')
}

export async function confirmSchedule(
  assignments: Array<{ id: string; scheduled_date: string }>
) {
  const supabase = await createClient()
  for (const { id, scheduled_date } of assignments) {
    await supabase
      .from('content_items')
      .update({ status: 'scheduled', scheduled_date })
      .eq('id', id)
  }
  revalidatePath('/app/planning')
  revalidatePath('/app/social')
  revalidatePath('/app/calendar')
}

export async function unscheduleItems(ids: string[]) {
  const supabase = await createClient()
  for (const id of ids) {
    await supabase
      .from('content_items')
      .update({ status: 'ready', scheduled_date: null })
      .eq('id', id)
  }
  revalidatePath('/app/planning')
  revalidatePath('/app/social')
  revalidatePath('/app/calendar')
}

export async function updateItemStatus(id: string, status: Status): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ status })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/planning')
  revalidatePath('/app/social')
}

export async function deleteItem(id: string) {
  // Soft-delete: mark as archived and remove from schedule.
  // Hard-deleting from Supabase causes the post to be re-inserted on the next
  // git commit because sync-social-to-supabase.mjs re-syncs all markdown files.
  // The sync script respects 'archived' status and will not overwrite it.
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({
      status: 'archived' as Status,
      scheduled_date: null,
      scheduled_time: null,
    })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/calendar')
  revalidatePath('/app/social')
}

export async function bulkMarkPosted(ids: string[]): Promise<void> {
  if (!ids.length) return
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ status: 'posted' as Status })
    .in('id', ids)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/planning')
}

export async function getNextSameTypePost(
  currentId: string,
  isArticle: boolean,
): Promise<ContentItem | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('content_items')
    .select('*')
    .eq('platform', 'linkedin')
    .in('status', ['ready', 'idea'])
    .neq('id', currentId)
    .is('scheduled_date', null)
  if (!data) return null

  const candidates = data.filter(item => {
    const t = (item.title ?? '').toLowerCase()
    const n = (item.notes ?? '').toLowerCase()
    if (t.includes('poll')) return false
    const isArticlePost = t.includes('field guide') || t.includes('article feature') || n.includes('field guide')
    return isArticle ? isArticlePost : !isArticlePost
  })

  if (!candidates.length) return null
  const idx = Math.floor(Math.random() * candidates.length)
  return candidates[idx] as ContentItem
}

// Day-of-week post type for the "+" smart schedule flow
// dow: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
type DayPostType = 'poll' | 'article' | 'authority' | null

function dayPostType(dateStr: string): DayPostType {
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  if (dow === 2) return 'authority'  // Tuesday
  if (dow === 3) return 'poll'       // Wednesday
  if (dow === 4) return 'article'    // Thursday
  return null
}

export async function getPostForDate(
  dateStr: string,
  excludeIds: string[],
): Promise<ContentItem | null> {
  const type = dayPostType(dateStr)
  const supabase = await createClient()
  const { data } = await supabase
    .from('content_items')
    .select('*')
    .eq('platform', 'linkedin')
    .in('status', ['ready', 'idea'])
    .is('scheduled_date', null)
  if (!data) return null

  const candidates = data.filter(item => {
    if (excludeIds.includes(item.id)) return false
    const t = (item.title ?? '').toLowerCase()
    const n = (item.notes ?? '').toLowerCase()
    if (type === 'poll') return t.includes('poll')
    if (t.includes('poll')) return false
    const isArticle = t.includes('field guide') || t.includes('article feature') || n.includes('field guide')
    if (type === 'article') return isArticle
    if (type === 'authority') return !isArticle
    return true // non-posting day — any type
  })

  if (!candidates.length) return null
  return candidates[Math.floor(Math.random() * candidates.length)] as ContentItem
}

export async function scheduleLibraryPost(
  postId: string,
  date: string,
): Promise<ContentItem> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .update({ scheduled_date: date, status: 'scheduled' })
    .eq('id', postId)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/calendar')
  revalidatePath('/app/planning')
  return data as ContentItem
}

export async function swapPost(
  currentId: string,
  incomingId: string,
  date: string,
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('content_items')
    .update({ scheduled_date: null, status: 'ready' })
    .eq('id', currentId)
  await supabase
    .from('content_items')
    .update({ scheduled_date: date, status: 'scheduled' })
    .eq('id', incomingId)
  revalidatePath('/app')
  revalidatePath('/app/calendar')
  revalidatePath('/app/planning')
}

export async function regenerateVisual(id: string, mode: 'primary' | 'alternate' = 'alternate'): Promise<string | null> {
  const supabase = await createClient()
  const { data: item } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()
  if (!item) throw new Error('Item not found')

  const { execSync }                              = await import('child_process')
  const { readFileSync, readdirSync, existsSync, mkdirSync } = await import('fs')
  const { join, resolve }                         = await import('path')

  const repoRoot   = resolve(process.cwd(), '..')
  const scriptPath = join(repoRoot, 'scripts', 'screenshot-linkedin.mjs')
  const imgDir     = join(repoRoot, 'content', 'social', 'images')
  const socialDir  = join(repoRoot, 'content', 'social')
  mkdirSync(imgDir, { recursive: true })

  // Load SUPABASE_KEY from repo root .env (same as sync script)
  const envPath = join(repoRoot, '.env')
  let supabaseKey = process.env.SUPABASE_KEY
  if (!supabaseKey && existsSync(envPath)) {
    const txt = readFileSync(envPath, 'utf8')
    const m   = txt.match(/^SUPABASE_KEY=(.+)$/m)
    if (m) supabaseKey = m[1].trim()
  }

  const date         = item.scheduled_date ?? new Date().toISOString().slice(0, 10)
  const notes        = item.notes ?? ''
  const title        = item.title ?? ''
  const currentThumb = item.visual_thumbnail ?? ''

  // Day of week is authoritative for template selection:
  // Tuesday (2) = market/authority — NEVER article-cover, regardless of title
  // Thursday (4) = article feature — ALWAYS article or article-cover
  // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  const scheduledDow = item.scheduled_date
    ? new Date(item.scheduled_date + 'T12:00:00').getDay()
    : -1
  const isTuesdayPost   = scheduledDow === 2
  const isThursdayPost  = scheduledDow === 4
  const isArticle = isThursdayPost || (
    !isTuesdayPost && (
      /article feature|field guide/i.test(title) || /field guide/i.test(notes)
    )
  )

  // Strip common prefixes to get the clean headline
  const cleanHeadline = title
    .replace(/^LinkedIn\s+(Field Guide\s*[-–]\s*|Article Feature\s*[-–]\s*|Post[:\s\-]+|Poll[:\s\-]+)/i, '')
    .trim()

  // For article posts: find the next sequential Field Guide issue number.
  // Checks BOTH Supabase notes (authoritative — updated after every dashboard generation)
  // AND markdown files (catches agent-written posts). Uses the higher of the two.
  async function nextFieldGuideIssue(): Promise<string> {
    let max = 0

    // 1. Query Supabase for all items whose notes contain a Field Guide issue number.
    //    This is the source of truth for dashboard-generated visuals.
    const { data: dbItems } = await supabase
      .from('content_items')
      .select('notes')
      .ilike('notes', '%field guide issue%')
    if (dbItems) {
      for (const row of dbItems) {
        const m = (row.notes ?? '').match(/Field Guide Issue\s+(\d+)/i)
        if (m) max = Math.max(max, parseInt(m[1], 10))
      }
    }

    // 2. Also scan markdown files — catches agent-written posts that haven't synced yet.
    try {
      const files = readdirSync(socialDir).filter(f => f.endsWith('.md'))
      for (const f of files) {
        try {
          const txt = readFileSync(join(socialDir, f), 'utf8')
          const m   = txt.match(/Field Guide Issue\s+(\d+)/i)
          if (m) max = Math.max(max, parseInt(m[1], 10))
        } catch { /* skip unreadable files */ }
      }
    } catch { /* fallback */ }

    return String(max + 1).padStart(2, '0')
  }

  // Pick the most visually interesting word from the headline to highlight in gold italic.
  // Prefers property-specific nouns/adjectives; skips stop words and short words.
  function pickKeyword(text: string): string {
    const STOP = new Set(['the','a','an','and','or','but','for','in','on','at','to','of','is','are','was','were','be','been','what','how','why','when','where','who','with','from','your','you','that','this','as','its','it','do','does','not','before','after','than','more','can','will','by'])
    const words = text.replace(/[^a-zA-Z\s'-]/g, '').split(/\s+/).filter(w => w.length > 4 && !STOP.has(w.toLowerCase()))
    // Prefer longer, more specific words
    words.sort((a, b) => b.length - a.length)
    return words[0] ?? ''
  }

  let type: string
  const extraArgs: string[] = []

  if (mode === 'primary') {
    // Always generate the canonical/best visual for this post type
    if (isArticle) {
      // Check if this post already has a Field Guide issue number assigned
      const existingIssue = notes.match(/Field Guide Issue\s+(\d+)/i)
      const issue = existingIssue
        ? existingIssue[1].padStart(2, '0')
        : await nextFieldGuideIssue()
      type = 'article-cover'
      const taglineMatch = notes.match(/tagline[:\s]+([^\n]+)/i)
        ?? (item.visual_brief ?? '').match(/tagline[:\s]+([^\n]+)/i)
      const tagline = taglineMatch?.[1]?.replace(/^["']|["']$/g, '').trim() ?? ''
      extraArgs.push('--issue', issue, '--tagline', tagline, '--readtime', '5 MIN READ')
    } else {
      // Market / authority post: use market template
      type = 'market'
      const labelMatch = (item.visual_brief ?? '').match(/MARKET UPDATE|INNER EAST|SELLER INSIGHT|BUYER INSIGHT|AUTHORITY|FIELD GUIDE|RATE WATCH/i)
      const label   = labelMatch?.[0]?.toUpperCase() ?? 'MARKET UPDATE'
      const body    = (item.caption ?? '').split(/\n\n+/)[0]?.slice(0, 230) ?? ''
      const keyword = pickKeyword(cleanHeadline)
      extraArgs.push('--label', label, '--body', body)
      if (keyword) extraArgs.push('--keyword', keyword)
    }
  } else {
    // Alternate: cycle away from whatever template is currently showing
    const issueMatch     = notes.match(/Field Guide Issue\s+(\d+)/i)
    const currentIsCover = currentThumb.includes('article-cover')

    if (isArticle && currentIsCover) {
      // Was cover → switch to 1080×1080 article card
      type = 'article'
      const captionParas = (item.caption ?? '').split(/\n\n+/)
      const excerpt      = (captionParas[1] ?? captionParas[0] ?? '').slice(0, 180)
      const slugMatch    = (item.caption ?? '').match(/danielgierach\.com\/insights\/([^\s\n]+)/)
      const slug         = slugMatch?.[1] ?? 'insights'
      extraArgs.push('--excerpt', excerpt, '--slug', slug)
    } else if (isArticle || issueMatch) {
      // Was article card (or no thumb yet) → generate cover
      type = 'article-cover'
      const issue       = issueMatch?.[1]?.padStart(2, '0') ?? await nextFieldGuideIssue()
      const taglineMatch = notes.match(/tagline[:\s]+([^\n]+)/i)
      const tagline      = taglineMatch?.[1]?.replace(/^["']|["']$/g, '').trim() ?? ''
      extraArgs.push('--issue', issue, '--tagline', tagline, '--readtime', '5 MIN READ')
    } else {
      // Market alternate: rotate to a different label + use second paragraph of caption
      type = 'market'
      const MARKET_LABELS = ['MARKET UPDATE', 'INNER EAST', 'SELLER INSIGHT', 'BUYER INSIGHT', 'AUTHORITY', 'RATE WATCH']
      const labelMatch   = (item.visual_brief ?? '').match(/MARKET UPDATE|INNER EAST|SELLER INSIGHT|BUYER INSIGHT|AUTHORITY|FIELD GUIDE|RATE WATCH/i)
      const currentLabel = labelMatch?.[0]?.toUpperCase() ?? 'MARKET UPDATE'
      const idx          = MARKET_LABELS.indexOf(currentLabel)
      const altLabel     = MARKET_LABELS[(idx + 1) % MARKET_LABELS.length]
      // Use second paragraph if available so the body text is visually different
      const paras   = (item.caption ?? '').split(/\n\n+/).filter(Boolean)
      const body    = (paras[1] ?? paras[0] ?? '').slice(0, 230)
      const keyword = pickKeyword(cleanHeadline)
      extraArgs.push('--label', altLabel, '--body', body)
      if (keyword) extraArgs.push('--keyword', keyword)
    }
  }

  // Timestamp in filename guarantees a unique Supabase URL on every generation —
  // prevents the browser from serving a cached version of the old image.
  const outFilename = `${date}-${id.slice(0, 8)}-${Date.now()}.png`
  const outPath     = join(imgDir, outFilename)

  const allArgs = ['--type', type, '--headline', cleanHeadline, '--date', date, '--out', outPath, ...extraArgs]
  const escaped = allArgs.map(a => `'${String(a).replace(/'/g, "'\\''")}'`).join(' ')
  execSync(`node ${scriptPath} ${escaped}`, { cwd: repoRoot, timeout: 45000 })

  if (!existsSync(outPath)) throw new Error('Screenshot generation failed — file not written')

  const bytes       = readFileSync(outPath)
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://hmwulvvwsksuyqozuxvw.supabase.co'
  const uploadRes   = await fetch(
    `${SUPABASE_URL}/storage/v1/object/social-images/${outFilename}`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseKey ?? '',
        Authorization: `Bearer ${supabaseKey ?? ''}`,
        'Content-Type': 'image/png',
        'x-upsert': 'true',
      },
      body: bytes,
    }
  )
  if (!uploadRes.ok) throw new Error(`Storage upload failed: ${await uploadRes.text()}`)

  const thumbnailUrl = `${SUPABASE_URL}/storage/v1/object/public/social-images/${outFilename}`

  // For article-cover visuals: stamp the issue number into the item's notes so that
  // every future call to nextFieldGuideIssue() finds it in Supabase and never re-uses it.
  const issueArg = extraArgs.indexOf('--issue') !== -1
    ? extraArgs[extraArgs.indexOf('--issue') + 1]
    : null
  const notesUpdate = (type === 'article-cover' && issueArg && !notes.match(/Field Guide Issue\s+\d+/i))
    ? (notes ? `${notes}\nField Guide Issue ${issueArg}` : `Field Guide Issue ${issueArg}`)
    : undefined

  await supabase
    .from('content_items')
    .update({
      visual_thumbnail: thumbnailUrl,
      visual_status: 'approved',
      ...(notesUpdate !== undefined ? { notes: notesUpdate } : {}),
    })
    .eq('id', id)

  revalidatePath('/app')
  revalidatePath('/app/planning')
  return thumbnailUrl
}
