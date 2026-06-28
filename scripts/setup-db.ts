/**
 * Full database migration for Coded Mind.
 * Safe to re-run — uses CREATE TABLE IF NOT EXISTS and ADD COLUMN IF NOT EXISTS.
 *
 *   npx tsx --env-file=.env.local scripts/setup-db.ts
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌  DATABASE_URL not set. Add it to .env.local and re-run.");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1, connect_timeout: 10 });

function ok(name: string, note: string) {
  console.log(`  ✅  ${name.padEnd(26)} ${note}`);
}

async function run() {
  const [{ now }] = await sql<[{ now: string }]>`SELECT now()::text AS now`;
  console.log(`\n🔌  Connected — ${now}\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // EXISTING TABLES  (idempotent — skip if already created)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("── Existing ──────────────────────────────────────────────────");

  await sql`
    CREATE TABLE IF NOT EXISTS candidates (
      id            TEXT PRIMARY KEY,
      full_name     TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      role          TEXT NOT NULL DEFAULT 'candidate',
      created_at    TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL
    )`;
  ok("candidates", "external job applicants / public auth");

  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id            TEXT PRIMARY KEY,
      full_name     TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      role          TEXT NOT NULL DEFAULT 'employee',
      department    TEXT,
      is_active     BOOLEAN NOT NULL DEFAULT true,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at    TEXT NOT NULL,
      last_login_at TEXT
    )`;
  ok("team_members", "internal staff (superadmin/admin/employee)");

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      company    TEXT,
      message    TEXT,
      source     TEXT,
      created_at TEXT NOT NULL
    )`;
  ok("leads", "contact form submissions");

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id            TEXT PRIMARY KEY,
      company_name  TEXT NOT NULL,
      contact_name  TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      phone         TEXT,
      website       TEXT,
      industry      TEXT,
      status        TEXT NOT NULL DEFAULT 'prospect',
      notes         TEXT,
      created_by    TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    )`;
  ok("clients", "client companies (CRM)");

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT PRIMARY KEY,
      client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      name        TEXT NOT NULL,
      description TEXT,
      status      TEXT NOT NULL DEFAULT 'planning',
      type        TEXT NOT NULL,
      budget      NUMERIC(14,2),
      currency    TEXT NOT NULL DEFAULT 'INR',
      start_date  TEXT,
      end_date    TEXT,
      created_by  TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    )`;
  ok("projects", "client engagements");

  await sql`
    CREATE TABLE IF NOT EXISTS project_members (
      id         TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      member_id  TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      role       TEXT NOT NULL DEFAULT 'contributor',
      joined_at  TEXT NOT NULL,
      UNIQUE (project_id, member_id)
    )`;
  ok("project_members", "team assignments per project");

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id          TEXT PRIMARY KEY,
      project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      assigned_to TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      title       TEXT NOT NULL,
      description TEXT,
      status      TEXT NOT NULL DEFAULT 'todo',
      priority    TEXT NOT NULL DEFAULT 'medium',
      due_date    TEXT,
      created_by  TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    )`;
  ok("tasks", "project task board");

  await sql`
    CREATE TABLE IF NOT EXISTS time_logs (
      id          TEXT PRIMARY KEY,
      project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      member_id   TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      task_id     TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      description TEXT,
      hours       NUMERIC(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
      logged_date TEXT NOT NULL,
      created_at  TEXT NOT NULL
    )`;
  ok("time_logs", "hours per project/task");

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id             TEXT PRIMARY KEY,
      client_id      TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      project_id     TEXT REFERENCES projects(id) ON DELETE SET NULL,
      invoice_number TEXT UNIQUE NOT NULL,
      amount         NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
      currency       TEXT NOT NULL DEFAULT 'INR',
      status         TEXT NOT NULL DEFAULT 'draft',
      notes          TEXT,
      issued_at      TEXT,
      due_at         TEXT,
      paid_at        TEXT,
      created_by     TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at     TEXT NOT NULL,
      updated_at     TEXT NOT NULL
    )`;
  ok("invoices", "client billing");

  await sql`
    CREATE TABLE IF NOT EXISTS job_postings (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      department   TEXT,
      type         TEXT NOT NULL DEFAULT 'full_time',
      location     TEXT,
      is_remote    BOOLEAN NOT NULL DEFAULT true,
      description  TEXT,
      requirements TEXT,
      is_active    BOOLEAN NOT NULL DEFAULT true,
      created_by   TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at   TEXT NOT NULL,
      closes_at    TEXT
    )`;
  ok("job_postings", "careers / open positions");

  await sql`
    CREATE TABLE IF NOT EXISTS job_applications (
      id           TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      job_id       TEXT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
      status       TEXT NOT NULL DEFAULT 'applied',
      resume_url   TEXT,
      cover_letter TEXT,
      notes        TEXT,
      reviewed_by  TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      applied_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL,
      UNIQUE (candidate_id, job_id)
    )`;
  ok("job_applications", "candidate × job mapping");

  await sql`
    CREATE TABLE IF NOT EXISTS tool_events (
      id         TEXT PRIMARY KEY,
      tool       TEXT NOT NULL,
      event      TEXT NOT NULL DEFAULT 'used',
      session_id TEXT,
      created_at TEXT NOT NULL
    )`;
  ok("tool_events", "free tool analytics");

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN 1 — HR / PEOPLE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── HR / People ───────────────────────────────────────────────");

  await sql`
    CREATE TABLE IF NOT EXISTS departments (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL UNIQUE,
      description TEXT,
      head_id     TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at  TEXT NOT NULL
    )`;
  ok("departments", "org structure");

  await sql`
    CREATE TABLE IF NOT EXISTS designations (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
      level         TEXT,
        -- junior | mid | senior | lead | manager | director
      created_at    TEXT NOT NULL
    )`;
  ok("designations", "job titles per department");

  // Extend team_members with a dept FK (safe if column already exists)
  await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS department_id TEXT REFERENCES departments(id) ON DELETE SET NULL`;
  ok("team_members", "(+department_id FK)");

  await sql`
    CREATE TABLE IF NOT EXISTS employee_profiles (
      id                          TEXT PRIMARY KEY,
      member_id                   TEXT NOT NULL UNIQUE REFERENCES team_members(id) ON DELETE CASCADE,
      date_of_birth               TEXT,
      phone                       TEXT,
      personal_email              TEXT,
      address_line1               TEXT,
      address_line2               TEXT,
      city                        TEXT,
      state                       TEXT,
      country                     TEXT DEFAULT 'India',
      postal_code                 TEXT,
      emergency_contact_name      TEXT,
      emergency_contact_phone     TEXT,
      emergency_contact_relation  TEXT,
      join_date                   TEXT,
      employment_type             TEXT NOT NULL DEFAULT 'full_time',
        -- full_time | part_time | contract | intern
      department_id               TEXT REFERENCES departments(id) ON DELETE SET NULL,
      designation_id              TEXT REFERENCES designations(id) ON DELETE SET NULL,
      reporting_to                TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      pan_number                  TEXT,
      bank_account_number         TEXT,
      bank_ifsc                   TEXT,
      created_at                  TEXT NOT NULL,
      updated_at                  TEXT NOT NULL
    )`;
  ok("employee_profiles", "full HR details per team member");

  await sql`
    CREATE TABLE IF NOT EXISTS leave_types (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL UNIQUE,
        -- Annual | Sick | Casual | Maternity | Paternity | Unpaid
      days_per_year INTEGER,
      is_paid       BOOLEAN NOT NULL DEFAULT true,
      created_at    TEXT NOT NULL
    )`;
  ok("leave_types", "leave policy definitions");

  await sql`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id             TEXT PRIMARY KEY,
      member_id      TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      leave_type_id  TEXT NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
      from_date      TEXT NOT NULL,
      to_date        TEXT NOT NULL,
      days_count     NUMERIC(4,1) NOT NULL,
      reason         TEXT,
      status         TEXT NOT NULL DEFAULT 'pending',
        -- pending | approved | rejected | cancelled
      reviewed_by    TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      review_note    TEXT,
      applied_at     TEXT NOT NULL,
      updated_at     TEXT NOT NULL
    )`;
  ok("leave_requests", "leave applications + approvals");

  await sql`
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id            TEXT PRIMARY KEY,
      member_id     TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      date          TEXT NOT NULL,
      check_in_at   TEXT,
      check_out_at  TEXT,
      work_hours    NUMERIC(4,2),
      status        TEXT NOT NULL DEFAULT 'present',
        -- present | absent | half_day | on_leave | holiday | wfh
      note          TEXT,
      created_at    TEXT NOT NULL,
      UNIQUE (member_id, date)
    )`;
  ok("attendance_logs", "daily attendance per employee");

  await sql`
    CREATE TABLE IF NOT EXISTS payroll_runs (
      id           TEXT PRIMARY KEY,
      period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
      period_year  INTEGER NOT NULL,
      status       TEXT NOT NULL DEFAULT 'draft',
        -- draft | processing | completed | cancelled
      run_date     TEXT,
      notes        TEXT,
      created_by   TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at   TEXT NOT NULL,
      UNIQUE (period_month, period_year)
    )`;
  ok("payroll_runs", "monthly payroll batch headers");

  await sql`
    CREATE TABLE IF NOT EXISTS payroll_items (
      id             TEXT PRIMARY KEY,
      payroll_run_id TEXT NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
      member_id      TEXT NOT NULL REFERENCES team_members(id) ON DELETE RESTRICT,
      basic_salary   NUMERIC(12,2) NOT NULL,
      allowances     NUMERIC(12,2) NOT NULL DEFAULT 0,
      deductions     NUMERIC(12,2) NOT NULL DEFAULT 0,
      bonus          NUMERIC(12,2) NOT NULL DEFAULT 0,
      net_pay        NUMERIC(12,2) NOT NULL,
      currency       TEXT NOT NULL DEFAULT 'INR',
      payment_status TEXT NOT NULL DEFAULT 'pending',
        -- pending | paid | on_hold
      paid_at        TEXT,
      notes          TEXT,
      UNIQUE (payroll_run_id, member_id)
    )`;
  ok("payroll_items", "per-employee salary lines per run");

  await sql`
    CREATE TABLE IF NOT EXISTS performance_reviews (
      id                   TEXT PRIMARY KEY,
      member_id            TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      reviewer_id          TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      period               TEXT NOT NULL,
        -- e.g. Q1-2025 | Annual-2025
      rating               INTEGER CHECK (rating BETWEEN 1 AND 5),
      strengths            TEXT,
      areas_for_improvement TEXT,
      goals_next_period    TEXT,
      status               TEXT NOT NULL DEFAULT 'draft',
        -- draft | submitted | acknowledged
      reviewed_at          TEXT,
      created_at           TEXT NOT NULL,
      updated_at           TEXT NOT NULL
    )`;
  ok("performance_reviews", "quarterly / annual reviews");

  await sql`
    CREATE TABLE IF NOT EXISTS employee_documents (
      id            TEXT PRIMARY KEY,
      member_id     TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      document_type TEXT NOT NULL,
        -- offer_letter | contract | id_proof | payslip | certificate | other
      name          TEXT NOT NULL,
      file_url      TEXT NOT NULL,
      uploaded_by   TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      expires_at    TEXT,
      created_at    TEXT NOT NULL
    )`;
  ok("employee_documents", "HR doc storage (offer letters, IDs, etc.)");

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN 2 — ASSETS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Assets ────────────────────────────────────────────────────");

  await sql`
    CREATE TABLE IF NOT EXISTS asset_categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
        -- Laptop | Mobile | Monitor | Software License | Peripheral | Furniture
      created_at TEXT NOT NULL
    )`;
  ok("asset_categories", "equipment / license types");

  await sql`
    CREATE TABLE IF NOT EXISTS assets (
      id                 TEXT PRIMARY KEY,
      category_id        TEXT REFERENCES asset_categories(id) ON DELETE SET NULL,
      name               TEXT NOT NULL,
      serial_number      TEXT UNIQUE,
      purchase_date      TEXT,
      purchase_price     NUMERIC(12,2),
      currency           TEXT NOT NULL DEFAULT 'INR',
      vendor             TEXT,
      warranty_expires_at TEXT,
      status             TEXT NOT NULL DEFAULT 'available',
        -- available | assigned | in_repair | retired | lost
      assigned_to        TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      assigned_at        TEXT,
      notes              TEXT,
      created_by         TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at         TEXT NOT NULL,
      updated_at         TEXT NOT NULL
    )`;
  ok("assets", "company equipment & licenses");

  await sql`
    CREATE TABLE IF NOT EXISTS asset_assignments (
      id          TEXT PRIMARY KEY,
      asset_id    TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
      member_id   TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      action      TEXT NOT NULL,
        -- assigned | returned | sent_for_repair | retired
      note        TEXT,
      actioned_at TEXT NOT NULL,
      actioned_by TEXT REFERENCES team_members(id) ON DELETE SET NULL
    )`;
  ok("asset_assignments", "assignment / return audit trail");

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN 3 — CRM / SALES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── CRM / Sales ───────────────────────────────────────────────");

  // Extend leads with pipeline status + owner
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to TEXT REFERENCES team_members(id) ON DELETE SET NULL`;
  ok("leads", "(+status, +assigned_to)");

  await sql`
    CREATE TABLE IF NOT EXISTS lead_activities (
      id                 TEXT PRIMARY KEY,
      lead_id            TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      activity_type      TEXT NOT NULL,
        -- email | call | meeting | demo | follow_up | note
      subject            TEXT,
      body               TEXT,
      outcome            TEXT,
      next_follow_up_date TEXT,
      created_by         TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at         TEXT NOT NULL
    )`;
  ok("lead_activities", "touchpoint log per lead");

  await sql`
    CREATE TABLE IF NOT EXISTS proposals (
      id          TEXT PRIMARY KEY,
      lead_id     TEXT REFERENCES leads(id) ON DELETE SET NULL,
      client_id   TEXT REFERENCES clients(id) ON DELETE SET NULL,
      title       TEXT NOT NULL,
      value       NUMERIC(14,2),
      currency    TEXT NOT NULL DEFAULT 'INR',
      status      TEXT NOT NULL DEFAULT 'draft',
        -- draft | sent | under_review | accepted | rejected | expired
      sent_at     TEXT,
      valid_until TEXT,
      file_url    TEXT,
      notes       TEXT,
      created_by  TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    )`;
  ok("proposals", "sales proposals to leads / clients");

  await sql`
    CREATE TABLE IF NOT EXISTS contracts (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      project_id      TEXT REFERENCES projects(id) ON DELETE SET NULL,
      proposal_id     TEXT REFERENCES proposals(id) ON DELETE SET NULL,
      contract_number TEXT UNIQUE NOT NULL,
      title           TEXT NOT NULL,
      value           NUMERIC(14,2),
      currency        TEXT NOT NULL DEFAULT 'INR',
      start_date      TEXT,
      end_date        TEXT,
      status          TEXT NOT NULL DEFAULT 'draft',
        -- draft | active | expired | terminated
      file_url        TEXT,
      signed_at       TEXT,
      notes           TEXT,
      created_by      TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    )`;
  ok("contracts", "signed client agreements");

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN 4 — FINANCE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Finance ───────────────────────────────────────────────────");

  await sql`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
        -- Travel | Software | Office Supplies | Meals | Marketing | Utilities | Other
      created_at TEXT NOT NULL
    )`;
  ok("expense_categories", "expense classification");

  await sql`
    CREATE TABLE IF NOT EXISTS expense_claims (
      id            TEXT PRIMARY KEY,
      member_id     TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      category_id   TEXT REFERENCES expense_categories(id) ON DELETE SET NULL,
      project_id    TEXT REFERENCES projects(id) ON DELETE SET NULL,
      title         TEXT NOT NULL,
      amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      currency      TEXT NOT NULL DEFAULT 'INR',
      expense_date  TEXT NOT NULL,
      receipt_url   TEXT,
      status        TEXT NOT NULL DEFAULT 'pending',
        -- pending | approved | rejected | reimbursed
      reviewed_by   TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      review_note   TEXT,
      reimbursed_at TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    )`;
  ok("expense_claims", "employee expense reimbursements");

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id                   TEXT PRIMARY KEY,
      invoice_id           TEXT NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
      client_id            TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      amount               NUMERIC(14,2) NOT NULL CHECK (amount > 0),
      currency             TEXT NOT NULL DEFAULT 'INR',
      payment_method       TEXT,
        -- bank_transfer | upi | cheque | credit_card | other
      transaction_reference TEXT,
      received_at          TEXT NOT NULL,
      notes                TEXT,
      recorded_by          TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at           TEXT NOT NULL
    )`;
  ok("payments", "money received against invoices");

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN 5 — INTERNAL OPS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Internal Ops ──────────────────────────────────────────────");

  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      body          TEXT NOT NULL,
      audience      TEXT NOT NULL DEFAULT 'all',
        -- all | department
      department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
      is_pinned     BOOLEAN NOT NULL DEFAULT false,
      published_at  TEXT,
      expires_at    TEXT,
      created_by    TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    )`;
  ok("announcements", "company-wide / dept notices");

  await sql`
    CREATE TABLE IF NOT EXISTS meetings (
      id               TEXT PRIMARY KEY,
      title            TEXT NOT NULL,
      meeting_type     TEXT NOT NULL DEFAULT 'internal',
        -- internal | client | standup | retrospective | interview
      project_id       TEXT REFERENCES projects(id) ON DELETE SET NULL,
      client_id        TEXT REFERENCES clients(id) ON DELETE SET NULL,
      scheduled_at     TEXT NOT NULL,
      duration_minutes INTEGER,
      location         TEXT,
      agenda           TEXT,
      minutes          TEXT,
      status           TEXT NOT NULL DEFAULT 'scheduled',
        -- scheduled | completed | cancelled
      created_by       TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL
    )`;
  ok("meetings", "internal and client meetings log");

  await sql`
    CREATE TABLE IF NOT EXISTS meeting_attendees (
      id          TEXT PRIMARY KEY,
      meeting_id  TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      member_id   TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      rsvp_status TEXT NOT NULL DEFAULT 'invited',
        -- invited | accepted | declined | attended
      UNIQUE (meeting_id, member_id)
    )`;
  ok("meeting_attendees", "who attended which meeting");

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN 6 — KNOWLEDGE BASE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Knowledge Base ────────────────────────────────────────────");

  await sql`
    CREATE TABLE IF NOT EXISTS kb_categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      slug       TEXT UNIQUE NOT NULL,
      parent_id  TEXT REFERENCES kb_categories(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    )`;
  ok("kb_categories", "wiki sections (nestable)");

  await sql`
    CREATE TABLE IF NOT EXISTS kb_articles (
      id             TEXT PRIMARY KEY,
      category_id    TEXT REFERENCES kb_categories(id) ON DELETE SET NULL,
      title          TEXT NOT NULL,
      slug           TEXT UNIQUE NOT NULL,
      content        TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'draft',
        -- draft | published | archived
      is_pinned      BOOLEAN NOT NULL DEFAULT false,
      authored_by    TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      last_edited_by TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      published_at   TEXT,
      created_at     TEXT NOT NULL,
      updated_at     TEXT NOT NULL
    )`;
  ok("kb_articles", "internal SOPs and wiki pages");

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN 7 — MARKETING
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Marketing ─────────────────────────────────────────────────");

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id               TEXT PRIMARY KEY,
      email            TEXT UNIQUE NOT NULL,
      name             TEXT,
      source           TEXT,
        -- website_footer | blog | tool_page | event | manual
      status           TEXT NOT NULL DEFAULT 'active',
        -- active | unsubscribed | bounced
      unsubscribed_at  TEXT,
      created_at       TEXT NOT NULL
    )`;
  ok("newsletter_subscribers", "email marketing opt-ins");

  // ═══════════════════════════════════════════════════════════════════════════
  // INDEXES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── Indexes ───────────────────────────────────────────────────");

  const indexes: [string, string][] = [
    // existing
    ["idx_projects_client",           "projects(client_id)"],
    ["idx_tasks_project",             "tasks(project_id)"],
    ["idx_tasks_assigned",            "tasks(assigned_to)"],
    ["idx_time_logs_project",         "time_logs(project_id)"],
    ["idx_time_logs_member",          "time_logs(member_id)"],
    ["idx_invoices_client",           "invoices(client_id)"],
    ["idx_applications_job",          "job_applications(job_id)"],
    ["idx_tool_events_tool",          "tool_events(tool)"],
    ["idx_leads_created",             "leads(created_at)"],
    // HR
    ["idx_employee_profiles_member",  "employee_profiles(member_id)"],
    ["idx_leave_requests_member",     "leave_requests(member_id)"],
    ["idx_attendance_member_date",    "attendance_logs(member_id, date)"],
    ["idx_payroll_items_run",         "payroll_items(payroll_run_id)"],
    ["idx_payroll_items_member",      "payroll_items(member_id)"],
    ["idx_performance_reviews_member","performance_reviews(member_id)"],
    ["idx_employee_docs_member",      "employee_documents(member_id)"],
    // Assets
    ["idx_assets_assigned_to",        "assets(assigned_to)"],
    ["idx_asset_assignments_asset",   "asset_assignments(asset_id)"],
    // CRM
    ["idx_lead_activities_lead",      "lead_activities(lead_id)"],
    ["idx_proposals_lead",            "proposals(lead_id)"],
    ["idx_proposals_client",          "proposals(client_id)"],
    ["idx_contracts_client",          "contracts(client_id)"],
    // Finance
    ["idx_expense_claims_member",     "expense_claims(member_id)"],
    ["idx_payments_invoice",          "payments(invoice_id)"],
    // Ops
    ["idx_announcements_published",   "announcements(published_at)"],
    ["idx_meetings_scheduled",        "meetings(scheduled_at)"],
    // KB
    ["idx_kb_articles_category",      "kb_articles(category_id)"],
    ["idx_kb_articles_status",        "kb_articles(status)"],
  ];

  for (const [name, def] of indexes) {
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS ${name} ON ${def}`);
  }
  console.log(`  ✅  ${indexes.length} indexes created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const all = [
    "candidates","team_members","leads","clients","projects","project_members",
    "tasks","time_logs","invoices","job_postings","job_applications","tool_events",
    "departments","designations","employee_profiles","leave_types","leave_requests",
    "attendance_logs","payroll_runs","payroll_items","performance_reviews",
    "employee_documents","asset_categories","assets","asset_assignments",
    "lead_activities","proposals","contracts","expense_categories","expense_claims",
    "payments","announcements","meetings","meeting_attendees",
    "kb_categories","kb_articles","newsletter_subscribers",
  ];

  console.log(`\n📊  Row counts (${all.length} tables):`);
  const pad = Math.max(...all.map((t) => t.length));
  for (const t of all) {
    const [{ c }] = await sql<[{ c: string }]>`SELECT COUNT(*)::text AS c FROM ${sql(t)}`;
    console.log(`     ${t.padEnd(pad)}  ${c}`);
  }

  console.log(`\n🎉  Database ready — ${all.length} tables, ${indexes.length} indexes.\n`);
  await sql.end();
}

run().catch((err) => {
  console.error("\n❌  Migration failed:", err.message, "\n");
  process.exit(1);
});
