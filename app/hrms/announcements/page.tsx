import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, isHrmsAdmin } from "@/lib/hrms/access";
import { listAnnouncements, listAllAnnouncements } from "@/lib/hrms/announcements";
import { listDepartments } from "@/lib/hrms/departments";
import PostAnnouncementForm from "./PostAnnouncementForm";
import AnnouncementActions from "./AnnouncementActions";
import { Megaphone, Pin } from "lucide-react";

export const metadata = { title: "Announcements — HRMS" };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AnnouncementsPage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "announcements:read")) redirect("/hrms/dashboard");

  const isAdmin = isHrmsAdmin(session.role);
  const canManage = hasPermission(session.role, "announcements:manage");

  const [announcements, departments] = await Promise.all([
    isAdmin ? listAllAnnouncements() : listAnnouncements(),
    canManage ? listDepartments() : Promise.resolve([]),
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Announcements</h1>
          <p className="text-stone-500 text-sm mt-0.5">Company-wide and department updates.</p>
        </div>
        {canManage && <PostAnnouncementForm departments={departments.map((d) => ({ id: d.id, name: d.name }))} />}
      </div>

      {announcements.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
          <Megaphone size={32} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-600 text-sm">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`bg-stone-900 border rounded-2xl p-5 ${
                a.isPinned ? "border-yellow-500/30" : "border-stone-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.isPinned && <Pin size={11} className="text-yellow-400 shrink-0" />}
                    <h3 className="font-semibold text-white text-sm leading-snug">{a.title}</h3>
                  </div>
                  <p className="text-sm text-stone-400 whitespace-pre-wrap leading-relaxed">{a.body}</p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-stone-600">
                    <span>{a.createdByName ?? "System"}</span>
                    <span>·</span>
                    <span>{timeAgo(a.publishedAt ?? a.createdAt)}</span>
                    {a.audience !== "all" && (
                      <>
                        <span>·</span>
                        <span className="capitalize">{a.audience}</span>
                      </>
                    )}
                    {a.departmentName && (
                      <>
                        <span>·</span>
                        <span>{a.departmentName}</span>
                      </>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="shrink-0">
                    <AnnouncementActions id={a.id} isPinned={a.isPinned} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
