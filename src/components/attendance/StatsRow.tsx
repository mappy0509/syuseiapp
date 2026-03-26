interface StatsData {
  rate: number
  present: number
  absent: number
  pending: number
  paid: number
  guests: number
}

interface Props {
  stats: StatsData
}

export function StatsRow({ stats }: Props) {
  const items = [
    { label: '出席率', value: `${stats.rate}%`, color: 'var(--gold)' },
    { label: '出席', value: stats.present, color: 'var(--green)' },
    { label: '欠席', value: stats.absent, color: 'var(--red)' },
    { label: '未回答', value: stats.pending, color: 'var(--blue)' },
    { label: '入金', value: stats.paid, color: 'var(--amber)' },
    { label: 'ゲスト', value: stats.guests, color: 'var(--violet)' },
  ]

  return (
    <div className="stats-row">
      {items.map((item, i) => (
        <div key={i} style={{ ...styles.card, animationDelay: `${i * 50}ms` }}>
          <div style={styles.label}>{item.label}</div>
          <div style={{ ...styles.value, color: item.color }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '14px 12px',
    animation: 'slideUp .4s both',
  },
  label: {
    fontSize: '10px',
    color: 'var(--txt2)',
    fontWeight: 600,
    letterSpacing: '.08em',
    marginBottom: '4px',
  },
  value: {
    fontSize: '26px',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    letterSpacing: '-.02em',
    lineHeight: 1.1,
  },
}
