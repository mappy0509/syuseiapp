import type { Member, AttendanceStatus, GuestEntry } from './types'

function norm(s: string): string {
  return s.replace(/[\s　\t\n\r]/g, '').toLowerCase()
}

function buildLookup(lines: string[]): Set<string> {
  const names = new Set<string>()
  for (const line of lines) {
    const parts = line.indexOf('\t') >= 0
      ? line.split(/\t+/)
      : line.split(/\s+/)
    for (const p of parts) {
      const clean = p.trim().replace(/^\d+$/, '').replace(/^\d+[\s)．.\u3001\uff0c,]+/, '').trim()
      if (clean.length >= 2 && !/^\d+$/.test(clean)) {
        names.add(norm(clean))
      }
    }
  }
  return names
}

interface Section {
  present: string[]
  absent: string[]
  pending: string[]
  guest: string[]
}

function parseSections(raw: string): Section {
  const sections: Section = { present: [], absent: [], pending: [], guest: [] }
  const lines = raw.split(/\r?\n/)
  let cur: keyof Section = 'present'
  const skipExact = new Set(['名簿用紹介者', 'no', '氏名', '資格', '会社名', '会場', '役職', '紹介者'])

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed === '　') continue
    const s = trimmed.replace(/[\s　\t]/g, '')
    if (s === '欠席') { cur = 'absent'; continue }
    if (s === '未回答') { cur = 'pending'; continue }
    if (s === 'ゲスト') { cur = 'guest'; continue }
    if (['現在の出席者', '出席', '出席者'].includes(s)) { cur = 'present'; continue }
    if (skipExact.has(s)) continue
    if (/^No[\s\t]/i.test(line)) continue
    if (/^\d+$/.test(s)) continue
    const hasNum = /^\d+[\s\t]/.test(line)
    const hasTab = line.indexOf('\t') >= 0
    if (!hasNum && !hasTab && line.length > 35) continue
    sections[cur].push(trimmed)
  }
  return sections
}

function extractGuests(lines: string[]): GuestEntry[] {
  const guests: GuestEntry[] = []
  for (const line of lines) {
    const parts = (line.indexOf('\t') >= 0 ? line.split(/\t+/) : line.split(/\s+/))
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (parts.length < 1) continue
    let name = parts[0].replace(/^\d+$/, '').trim()
    if (!name && parts.length >= 2) name = parts[1]
    else if (/^\d+$/.test(parts[0]) && parts.length >= 2) name = parts[1]
    if (name && name.length >= 2 && !/^\d+$/.test(name)) {
      const company = parts.length >= 3 ? parts[2] : ''
      guests.push({ name, company })
    }
  }
  return guests
}

export interface MatchResult {
  memberId: string
  name: string
  company: string | null
  status: AttendanceStatus
}

export function runMatch(raw: string, members: Member[]): { results: MatchResult[]; guests: GuestEntry[] } {
  const sections = parseSections(raw)
  const pLk = buildLookup([...sections.present, ...sections.guest])
  const aLk = buildLookup(sections.absent)
  const peLk = buildLookup(sections.pending)

  const results: MatchResult[] = members.map((m) => {
    const nn = norm(m.name)
    const cn = norm(m.company ?? '')
    const inLk = (lk: Set<string>) => lk.has(nn) || (cn.length >= 3 && lk.has(cn))
    let status: AttendanceStatus = 'pending'
    if (inLk(pLk)) status = 'present'
    else if (inLk(aLk)) status = 'absent'
    else if (inLk(peLk)) status = 'pending'
    return { memberId: m.id, name: m.name, company: m.company, status }
  })

  const guests = extractGuests(sections.guest)
  return { results, guests }
}
