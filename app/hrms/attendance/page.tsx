import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isHrmsUser, isHrmsAdmin } from "@/lib/hrms/access";
import { getTodayAttendance, listAttendance } from "@/lib/hrms/attendance";
import AttendanceWidget from "./AttendanceWidget";
import Link from "next/link";

export const metadata = { title: "Attendance — HRMS" };

const STATUS_STYLE: Record<string, string> = {
  present:  "bg-emerald-500/15 text-emerald-400",
  absent:   "bg-red-500/15 text-red-400",
  half_day: "bg-amber-500/15 text-amber-400",
  wfh:      "bg-blue-500/15 text-blue-400",
  holiday:  "bg-purple-500/15 text-purple-400",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; month?: string; year?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!isHrmsUser(session.role)) redirect("/");

  const sp = await searchParams;
  const isAdmin = isHrmsAdmin(session.role);

  const now = new Date();
  const month = sp.month ? Number(sp.month) : now.getMonth() + 1;
  const year  = sp.year  ? Number(sp.year)  : now.getFullYear();

  const [todayLog, logs] = await Promise.all([
    getTodayAttendance(session.sub),
    listAttendance({
      memberId: isAdmin ? (sp.member || undefined) : session.sub,
      month,
      year,
    }),
  ]);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const yearRange = Array.from({ length: 3 }, (_, i) => now.getFullYear() - 1 + i);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Attendance</h1>
          <p className="text-stone-500 text-sm mt-0.5">Track check-ins, check-outs, and working hours.</p>
        </div>
      </div>

      {/* Today widget — only for own attendance */}
      <AttendanceWidget today={todayLog} />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-stone-500 font-semibold uppercase tracking-widest">Month:</span>
        {MONTHS.map((name, i) => (
          <Link
            key={i}
            href={`/hrms/attendance?month=${i + 1}&year=${year}${sp.member ? `&member=${sp.member}` : ""}`}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              month === i + 1 ? "bg-[#C87660] text-white" : "bg-stone-800 text-stone-400 hover:text-white"
            }`}
          >
            {name}
          </Link>
        ))}
        {yearRange.map((y) => (
          <Link
            key={y}
            href={`/hrms/attendance?month=${month}&year=${y}${sp.member ? `&member=${sp.member}` : ""}`}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              year === y ? "bg-stone-600 text-white" : "bg-stone-800 text-stone-400 hover:text-white"
            }`}
          >
            {y}
          </Link>
        ))}
      </div>

      {/* Logs table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">
            {MONTHS[month - 1]} {year} · {logs.length} record{logs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800">
              {isAdmin && (
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Employee</th>
              )}
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Date</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Check-in</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Check-out</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Hours</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-stone-600 text-sm">
                  No attendance records for {MONTHS[month - 1]} {year}.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-stone-800/60 hover:bg-stone-800/20">
                {isAdmin && (
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{log.memberName}</p>
                    <p className="text-[11px] text-stone-600">{log.memberEmail}</p>
                  </td>
                )}
                <td className="px-5 py-3.5 text-stone-300">
                  {new Date(log.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", weekday: "short" })}
                </td>
                <td className="px-5 py-3.5 text-stone-400 font-mono text-xs">{fmt(log.checkInAt)}</td>
                <td className="px-5 py-3.5 text-stone-400 font-mono text-xs">{fmt(log.checkOutAt)}</td>
                <td className="px-5 py-3.5 text-right text-stone-400 font-mono text-xs">
                  {log.workHours != null ? `${log.workHours}h` : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[log.status] ?? "bg-stone-800 text-stone-400"}`}>
                    {log.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
