import { useState } from 'react'
import { ArrowLeft, Trophy, User, Mail, Phone, CheckCircle, XCircle, BarChart2, ChevronDown, ChevronUp } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

const ScoreBar = ({ value, color = 'var(--accent)', label }) => (
  <div style={{ marginBottom: '0.6rem' }}>
    {label && (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{value}%</span>
      </div>
    )}
    <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${value}%`,
        background: color,
        borderRadius: 3,
        transition: 'width 0.8s ease',
      }} />
    </div>
  </div>
)

const RankBadge = ({ rank }) => {
  const colors = {
    1: { bg: '#fbbf24', text: '#0b0f1a' },
    2: { bg: '#94a3b8', text: '#0b0f1a' },
    3: { bg: '#b45309', text: '#fff' },
  }
  const style = colors[rank] || { bg: 'var(--surface2)', text: 'var(--muted)' }
  return (
    <div style={{
      width: 32, height: 32,
      borderRadius: '50%',
      background: style.bg,
      color: style.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne, sans-serif',
      fontWeight: 800,
      fontSize: '0.9rem',
      flexShrink: 0,
    }}>
      {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
    </div>
  )
}

const getScoreColor = (score) => {
  if (score >= 70) return 'var(--success)'
  if (score >= 45) return 'var(--warn)'
  return 'var(--danger)'
}

const getScoreLabel = (score) => {
  if (score >= 70) return { text: 'Strong Match', cls: 'tag-green' }
  if (score >= 45) return { text: 'Moderate Match', cls: 'tag-yellow' }
  return { text: 'Weak Match', cls: 'tag-red' }
}

function CandidateCard({ candidate, isExpanded, onToggle }) {
  const label = getScoreLabel(candidate.final_score)

  const radarData = [
    { subject: 'Semantic', value: candidate.cosine_similarity },
    { subject: 'Skills', value: candidate.skill_match },
    { subject: 'Keywords', value: candidate.keyword_match },
  ]

  return (
    <div className="card" style={{
      border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)',
      transition: 'border-color 0.2s',
    }}>
      {/* Summary row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <RankBadge rank={candidate.rank} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {candidate.name || candidate.filename}
            </h3>
            <span className={`tag ${label.cls}`}>{label.text}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {candidate.filename}
          </p>
        </div>

        {/* Score pill */}
        <div style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '0.4rem 1rem',
          textAlign: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '1.4rem',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            color: getScoreColor(candidate.final_score),
          }}>
            {candidate.final_score}%
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Match Score</div>
        </div>

        <div style={{ color: 'var(--muted)' }}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Score bars preview */}
      <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        {[
          { label: 'Semantic', value: candidate.cosine_similarity },
          { label: 'Skills', value: candidate.skill_match },
          { label: 'Keywords', value: candidate.keyword_match },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>{s.label}</div>
            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.value}%`, background: getScoreColor(s.value), borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', fontWeight: 600 }}>{s.value}%</div>
          </div>
        ))}
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Left: contact + scores */}
            <div>
              {/* Contact */}
              {(candidate.email || candidate.phone) && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {candidate.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <Mail size={13} />{candidate.email}
                    </span>
                  )}
                  {candidate.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <Phone size={13} />{candidate.phone}
                    </span>
                  )}
                </div>
              )}

              <ScoreBar value={candidate.cosine_similarity} color="var(--accent)" label="Semantic Similarity (TF-IDF Cosine)" />
              <ScoreBar value={candidate.skill_match} color="var(--success)" label="Skill Match" />
              <ScoreBar value={candidate.keyword_match} color="var(--warn)" label="Keyword Overlap" />
              <ScoreBar value={candidate.final_score} color={getScoreColor(candidate.final_score)} label="Overall Score" />

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                <span>📚 Education signals: {candidate.education_indicators}</span>
                <span>💼 Experience signals: {candidate.experience_indicators}</span>
              </div>
            </div>

            {/* Right: skills */}
            <div>
              {candidate.matched_skills?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={14} color="var(--success)" /> Matched Skills ({candidate.matched_skills.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {candidate.matched_skills.map(s => (
                      <span key={s} className="tag tag-green">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {candidate.missing_skills?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <XCircle size={14} color="var(--danger)" /> Missing Skills ({candidate.missing_skills.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {candidate.missing_skills.map(s => (
                      <span key={s} className="tag tag-red">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {candidate.all_skills?.soft?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>
                    Soft Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {candidate.all_skills.soft.map(s => (
                      <span key={s} className="tag tag-blue">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Results({ data, onBack }) {
  const [expanded, setExpanded] = useState(new Set([0]))

  const toggle = (i) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const chartData = data.candidates.map(c => ({
    name: c.filename.replace('.pdf','').replace('.txt','').slice(0, 12),
    score: c.final_score,
  }))

  const avg = Math.round(data.candidates.reduce((sum, c) => sum + c.final_score, 0) / data.candidates.length)
  const top = data.candidates[0]
  const shortlisted = data.candidates.filter(c => c.final_score >= 50).length

  return (
    <div>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-outline" onClick={onBack} style={{ padding: '0.5rem 0.75rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Screening Results</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
            {data.candidates.length} candidates analyzed • Ranked by semantic match score
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Candidates', value: data.total, icon: '👥' },
          { label: 'Shortlisted (≥50%)', value: shortlisted, icon: '✅' },
          { label: 'Average Score', value: `${avg}%`, icon: '📊' },
          { label: 'Top Score', value: `${top?.final_score}%`, icon: '🏆' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {data.candidates.length > 1 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={16} /> Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                formatter={(v) => [`${v}%`, 'Match Score']}
              />
              <Bar dataKey="score" radius={[4,4,0,0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Candidate cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.candidates.map((c, i) => (
          <CandidateCard
            key={i}
            candidate={c}
            isExpanded={expanded.has(i)}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </div>
  )
}
