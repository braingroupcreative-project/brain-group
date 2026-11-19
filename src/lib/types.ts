import type { ServiceKey } from "./site";

export type Role = "admin" | "agent";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  password_hash: string;
  active: boolean;
  created_at: string;
}

export interface Attachment {
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface LogEntry {
  at: string;
  by: string;
  text: string;
}

export interface QuoteRequest {
  id: string;
  ref: string;
  service: ServiceKey;
  details: Record<string, string>;
  name: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  message: string;
  consent: boolean;
  status: string;
  assigned_to: string | null;
  attachments: Attachment[];
  notes: LogEntry[];
  history: LogEntry[];
  created_at: string;
  taken_at: string | null;
  reminder_sent_at: string | null;
}

export interface QuoteLine {
  label: string;
  qty: number;
  unit_price: number;
  discount_pct: number;
}

export interface Quote {
  id: string;
  ref: string;
  request_id: string;
  token: string;
  items: QuoteLine[];
  validity_days: number;
  conditions: string;
  delay: string;
  payment_terms: string;
  deposit_mode: "percent" | "amount";
  deposit_value: number;
  total: number;
  deposit: number;
  status: "brouillon" | "envoye" | "accepte" | "refuse";
  sent_at: string | null;
  decided_at: string | null;
  created_by: string;
  created_at: string;
}

export interface Order {
  id: string;
  ref: string;
  quote_id: string;
  request_id: string;
  status: "confirmee" | "production" | "terminee" | "annulee";
  history: LogEntry[];
  created_at: string;
}

export interface Payment {
  id: string;
  quote_id: string;
  kind: "acompte" | "solde" | "autre";
  amount: number;
  method: string;
  tx_ref: string;
  proof_path: string | null;
  status: "a_verifier" | "confirme" | "rejete";
  paid_at: string;
  confirmed_by: string | null;
  history: LogEntry[];
  created_at: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  user: string;
  action: string;
  target: string;
  created_at: string;
}

export interface Tables {
  users: User;
  requests: QuoteRequest;
  quotes: Quote;
  orders: Order;
  payments: Payment;
  audit: AuditEntry;
}
export type TableName = keyof Tables;
