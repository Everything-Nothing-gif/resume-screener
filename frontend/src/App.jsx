import { useState } from 'react'
import './index.css'
import ScreeningForm from './components/ScreeningForm'
import Results from './components/Results'
import Header from './components/Header'

export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('screen')

  const handleResults = (data) => {
    setResults(data)
    setActiveTab('results')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <button
            className="btn"
            onClick={() => setActiveTab('screen')}
            style={{
              background: activeTab === 'screen' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'screen' ? 'white' : 'var(--muted)',
              border: activeTab === 'screen' ? 'none' : '1px solid var(--border)',
            }}
          >
            Screen Resumes
          </button>
          {results && (
            <button
              className="btn"
              onClick={() => setActiveTab('results')}
              style={{
                background: activeTab === 'results' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'results' ? 'white' : 'var(--muted)',
                border: activeTab === 'results' ? 'none' : '1px solid var(--border)',
              }}
            >
              Results ({results.total})
            </button>
          )}
        </div>

        {activeTab === 'screen' && (
          <ScreeningForm
            onResults={handleResults}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {activeTab === 'results' && results && (
          <Results data={results} onBack={() => setActiveTab('screen')} />
        )}
      </main>
    </div>
  )
}
