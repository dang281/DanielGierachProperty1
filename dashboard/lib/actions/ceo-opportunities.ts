'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

export interface CeoOpportunity {
  number: number
  title: string
  category: string
  priority: 'high' | 'medium' | 'low'
  why: string
  impact: string
  next: string
  approved?: boolean
}

export interface CeoWeek {
  file: string           // e.g. "2026-W21"
  weekStart: string      // e.g. "2026-05-18"
  opportunities: CeoOpportunity[]
}

const OPP_DIR = path.resolve(process.cwd(), '..', 'content', 'opportunities')
const APPROVED_FILE = path.join(OPP_DIR, 'approved.json')

function readApproved(): Set<string> {
  try {
    const raw = fs.readFileSync(APPROVED_FILE, 'utf-8')
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

export async function approveOpportunity(weekKey: string, number: number): Promise<void> {
  const key = `${weekKey}-${number}`
  const approved = readApproved()
  approved.add(key)
  fs.writeFileSync(APPROVED_FILE, JSON.stringify([...approved], null, 2))
  revalidatePath('/app/projects')
}

export async function getApprovedKeys(): Promise<Set<string>> {
  return readApproved()
}

function parseField(text: string, key: string): string {
  const regex = new RegExp(`\\*\\*${key}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`)
  const m = text.match(regex)
  return m ? m[1].trim() : ''
}

function parseWeekFile(filePath: string, fileName: string): CeoWeek {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const weekKey = fileName.replace('.md', '')

  const weekStartMatch = raw.match(/\*\*Week start:\*\*\s*(\S+)/)
  const weekStart = weekStartMatch ? weekStartMatch[1] : weekKey

  // Split on opportunity headings: ## 1. Title
  const sections = raw.split(/\n(?=## \d+\.)/).slice(1)

  const opportunities: CeoOpportunity[] = sections.map(section => {
    const titleMatch = section.match(/^## (\d+)\.\s+(.+)/)
    const number = titleMatch ? parseInt(titleMatch[1]) : 0
    const title  = titleMatch ? titleMatch[2].trim() : 'Untitled'

    const rawPriority = parseField(section, 'Priority').toLowerCase()
    const priority: 'high' | 'medium' | 'low' =
      rawPriority === 'high' ? 'high' : rawPriority === 'low' ? 'low' : 'medium'

    return {
      number,
      title,
      category: parseField(section, 'Category'),
      priority,
      why:    parseField(section, 'Why it matters'),
      impact: parseField(section, 'Expected impact'),
      next:   parseField(section, 'Next action'),
    }
  })

  return { file: weekKey, weekStart, opportunities }
}

export async function getCeoWeeks(): Promise<CeoWeek[]> {
  try {
    if (!fs.existsSync(OPP_DIR)) return []

    const approved = readApproved()

    const files = fs.readdirSync(OPP_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()

    return files.map(f => {
      const week = parseWeekFile(path.join(OPP_DIR, f), f)
      return {
        ...week,
        opportunities: week.opportunities.map(o => ({
          ...o,
          approved: approved.has(`${week.file}-${o.number}`),
        })),
      }
    })
  } catch {
    return []
  }
}
