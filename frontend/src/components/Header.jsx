import { Brain } from 'lucide-react'

export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(11,15,26,0.95)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              ResumeAI
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: -2 }}>
              AI-Powered Screening System
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
          <span>NLP • TF-IDF • Cosine Similarity</span>
        </div>
      </div>
    </header>
  )
}
