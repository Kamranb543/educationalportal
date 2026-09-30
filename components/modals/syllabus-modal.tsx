"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { TextField } from "@/components/ui/form-fields";
import { HasPermission } from "@/components/auth/has-permission";
import { useStore } from "@/lib/store/store-context";
import type { Course, SyllabusChapter, SyllabusTopic } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  course?: Course;
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Subject syllabus outline. Renders read-only by default; an explicit
 * "Edit Syllabus" toggle (permissions-gated) switches into the editor.
 */
export function SyllabusModal({ open, onClose, course }: Props) {
  const store = useStore();
  const [editing, setEditing] = useState(false);
  if (!course) return null;

  // Read fresh reactive copy so post-save renders show updates.
  const liveCourse = store.getCourseById(course.id) ?? course;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Syllabus Outline"
      description={`${liveCourse.code} · ${liveCourse.title}`}
      footer={
        <div className="flex w-full items-center justify-between">
          {editing ? (
            <span className="text-xs text-accent">Editing — changes save instantly</span>
          ) : (
            <HasPermission allow="manageSubjects">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-muted"
              >
                Edit Syllabus
              </button>
            </HasPermission>
          )}
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              onClose();
            }}
            className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
          >
            Done
          </button>
        </div>
      }
    >
      {editing ? (
        <SyllabusEditor key={liveCourse.id} course={liveCourse} />
      ) : (
        <SyllabusView course={liveCourse} />
      )}
    </Modal>
  );
}

function SyllabusView({ course }: { course: Course }) {
  return (
    <div className="space-y-3">
      {course.syllabus.length === 0 && (
        <p className="rounded-lg border border-dashed border-muted px-4 py-6 text-center text-sm text-secondary">
          No syllabus outline yet. Use “Edit Syllabus” to add chapters and topics.
        </p>
      )}
      {course.syllabus.map((ch, i) => (
        <div key={ch.id} className="rounded-lg border border-muted p-3">
          <p className="text-sm font-semibold text-primary">
            <span className="mr-2 text-xs text-secondary">#{i + 1}</span>
            {ch.title || <span className="italic text-secondary">Untitled chapter</span>}
          </p>
          {ch.topics.length > 0 ? (
            <ul className="mt-2 space-y-1 border-l border-muted pl-3">
              {ch.topics.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-secondary">{t.title || "—"}</span>
                  {t.testRange && (
                    <span className="shrink-0 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-secondary">
                      Test: Ch. {t.testRange}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 pl-3 text-xs text-secondary">No topics listed.</p>
          )}
        </div>
      ))}
      <p className="text-[11px] text-secondary">
        {course.syllabus.length} chapter(s) ·{" "}
        {course.syllabus.reduce((n, ch) => n + ch.topics.length, 0)} topic(s)
      </p>
    </div>
  );
}

function SyllabusEditor({ course }: { course: Course }) {
  const store = useStore();
  const [draft, setDraft] = useState<SyllabusChapter[]>(() =>
    course.syllabus.map((c) => ({
      ...c,
      topics: c.topics.map((t) => ({ ...t })),
    })),
  );

  function save(next: SyllabusChapter[]) {
    setDraft(next);
    store.setCourseSyllabus(course.id, next);
  }

  function addChapter() {
    save([...draft, { id: uid("ch"), title: "", topics: [] }]);
  }

  function updateChapter(id: string, patch: Partial<SyllabusChapter>) {
    save(draft.map((ch) => (ch.id === id ? { ...ch, ...patch } : ch)));
  }

  function removeChapter(id: string) {
    save(draft.filter((ch) => ch.id !== id));
  }

  function moveChapter(id: string, dir: -1 | 1) {
    const i = draft.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= draft.length) return;
    const next = [...draft];
    [next[i], next[j]] = [next[j], next[i]];
    save(next);
  }

  function addTopic(chapterId: string) {
    save(
      draft.map((ch) =>
        ch.id === chapterId
          ? { ...ch, topics: [...ch.topics, { id: uid("tp"), title: "", testRange: "" }] }
          : ch,
      ),
    );
  }

  function updateTopic(chapterId: string, topicId: string, patch: Partial<SyllabusTopic>) {
    save(
      draft.map((ch) =>
        ch.id === chapterId
          ? { ...ch, topics: ch.topics.map((t) => (t.id === topicId ? { ...t, ...patch } : t)) }
          : ch,
      ),
    );
  }

  function removeTopic(chapterId: string, topicId: string) {
    save(
      draft.map((ch) =>
        ch.id === chapterId ? { ...ch, topics: ch.topics.filter((t) => t.id !== topicId) } : ch,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {draft.length === 0 && (
        <p className="rounded-lg border border-dashed border-muted px-4 py-4 text-center text-sm text-secondary">
          No chapters yet. Add the first chapter to build the outline.
        </p>
      )}
      {draft.map((ch, chapterIndex) => (
        <div key={ch.id} className="rounded-lg border border-muted p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-secondary">#{chapterIndex + 1}</span>
            <div className="min-w-0 flex-1">
              <TextField
                id={`ch-${ch.id}`}
                label=""
                value={ch.title}
                placeholder="Chapter title"
                onChange={(e) => updateChapter(ch.id, { title: e.target.value })}
              />
            </div>
            <div className="flex gap-1">
              <IconBtn label="Move up" disabled={chapterIndex === 0} onClick={() => moveChapter(ch.id, -1)} path="M10 4l4 6H6z" />
              <IconBtn label="Move down" disabled={chapterIndex === draft.length - 1} onClick={() => moveChapter(ch.id, 1)} path="M10 16l-4-6h8z" />
              <IconBtn label="Delete" onClick={() => removeChapter(ch.id)} path="M6 6l8 8M14 6l-8 8" />
            </div>
          </div>
          <div className="mt-2 space-y-2 border-l border-muted pl-3">
            {ch.topics.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <TextField
                    id={`tp-${t.id}`}
                    label=""
                    value={t.title}
                    placeholder="Topic title"
                    onChange={(e) => updateTopic(ch.id, t.id, { title: e.target.value })}
                  />
                </div>
                <div className="w-28 shrink-0">
                  <TextField
                    id={`tr-${t.id}`}
                    label=""
                    value={t.testRange}
                    placeholder="Ch. range"
                    onChange={(e) => updateTopic(ch.id, t.id, { testRange: e.target.value })}
                  />
                </div>
                <IconBtn label="Remove topic" onClick={() => removeTopic(ch.id, t.id)} path="M6 6l8 8M14 6l-8 8" />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTopic(ch.id)}
              className="text-xs font-medium text-accent hover:underline"
            >
              + Add topic
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addChapter}
        className="w-full rounded-lg border border-dashed border-muted px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-muted"
      >
        + Add Chapter
      </button>
    </div>
  );
}

function IconBtn({
  label,
  path,
  onClick,
  disabled,
}: {
  label: string;
  path: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-muted text-secondary transition-colors hover:bg-muted disabled:opacity-40"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}