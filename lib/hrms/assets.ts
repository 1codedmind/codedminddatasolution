import { getSql } from "@/lib/db";
import { ensureHrmsTables } from "./db-init";
import { randomUUID } from "crypto";

export type Asset = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  currency: string;
  vendor: string | null;
  warrantyExpiresAt: string | null;
  status: string;
  assignedTo: string | null;
  assignedToName: string | null;
  assignedAt: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetCategory = { id: string; name: string };

export async function listAssetCategories(): Promise<AssetCategory[]> {
  await ensureHrmsTables();
  const sql = getSql();
  return sql<AssetCategory[]>`SELECT id, name FROM asset_categories ORDER BY name`;
}

export async function listAssets(opts: {
  status?: string;
  assignedTo?: string;
} = {}): Promise<Asset[]> {
  await ensureHrmsTables();
  const sql = getSql();
  const { status, assignedTo } = opts;
  return sql<Asset[]>`
    SELECT
      a.id,
      a.category_id         AS "categoryId",
      ac.name               AS "categoryName",
      a.name,
      a.serial_number       AS "serialNumber",
      a.purchase_date       AS "purchaseDate",
      a.purchase_price      AS "purchasePrice",
      a.currency,
      a.vendor,
      a.warranty_expires_at AS "warrantyExpiresAt",
      a.status,
      a.assigned_to         AS "assignedTo",
      tm.full_name          AS "assignedToName",
      a.assigned_at         AS "assignedAt",
      a.notes,
      a.created_by          AS "createdBy",
      a.created_at          AS "createdAt",
      a.updated_at          AS "updatedAt"
    FROM assets a
    LEFT JOIN asset_categories ac ON ac.id = a.category_id
    LEFT JOIN team_members tm ON tm.id = a.assigned_to
    WHERE
      a.status = COALESCE(${status ?? null}, a.status)
    ORDER BY a.created_at DESC
  `;
}

export async function createAsset(input: {
  name: string;
  categoryId?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currency?: string;
  vendor?: string;
  warrantyExpiresAt?: string;
  notes?: string;
  createdBy: string;
}): Promise<{ id: string }> {
  await ensureHrmsTables();
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO assets (
      id, category_id, name, serial_number, purchase_date, purchase_price,
      currency, vendor, warranty_expires_at, status, notes, created_by, created_at, updated_at
    ) VALUES (
      ${id}, ${input.categoryId ?? null}, ${input.name},
      ${input.serialNumber ?? null}, ${input.purchaseDate ?? null},
      ${input.purchasePrice ?? null}, ${input.currency ?? "INR"},
      ${input.vendor ?? null}, ${input.warrantyExpiresAt ?? null},
      'available', ${input.notes ?? null}, ${input.createdBy}, ${now}, ${now}
    )
  `;
  return { id };
}

export async function assignAsset(
  assetId: string,
  memberId: string | null
): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  const now = new Date().toISOString();
  const newStatus = memberId ? "assigned" : "available";
  await sql`
    UPDATE assets
    SET assigned_to = ${memberId}, assigned_at = ${memberId ? now : null},
        status = ${newStatus}, updated_at = ${now}
    WHERE id = ${assetId}
  `;
}

export async function updateAssetStatus(
  assetId: string,
  status: "available" | "in_repair" | "retired"
): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    UPDATE assets
    SET status = ${status}, assigned_to = NULL, assigned_at = NULL, updated_at = ${now}
    WHERE id = ${assetId}
  `;
}
