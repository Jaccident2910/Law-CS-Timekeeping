import * as React from "react";
import "./timekeeping.css";

/**
 * Timekeeping route for React Router (framework mode).
 * - Timeline label dashes align exactly with the calendar grid (shared y positions).
 * - Calendar view scrolls independently (page stays fixed in viewport).
 * - Drag & drop for entries: move + resize start/end (5-minute snapping).
 * - Modals scroll instead of overflowing off-screen.
 *
 * Tailwind kept for layout/spacing/typography.
 * Colours + theme styling moved into timekeeping.css via tk-* classes.
 */

type Task = {
  id: string;
  name: string;
  description: string;
  billableMinutes: number; // target billable time
  color: string; // hex
};

type CalendarEntry = {
  id: string;
  taskId: string;
  start: Date;
  end: Date;
  notes?: string;
  isRunning?: boolean;
};

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 18;

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function minutesBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
}

function formatHM(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatMinutes(mins: number) {
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}:${m.toString().padStart(2, "0")}`;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

function dateWithHM(base: Date, hm: string) {
  const [hStr, mStr] = hm.split(":");
  const h = clamp(parseInt(hStr || "0", 10), 0, 23);
  const m = clamp(parseInt(mStr || "0", 10), 0, 59);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m, 0, 0);
}

function computeTaskSpentMinutes(taskId: string, entries: CalendarEntry[]) {
  return entries
    .filter((e) => e.taskId === taskId)
    .reduce((sum, e) => sum + minutesBetween(e.start, e.end), 0);
}

function hourToY(hour: number, pxPerHour: number) {
  return (hour - DAY_START_HOUR) * pxPerHour;
}

function dateToY(d: Date, pxPerHour: number) {
  const h = d.getHours() + d.getMinutes() / 60;
  return hourToY(h, pxPerHour);
}

function withinDayWindow(d: Date) {
  const h = d.getHours() + d.getMinutes() / 60;
  return h >= DAY_START_HOUR && h <= DAY_END_HOUR;
}

function safeLabelColor(bgHex: string) {
  // simple luminance check for readable text over colored badges
  const hex = bgHex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? "tk-chipTextDark" : "tk-chipTextLight";
}

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60000);
}

function snapMinutes(mins: number, snap = 5) {
  return Math.round(mins / snap) * snap;
}

function clampEntryToDay(baseDay: Date, start: Date, end: Date) {
  const min = new Date(baseDay.getFullYear(), baseDay.getMonth(), baseDay.getDate(), DAY_START_HOUR, 0, 0, 0);
  const max = new Date(baseDay.getFullYear(), baseDay.getMonth(), baseDay.getDate(), DAY_END_HOUR, 0, 0, 0);

  let s = start;
  let e = end;

  if (e.getTime() <= s.getTime()) e = addMinutes(s, 5);

  // If it starts before the window, shift forward preserving duration
  if (s.getTime() < min.getTime()) {
    const dur = e.getTime() - s.getTime();
    s = min;
    e = new Date(min.getTime() + dur);
  }

  // If it ends after the window, shift back preserving duration
  if (e.getTime() > max.getTime()) {
    const dur = e.getTime() - s.getTime();
    e = max;
    s = new Date(max.getTime() - dur);
  }

  // Clamp again and ensure min duration
  if (s.getTime() < min.getTime()) s = min;
  if (e.getTime() > max.getTime()) e = max;
  if (e.getTime() <= s.getTime()) e = addMinutes(s, 5);

  return { start: s, end: e };
}

const seedColors = [
  "#B08D57", // gold-ish
  "#4C6A92",
  "#6B8E6E",
  "#8B5E83",
  "#A35D4B",
  "#3B7A7A",
  "#7A6A3B",
  "#5A5A8B",
];

type DragMode = "move" | "resize-start" | "resize-end";

type DragState = {
  id: string;
  mode: DragMode;
  pointerStartY: number;
  startAtDragStart: Date;
  endAtDragStart: Date;
  didMove: boolean;
};

export default function TimekeepingRoute() {
  const today = React.useMemo(() => startOfToday(), []);

  const [tasks, setTasks] = React.useState<Task[]>(() => [
    {
      id: "t1",
      name: "Draft statement of case",
      description: "Client: A. Smith — initial pleadings",
      billableMinutes: 120,
      color: seedColors[1],
    },
    {
      id: "t2",
      name: "Review disclosure bundle",
      description: "Client: Redwood Ltd — priority docs",
      billableMinutes: 90,
      color: seedColors[2],
    },
    {
      id: "t3",
      name: "Call with counsel",
      description: "Prep + attendance note",
      billableMinutes: 45,
      color: seedColors[0],
    },
  ]);

  const [entries, setEntries] = React.useState<CalendarEntry[]>(() => {
    const d = startOfToday();
    return [
      {
        id: "e1",
        taskId: "t2",
        start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0),
        end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 35),
        notes: "Initial scan of key docs",
      },
      {
        id: "e2",
        taskId: "t1",
        start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 0),
        end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 50),
        notes: "First draft sections 1–3",
      },
    ];
  });

  // Running timer: at most one active entry at a time in this version.
  const runningEntry = entries.find((e) => e.isRunning);

  React.useEffect(() => {
    if (!runningEntry) return;
    const id = window.setInterval(() => {
      setEntries((prev) => prev.map((e) => (e.id === runningEntry.id ? { ...e, end: new Date() } : e)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [runningEntry?.id]);

  // UI state: modals
  const [taskModalOpen, setTaskModalOpen] = React.useState(false);
  const [manualModalOpen, setManualModalOpen] = React.useState(false);
  const [editEntryId, setEditEntryId] = React.useState<string | null>(null);

  // Task form
  const [newTask, setNewTask] = React.useState({
    name: "",
    description: "",
    billableMinutes: 60,
  });

  // Manual entry form
  const [manual, setManual] = React.useState({
    taskId: tasks[0]?.id ?? "",
    startHM: "11:00",
    endHM: "11:30",
    notes: "",
  });

  React.useEffect(() => {
    setManual((m) => ({
      ...m,
      taskId: tasks.find((t) => t.id === m.taskId)?.id ?? tasks[0]?.id ?? "",
    }));
  }, [tasks]);

  const pxPerHour = 72;
  const minutesPerPixel = 60 / pxPerHour;
  const dayHeight = (DAY_END_HOUR - DAY_START_HOUR) * pxPerHour;

  const taskById = React.useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tasks]);

  function startTask(taskId: string) {
    setEntries((prev) => {
      const stopped = prev.map((e) => (e.isRunning ? { ...e, isRunning: false } : e));
      const now = new Date();
      const entry: CalendarEntry = {
        id: uid("entry"),
        taskId,
        start: now,
        end: now,
        notes: "",
        isRunning: true,
      };
      return [...stopped, entry];
    });
  }

  function stopRunning() {
    setEntries((prev) => prev.map((e) => (e.isRunning ? { ...e, isRunning: false, end: new Date() } : e)));
  }

  function addTask() {
    const idx = tasks.length % seedColors.length;
    const t: Task = {
      id: uid("task"),
      name: newTask.name.trim() || "Untitled task",
      description: newTask.description.trim() || "",
      billableMinutes: Math.max(0, Math.round(newTask.billableMinutes || 0)),
      color: seedColors[idx],
    };
    setTasks((prev) => [...prev, t]);
    setNewTask({ name: "", description: "", billableMinutes: 60 });
    setTaskModalOpen(false);
  }

  function addManualEntry() {
    const start = dateWithHM(today, manual.startHM);
    const end = dateWithHM(today, manual.endHM);
    const fixedEnd = end.getTime() <= start.getTime() ? new Date(start.getTime() + 15 * 60000) : end;
    const clamped = clampEntryToDay(today, start, fixedEnd);

    const entry: CalendarEntry = {
      id: uid("entry"),
      taskId: manual.taskId,
      start: clamped.start,
      end: clamped.end,
      notes: manual.notes.trim(),
      isRunning: false,
    };
    setEntries((prev) => [...prev, entry]);
    setManual((m) => ({ ...m, notes: "" }));
    setManualModalOpen(false);
  }

  function updateEntry(updated: CalendarEntry) {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  const entriesSorted = React.useMemo(
    () => [...entries].sort((a, b) => a.start.getTime() - b.start.getTime()),
    [entries]
  );
  const editEntry = editEntryId ? entries.find((e) => e.id === editEntryId) ?? null : null;

  // Drag state
  const [drag, setDrag] = React.useState<DragState | null>(null);

  function beginDrag(e: React.PointerEvent, entry: CalendarEntry, mode: DragMode) {
    if (entry.isRunning) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    setDrag({
      id: entry.id,
      mode,
      pointerStartY: e.clientY,
      startAtDragStart: entry.start,
      endAtDragStart: entry.end,
      didMove: false,
    });
  }

  function onPointerMoveTimeline(e: React.PointerEvent) {
    if (!drag) return;
    e.preventDefault();

    const dy = e.clientY - drag.pointerStartY;
    const deltaMinutes = snapMinutes(dy * minutesPerPixel, 5);

    setEntries((prev) =>
      prev.map((en) => {
        if (en.id !== drag.id) return en;

        let start = drag.startAtDragStart;
        let end = drag.endAtDragStart;

        if (drag.mode === "move") {
          start = addMinutes(drag.startAtDragStart, deltaMinutes);
          end = addMinutes(drag.endAtDragStart, deltaMinutes);
        } else if (drag.mode === "resize-start") {
          start = addMinutes(drag.startAtDragStart, deltaMinutes);
          if (end.getTime() <= start.getTime()) start = addMinutes(end, -5);
        } else {
          end = addMinutes(drag.endAtDragStart, deltaMinutes);
          if (end.getTime() <= start.getTime()) end = addMinutes(start, 5);
        }

        const clamped = clampEntryToDay(today, start, end);
        return { ...en, start: clamped.start, end: clamped.end };
      })
    );

    if (!drag.didMove && Math.abs(dy) > 2) {
      setDrag((d) => (d ? { ...d, didMove: true } : d));
    }
  }

  function endDrag(e: React.PointerEvent) {
    if (!drag) return;
    e.preventDefault();
    setDrag(null);
  }

  // Key y-positions for hours (shared by labels + canvas)
  const hourMarks = React.useMemo(() => {
    const marks: Array<{ hour: number; y: number; label: string }> = [];
    for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
      const y = (h - DAY_START_HOUR) * pxPerHour;
      marks.push({ hour: h, y, label: `${h.toString().padStart(2, "0")}:00` });
    }
    return marks;
  }, [pxPerHour]);

  return (
    <div className="h-screen overflow-hidden tk-page tk-text">
      {/* Header */}
      <div className="sticky top-0 z-10 tk-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-lg font-semibold tracking-tight">Timekeeping</div>
            <div className="text-xs tk-muted">Tasks, timers, and day view</div>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-lg px-3 py-2 text-sm shadow-sm tk-btn tk-btnSoft" onClick={() => setManualModalOpen(true)} type="button">
              + Add manual entry
            </button>
            <button className="rounded-lg px-3 py-2 text-sm shadow-sm tk-btn tk-btnSoft" onClick={() => setTaskModalOpen(true)} type="button">
              + Add task
            </button>
          </div>
        </div>
      </div>

      {/* Main layout (fills viewport under header) */}
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-4" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left panel: Tasks */}
        <section className="col-span-12 lg:col-span-5 min-h-0">
          <div className="flex h-full flex-col rounded-2xl shadow-sm tk-card">
            <div className="flex items-center justify-between px-4 py-3 tk-dividerBottom">
              <div>
                <div className="text-sm font-semibold">Tasks</div>
                <div className="text-xs tk-muted">Start/stop timers per task</div>
              </div>

              {runningEntry ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2 py-1 text-xs font-medium tk-pill tk-pillAccentSoft">
                    Running: {taskById.get(runningEntry.taskId)?.name ?? "Task"}
                  </span>
                  <button className="rounded-lg px-3 py-2 text-xs font-semibold tk-btn tk-btnDark" onClick={stopRunning} type="button">
                    Stop
                  </button>
                </div>
              ) : (
                <span className="text-xs tk-muted">No timer running</span>
              )}
            </div>

            {/* Scrollable task list */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="divide-y tk-dividerColor">
                {tasks.map((t) => {
                  const spent = computeTaskSpentMinutes(t.id, entries);
                  const remaining = t.billableMinutes - spent;
                  const isRunningThis = runningEntry?.taskId === t.id;

                  return (
                    <div key={t.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                            <div className="truncate text-sm font-semibold">{t.name}</div>
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs tk-muted">{t.description || "—"}</div>

                          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                            <div className="rounded-lg px-2 py-2 tk-surfaceSoft">
                              <div className="tk-muted">Spent</div>
                              <div className="font-semibold tabular-nums">{formatMinutes(spent)}</div>
                            </div>
                            <div className="rounded-lg px-2 py-2 tk-surfaceSoft">
                              <div className="tk-muted">Target</div>
                              <div className="font-semibold tabular-nums">{formatMinutes(t.billableMinutes)}</div>
                            </div>
                            <div className="rounded-lg px-2 py-2 tk-surfaceSoft">
                              <div className="tk-muted">Remaining</div>
                              <div className={`font-semibold tabular-nums ${remaining < 0 ? "tk-danger" : ""}`}>
                                {formatMinutes(remaining)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2">
                          <button
                            className={`rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition tk-btn ${
                              isRunningThis ? "tk-btnAccent" : "tk-btnSoft"
                            }`}
                            onClick={() => startTask(t.id)}
                            type="button"
                          >
                            Start
                          </button>
                          <button
                            className="rounded-lg px-3 py-2 text-xs font-semibold shadow-sm tk-btn tk-btnDark disabled:opacity-40"
                            onClick={stopRunning}
                            disabled={!runningEntry}
                            type="button"
                          >
                            Stop
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 tk-dividerTop">
              <button className="w-full rounded-xl px-4 py-3 text-sm font-semibold tk-btn tk-btnSoft" onClick={() => setTaskModalOpen(true)} type="button">
                + Add new task
              </button>
              <div className="mt-2 text-xs tk-muted">
                Tip: targets are billable minutes; entries can exceed targets (remaining becomes negative).
              </div>
            </div>
          </div>
        </section>

        {/* Right panel: Calendar */}
        <section className="col-span-12 lg:col-span-7 min-h-0">
          <div className="flex h-full flex-col rounded-2xl shadow-sm tk-card">
            <div className="flex items-center justify-between px-4 py-3 tk-dividerBottom">
              <div>
                <div className="text-sm font-semibold">Today</div>
                <div className="text-xs tk-muted">Drag entries to move/resize (5 min snap)</div>
              </div>

              <button className="rounded-lg px-3 py-2 text-xs font-semibold shadow-sm tk-btn tk-btnSoft" onClick={() => setManualModalOpen(true)} type="button">
                + Add entry
              </button>
            </div>

            {/* Scroll container for the calendar area */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid grid-cols-12 gap-0 p-3">
                {/* Time labels */}
                <div className="col-span-3 pr-3">
                  <div className="text-xs font-semibold">Timeline</div>
                  <div className="relative mt-2 rounded-xl tk-frame" style={{ height: dayHeight }}>
                    {hourMarks.map((m) => (
                      <React.Fragment key={m.hour}>
                        <div className="absolute left-2 right-2 flex items-center gap-2" style={{ top: m.y }}>
                          <div className="w-12 text-xs font-medium tabular-nums tk-muted">{m.label}</div>
                          <div className="h-px flex-1 tk-dash" />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Canvas */}
                <div className="col-span-9">
                  <div className="text-xs font-semibold">Calendar</div>
                  <div
                    className="relative mt-2 rounded-xl tk-frame"
                    style={{ height: dayHeight }}
                    onPointerMove={onPointerMoveTimeline}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerLeave={endDrag}
                  >
                    {/* hour grid lines at exact same y as labels */}
                    {hourMarks.map((m) =>
                      m.hour === DAY_END_HOUR ? null : (
                        <div key={m.hour} className="absolute left-0 right-0 tk-gridLine" style={{ top: m.y }} />
                      )
                    )}

                    {/* entries */}
                    {entriesSorted
                      .filter((e) => withinDayWindow(e.start) || withinDayWindow(e.end))
                      .map((e) => {
                        const t = taskById.get(e.taskId);
                        if (!t) return null;

                        const top = dateToY(e.start, pxPerHour);
                        const bottom = dateToY(e.end, pxPerHour);
                        const height = Math.max(28, bottom - top);
                        const mins = minutesBetween(e.start, e.end);

                        return (
                          <div key={e.id} className="absolute left-3 right-3" style={{ top, height }}>
                            <div
                              className="absolute -top-1 left-6 right-6 z-10 h-3 cursor-ns-resize rounded-full tk-handle"
                              onPointerDown={(ev) => beginDrag(ev, e, "resize-start")}
                              title={e.isRunning ? "Stop timer to resize" : "Drag to resize start"}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                if (drag?.id === e.id && drag.didMove) return;
                                setEditEntryId(e.id);
                              }}
                              className="relative h-full w-full select-none rounded-xl text-left shadow-sm tk-entry"
                              style={{
                                backgroundColor: `${t.color}1A`,
                              }}
                              onPointerDown={(ev) => beginDrag(ev, e, "move")}
                              title={e.isRunning ? "Stop timer to move" : "Drag to move • Click to edit"}
                            >
                              <div className="flex h-full flex-col justify-between p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${safeLabelColor(
                                          t.color
                                        )}`}
                                        style={{ backgroundColor: t.color }}
                                      >
                                        {t.name}
                                      </span>
                                      {e.isRunning ? (
                                        <span className="rounded-full px-2 py-1 text-[11px] font-semibold tk-pill tk-pillAccentSoft">
                                          Running
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="mt-1 truncate text-xs tk-muted">{e.notes?.trim() ? e.notes : "(no notes)"}</div>
                                  </div>

                                  <div className="shrink-0 text-right text-xs">
                                    <div className="tabular-nums tk-subtle">
                                      {formatHM(e.start)} → {formatHM(e.end)}
                                    </div>
                                    <div className="mt-1 font-semibold tabular-nums">{formatMinutes(mins)}</div>
                                  </div>
                                </div>

                                <div className="mt-2 text-[11px] tk-muted">Drag: move • Handles: resize</div>
                              </div>

                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <div className="h-10 w-1.5 rounded-full tk-grip" />
                              </div>
                            </button>

                            <div
                              className="absolute -bottom-1 left-6 right-6 z-10 h-3 cursor-ns-resize rounded-full tk-handle"
                              onPointerDown={(ev) => beginDrag(ev, e, "resize-end")}
                              title={e.isRunning ? "Stop timer to resize" : "Drag to resize end"}
                            />
                          </div>
                        );
                      })}

                    {entriesSorted.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm tk-muted">
                        No entries yet — start a timer or add a manual entry.
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 rounded-full px-3 py-1 tk-legend">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="tk-subtle">{t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 text-xs tk-dividerTop tk-muted">
              Accent: <span className="font-semibold tk-accentText">gold</span> • Primary: light grey • Secondary: dark greys
            </div>
          </div>
        </section>
      </div>

      {/* Add Task Modal */}
      {taskModalOpen ? (
        <Modal title="Add task" onClose={() => setTaskModalOpen(false)}>
          <div className="space-y-3">
            <Field label="Task name">
              <input
                className="w-full rounded-lg px-3 py-2 text-sm tk-input"
                value={newTask.name}
                onChange={(e) => setNewTask((s) => ({ ...s, name: e.target.value }))}
                placeholder="e.g. Draft letter to client"
              />
            </Field>

            <Field label="Description">
              <textarea
                className="min-h-[80px] w-full rounded-lg px-3 py-2 text-sm tk-input"
                value={newTask.description}
                onChange={(e) => setNewTask((s) => ({ ...s, description: e.target.value }))}
                placeholder="Short context (client / matter / next steps)"
              />
            </Field>

            <Field label="Target billable time (minutes)">
              <input
                type="number"
                className="w-full rounded-lg px-3 py-2 text-sm tk-input"
                value={newTask.billableMinutes}
                onChange={(e) => setNewTask((s) => ({ ...s, billableMinutes: Number(e.target.value) }))}
                min={0}
                step={5}
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button className="rounded-lg px-4 py-2 text-sm font-semibold tk-btn tk-btnSoft" onClick={() => setTaskModalOpen(false)} type="button">
                Cancel
              </button>
              <button className="rounded-lg px-4 py-2 text-sm font-semibold tk-btn tk-btnAccent" onClick={addTask} type="button">
                Add task
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Manual Entry Modal */}
      {manualModalOpen ? (
        <Modal title="Add manual entry" onClose={() => setManualModalOpen(false)}>
          <div className="space-y-3">
            <Field label="Task">
              <select
                className="w-full rounded-lg px-3 py-2 text-sm tk-input"
                value={manual.taskId}
                onChange={(e) => setManual((m) => ({ ...m, taskId: e.target.value }))}
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start (HH:MM)">
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm tabular-nums tk-input"
                  value={manual.startHM}
                  onChange={(e) => setManual((m) => ({ ...m, startHM: e.target.value }))}
                  placeholder="09:00"
                />
              </Field>
              <Field label="End (HH:MM)">
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm tabular-nums tk-input"
                  value={manual.endHM}
                  onChange={(e) => setManual((m) => ({ ...m, endHM: e.target.value }))}
                  placeholder="09:30"
                />
              </Field>
            </div>

            <Field label="Notes (optional)">
              <textarea
                className="min-h-[80px] w-full rounded-lg px-3 py-2 text-sm tk-input"
                value={manual.notes}
                onChange={(e) => setManual((m) => ({ ...m, notes: e.target.value }))}
                placeholder="What was done?"
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button className="rounded-lg px-4 py-2 text-sm font-semibold tk-btn tk-btnSoft" onClick={() => setManualModalOpen(false)} type="button">
                Cancel
              </button>
              <button className="rounded-lg px-4 py-2 text-sm font-semibold tk-btn tk-btnAccent" onClick={addManualEntry} type="button">
                Add entry
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Edit Entry Modal */}
      {editEntry ? (
        <EditEntryModal
          entry={editEntry}
          tasks={tasks}
          onClose={() => setEditEntryId(null)}
          onSave={(next) => {
            updateEntry(next);
            setEditEntryId(null);
          }}
          onDelete={() => {
            setEntries((prev) => prev.filter((e) => e.id !== editEntry.id));
            setEditEntryId(null);
          }}
        />
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold tk-subtle">{label}</div>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 tk-overlay" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-xl tk-modal">
        <div className="flex items-center justify-between px-4 py-3 tk-dividerBottom">
          <div className="text-sm font-semibold">{title}</div>
          <button className="rounded-lg px-2 py-1 text-xs font-semibold tk-btn tk-btnSoft" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-4 py-3">{children}</div>
      </div>
    </div>
  );
}

function EditEntryModal({
  entry,
  tasks,
  onClose,
  onSave,
  onDelete,
}: {
  entry: CalendarEntry;
  tasks: Task[];
  onClose: () => void;
  onSave: (entry: CalendarEntry) => void;
  onDelete: () => void;
}) {
  const base = React.useMemo(() => startOfToday(), []);
  const [local, setLocal] = React.useState(() => ({
    taskId: entry.taskId,
    startHM: formatHM(entry.start),
    endHM: formatHM(entry.end),
    notes: entry.notes ?? "",
  }));

  React.useEffect(() => {
    setLocal({
      taskId: entry.taskId,
      startHM: formatHM(entry.start),
      endHM: formatHM(entry.end),
      notes: entry.notes ?? "",
    });
  }, [entry.id]);

  return (
    <Modal title="Edit entry" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Task">
          <select
            className="w-full rounded-lg px-3 py-2 text-sm tk-input"
            value={local.taskId}
            onChange={(e) => setLocal((s) => ({ ...s, taskId: e.target.value }))}
            disabled={entry.isRunning}
            title={entry.isRunning ? "Stop the timer to change task" : undefined}
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start (HH:MM)">
            <input
              className="w-full rounded-lg px-3 py-2 text-sm tabular-nums tk-input"
              value={local.startHM}
              onChange={(e) => setLocal((s) => ({ ...s, startHM: e.target.value }))}
              disabled={entry.isRunning}
            />
          </Field>
          <Field label="End (HH:MM)">
            <input
              className="w-full rounded-lg px-3 py-2 text-sm tabular-nums tk-input"
              value={local.endHM}
              onChange={(e) => setLocal((s) => ({ ...s, endHM: e.target.value }))}
              disabled={entry.isRunning}
            />
          </Field>
        </div>

        <Field label="Notes">
          <textarea className="min-h-[80px] w-full rounded-lg px-3 py-2 text-sm tk-input" value={local.notes} onChange={(e) => setLocal((s) => ({ ...s, notes: e.target.value }))} />
        </Field>

        {entry.isRunning ? (
          <div className="rounded-xl px-3 py-2 text-xs tk-callout">
            This entry is currently running. Stop the timer to edit its times.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <button className="rounded-lg px-4 py-2 text-sm font-semibold tk-btn tk-btnSoft" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold tk-btn tk-btnDanger"
            onClick={onDelete}
            type="button"
            disabled={entry.isRunning}
            title={entry.isRunning ? "Stop the timer to delete" : undefined}
          >
            Delete
          </button>
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold tk-btn tk-btnAccent"
            onClick={() => {
              const start = dateWithHM(base, local.startHM);
              const end = dateWithHM(base, local.endHM);
              const fixedEnd = end.getTime() <= start.getTime() ? new Date(start.getTime() + 15 * 60000) : end;
              const clamped = clampEntryToDay(base, start, fixedEnd);
              onSave({
                ...entry,
                taskId: local.taskId,
                start: clamped.start,
                end: clamped.end,
                notes: local.notes,
              });
            }}
            type="button"
            disabled={entry.isRunning}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
