import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { AttendanceRecord, AttendanceStatus, GuestEntry } from '../lib/types'

export function useAttendance(teamId: string | null, meetingId: number) {
  const [records, setRecords] = useState<Map<string, AttendanceRecord>>(new Map())
  const [loading, setLoading] = useState(false)

  const fetchAttendance = useCallback(async () => {
    if (!teamId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('meeting_id', meetingId)
      .in(
        'member_id',
        (
          await supabase
            .from('members')
            .select('id')
            .eq('team_id', teamId)
            .eq('is_active', true)
        ).data?.map((m) => m.id) ?? []
      )

    if (!error && data) {
      const map = new Map<string, AttendanceRecord>()
      for (const rec of data) map.set(rec.member_id, rec as AttendanceRecord)
      setRecords(map)
    }
    setLoading(false)
  }, [teamId, meetingId])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const getStatus = useCallback(
    (memberId: string): AttendanceStatus => records.get(memberId)?.status ?? 'pending',
    [records]
  )

  const getRecord = useCallback(
    (memberId: string): AttendanceRecord | undefined => records.get(memberId),
    [records]
  )

  const upsertStatus = useCallback(
    async (memberId: string, status: AttendanceStatus) => {
      const existing = records.get(memberId)
      if (existing) {
        const { error } = await supabase
          .from('attendance')
          .update({ status })
          .eq('id', existing.id)
        if (!error) {
          setRecords((prev) => {
            const next = new Map(prev)
            next.set(memberId, { ...existing, status })
            return next
          })
        }
      } else {
        const { data, error } = await supabase
          .from('attendance')
          .insert({ meeting_id: meetingId, member_id: memberId, status, guest_count: 0, guest_names: [], paid: false })
          .select()
          .single()
        if (!error && data) {
          setRecords((prev) => {
            const next = new Map(prev)
            next.set(memberId, data as AttendanceRecord)
            return next
          })
        }
      }
    },
    [records, meetingId]
  )

  const updateGuestCount = useCallback(
    async (memberId: string, delta: number) => {
      const existing = records.get(memberId)
      const newCount = Math.max(0, (existing?.guest_count ?? 0) + delta)
      if (existing) {
        const { error } = await supabase
          .from('attendance')
          .update({ guest_count: newCount })
          .eq('id', existing.id)
        if (!error) {
          setRecords((prev) => {
            const next = new Map(prev)
            next.set(memberId, { ...existing, guest_count: newCount })
            return next
          })
        }
      } else {
        const { data, error } = await supabase
          .from('attendance')
          .insert({ meeting_id: meetingId, member_id: memberId, status: 'pending', guest_count: newCount, guest_names: [], paid: false })
          .select()
          .single()
        if (!error && data) {
          setRecords((prev) => {
            const next = new Map(prev)
            next.set(memberId, data as AttendanceRecord)
            return next
          })
        }
      }
    },
    [records, meetingId]
  )

  const togglePaid = useCallback(
    async (memberId: string) => {
      const existing = records.get(memberId)
      const newPaid = !(existing?.paid ?? false)
      if (existing) {
        const { error } = await supabase
          .from('attendance')
          .update({ paid: newPaid })
          .eq('id', existing.id)
        if (!error) {
          setRecords((prev) => {
            const next = new Map(prev)
            next.set(memberId, { ...existing, paid: newPaid })
            return next
          })
        }
      } else {
        const { data, error } = await supabase
          .from('attendance')
          .insert({ meeting_id: meetingId, member_id: memberId, status: 'pending', guest_count: 0, guest_names: [], paid: newPaid })
          .select()
          .single()
        if (!error && data) {
          setRecords((prev) => {
            const next = new Map(prev)
            next.set(memberId, data as AttendanceRecord)
            return next
          })
        }
      }
    },
    [records, meetingId]
  )

  const updateNote = useCallback(
    async (memberId: string, note: string) => {
      const existing = records.get(memberId)
      if (existing) {
        await supabase.from('attendance').update({ note }).eq('id', existing.id)
        setRecords((prev) => {
          const next = new Map(prev)
          next.set(memberId, { ...existing, note })
          return next
        })
      } else {
        const { data, error } = await supabase
          .from('attendance')
          .insert({ meeting_id: meetingId, member_id: memberId, status: 'pending', guest_count: 0, guest_names: [], paid: false, note })
          .select()
          .single()
        if (!error && data) {
          setRecords((prev) => {
            const next = new Map(prev)
            next.set(memberId, data as AttendanceRecord)
            return next
          })
        }
      }
    },
    [records, meetingId]
  )

  const bulkUpsert = useCallback(
    async (entries: { memberId: string; status: AttendanceStatus }[], guestList: GuestEntry[]) => {
      const ops = entries.map(({ memberId, status }) => {
        const existing = records.get(memberId)
        if (existing) {
          return supabase.from('attendance').update({ status }).eq('id', existing.id)
        }
        return supabase.from('attendance').insert({
          meeting_id: meetingId, member_id: memberId, status, guest_count: 0, guest_names: [], paid: false,
        })
      })
      await Promise.all(ops)

      // Store guest list summary on a special "team-level" record if needed — for now just refetch
      await fetchAttendance()
      return { guestCount: guestList.length }
    },
    [records, meetingId, fetchAttendance]
  )

  const stats = useCallback(
    (memberIds: string[]) => {
      let present = 0, absent = 0, pending = 0, guests = 0, paid = 0
      for (const id of memberIds) {
        const rec = records.get(id)
        const s = rec?.status ?? 'pending'
        if (s === 'present') present++
        else if (s === 'absent') absent++
        else pending++
        guests += rec?.guest_count ?? 0
        if (rec?.paid) paid++
      }
      const total = memberIds.length
      const rate = (present + absent) > 0 ? Math.round(present / (present + absent) * 100) : 0
      return { present, absent, pending, guests, paid, total, rate }
    },
    [records]
  )

  return {
    records,
    loading,
    getStatus,
    getRecord,
    upsertStatus,
    updateGuestCount,
    togglePaid,
    updateNote,
    bulkUpsert,
    stats,
    refetch: fetchAttendance,
  }
}
