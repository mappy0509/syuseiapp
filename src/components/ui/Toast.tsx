interface Props {
  msg: string
  type: 'success' | 'info' | 'error'
}

const bgMap = {
  success: '#ECFDF5',
  info: '#EFF6FF',
  error: '#FEF2F2',
}

const borderMap = {
  success: 'rgba(5,150,105,.3)',
  info: 'rgba(37,99,235,.3)',
  error: 'rgba(220,38,38,.3)',
}

const colorMap = {
  success: '#065F46',
  info: '#1E40AF',
  error: '#991B1B',
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
      boxShadow: '0 8px 32px rgba(0,0,0,.12)',
      animation: 'slideUp .3s both',
      whiteSpace: 'nowrap',
      maxWidth: '90vw',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      background: bgMap[type],
      border: `1px solid ${borderMap[type]}`,
      color: colorMap[type],
    }}>
      {iconMap[type]}{msg}
    </div>
  )
}
