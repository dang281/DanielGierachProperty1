'use client'

import type { ContentItem } from '@/types/content'

type Props = {
  item: ContentItem
  firstComment?: string | null
}

function parseFirstCommentFromCaption(caption: string | null): { body: string; comment: string | null } {
  if (!caption) return { body: '', comment: null }
  const m = caption.match(/##\s*First comment[\s\S]*?\n([\s\S]+?)(?:\n##|\n---|\n$|$)/i)
  if (m) {
    const comment = m[1].trim()
    const body = caption.replace(m[0], '').trim()
    return { body, comment }
  }
  return { body: caption, comment: null }
}

function trimBody(body: string): string {
  return body.replace(/^##.*$/gm, '').replace(/^---+$/gm, '').trim()
}

const AVATAR_URL = 'https://danielgierach.com/img/daniel-headshot.jpg'

export default function LinkedInPreview({ item, firstComment }: Props) {
  const caption = item.caption ?? ''
  const parsed = parseFirstCommentFromCaption(caption)
  const body = trimBody(parsed.body)
  const commentText = firstComment ?? parsed.comment

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e0dfdc',
      borderRadius: 8,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 14,
      color: '#000000',
      overflow: 'hidden',
      maxWidth: 540,
    }}>
      {/* Header: avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px 8px' }}>
        <img
          src={AVATAR_URL}
          alt="Daniel Gierach"
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 10%' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#000', lineHeight: 1.3 }}>Daniel Gierach</div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.3 }}>
            Real Estate Agent · Ray White Collective
          </div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.3 }}>
            {item.scheduled_date ?? 'unscheduled'} · 🌐
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0 16px 8px', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#000' }}>
        {body || <span style={{ color: '#999', fontStyle: 'italic' }}>No caption yet</span>}
      </div>

      {/* Visual */}
      {item.visual_thumbnail && (
        <div style={{ borderTop: '1px solid #f0f0f0' }}>
          <img
            src={item.visual_thumbnail}
            alt="Post visual"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      )}

      {/* Reaction bar */}
      <div style={{
        display: 'flex', gap: 16, justifyContent: 'space-around',
        padding: '8px 16px', borderTop: '1px solid #f0f0f0',
        color: '#666', fontSize: 13, fontWeight: 600,
      }}>
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>↻ Repost</span>
        <span>📤 Send</span>
      </div>

      {/* First comment */}
      {commentText && (
        <div style={{
          padding: '12px 16px',
          background: '#f3f2ef',
          borderTop: '1px solid #e0dfdc',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <img
              src={AVATAR_URL}
              alt="Daniel Gierach"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 10%', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                background: '#fff',
                border: '1px solid #e0dfdc',
                borderRadius: 8,
                padding: '8px 12px',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Daniel Gierach</div>
                <div style={{
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: '#000',
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap',
                }}>
                  {commentText}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4, paddingLeft: 4 }}>
                Author · 1m
              </div>
            </div>
          </div>
        </div>
      )}

      {!commentText && item.scheduled_date && (
        <div style={{
          padding: '10px 16px',
          background: '#fef9e7',
          borderTop: '1px solid #f4e9c2',
          fontSize: 12,
          color: '#7a5e1f',
          fontStyle: 'italic',
        }}>
          No first-comment link drafted. Tue/Thu posts should have a link in the first comment.
        </div>
      )}
    </div>
  )
}
