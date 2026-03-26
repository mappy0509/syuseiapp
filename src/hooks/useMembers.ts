import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Member, MemberRole } from '../lib/types'

export function useMembers(teamId: string | null) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMembers = useCallback(async () => {
    if (!teamId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (!error && data) setMembers(data as Member[])
    setLoading(false)
  }, [teamId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const addMember = useCallback(
    async (name: string, company: string, role: MemberRole) => {
      if (!teamId) return
      const maxOrder = members.length ? Math.max(...members.map((m) => m.sort_order)) + 1 : 0
      const { data, error } = await supabase
        .from('members')
        .insert({ team_id: teamId, name, company, role, is_active: true, sort_order: maxOrder })
        .select()
        .single()
      if (!error && data) setMembers((prev) => [...prev, data as Member])
      return { error }
    },
    [teamId, members]
  )

  const addMembersBulk = useCallback(
    async (entries: { name: string; company: string }[]) => {
      if (!teamId) return { added: 0, skipped: 0 }
      const existing = new Set(members.map((m) => m.name.replace(/[\s　]/g, '')))
      const toInsert: object[] = []
      let skipped = 0
      let maxOrder = members.length ? Math.max(...members.map((m) => m.sort_order)) + 1 : 0

      for (const entry of entries) {
        const normalized = entry.name.replace(/[\s　]/g, '')
        if (existing.has(normalized)) { skipped++; continue }
        toInsert.push({ team_id: teamId, name: entry.name, company: entry.company, role: '準会員', is_active: true, sort_order: maxOrder++ })
        existing.add(normalized)
      }

      if (toInsert.length === 0) return { added: 0, skipped }
      const { error } = await supabase.from('members').insert(toInsert)
      if (!error) await fetchMembers()
      return { added: toInsert.length, skipped, error }
    },
    [teamId, members, fetchMembers]
  )

  const updateMember = useCallback(
    async (id: string, name: string, company: string, role: MemberRole) => {
      const { error } = await supabase
        .from('members')
        .update({ name, company, role })
        .eq('id', id)
      if (!error) setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name, company, role } : m)))
      return { error }
    },
    []
  )

  const deleteMember = useCallback(async (id: string) => {
    const { error } = await supabase.from('members').update({ is_active: false }).eq('id', id)
    if (!error) setMembers((prev) => prev.filter((m) => m.id !== id))
    return { error }
  }, [])

  return { members, loading, addMember, addMembersBulk, updateMember, deleteMember, refetch: fetchMembers }
}
