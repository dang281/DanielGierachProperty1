'use server'

import { readFileSync } from 'fs'
import { join } from 'path'
import type { ContentItem } from '@/types/content'

export interface SeoArticle {
  id:          string
  title:       string
  slug:        string
  type:        'insights' | 'suburb'
  publishDate: string   // YYYY-MM-DD
  draft:       boolean
  createdAt:   string
}

export function getSeoSchedule(): ContentItem[] {
  try {
    const raw  = readFileSync(join(process.cwd(), 'seo-schedule.json'), 'utf-8')
    const data = JSON.parse(raw) as { articles: SeoArticle[] }

    return (data.articles ?? []).map(a => ({
      id:                a.id,
      title:             a.title,
      platform:          'seo' as const,
      content_type:      a.type,
      caption:           null,
      platform_variants: null,
      objective:         null,
      target_audience:   null,
      expected_outcome:  null,
      cta:               null,
      destination_url:   `https://danielgierach.com/${a.type === 'suburb' ? 'suburbs' : 'insights'}/${a.slug}`,
      status:            (a.draft ? 'scheduled' : 'posted') as 'scheduled' | 'posted',
      content_pillar:    null,
      score:             null,
      scheduled_date:    a.publishDate,
      scheduled_time:    '07:00',
      notes:             a.draft ? 'Staged — noindex until publish date' : null,
      visual_brief:      null,
      canva_url:         null,
      visual_thumbnail:  null,
      visual_feedback:   null,
      visual_status:     'approved' as const,
      created_at:        a.createdAt,
      updated_at:        a.createdAt,
    }))
  } catch {
    return []
  }
}
