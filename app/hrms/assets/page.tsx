import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { listAssets, listAssetCategories } from "@/lib/hrms/assets";
import { listEmployees } from "@/lib/hrms/employees";
import AddAssetForm from "./AddAssetForm";
import AssignButton from "./AssignButton";
import Link from "next/link";

export const metadata = { title: "Assets — HRMS" };

const STATUS_STYLE: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-400",
  assigned:  "bg-blue-500/15 text-blue-400",
  in_repair: "bg-amber-500/15 text-amber-400",
  retired:   "bg-stone-800 text-stone-500",
};

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "assets:read")) redirect("/hrms/dashboard");

  const { status = "" } = await searchParams;
  const canManage = hasPermission(session.role, "assets:manage");

  const [assets, categories, employees] = await Promise.all([
    listAssets({ status: status || undefined }),
    canManage ? listAssetCategories() : Promise.resolve([]),
    canManage ? listEmployees() : Promise.resolve([]),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Assets</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {assets.length} asset{assets.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && <AddAssetForm categories={categories} />}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {["", "available", "assigned", "in_repair", "retired"].map((s) => (
          <Link
            key={s}
            href={`/hrms/assets${s ? `?status=${s}` : ""}`}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              status === s
                ? "bg-[#C87660] text-white"
                : "bg-stone-800 text-stone-400 hover:text-white"
            }`}
          >
            {s === "" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Link>
        ))}
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800">
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Asset</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden md:table-cell">Category</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden lg:table-cell">Serial no.</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Assigned to</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Status</th>
              {canManage && <th className="px-5 py-3.5" />}
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 && (
              <tr>
                <td colSpan={canManage ? 6 : 5} className="text-center py-12 text-stone-600 text-sm">
                  No assets found.
                </td>
              </tr>
            )}
            {assets.map((asset) => (
              <tr key={asset.id} className="border-b border-stone-800/60 hover:bg-stone-800/20">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-white">{asset.name}</p>
                  {asset.vendor && <p className="text-[11px] text-stone-600">{asset.vendor}</p>}
                </td>
                <td className="px-5 py-3.5 text-stone-400 text-xs hidden md:table-cell">
                  {asset.categoryName ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-stone-500 font-mono text-xs hidden lg:table-cell">
                  {asset.serialNumber ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-stone-400 text-xs">
                  {asset.assignedToName ?? <span className="text-stone-700">Unassigned</span>}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[asset.status] ?? "bg-stone-800 text-stone-400"}`}>
                    {asset.status.replace("_", " ")}
                  </span>
                </td>
                {canManage && (
                  <td className="px-5 py-3.5 text-right">
                    <AssignButton
                      assetId={asset.id}
                      assignedTo={asset.assignedTo}
                      employees={employees.map((e) => ({ id: e.id, fullName: e.fullName }))}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
