"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shell/section-header";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { HasPermission } from "@/components/auth/has-permission";
import { AnnouncementModal } from "@/components/modals/announcement-modal";
import { matchesQuery } from "@/lib/store/selectors";
import { config, terminology } from "@/lib/config";
import { useAuth } from "@/lib/auth/auth-context";
import { useStore } from "@/lib/store/store-context";
import type { Announcement, AnnouncementAudience, Role } from "@/types";
import type { NewAnnouncementInput } from "@/lib/store/store-context";

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  students: `${terminology.studentLabel}s`,
  teachers: `${terminology.teacherLabel}s`,
  admins: "Admins",
};

/** Map a user role to the audience tag its account belongs to. */
const ROLE_TAG: Record<Role, AnnouncementAudience> = {
  student: "students",
  teacher: "teachers",
  admin: "admins",
  super_admin: "admins",
};

/** An announcement is visible when its audience list is empty (everyone) or
 * contains the viewer's role tag. */
function isVisibleTo(audience: AnnouncementAudience[], role: Role): boolean {
  if (audience.length === 0) return true;
  return audience.includes(ROLE_TAG[role]);
}

function audienceLabel(audience: AnnouncementAudience[]): string {
  if (audience.length === 0) return "Everyone";
  return audience.map((a) => AUDIENCE_LABELS[a]).join(", ");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function AnnCard({
  announcement,
  canPin,
  authorName,
  onTogglePin,
}: {
  announcement: Announcement;
  canPin: boolean;
  authorName: string;
  onTogglePin: () => void;
}) {
  return (
    <article
      className={`rounded-xl border p-4 shadow-sm ${
        announcement.pinned ? "border-accent bg-accent/5" : "border-muted bg-card"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-primary">{announcement.title}</h3>
            {announcement.pinned && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                Pinned
              </span>
            )}
            {announcement.priority === "urgent" && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Urgent
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-secondary">{announcement.body}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-secondary">
          <span className="font-medium text-primary">{audienceLabel(announcement.audience)}</span>
          <span>{formatDate(announcement.createdAt)}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-muted pt-2 text-xs text-secondary">
        <span>By {authorName}</span>
        {canPin && (
          <button
            type="button"
            onClick={onTogglePin}
            className="rounded-md border border-muted px-2 py-1 font-medium text-secondary hover:bg-muted"
          >
            {announcement.pinned ? "Unpin" : "Pin"}
          </button>
        )}
      </div>
    </article>
  );
}

/** Announcements feed scoped to audience tags + admin controls (create, pin, filter). */
export function AnnouncementsManager() {
  const store = useStore();
  const { currentRole, currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const visible = useMemo(
    () => (currentRole ? store.announcements.filter((a) => isVisibleTo(a.audience, currentRole)) : []),
    [store.announcements, currentRole],
  );

  const rows = useMemo(
    () =>
      visible
        .filter(
          (a) =>
            matchesQuery(search, a.title, a.body) &&
            (audienceFilter === "all" || a.audience.includes(audienceFilter as AnnouncementAudience)),
        )
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return a.createdAt < b.createdAt ? 1 : -1;
        }),
    [visible, search, audienceFilter],
  );

  function addAnnouncement(input: NewAnnouncementInput) {
    store.addAnnouncement(input);
    toast.success("Announcement published", { description: input.title });
  }

  const pinnedCount = rows.filter((a) => a.pinned).length;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Announcements"
        description={`${rows.length} ${rows.length === 1 ? "message" : "messages"}${pinnedCount > 0 ? ` · ${pinnedCount} pinned` : ""} in your feed`}
        action={
          <HasPermission allow="manageAnnouncements">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
              style={{ background: "var(--app-accent)" }}
            >
              + New Announcement
            </button>
          </HasPermission>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search announcements..."
        filters={
          <FilterSelect
            id="af-audience"
            ariaLabel="Filter by audience"
            value={audienceFilter}
            onChange={setAudienceFilter}
            options={[
              { value: "all", label: "All Audiences" },
              { value: "students", label: AUDIENCE_LABELS.students },
              { value: "teachers", label: AUDIENCE_LABELS.teachers },
              { value: "admins", label: AUDIENCE_LABELS.admins },
            ]}
          />
        }
      />

      <div className="space-y-4">
        {rows.map((a) => (
          <AnnCard
            key={a.id}
            announcement={a}
            canPin={currentRole === "super_admin" || currentRole === "admin"}
            authorName={store.users.find((u) => u.id === a.authorId)?.name ?? config.identity.shortName}
            onTogglePin={() => store.toggleAnnouncementPin(a.id)}
          />
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-muted bg-card p-8 text-center text-sm text-secondary">
            No announcements match your filters.
          </div>
        )}
      </div>

      <HasPermission allow="manageAnnouncements">
        <AnnouncementModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          authorId={currentUser?.id ?? "usr-01"}
          onSubmit={addAnnouncement}
        />
      </HasPermission>
    </div>
  );
}
