import { getSql } from "@/lib/db";

let initPromise: Promise<void> | null = null;

export function ensureHrmsTables(): Promise<void> {
  if (!initPromise) initPromise = _init();
  return initPromise;
}

async function _init() {
  const sql = getSql();

  // Run all CREATE TABLE statements in parallel — much faster on cold start
  await Promise.all([
    sql`CREATE TABLE IF NOT EXISTS departments (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL UNIQUE,
      description TEXT,
      head_id     TEXT,
      created_at  TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS designations (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      department_id TEXT,
      level         TEXT,
      created_at    TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS employee_profiles (
      id                         TEXT PRIMARY KEY,
      member_id                  TEXT NOT NULL UNIQUE,
      date_of_birth              TEXT,
      phone                      TEXT,
      personal_email             TEXT,
      address_line1              TEXT,
      address_line2              TEXT,
      city                       TEXT,
      state                      TEXT,
      country                    TEXT,
      postal_code                TEXT,
      emergency_contact_name     TEXT,
      emergency_contact_phone    TEXT,
      emergency_contact_relation TEXT,
      join_date                  TEXT,
      employment_type            TEXT NOT NULL DEFAULT 'full_time',
      department_id              TEXT,
      designation_id             TEXT,
      reporting_to               TEXT,
      pan_number                 TEXT,
      bank_account_number        TEXT,
      bank_ifsc                  TEXT,
      created_at                 TEXT NOT NULL,
      updated_at                 TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS leave_types (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL UNIQUE,
      days_per_year INTEGER,
      is_paid       BOOLEAN NOT NULL DEFAULT true,
      created_at    TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS leave_requests (
      id            TEXT PRIMARY KEY,
      member_id     TEXT NOT NULL,
      leave_type_id TEXT NOT NULL,
      from_date     TEXT NOT NULL,
      to_date       TEXT NOT NULL,
      days_count    REAL NOT NULL,
      reason        TEXT,
      status        TEXT NOT NULL DEFAULT 'pending',
      reviewed_by   TEXT,
      review_note   TEXT,
      applied_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS attendance_logs (
      id           TEXT PRIMARY KEY,
      member_id    TEXT NOT NULL,
      date         TEXT NOT NULL,
      check_in_at  TEXT,
      check_out_at TEXT,
      work_hours   REAL,
      status       TEXT NOT NULL DEFAULT 'present',
      note         TEXT,
      created_at   TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS payroll_runs (
      id           TEXT PRIMARY KEY,
      period_month INTEGER NOT NULL,
      period_year  INTEGER NOT NULL,
      status       TEXT NOT NULL DEFAULT 'draft',
      run_date     TEXT,
      notes        TEXT,
      created_by   TEXT,
      created_at   TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS payroll_items (
      id             TEXT PRIMARY KEY,
      payroll_run_id TEXT NOT NULL,
      member_id      TEXT NOT NULL,
      basic_salary   REAL NOT NULL DEFAULT 0,
      allowances     REAL NOT NULL DEFAULT 0,
      deductions     REAL NOT NULL DEFAULT 0,
      bonus          REAL NOT NULL DEFAULT 0,
      net_pay        REAL NOT NULL DEFAULT 0,
      currency       TEXT NOT NULL DEFAULT 'INR',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      paid_at        TEXT,
      notes          TEXT
    )`,

    sql`CREATE TABLE IF NOT EXISTS performance_reviews (
      id                    TEXT PRIMARY KEY,
      member_id             TEXT NOT NULL,
      reviewer_id           TEXT,
      period                TEXT NOT NULL,
      rating                INTEGER,
      strengths             TEXT,
      areas_for_improvement TEXT,
      goals_next_period     TEXT,
      status                TEXT NOT NULL DEFAULT 'draft',
      reviewed_at           TEXT,
      created_at            TEXT NOT NULL,
      updated_at            TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS employee_documents (
      id            TEXT PRIMARY KEY,
      member_id     TEXT NOT NULL,
      document_type TEXT NOT NULL,
      name          TEXT NOT NULL,
      file_url      TEXT NOT NULL,
      uploaded_by   TEXT,
      expires_at    TEXT,
      created_at    TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS asset_categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS assets (
      id                  TEXT PRIMARY KEY,
      category_id         TEXT,
      name                TEXT NOT NULL,
      serial_number       TEXT,
      purchase_date       TEXT,
      purchase_price      REAL,
      currency            TEXT NOT NULL DEFAULT 'INR',
      vendor              TEXT,
      warranty_expires_at TEXT,
      status              TEXT NOT NULL DEFAULT 'available',
      assigned_to         TEXT,
      assigned_at         TEXT,
      notes               TEXT,
      created_by          TEXT,
      created_at          TEXT NOT NULL,
      updated_at          TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS announcements (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      body          TEXT NOT NULL,
      audience      TEXT NOT NULL DEFAULT 'all',
      department_id TEXT,
      is_pinned     BOOLEAN NOT NULL DEFAULT false,
      published_at  TEXT,
      expires_at    TEXT,
      created_by    TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    )`,
  ]);

  const now = new Date().toISOString();

  // Seed default departments
  await sql`
    INSERT INTO departments (id, name, description, created_at) VALUES
      ('dept-engineering', 'Engineering',  'Product and software engineering',        ${now}),
      ('dept-hr',          'Human Resources', 'People operations and talent',         ${now}),
      ('dept-finance',     'Finance',      'Accounting, payroll, and financial ops',  ${now}),
      ('dept-operations',  'Operations',   'Business operations and logistics',       ${now}),
      ('dept-sales',       'Sales',        'Revenue and customer acquisition',        ${now}),
      ('dept-marketing',   'Marketing',    'Brand, growth, and marketing campaigns',  ${now})
    ON CONFLICT (id) DO NOTHING
  `;

  // Seed default leave types
  await sql`
    INSERT INTO leave_types (id, name, days_per_year, is_paid, created_at) VALUES
      ('lt-annual',    'Annual Leave',    21,   true,  ${now}),
      ('lt-sick',      'Sick Leave',      10,   true,  ${now}),
      ('lt-casual',    'Casual Leave',    7,    true,  ${now}),
      ('lt-maternity', 'Maternity Leave', 180,  true,  ${now}),
      ('lt-paternity', 'Paternity Leave', 15,   true,  ${now}),
      ('lt-unpaid',    'Unpaid Leave',    NULL, false, ${now})
    ON CONFLICT (id) DO NOTHING
  `;

  // Seed default asset categories
  await sql`
    INSERT INTO asset_categories (id, name, created_at) VALUES
      ('cat-laptop',   'Laptop',          ${now}),
      ('cat-mobile',   'Mobile Phone',    ${now}),
      ('cat-monitor',  'Monitor',         ${now}),
      ('cat-headset',  'Headset',         ${now}),
      ('cat-keyboard', 'Keyboard / Mouse',${now}),
      ('cat-other',    'Other',           ${now})
    ON CONFLICT (id) DO NOTHING
  `;

  // Unique index on attendance to prevent duplicate daily entries per employee
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS attendance_member_date_idx
    ON attendance_logs(member_id, date)
  `;
}
