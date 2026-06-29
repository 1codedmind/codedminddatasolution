import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getEmployee } from "@/lib/hrms/employees";
import { Mail, Phone, Building2, Briefcase, CalendarDays, MapPin, UserCheck } from "lucide-react";

export const metadata = { title: "Employee Profile — HRMS" };

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-stone-200">{value ?? <span className="text-stone-700">—</span>}</p>
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time",
  contract: "Contract", intern: "Intern",
};

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const { id } = await params;

  // Employees can only view their own profile
  if (session.role === "employee" && id !== session.sub) redirect("/hrms/employees/me");
  if (!hasPermission(session.role, "employees:read") && id !== session.sub) redirect("/hrms/dashboard");

  const emp = await getEmployee(id);
  if (!emp) notFound();

  const canEdit = hasPermission(session.role, "employees:update");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/hrms/employees" className="text-sm text-stone-500 hover:text-stone-300 transition">← Employees</a>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-2">{emp.fullName}</h1>
          <p className="text-stone-500 text-sm mt-0.5">{emp.departmentName ?? "No department"}</p>
        </div>
        {canEdit && (
          <a
            href={`/hrms/employees/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 hover:text-white transition-colors"
          >
            Edit profile
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Avatar + summary */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-stone-800 flex items-center justify-center mb-3">
            <span className="text-3xl font-extrabold text-stone-400 uppercase">{emp.fullName.charAt(0)}</span>
          </div>
          <p className="font-bold text-white text-lg">{emp.fullName}</p>
          <p className="text-xs text-stone-500 mt-1">{emp.email}</p>
          <span className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${emp.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-stone-800 text-stone-500"}`}>
            {emp.isActive ? "Active" : "Inactive"}
          </span>
          <div className="mt-4 w-full border-t border-stone-800 pt-4 space-y-2 text-left">
            {emp.phone && (
              <a href={`tel:${emp.phone}`} className="flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors">
                <Phone size={13} /> {emp.phone}
              </a>
            )}
            <a href={`mailto:${emp.email}`} className="flex items-center gap-2 text-sm text-stone-400 hover:text-[#C87660] transition-colors">
              <Mail size={13} /> {emp.email}
            </a>
          </div>
        </div>

        {/* Employment info */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Briefcase size={13} /> Employment
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow label="Role" value={emp.role} />
              <InfoRow label="Type" value={TYPE_LABELS[emp.employmentType ?? ""] ?? emp.employmentType} />
              <InfoRow label="Department" value={emp.departmentName} />
              <InfoRow
                label="Join date"
                value={emp.joinDate ? new Date(emp.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null}
              />
              <InfoRow label="Reports to" value={emp.reportingToName} />
              <InfoRow label="Member since" value={new Date(emp.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
            </div>
          </div>

          {(emp.addressLine1 || emp.city || emp.country) && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={13} /> Address
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoRow label="Address" value={emp.addressLine1} />
                <InfoRow label="City" value={emp.city} />
                <InfoRow label="State" value={emp.state} />
                <InfoRow label="Country" value={emp.country} />
              </div>
            </div>
          )}

          {(emp.emergencyContactName || emp.emergencyContactPhone) && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserCheck size={13} /> Emergency contact
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoRow label="Name" value={emp.emergencyContactName} />
                <InfoRow label="Phone" value={emp.emergencyContactPhone} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leave shortcut */}
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`/hrms/leaves?member=${id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 hover:text-white transition-colors"
        >
          <CalendarDays size={14} /> Leave history
        </a>
        <a
          href={`/hrms/payroll?member=${id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 hover:text-white transition-colors"
        >
          Payslips
        </a>
      </div>
    </div>
  );
}
