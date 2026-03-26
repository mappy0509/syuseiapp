interface Props {
  msg: string
  type: 'success' | 'info' | 'error'
}

const bgMap = {
  success: 'linear-gradient(135deg,#065F46,#064E3B)',
  info: 'linear-gradient(135deg,#1E3A5F,#1E293B)',
  error: 'linear-gradient(135deg,#7F1D1D,#991B1B)',
}

const borderMap = {
  success: 'rgba(16,185,129,.3)',
  info: 'rgba(59,130,246,.3)',
  error: 'rgba(239,68,68,.3)',
}

const iconMap = { success: '✓ ', info: 'ℹ ', error: '✕ ' }

export function Toast({ msg, type }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 600,
      padding: '10px 20px',
      borderRadius: 'var(--rs)',
      fontSize: '13px',
      fontWeight: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      animation: 'slideUp .3s both',
      whiteSpace: 'nowrap',
      maxWidth: '90vw',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      background: bgMap[type],
      border: `1px solid ${borderMap[type]}`,
      color: '#F0EFE8',
    }}>
      {iconMap[type]}{msg}
    </div>
  )
}
