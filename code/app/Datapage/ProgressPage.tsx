import type { FC } from 'react'
import React, { useState } from 'react'

// ─── Shared CSS (matches TimeLinePage tokens exactly) ─────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --tk-bg: #f4f4f5;
    --tk-card: #ffffff;
    --tk-border: #d4d4d8;
    --tk-divider: #e4e4e7;
    --tk-muted: #71717a;
    --tk-text: #18181b;
    --tk-soft: #fafafa;
    --tk-softHover: #f4f4f5;
    --tk-grid: #f0f0f3;
    --tk-accent: #d6b25e;
    --tk-accentHover: #e6c870;
    --tk-accentSoftBg: rgba(214,178,94,0.14);
    --tk-accentSoftText: #6b4f12;
    --tk-overlay: rgba(0,0,0,0.28);
    --tk-darkBtn: #18181b;
  }

  body { background: var(--tk-bg); color: var(--tk-text); font-family: 'Inter', sans-serif; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--tk-divider); }
  ::-webkit-scrollbar-thumb { background: var(--tk-border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--tk-accent); }

  .tk-header {
    border-bottom: 1px solid var(--tk-border);
    background: color-mix(in srgb, var(--tk-bg) 92%, transparent);
    backdrop-filter: blur(10px);
  }

  .tk-card { background: var(--tk-card); border: 1px solid var(--tk-border); }
  .tk-sidebar { background: var(--tk-card); border-left: 1px solid var(--tk-border); }

  .tk-btn {
    border: 1px solid var(--tk-border);
    background: var(--tk-card);
    color: var(--tk-text);
    cursor: pointer;
    transition: background 0.13s, border-color 0.13s;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    border-radius: 3px;
    padding: 6px 14px;
  }
  .tk-btn:hover { background: var(--tk-softHover); }
  .tk-btn.active {
    background: var(--tk-accentSoftBg);
    border-color: color-mix(in srgb, var(--tk-accent) 55%, var(--tk-border));
    color: var(--tk-accentSoftText);
  }

  .tk-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--tk-muted);
    margin-bottom: 12px;
  }

  .tk-tag {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 2px;
    background: var(--tk-accentSoftBg);
    color: var(--tk-accentSoftText);
    border: 1px solid color-mix(in srgb, var(--tk-accent) 35%, var(--tk-border));
  }

  .tk-logo-upload {
    width: 34px; height: 34px;
    border-radius: 4px;
    border: 1.5px dashed var(--tk-border);
    background: var(--tk-soft);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .tk-logo-upload img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Progress bar track ── */
  .tk-track {
    height: 8px;
    background: var(--tk-divider);
    border-radius: 100px;
    overflow: visible;
    position: relative;
  }
  .tk-track-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
    position: relative;
  }
  /* goal marker line */
  .tk-goal-marker {
    position: absolute;
    top: -3px;
    width: 2px;
    height: 14px;
    background: var(--tk-border);
    border-radius: 1px;
    transform: translateX(-50%);
  }

  /* ── Client section header ── */
  .tk-client-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    cursor: pointer;
    transition: background 0.1s;
    border-bottom: 1px solid var(--tk-divider);
    user-select: none;
  }
  .tk-client-header:hover { background: var(--tk-softHover); }

  /* ── Matter row ── */
  .tk-matter-row {
    padding: 14px 20px 14px 44px;
    border-bottom: 1px solid var(--tk-divider);
    cursor: pointer;
    transition: background 0.1s;
  }
  .tk-matter-row:hover { background: var(--tk-softHover); }
  .tk-matter-row:last-child { border-bottom: none; }

  /* ── Modal ── */
  .tk-modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: var(--tk-overlay);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(3px);
  }
  .tk-modal {
    background: var(--tk-card);
    border: 1px solid var(--tk-border);
    border-radius: 6px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.14);
    padding: 36px 40px;
    max-width: 580px;
    width: 92%;
    position: relative;
    max-height: 85vh;
    overflow-y: auto;
  }

  /* ── Sidebar client filter pill ── */
  .tk-client-pill {
    display: flex; align-items: center; gap: 7px;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 0.1s, border-color 0.1s;
    user-select: none;
  }
  .tk-client-pill:hover { background: var(--tk-softHover); border-color: var(--tk-divider); }
  .tk-client-pill.active { background: var(--tk-soft); border-color: var(--tk-border); }

  /* ── Stat chip ── */
  .tk-stat {
    background: var(--tk-soft);
    border: 1px solid var(--tk-divider);
    border-radius: 4px;
    padding: 10px 14px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .tk-fadein { animation: fadeIn 0.22s ease both; }
`

// ─── Types ────────────────────────────────────────────────────────────────────

type LogEntry = {
  date: string      // ISO-ish label e.g. "2025-09-10"
  units: number     // 6-min units
  note: string
}

type Matter = {
  id: string
  name: string
  goalUnits: number    // total budget in 6-min units
  loggedUnits: number  // already recorded
  log: LogEntry[]
  tags?: string[]
  status: 'on-track' | 'at-risk' | 'over-budget' | 'complete'
}

type Client = {
  id: string
  name: string
  dotColor: string
  blockBorder: string
  matters: Matter[]
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const DATA: Client[] = [
  {
    id: 'redwood', name: 'Redwood Ltd', dotColor: '#2563eb', blockBorder: '#2563eb',
    matters: [
      {
        id: 'm1', name: 'Redwood v. Callahan — Litigation',
        goalUnits: 100, loggedUnits: 72,
        status: 'on-track',
        tags: ['Litigation', 'Drafting'],
        log: [
          { date: '2025-09-08', units: 20, note: 'Initial pleadings review and strategy memo' },
          { date: '2025-09-10', units: 18, note: 'Correspondence with opposing counsel; discovery requests' },
          { date: '2025-09-15', units: 22, note: 'Drafted amended defence; partner review' },
          { date: '2025-09-18', units: 12, note: 'Client attendance re: settlement instructions' },
        ],
      },
      {
        id: 'm2', name: 'Strike-Out Application',
        goalUnits: 40, loggedUnits: 38,
        status: 'at-risk',
        tags: ['Litigation', 'Research'],
        log: [
          { date: '2025-09-16', units: 16, note: 'Legal research on applicable strike-out authorities' },
          { date: '2025-09-18', units: 22, note: 'Written submissions drafted and revised (12 pp)' },
        ],
      },
      {
        id: 'm3', name: 'Corporate Restructure Advice',
        goalUnits: 60, loggedUnits: 14,
        status: 'on-track',
        tags: ['Corporate', 'Advisory'],
        log: [
          { date: '2025-09-12', units: 14, note: 'Preliminary advice memo on restructure options' },
        ],
      },
    ],
  },
  {
    id: 'meridian', name: 'Meridian Capital', dotColor: '#9333ea', blockBorder: '#9333ea',
    matters: [
      {
        id: 'm4', name: 'Meridian Acquisition — Due Diligence',
        goalUnits: 80, loggedUnits: 80,
        status: 'complete',
        tags: ['M&A', 'Due Diligence'],
        log: [
          { date: '2025-09-02', units: 30, note: 'Phase 1 due diligence — corporate records review' },
          { date: '2025-09-09', units: 30, note: 'Phase 2 — financial statements and asset schedule' },
          { date: '2025-09-15', units: 20, note: 'Final DD report drafted and delivered' },
        ],
      },
      {
        id: 'm5', name: 'SPA Negotiation',
        goalUnits: 50, loggedUnits: 62,
        status: 'over-budget',
        tags: ['M&A', 'Drafting'],
        log: [
          { date: '2025-09-10', units: 20, note: 'First draft SPA prepared; circulated to client' },
          { date: '2025-09-13', units: 22, note: 'Negotiation sessions with counterparty counsel (3 rounds)' },
          { date: '2025-09-17', units: 20, note: 'Revised SPA; representations clause mark-up' },
        ],
      },
    ],
  },
  {
    id: 'harris', name: 'Harris & Associates', dotColor: '#16a34a', blockBorder: '#16a34a',
    matters: [
      {
        id: 'm6', name: 'Employment Dispute — Unfair Dismissal',
        goalUnits: 35, loggedUnits: 18,
        status: 'on-track',
        tags: ['Employment', 'Litigation'],
        log: [
          { date: '2025-09-11', units: 10, note: 'Initial client instructions; reviewed employment contract' },
          { date: '2025-09-18', units: 8, note: 'Draft correspondence to opposing solicitors re: disclosure' },
        ],
      },
      {
        id: 'm7', name: 'Shareholder Agreement Review',
        goalUnits: 20, loggedUnits: 20,
        status: 'complete',
        tags: ['Corporate'],
        log: [
          { date: '2025-09-05', units: 20, note: 'Full review and mark-up of shareholder agreement; client report' },
        ],
      },
    ],
  },
  {
    id: 'internal', name: 'Internal', dotColor: '#71717a', blockBorder: '#71717a',
    matters: [
      {
        id: 'm8', name: 'Q3 Billing & Compliance Review',
        goalUnits: 15, loggedUnits: 5,
        status: 'on-track',
        tags: ['Admin'],
        log: [
          { date: '2025-09-18', units: 5, note: 'Billing entries reviewed; matter codes updated' },
        ],
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unitsToHours(u: number) { return (u * 6 / 60).toFixed(1) }
function pct(logged: number, goal: number) { return Math.min(Math.round((logged / goal) * 100), 100) }

const STATUS_CONFIG = {
  'on-track':    { label: 'On Track',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  'at-risk':     { label: 'At Risk',     color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  'over-budget': { label: 'Over Budget', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  'complete':    { label: 'Complete',    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
} as const

function getBarColor(m: Matter) {
  if (m.status === 'complete')    return '#2563eb'
  if (m.status === 'over-budget') return '#dc2626'
  if (m.status === 'at-risk')     return '#d97706'
  return '#16a34a'
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: FC<{ status: Matter['status'] }> = ({ status }) => {
  const s = STATUS_CONFIG[status]
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace", fontSize: 9,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar: FC<{ matter: Matter; showGoalMarker?: boolean }> = ({ matter, showGoalMarker = true }) => {
  const p = pct(matter.loggedUnits, matter.goalUnits)
  const color = getBarColor(matter)
  // if over budget, bar is full but coloured red
  const fillPct = matter.loggedUnits > matter.goalUnits ? 100 : p

  return (
    <div className="tk-track" style={{ flex: 1 }}>
      <div className="tk-track-fill" style={{ width: `${fillPct}%`, background: color }} />
      {/* goal marker at 100% only makes sense when over */}
      {showGoalMarker && matter.loggedUnits > matter.goalUnits && (
        <div className="tk-goal-marker" style={{ left: `${Math.round((matter.goalUnits / matter.loggedUnits) * 100)}%` }} />
      )}
    </div>
  )
}

// ─── Matter Detail Modal ──────────────────────────────────────────────────────

const MatterModal: FC<{ matter: Matter; client: Client; onClose: () => void }> = ({ matter, client, onClose }) => {
  const p = pct(matter.loggedUnits, matter.goalUnits)
  const remaining = matter.goalUnits - matter.loggedUnits
  const color = getBarColor(matter)

  return (
    <div className="tk-modal-overlay" onClick={onClose}>
      <div className="tk-modal tk-fadein" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 16,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--tk-muted)', fontSize: 18, lineHeight: 1,
        }}>×</button>

        {/* Client */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: client.dotColor, flexShrink: 0 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: client.dotColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {client.name}
          </span>
        </div>

        {/* Matter name */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20, fontWeight: 600, color: 'var(--tk-text)',
          lineHeight: 1.35, marginBottom: 6,
        }}>{matter.name}</div>

        {/* Tags + status */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--tk-divider)' }}>
          {matter.tags?.map(t => <span key={t} className="tk-tag">{t}</span>)}
          <StatusBadge status={matter.status} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Logged', value: `${unitsToHours(matter.loggedUnits)} hrs`, sub: `${matter.loggedUnits} units` },
            { label: 'Budget', value: `${unitsToHours(matter.goalUnits)} hrs`, sub: `${matter.goalUnits} units` },
            {
              label: remaining >= 0 ? 'Remaining' : 'Over by',
              value: `${unitsToHours(Math.abs(remaining))} hrs`,
              sub: `${Math.abs(remaining)} units`,
              highlight: remaining < 0,
            },
          ].map(s => (
            <div key={s.label} className="tk-stat">
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'var(--tk-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: s.highlight ? '#dc2626' : 'var(--tk-accentSoftText)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--tk-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Big progress bar */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--tk-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Progress</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color, fontWeight: 500 }}>{p}%</span>
          </div>
          <div className="tk-track" style={{ height: 12 }}>
            <div className="tk-track-fill" style={{ width: `${Math.min(p, 100)}%`, background: color }} />
          </div>
        </div>

        {/* Time log */}
        <div style={{ marginTop: 24 }}>
          <div className="tk-section-label">Time Log</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--tk-divider)', borderRadius: 4, overflow: 'hidden' }}>
            {matter.log.map((entry, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '100px 60px 1fr',
                gap: 12, padding: '10px 14px',
                borderBottom: i < matter.log.length - 1 ? '1px solid var(--tk-divider)' : 'none',
                background: i % 2 === 0 ? 'var(--tk-soft)' : 'var(--tk-card)',
              }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-accentSoftText)' }}>{entry.date}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-muted)' }}>{entry.units}u</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--tk-text)', lineHeight: 1.5 }}>{entry.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar: FC<{
  clients: Client[]
  activeClientId: string | null
  onSelectClient: (id: string | null) => void
}> = ({ clients, activeClientId, onSelectClient }) => {

  // Aggregate totals
  const allMatters = clients.flatMap(c => c.matters)
  const totalLogged = allMatters.reduce((s, m) => s + m.loggedUnits, 0)
  const totalGoal   = allMatters.reduce((s, m) => s + m.goalUnits, 0)
  const overCount   = allMatters.filter(m => m.status === 'over-budget').length
  const atRiskCount = allMatters.filter(m => m.status === 'at-risk').length

  return (
    <aside className="tk-sidebar" style={{
      width: 234, flexShrink: 0,
      padding: '24px 16px',
      display: 'flex', flexDirection: 'column', gap: 24,
      overflowY: 'auto',
    }}>
      {/* Overall summary */}
      <div>
        <div className="tk-section-label">Overall Progress</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--tk-accentSoftText)', lineHeight: 1 }}>
          {unitsToHours(totalLogged)}
          <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--tk-muted)', marginLeft: 4 }}>hrs</span>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-muted)', marginTop: 3 }}>
          of {unitsToHours(totalGoal)} hrs budgeted
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="tk-track" style={{ height: 6 }}>
            <div className="tk-track-fill" style={{
              width: `${Math.min(pct(totalLogged, totalGoal), 100)}%`,
              background: 'var(--tk-accent)',
            }} />
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--tk-muted)', marginTop: 4 }}>
            {pct(totalLogged, totalGoal)}% of total budget used
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(overCount > 0 || atRiskCount > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="tk-section-label">Alerts</div>
          {overCount > 0 && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4,
              padding: '8px 10px', fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#dc2626',
            }}>
              {overCount} matter{overCount > 1 ? 's' : ''} over budget
            </div>
          )}
          {atRiskCount > 0 && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4,
              padding: '8px 10px', fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#d97706',
            }}>
              {atRiskCount} matter{atRiskCount > 1 ? 's' : ''} at risk
            </div>
          )}
        </div>
      )}

      {/* Client filter */}
      <div>
        <div className="tk-section-label">Filter by Client</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            className={`tk-client-pill${activeClientId === null ? ' active' : ''}`}
            onClick={() => onSelectClient(null)}
          >
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--tk-border)' }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--tk-text)' }}>All Clients</span>
          </div>
          {clients.map(c => {
            const logged = c.matters.reduce((s, m) => s + m.loggedUnits, 0)
            const goal   = c.matters.reduce((s, m) => s + m.goalUnits, 0)
            const p2     = pct(logged, goal)
            return (
              <div
                key={c.id}
                className={`tk-client-pill${activeClientId === c.id ? ' active' : ''}`}
                onClick={() => onSelectClient(activeClientId === c.id ? null : c.id)}
              >
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: c.dotColor, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--tk-text)', flex: 1 }}>{c.name}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--tk-muted)' }}>{p2}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Donut chart per client */}
<div>
  <div className="tk-section-label">Hours by Client</div>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {clients.map(c => {
      const logged = c.matters.reduce((s, m) => s + m.loggedUnits, 0)
      const goal   = c.matters.reduce((s, m) => s + m.goalUnits, 0)
      const p      = Math.min(pct(logged, goal), 100)
      const r = 22, stroke = 6
      const circ = 2 * Math.PI * r
      const dash = (p / 100) * circ

      return (
        <div key={c.id} style={{
          opacity: activeClientId && activeClientId !== c.id ? 0.35 : 1,
          transition: 'opacity 0.2s',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* Donut */}
          <svg width={56} height={56} style={{ flexShrink: 0 }}>
            {/* Track */}
            <circle cx={28} cy={28} r={r}
              fill="none" stroke="var(--tk-divider)" strokeWidth={stroke} />
            {/* Fill */}
            <circle cx={28} cy={28} r={r}
              fill="none" stroke={c.dotColor} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
              style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)' }}
            />
            {/* Centre label */}
            <text x={28} y={31} textAnchor="middle"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: 'var(--tk-accentSoftText)', fontWeight: 500 }}>
              {p}%
            </text>
          </svg>

          {/* Text */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: c.dotColor }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--tk-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-accentSoftText)' }}>
              {unitsToHours(logged)}h
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'var(--tk-muted)' }}>
              of {unitsToHours(goal)}h budgeted
            </div>
          </div>
        </div>
      )
    })}
  </div>
</div>
    </aside>
  )
}

// ─── Client Block ─────────────────────────────────────────────────────────────

const ClientBlock: FC<{
  client: Client
  onSelectMatter: (m: Matter, c: Client) => void
}> = ({ client, onSelectMatter }) => {
  const [expanded, setExpanded] = useState(true)
  const totalLogged = client.matters.reduce((s, m) => s + m.loggedUnits, 0)
  const totalGoal   = client.matters.reduce((s, m) => s + m.goalUnits, 0)
  const p           = pct(totalLogged, totalGoal)

  return (
    <div className="tk-card tk-fadein" style={{ borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
      {/* Client header */}
      <div className="tk-client-header" onClick={() => setExpanded(e => !e)}>
        {/* Chevron */}
        <span style={{
          fontFamily: 'monospace', fontSize: 11, color: 'var(--tk-muted)',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.18s',
          display: 'inline-block', width: 14, flexShrink: 0,
        }}>›</span>

        {/* Dot + name */}
        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: client.dotColor, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--tk-text)', flex: 1 }}>
          {client.name}
        </span>

        {/* Summary numbers */}
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-muted)', marginRight: 16 }}>
          {client.matters.length} matter{client.matters.length !== 1 ? 's' : ''}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-accentSoftText)', marginRight: 16 }}>
          {unitsToHours(totalLogged)} / {unitsToHours(totalGoal)} hrs
        </span>

        {/* Mini bar */}
        <div style={{ width: 80, flexShrink: 0 }}>
          <div className="tk-track" style={{ height: 5 }}>
            <div className="tk-track-fill" style={{ width: `${Math.min(p, 100)}%`, background: client.dotColor }} />
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'var(--tk-muted)', marginTop: 3, textAlign: 'right' }}>{p}%</div>
        </div>
      </div>

      {/* Matter rows */}
      {expanded && client.matters.map((matter) => {
        const mp     = pct(matter.loggedUnits, matter.goalUnits)
        const color  = getBarColor(matter)
        const remain = matter.goalUnits - matter.loggedUnits

        return (
          <div key={matter.id} className="tk-matter-row" onClick={() => onSelectMatter(matter, client)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
              {/* Left: name + tags */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: 'var(--tk-text)', marginBottom: 4 }}>
                  {matter.name}
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                  {matter.tags?.map(t => <span key={t} className="tk-tag">{t}</span>)}
                  <StatusBadge status={matter.status} />
                </div>
              </div>

              {/* Right: numbers */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--tk-accentSoftText)', fontWeight: 500 }}>
                  {unitsToHours(matter.loggedUnits)} <span style={{ color: 'var(--tk-muted)' }}>/ {unitsToHours(matter.goalUnits)} hrs</span>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: remain < 0 ? '#dc2626' : 'var(--tk-muted)', marginTop: 2 }}>
                  {remain < 0 ? `+${unitsToHours(Math.abs(remain))} over` : `${unitsToHours(remain)} hrs left`}
                </div>
              </div>
            </div>

            {/* Progress bar row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ProgressBar matter={matter} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color, flexShrink: 0, width: 36, textAlign: 'right' }}>
                {mp}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProgressPage() {
  const [activeClientId, setActiveClientId] = useState<string | null>(null)
  const [selectedMatter, setSelectedMatter] = useState<{ matter: Matter; client: Client } | null>(null)

  const visibleClients = activeClientId
    ? DATA.filter(c => c.id === activeClientId)
    : DATA

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight: '100vh', background: 'var(--tk-bg)' }}>

        {/* Header */}
        <header className="tk-header" style={{
          height: 56, padding: '0 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="tk-logo-upload">
              <img src="/briefLogo.PNG" alt="logo" />
            </div>

            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700,
              color: 'var(--tk-text)', letterSpacing: '-0.01em',
            }}>briefly</span>

            <span style={{ width: 1, height: 18, background: 'var(--tk-border)', display: 'inline-block' }} />

            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-muted)', letterSpacing: '0.06em' }}>
              MATTER PROGRESS
            </span>
          </div>

          {/* Active filter pill */}
          {activeClientId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-muted)' }}>
                Filtered:
              </span>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                color: DATA.find(c => c.id === activeClientId)?.dotColor,
                background: 'var(--tk-accentSoftBg)',
                border: '1px solid var(--tk-border)',
                borderRadius: 3, padding: '3px 10px',
              }}>
                {DATA.find(c => c.id === activeClientId)?.name}
              </span>
              <button className="tk-btn" style={{ padding: '3px 10px' }} onClick={() => setActiveClientId(null)}>
                Clear ×
              </button>
            </div>
          )}
        </header>

        {/* Body */}
        <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

          {/* Main content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
            <div className="tk-section-label" style={{ marginBottom: 18 }}>
              {activeClientId
                ? `${DATA.find(c => c.id === activeClientId)?.name} — Matters`
                : `All Clients · ${DATA.flatMap(c => c.matters).length} Matters`}
            </div>

            {visibleClients.map(client => (
              <ClientBlock
                key={client.id}
                client={client}
                onSelectMatter={(m, c) => setSelectedMatter({ matter: m, client: c })}
              />
            ))}
          </div>

          {/* Sidebar */}
          <Sidebar
            clients={DATA}
            activeClientId={activeClientId}
            onSelectClient={setActiveClientId}
          />
        </div>

        {/* Matter detail modal */}
        {selectedMatter && (
          <MatterModal
            matter={selectedMatter.matter}
            client={selectedMatter.client}
            onClose={() => setSelectedMatter(null)}
          />
        )}
      </div>
    </>
  )
}
