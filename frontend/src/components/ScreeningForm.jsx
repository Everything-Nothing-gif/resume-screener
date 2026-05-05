import { useState, useRef } from 'react'
import { Upload, FileText, Loader, X, CheckCircle, AlertCircle } from 'lucide-react'

const API_URL = 'http://localhost:8000'

const SAMPLE_JD = `We are looking for a Python Backend Developer with strong experience in:

Required Skills:
- Python (3+ years)
- FastAPI or Flask for REST API development
- Machine Learning basics (scikit-learn, pandas, numpy)
- SQL databases (PostgreSQL or MySQL)
- Docker and Git for version control
- NLP/Natural Language Processing experience is a plus

Responsibilities:
- Design and implement scalable backend services
- Integrate ML models into production systems
- Collaborate with frontend and data science teams
- Write clean, testable, and well-documented code

Education: B.Tech/M.Tech in Computer Science or related field
Experience: 1-3 years (freshers with strong projects welcome)`

export default function ScreeningForm({ onResults, loading, setLoading }) {
  const [jd, setJd] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(f =>
      f.type === 'application/pdf' ||
      f.type === 'text/plain' ||
      f.name.endsWith('.pdf') ||
      f.name.endsWith('.txt')
    )
    if (validFiles.length !== newFiles.length) {
      setError('Only PDF and TXT files are supported')
    }
    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleSubmit = async () => {
    if (!jd.trim()) { setError('Please enter a job description'); return }
    if (files.length === 0) { setError('Please upload at least one resume'); return }

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('job_description', jd)
      files.forEach(f => formData.append('resumes', f))

      const resp = await fetch(`${API_URL}/screen`, {
        method: 'POST',
        body: formData,
      })

      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.detail || 'Server error')
      }

      const data = await resp.json()
      onResults(data)
    } catch (e) {
      setError(`Error: ${e.message}. Make sure the backend is running on port 8000.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Left: Job Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Job Description</h2>
            <button
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              onClick={() => setJd(SAMPLE_JD)}
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the job description here — include required skills, responsibilities, and qualifications..."
            style={{
              width: '100%',
              minHeight: 360,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              padding: '1rem',
              fontSize: '0.875rem',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'vertical',
              outline: 'none',
              lineHeight: 1.6,
            }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
            {jd.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      </div>

      {/* Right: Resume Upload */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Upload Resumes</h2>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10,
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(59,130,246,0.05)' : 'var(--surface2)',
              transition: 'all 0.2s',
              marginBottom: '1rem',
            }}
          >
            <Upload size={32} color={dragOver ? 'var(--accent)' : 'var(--muted)'} style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              Drop resumes here or click to browse
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              Supports PDF and TXT files • Multiple files allowed
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt"
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 200, overflowY: 'auto' }}>
              {files.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '0.6rem 0.75rem',
                }}>
                  <FileText size={16} color="var(--accent)" />
                  <span style={{ flex: 1, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {(f.size / 1024).toFixed(0)}KB
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 2 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
              No files selected
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: '#fca5a5',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem' }}
        >
          {loading ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing Resumes...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Screen {files.length > 0 ? `${files.length} Resume${files.length > 1 ? 's' : ''}` : 'Resumes'}
            </>
          )}
        </button>

        {/* Info */}
        <div className="card" style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#93c5fd' }}>
            How it works
          </h3>
          <ul style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1rem' }}>
            <li>Resume text is extracted from PDF/TXT</li>
            <li>Skills and sections are identified via NLP</li>
            <li>TF-IDF vectors are computed for JD + resumes</li>
            <li>Cosine similarity ranks candidates semantically</li>
          </ul>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
