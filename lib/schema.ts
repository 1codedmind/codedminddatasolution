/**
 * TypeScript types for every database table.
 * Columns are camelCase (mapped from snake_case via SQL AS aliases).
 *
 * ┌─ Access matrix ─────────────────────────────────────────────────────────┐
 * │  superadmin — full CRUD on everything                                   │
 * │  admin      — full CRUD except cannot delete team_members or invoices   │
 * │  employee   — own data + assigned projects/tasks/time_logs              │
 * │  candidate  — own applications + public job_postings                    │
 * │  client     — own projects, tasks, invoices (future portal)             │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

export type Currency = "INR" | "USD" | "EUR" | "GBP";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/** External job applicants — public-facing auth */
export type Candidate = {
  id: string;
  fullName: string;
  email: string;
  role: "candidate";
  createdAt: string;
};

/** Internal staff */
export type TeamMemberRole = "superadmin" | "admin" | "employee";

export type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  role: TeamMemberRole;
  department: string | null;       // legacy free-text; prefer departmentId
  departmentId: string | null;     // FK → departments
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HR / PEOPLE
// ─────────────────────────────────────────────────────────────────────────────

/** access: superadmin CRUD | admin read | employee read */
export type Department = {
  id: string;
  name: string;
  description: string | null;
  headId: string | null;           // FK → team_members
  createdAt: string;
};

/** access: superadmin CRUD | admin read | employee read */
export type DesignationLevel = "junior" | "mid" | "senior" | "lead" | "manager" | "director";

export type Designation = {
  id: string;
  title: string;
  departmentId: string | null;
  level: DesignationLevel | null;
  createdAt: string;
};

/** access: superadmin CRUD | admin read+update | employee read own */
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";

export type EmployeeProfile = {
  id: string;
  memberId: string;                // FK → team_members (1:1)
  dateOfBirth: string | null;
  phone: string | null;
  personalEmail: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  joinDate: string | null;
  employmentType: EmploymentType;
  departmentId: string | null;
  designationId: string | null;
  reportingTo: string | null;      // FK → team_members
  panNumber: string | null;        // masked in UI
  bankAccountNumber: string | null;// masked in UI
  bankIfsc: string | null;
  createdAt: string;
  updatedAt: string;
};

/** access: superadmin CRUD | admin read | employee read */
export type LeaveType = {
  id: string;
  name: string;                    // Annual | Sick | Casual | Maternity | Paternity | Unpaid
  daysPerYear: number | null;
  isPaid: boolean;
  createdAt: string;
};

/** access: superadmin CRUD | admin CRUD | employee create+read own */
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveRequest = {
  id: string;
  memberId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  daysCount: number;
  reason: string | null;
  status: LeaveStatus;
  reviewedBy: string | null;
  reviewNote: string | null;
  appliedAt: string;
  updatedAt: string;
};

/** access: superadmin CRUD | admin read+edit | employee read+create own */
export type AttendanceStatus = "present" | "absent" | "half_day" | "on_leave" | "holiday" | "wfh";

export type AttendanceLog = {
  id: string;
  memberId: string;
  date: string;                    // YYYY-MM-DD
  checkInAt: string | null;
  checkOutAt: string | null;
  workHours: number | null;
  status: AttendanceStatus;
  note: string | null;
  createdAt: string;
};

/** access: superadmin CRUD | admin read */
export type PayrollRunStatus = "draft" | "processing" | "completed" | "cancelled";

export type PayrollRun = {
  id: string;
  periodMonth: number;             // 1-12
  periodYear: number;
  status: PayrollRunStatus;
  runDate: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
};

/** access: superadmin CRUD | admin read | employee read own */
export type PayrollItemStatus = "pending" | "paid" | "on_hold";

export type PayrollItem = {
  id: string;
  payrollRunId: string;
  memberId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netPay: number;
  currency: Currency;
  paymentStatus: PayrollItemStatus;
  paidAt: string | null;
  notes: string | null;
};

/** access: superadmin CRUD | admin CRUD | employee read own */
export type ReviewStatus = "draft" | "submitted" | "acknowledged";

export type PerformanceReview = {
  id: string;
  memberId: string;
  reviewerId: string | null;
  period: string;                  // e.g. "Q1-2025" | "Annual-2025"
  rating: 1 | 2 | 3 | 4 | 5 | null;
  strengths: string | null;
  areasForImprovement: string | null;
  goalsNextPeriod: string | null;
  status: ReviewStatus;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** access: superadmin CRUD | admin read+upload | employee read own */
export type DocumentType =
  | "offer_letter"
  | "contract"
  | "id_proof"
  | "payslip"
  | "certificate"
  | "other";

export type EmployeeDocument = {
  id: string;
  memberId: string;
  documentType: DocumentType;
  name: string;
  fileUrl: string;
  uploadedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────────────────────────────────────────

/** access: superadmin CRUD | admin read */
export type AssetCategory = {
  id: string;
  name: string;                    // Laptop | Mobile | Monitor | Software License | Peripheral
  createdAt: string;
};

/** access: superadmin CRUD | admin read+update | employee read own assigned */
export type AssetStatus = "available" | "assigned" | "in_repair" | "retired" | "lost";

export type Asset = {
  id: string;
  categoryId: string | null;
  name: string;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  currency: Currency;
  vendor: string | null;
  warrantyExpiresAt: string | null;
  status: AssetStatus;
  assignedTo: string | null;       // FK → team_members
  assignedAt: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

/** access: superadmin CRUD | admin read */
export type AssetAction = "assigned" | "returned" | "sent_for_repair" | "retired";

export type AssetAssignment = {
  id: string;
  assetId: string;
  memberId: string;
  action: AssetAction;
  note: string | null;
  actionedAt: string;
  actionedBy: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// CRM / SALES
// ─────────────────────────────────────────────────────────────────────────────

/** access: superadmin CRUD | admin CRUD | employee read */
export type LeadStatus = "new" | "contacted" | "qualified" | "disqualified" | "converted";

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  assignedTo: string | null;       // FK → team_members
  createdAt: string;
};

/** access: superadmin CRUD | admin CRUD | employee create+read assigned */
export type ActivityType = "email" | "call" | "meeting" | "demo" | "follow_up" | "note";

export type LeadActivity = {
  id: string;
  leadId: string;
  activityType: ActivityType;
  subject: string | null;
  body: string | null;
  outcome: string | null;
  nextFollowUpDate: string | null;
  createdBy: string | null;
  createdAt: string;
};

/** access: superadmin CRUD | admin CRUD | employee read assigned */
export type ProposalStatus =
  | "draft"
  | "sent"
  | "under_review"
  | "accepted"
  | "rejected"
  | "expired";

export type Proposal = {
  id: string;
  leadId: string | null;
  clientId: string | null;
  title: string;
  value: number | null;
  currency: Currency;
  status: ProposalStatus;
  sentAt: string | null;
  validUntil: string | null;
  fileUrl: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

/** access: superadmin CRUD | admin read+create | employee read if project member */
export type ContractStatus = "draft" | "active" | "expired" | "terminated";

export type Contract = {
  id: string;
  clientId: string;
  projectId: string | null;
  proposalId: string | null;
  contractNumber: string;
  title: string;
  value: number | null;
  currency: Currency;
  startDate: string | null;
  endDate: string | null;
  status: ContractStatus;
  fileUrl: string | null;
  signedAt: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS & DELIVERY  (existing)
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectStatus = "planning" | "active" | "paused" | "completed" | "cancelled";
export type ProjectType =
  | "data_engineering"
  | "cloud"
  | "reporting"
  | "automation"
  | "product"
  | "quality";

export type Project = {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  type: ProjectType;
  budget: number | null;
  currency: Currency;
  startDate: string | null;
  endDate: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectMemberRole = "lead" | "contributor" | "reviewer";

export type ProjectMember = {
  id: string;
  projectId: string;
  memberId: string;
  role: ProjectMemberRole;
  joinedAt: string;
};

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  projectId: string;
  assignedTo: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TimeLog = {
  id: string;
  projectId: string;
  memberId: string;
  taskId: string | null;
  description: string | null;
  hours: number;
  loggedDate: string;
  createdAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE
// ─────────────────────────────────────────────────────────────────────────────

/** access: superadmin CRUD | admin CRUD */
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type Invoice = {
  id: string;
  clientId: string;
  projectId: string | null;
  invoiceNumber: string;
  amount: number;
  currency: Currency;
  status: InvoiceStatus;
  notes: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

/** access: superadmin CRUD | admin read */
export type ExpenseCategory = {
  id: string;
  name: string;                    // Travel | Software | Office Supplies | Meals | Marketing
  createdAt: string;
};

/** access: superadmin CRUD | admin CRUD | employee create+read own */
export type ExpenseStatus = "pending" | "approved" | "rejected" | "reimbursed";

export type ExpenseClaim = {
  id: string;
  memberId: string;
  categoryId: string | null;
  projectId: string | null;
  title: string;
  amount: number;
  currency: Currency;
  expenseDate: string;
  receiptUrl: string | null;
  status: ExpenseStatus;
  reviewedBy: string | null;
  reviewNote: string | null;
  reimbursedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** access: superadmin CRUD | admin CRUD */
export type PaymentMethod = "bank_transfer" | "upi" | "cheque" | "credit_card" | "other";

export type Payment = {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod | null;
  transactionReference: string | null;
  receivedAt: string;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// HIRING  (existing)
// ─────────────────────────────────────────────────────────────────────────────

export type JobType = "full_time" | "part_time" | "contract" | "internship";

export type JobPosting = {
  id: string;
  title: string;
  department: string | null;
  type: JobType;
  location: string | null;
  isRemote: boolean;
  description: string | null;
  requirements: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  closesAt: string | null;
};

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "interviewed"
  | "offered"
  | "rejected"
  | "withdrawn";

export type JobApplication = {
  id: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  resumeUrl: string | null;
  coverLetter: string | null;
  notes: string | null;
  reviewedBy: string | null;
  appliedAt: string;
  updatedAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL OPS
// ─────────────────────────────────────────────────────────────────────────────

/** access: superadmin CRUD | admin CRUD | employee read */
export type AnnouncementAudience = "all" | "department";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  departmentId: string | null;
  isPinned: boolean;
  publishedAt: string | null;      // null = draft
  expiresAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

/** access: superadmin CRUD | admin CRUD | employee read+create */
export type MeetingType =
  | "internal"
  | "client"
  | "standup"
  | "retrospective"
  | "interview";

export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export type Meeting = {
  id: string;
  title: string;
  meetingType: MeetingType;
  projectId: string | null;
  clientId: string | null;
  scheduledAt: string;
  durationMinutes: number | null;
  location: string | null;
  agenda: string | null;
  minutes: string | null;
  status: MeetingStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RsvpStatus = "invited" | "accepted" | "declined" | "attended";

export type MeetingAttendee = {
  id: string;
  meetingId: string;
  memberId: string;
  rsvpStatus: RsvpStatus;
};

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────────────────

/** access: superadmin CRUD | admin CRUD | employee read */
export type KbCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;         // self-reference for nested sections
  createdAt: string;
};

/** access: superadmin CRUD | admin CRUD | employee read published + write own drafts */
export type ArticleStatus = "draft" | "published" | "archived";

export type KbArticle = {
  id: string;
  categoryId: string | null;
  title: string;
  slug: string;
  content: string;                 // Markdown
  status: ArticleStatus;
  isPinned: boolean;
  authoredBy: string | null;
  lastEditedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// MARKETING
// ─────────────────────────────────────────────────────────────────────────────

/** access: superadmin CRUD | admin read */
export type SubscriberStatus = "active" | "unsubscribed" | "bounced";
export type SubscriberSource =
  | "website_footer"
  | "blog"
  | "tool_page"
  | "event"
  | "manual";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  name: string | null;
  source: SubscriberSource | null;
  status: SubscriberStatus;
  unsubscribedAt: string | null;
  createdAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS  (existing)
// ─────────────────────────────────────────────────────────────────────────────

export type ToolEvent = {
  id: string;
  tool: string;
  event: string;
  sessionId: string | null;
  createdAt: string;
};
