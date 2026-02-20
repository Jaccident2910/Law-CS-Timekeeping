import type { FC } from 'react'
import React, { useMemo, useState } from 'react'



type TimelineItem = {
  time: string
  title: string
  description: string
}

type TimelineGroup = {
  id: string
  title: string
  items: TimelineItem[]
}

const TimelineList: FC<{ items: TimelineItem[] }> = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {items.map((item, idx) => (
      <div key={idx} style={{ borderBottom: '1px solid #eee', paddingBottom: 8 }}>
        <div style={{ color: '#666', fontSize: 12 }}>{item.time}</div>
        <div>
          <strong>{item.title}</strong>
          <div style={{ fontSize: 13, color: '#333' }}>{item.description}</div>
        </div>
      </div>
    ))}
  </div>
)

const TimelineColumn: FC<{ group: TimelineGroup }> = ({ group }) => (
  <div style={{ minWidth: 320, maxWidth: 480, padding: 12 }}>
    <div style={{ marginBottom: 8, fontWeight: 600 }}>{group.title}</div>
    <TimelineList items={group.items} />
  </div>
)

export function TimeLinePage() {
  // example data - replace with props or context as needed
  const groups: TimelineGroup[] = useMemo(
    () => [
      {
        id: 'g1',
        title: 'Team A',
        items: [
          { time: '09:00', title: 'Standup', description: 'Daily standup meeting' },
          { time: '11:00', title: 'Review', description: 'Code review' },
        ],
      },
      {
        id: 'g2',
        title: 'Team B',
        items: [
          { time: '10:00', title: 'Planning', description: 'Sprint planning' },
          { time: '15:00', title: 'Demo', description: 'Feature demo' },
        ],
      },
      {
        id: 'g3',
        title: 'External',
        items: [
          { time: '13:00', title: 'Client Call', description: 'Discuss requirements' },
          { time: '16:00', title: 'Deploy', description: 'Deploy to prod' },
        ],
      },
    ],
    []
  )

  const [visible, setVisible] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    groups.forEach((g) => (map[g.id] = true))
    return map
  })

  const toggle = (id: string) => setVisible((s) => ({ ...s, [id]: !s[id] }))

  const visibleGroups = groups.filter((g) => visible[g.id])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top bar: descriptors / buttons */}
      <div
        style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', gap: 8, alignItems: 'center' }}
      >
        <input placeholder="Descriptor or filter" style={{ padding: 8, flex: 1 }} />
        <button style={{ padding: '8px 12px' }}>Action</button>
        <button style={{ padding: '8px 12px' }}>Another</button>
      </div>

      {/* Main content area with left timelines (2/3) and right companies (1/3) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left: main section, roughly 2/3 */}
        <div style={{ flex: 2, padding: 12, minWidth: 0 }}>
          <div style={{ marginBottom: 8, fontSize: 18, fontWeight: 600 }}>Timelines</div>

          {/* Horizontal scrolling container for timeline columns */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {visibleGroups.length === 0 ? (
              <div style={{ color: '#666' }}>No timelines selected.</div>
            ) : (
              visibleGroups.map((g) => <TimelineColumn key={g.id} group={g} />)
            )}
          </div>
        </div>

        {/* Right: toggles panel */}
        <aside style={{ flex: 1, borderLeft: '1px solid #eee', padding: 12, maxWidth: '33%' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Show / Hide Timelines</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {groups.map((g) => (
              <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={!!visible[g.id]} onChange={() => toggle(g.id)} />
                <span>{g.title}</span>
              </label>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
