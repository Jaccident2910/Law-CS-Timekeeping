import type { FC } from 'react'
import React, { useRef, useState } from 'react'

// ─── CSS Tokens (light theme) ─────────────────────────────────────────────────

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
    --tk-danger: #dc2626;
    --tk-dangerBg: #fef2f2;
    --tk-dangerBorder: #fecaca;
    --tk-overlay: rgba(0,0,0,0.28);
    --tk-darkBtn: #18181b;
    --tk-darkBtnHover: #27272a;
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

  .tk-entry-row {
    border-bottom: 1px solid var(--tk-divider);
    cursor: pointer;
    transition: background 0.1s;
  }
  .tk-entry-row:hover { background: var(--tk-softHover); }

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
    max-width: 560px;
    width: 90%;
    position: relative;
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

  .tk-status-billed    { background: #1a3a5c; color: #e8f0f8; }
  .tk-status-unbilled  { background: #7a5a1a; color: #f8f0e0; }
  .tk-status-progress  { background: #1a4a2a; color: #e0f4e8; }

  .tk-client-toggle {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.1s;
    border: 1px solid transparent;
    user-select: none;
  }
  .tk-client-toggle:hover { background: var(--tk-softHover); border-color: var(--tk-divider); }
  .tk-client-toggle.active { background: var(--tk-soft); border-color: var(--tk-border); }

  .tk-checkbox {
    width: 15px; height: 15px;
    border-radius: 3px;
    border: 1.5px solid var(--tk-border);
    background: var(--tk-card);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.13s, background 0.13s;
    font-size: 10px;
  }

  .tk-progress-bar {
    height: 3px;
    background: var(--tk-divider);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 4px;
  }
  .tk-progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .tk-logo-upload {
    width: 34px; height: 34px;
    border-radius: 4px;
    border: 1.5px dashed var(--tk-border);
    background: var(--tk-soft);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.15s, background 0.15s;
    flex-shrink: 0;
  }
  .tk-logo-upload:hover { border-color: var(--tk-accent); background: var(--tk-accentSoftBg); }
  .tk-logo-upload img { width: 100%; height: 100%; object-fit: cover; }

  .tk-timeline-block {
    position: absolute;
    left: 2px; right: 2px;
    border-radius: 3px;
    cursor: pointer;
    overflow: hidden;
    transition: box-shadow 0.13s, filter 0.13s;
    border-left-width: 3px;
    border-left-style: solid;
  }
  .tk-timeline-block:hover {
    box-shadow: 0 4px 18px rgba(0,0,0,0.10);
    filter: brightness(0.97);
    z-index: 10;
  }

  .tk-hour-line      { border-top: 1px solid var(--tk-grid); }
  .tk-hour-line-bold { border-top: 1px solid var(--tk-border); }
  .tk-half-line      { border-top: 1px dashed var(--tk-grid); }

  .tk-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--tk-muted);
    margin-bottom: 12px;
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeBlock = {
  id: string
  startTime: string
  endTime: string
  units: number
  title: string
  narrative: string
  matter: string
  client: string
  clientId: string
  status: 'billed' | 'unbilled' | 'in-progress'
  tags?: string[]
}

type Client = {
  id: string
  name: string
  blockBg: string
  blockBorder: string
  dotColor: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CLIENTS: Client[] = [
  { id: 'redwood',  name: 'Redwood Ltd',         blockBg: '#eef4fb', blockBorder: '#2563eb', dotColor: '#2563eb' },
  { id: 'harris',   name: 'Harris & Associates', blockBg: '#edfbf4', blockBorder: '#16a34a', dotColor: '#16a34a' },
  { id: 'meridian', name: 'Meridian Capital',    blockBg: '#fdf4fb', blockBorder: '#9333ea', dotColor: '#9333ea' },
  { id: 'internal', name: 'Internal',            blockBg: '#f9f9f9', blockBorder: '#71717a', dotColor: '#71717a' },
]

const TIME_BLOCKS: TimeBlock[] = [
  {
    id: 't1', startTime: '08:00', endTime: '08:48', units: 8,
    title: 'Review of amended statement of claim',
    narrative: 'Reviewed amended statement of claim filed by opposing counsel; identified three discrepancies in paragraphs 14-17; prepared preliminary response notes.',
    matter: 'Redwood v. Callahan [2024] No. 4471',
    client: 'Redwood Ltd', clientId: 'redwood', status: 'billed',
    tags: ['Litigation', 'Drafting'],
  },
  {
    id: 't2', startTime: '09:00', endTime: '09:30', units: 5,
    title: 'Client call — instructions re: settlement',
    narrative: 'Telephone attendance with J. Redwood regarding settlement offer received 12 Sept. Received instructions to reject current offer and counter at $420,000.',
    matter: 'Redwood v. Callahan [2024] No. 4471',
    client: 'Redwood Ltd', clientId: 'redwood', status: 'billed',
    tags: ['Attendance'],
  },
  {
    id: 't3', startTime: '09:45', endTime: '11:15', units: 15,
    title: 'Due diligence — asset schedule review',
    narrative: 'Reviewed Schedule B asset disclosure documents (47 pages); cross-referenced against prior valuation reports; flagged three inconsistencies for partner review.',
    matter: 'Meridian Capital Acquisition',
    client: 'Meridian Capital', clientId: 'meridian', status: 'billed',
    tags: ['Due Diligence', 'M&A'],
  },
  {
    id: 't4', startTime: '11:30', endTime: '12:00', units: 5,
    title: 'Draft correspondence to opposing solicitors',
    narrative: 'Drafted letter to Blake & Partners re: disclosure obligations under r. 214; attached summary of outstanding items.',
    matter: 'Harris Employment Dispute',
    client: 'Harris & Associates', clientId: 'harris', status: 'unbilled',
    tags: ['Correspondence', 'Litigation'],
  },
  {
    id: 't5', startTime: '13:00', endTime: '13:30', units: 5,
    title: 'Firm admin — timekeeping compliance review',
    narrative: 'Internal review of billing entries for Q3; updated matter codes; flagged two matters for partner sign-off.',
    matter: 'Internal Administration',
    client: 'Internal', clientId: 'internal', status: 'billed',
    tags: ['Admin'],
  },
  {
    id: 't6', startTime: '14:00', endTime: '16:12', units: 22,
    title: 'Preparation of submissions — strike-out application',
    narrative: 'Researched applicable authorities on strike-out applications; drafted written submissions (12 pages); incorporated partner revisions.',
    matter: 'Redwood v. Callahan [2024] No. 4471',
    client: 'Redwood Ltd', clientId: 'redwood', status: 'in-progress',
    tags: ['Litigation', 'Drafting', 'Research'],
  },
  {
    id: 't7', startTime: '16:30', endTime: '17:00', units: 5,
    title: 'Review SPA — representations clause',
    narrative: 'Reviewed representations and warranties clause in draft SPA; marked up 6 comments for discussion at next call.',
    matter: 'Meridian Capital Acquisition',
    client: 'Meridian Capital', clientId: 'meridian', status: 'unbilled',
    tags: ['M&A', 'Drafting'],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeToMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const DAY_START = 7 * 60
const DAY_END   = 18 * 60
const SCALE     = 2.3
const HOURS     = Array.from({ length: DAY_END / 60 - DAY_START / 60 + 1 }, (_, i) => DAY_START / 60 + i)

const STATUS_META = {
  billed:         { cls: 'tk-status-billed',   label: 'Billed' },
  unbilled:       { cls: 'tk-status-unbilled',  label: 'Unbilled' },
  'in-progress':  { cls: 'tk-status-progress',  label: 'In Progress' },
} as const

// ─── Small Components ─────────────────────────────────────────────────────────

const Tag: FC<{ label: string }> = ({ label }) => <span className="tk-tag">{label}</span>

const StatusBadge: FC<{ status: TimeBlock['status'] }> = ({ status }) => {
  const m = STATUS_META[status]
  return (
    <span className={m.cls} style={{
      fontFamily: "'DM Mono', monospace", fontSize: 10,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2,
    }}>{m.label}</span>
  )
}

const ClientDot: FC<{ client: Client; size?: number }> = ({ client, size = 9 }) => (
  <span style={{
    display: 'inline-block',
    width: size, height: size,
    borderRadius: '50%',
    background: client.dotColor,
    flexShrink: 0,
  }} />
)

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal: FC<{ block: TimeBlock; client: Client; onClose: () => void }> = ({ block, client, onClose }) => (
  <div className="tk-modal-overlay" onClick={onClose}>
    <div className="tk-modal" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 14, right: 16,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--tk-muted)', fontSize: 18, lineHeight: 1,
      }}>x</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <ClientDot client={client} size={8} />
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          color: client.dotColor, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{client.name}</span>
      </div>

      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 11,
        color: 'var(--tk-muted)', marginBottom: 18, letterSpacing: '0.03em',
      }}>{block.matter}</div>

      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 20, fontWeight: 600, color: 'var(--tk-text)',
        lineHeight: 1.35, marginBottom: 20,
        borderBottom: '1px solid var(--tk-divider)', paddingBottom: 16,
      }}>{block.title}</div>

      <div style={{ display: 'flex', gap: 28, marginBottom: 20, alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--tk-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Time</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: 'var(--tk-accentSoftText)', fontWeight: 500 }}>
            {block.startTime} - {block.endTime}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--tk-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Units (6 min)</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: 'var(--tk-accentSoftText)', fontWeight: 500 }}>
            {block.units} <span style={{ fontSize: 12, color: 'var(--tk-muted)' }}>({block.units * 6} min)</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge status={block.status} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--tk-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Narrative</div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13.5,
          lineHeight: 1.75, color: '#3f3f46',
          background: 'var(--tk-soft)', border: '1px solid var(--tk-divider)',
          borderRadius: 4, padding: '12px 14px',
        }}>{block.narrative}</div>
      </div>

      {block.tags && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {block.tags.map(t => <Tag key={t} label={t} />)}
        </div>
      )}
    </div>
  </div>
)

// ─── Timeline Block ───────────────────────────────────────────────────────────

const TBlock: FC<{ block: TimeBlock; client: Client; onClick: () => void }> = ({ block, client, onClick }) => {
  const top    = (timeToMin(block.startTime) - DAY_START) * SCALE
  const height = Math.max((timeToMin(block.endTime) - timeToMin(block.startTime)) * SCALE - 3, 22)

  return (
    <div
      className="tk-timeline-block"
      onClick={onClick}
      style={{
        top, height,
        background: client.blockBg,
        borderLeftColor: client.blockBorder,
        borderTopColor: 'var(--tk-divider)',
        borderRightColor: 'var(--tk-divider)',
        borderBottomColor: 'var(--tk-divider)',
        padding: height > 32 ? '5px 8px' : '3px 6px',
      }}
    >
      {height > 20 && (
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: Math.min(10, height / 3.5),
          color: client.blockBorder,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 1,
        }}>
          {block.startTime} · {block.units} units
        </div>
      )}
      {height > 38 && (
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: Math.min(12, height / 5),
          fontWeight: 500,
          color: 'var(--tk-text)',
          overflow: 'hidden',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as any,
        }}>
          {block.title}
        </div>
      )}
    </div>
  )
}

// ─── Timeline Grid ────────────────────────────────────────────────────────────

const TimelineGrid: FC<{ blocks: TimeBlock[]; clients: Client[]; onSelect: (b: TimeBlock) => void }> = ({ blocks, clients, onSelect }) => {
  const totalH = (DAY_END - DAY_START) * SCALE
  const cMap   = Object.fromEntries(clients.map(c => [c.id, c]))

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ width: 48, flexShrink: 0, position: 'relative', height: totalH, userSelect: 'none' }}>
        {HOURS.map((h, i) => (
          <div key={h} style={{
            position: 'absolute', top: i * 60 * SCALE - 7,
            right: 8,
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: 'var(--tk-muted)', whiteSpace: 'nowrap',
          }}>
            {String(h).padStart(2, '0')}:00
          </div>
        ))}
      </div>

      <div style={{ flex: 1, position: 'relative', height: totalH, minWidth: 240, borderLeft: '1px solid var(--tk-border)' }}>
        {HOURS.map((h, i) => (
          <React.Fragment key={h}>
            <div className={i === 0 ? 'tk-hour-line-bold' : 'tk-hour-line'} style={{ position: 'absolute', top: i * 60 * SCALE, left: 0, right: 0 }} />
            <div className="tk-half-line" style={{ position: 'absolute', top: i * 60 * SCALE + 30 * SCALE, left: 0, right: 0 }} />
          </React.Fragment>
        ))}
        {blocks.map(b => (
          <TBlock key={b.id} block={b} client={cMap[b.clientId]} onClick={() => onSelect(b)} />
        ))}
      </div>
    </div>
  )
}

// ─── Entry Row ────────────────────────────────────────────────────────────────

const EntryRow: FC<{ block: TimeBlock; client: Client; onClick: () => void }> = ({ block, client, onClick }) => (
  <div className="tk-entry-row" onClick={onClick} style={{
    display: 'grid',
    gridTemplateColumns: '88px 1fr 130px 68px 90px',
    alignItems: 'center',
    gap: 14,
    padding: '11px 16px',
  }}>
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-accentSoftText)' }}>
      {block.startTime}-{block.endTime}
    </div>
    <div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: 'var(--tk-text)', marginBottom: 2 }}>
        {block.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <ClientDot client={client} size={7} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--tk-muted)' }}>{block.matter}</span>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {block.tags?.slice(0, 2).map(t => <Tag key={t} label={t} />)}
    </div>
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--tk-muted)', textAlign: 'right' }}>
      {block.units} units
    </div>
    <div><StatusBadge status={block.status} /></div>
  </div>
)

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar: FC<{
  blocks: TimeBlock[]
  clients: Client[]
  visible: Record<string, boolean>
  onToggle: (id: string) => void
}> = ({ blocks, clients, visible, onToggle }) => {
  const allUnits   = TIME_BLOCKS.reduce((s, b) => s + b.units, 0)
  const visUnits   = blocks.reduce((s, b) => s + b.units, 0)
  const totalHours = (visUnits * 6 / 60).toFixed(1)

  return (
    <aside className="tk-sidebar" style={{
      width: 234, flexShrink: 0,
      padding: '24px 16px',
      display: 'flex', flexDirection: 'column', gap: 24,
      overflowY: 'auto',
    }}>

      {/* Day totals */}
      <div>
        <div className="tk-section-label">Day Summary</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28, fontWeight: 700,
          color: 'var(--tk-accentSoftText)', lineHeight: 1,
        }}>
          {totalHours}
          <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--tk-muted)', marginLeft: 4 }}>hrs</span>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-muted)', marginTop: 4 }}>
          {visUnits} units · {blocks.length} entries
        </div>
      </div>

      {/* Client breakdown — always shows full-day data for context */}
      <div>
        <div className="tk-section-label">By Client</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map(c => {
            const units = TIME_BLOCKS.filter(b => b.clientId === c.id).reduce((s, b) => s + b.units, 0)
            if (!units) return null
            const pct = Math.round((units / allUnits) * 100)
            return (
              <div key={c.id} style={{ opacity: visible[c.id] ? 1 : 0.38, transition: 'opacity 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ClientDot client={c} size={7} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--tk-text)' }}>{c.name}</span>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--tk-accentSoftText)' }}>
                    {(units * 6 / 60).toFixed(1)}h
                  </span>
                </div>
                <div className="tk-progress-bar">
                  <div className="tk-progress-fill" style={{ width: `${pct}%`, background: c.dotColor }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Client toggles */}
      <div>
        <div className="tk-section-label">Show / Hide Clients</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {clients.map(c => {
            const on = !!visible[c.id]
            return (
              <div
                key={c.id}
                className={`tk-client-toggle${on ? ' active' : ''}`}
                onClick={() => onToggle(c.id)}
              >
                <div className="tk-checkbox" style={{
                  borderColor: on ? c.dotColor : 'var(--tk-border)',
                  background: on ? c.dotColor + '22' : 'var(--tk-card)',
                }}>
                  {on && <span style={{ color: c.dotColor, lineHeight: 1, fontWeight: 700 }}>v</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <ClientDot client={c} size={7} />
                  <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 12,
                    color: on ? 'var(--tk-text)' : 'var(--tk-muted)',
                    transition: 'color 0.13s',
                  }}>{c.name}</span>
                </div>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  color: on ? c.dotColor : 'var(--tk-muted)',
                  letterSpacing: '0.06em',
                }}>
                  {on ? 'ON' : 'OFF'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Status legend */}
      <div>
        <div className="tk-section-label">Status Key</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(STATUS_META).map(([, v]) => (
            <div key={v.label}>
              <span className={v.cls} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 9,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                padding: '2px 7px', borderRadius: 2,
              }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TimeLinePage() {
  const [selected, setSelected] = useState<TimeBlock | null>(null)
  const [view,     setView]     = useState<'timeline' | 'list'>('timeline')
  const [logoSrc,  setLogoSrc]  = useState<string | null>(null)
  const [visible,  setVisible]  = useState<Record<string, boolean>>(
    () => Object.fromEntries(CLIENTS.map(c => [c.id, true]))
  )

 
  const clientMap = Object.fromEntries(CLIENTS.map(c => [c.id, c]))
  const visibleBlocks = TIME_BLOCKS.filter(b => visible[b.clientId])



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

            {/* Wordmark */}
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700,
              color: 'var(--tk-text)', letterSpacing: '-0.01em',
            }}>briefly</span>

            <span style={{ width: 1, height: 18, background: 'var(--tk-border)', display: 'inline-block' }} />

            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: 'var(--tk-muted)', letterSpacing: '0.06em',
            }}>
              THU · 18 SEPT 2025
            </span>
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['timeline', 'list'] as const).map(v => (
              <button key={v} className={`tk-btn${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
                {v}
              </button>
            ))}
          </div>
        </header>

        {/* Body */}
        <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

          {/* Main */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
            <div className="tk-section-label" style={{ marginBottom: 18 }}>
              {view === 'timeline' ? 'Daily Timeline' : 'Entry List'}
            </div>

            {view === 'timeline' ? (
              <TimelineGrid blocks={visibleBlocks} clients={CLIENTS} onSelect={setSelected} />
            ) : (
              <div className="tk-card" style={{ borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '88px 1fr 130px 68px 90px',
                  gap: 14, padding: '8px 16px',
                  borderBottom: '1px solid var(--tk-border)',
                  background: 'var(--tk-soft)',
                }}>
                  {['Time', 'Task / Matter', 'Tags', 'Units', 'Status'].map(h => (
                    <div key={h} style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 10,
                      color: 'var(--tk-muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>{h}</div>
                  ))}
                </div>
                {visibleBlocks.length === 0
                  ? <div style={{ padding: 28, textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--tk-muted)' }}>
                      No entries visible — enable clients in the sidebar.
                    </div>
                  : visibleBlocks.map(b => (
                      <EntryRow key={b.id} block={b} client={clientMap[b.clientId]} onClick={() => setSelected(b)} />
                    ))
                }
              </div>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar
            blocks={visibleBlocks}
            clients={CLIENTS}
            visible={visible}
            onToggle={id => setVisible(s => ({ ...s, [id]: !s[id] }))}
          />
        </div>

        {/* Detail modal */}
        {selected && (
          <DetailModal
            block={selected}
            client={clientMap[selected.clientId]}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </>
  )
}
