import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClose: () => void
  maxWidth?: string
}

export function Modal({ children, onClose, maxWidth = '460px' }: Props) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'rgba(0,0,0,.7)',
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn .2s both',
  },
  modal: {
    width: '100%',
    maxHeight: '90dvh',
    overflowY: 'auto',
    padding: '28px 24px',
    background: 'var(--card)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--r)',
    boxShadow: '0 32px 64px rgba(0,0,0,.5)',
    animation: 'scaleIn .25s both',
    WebkitOverflowScrolling: 'touch',
  },
}
