/**
 * Sample data for the operations console fixture.
 *
 * Entirely fictional: Northwind Supply is an invented company, and every
 * incident, service and person below is neutral placeholder content. No
 * real customer, product or brand is referenced anywhere in this fixture.
 */

import type { BadgeTone, StatusBadgeStatus } from "@b4/react";

export type Severity = "sev1" | "sev2" | "sev3" | "sev4";

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";

export interface Person {
  name: string;
  role: string;
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  owner: Person;
  responders: Person[];
  opened: string;
  updated: string;
  regions: string[];
  /** Percentage of the response SLA still remaining. */
  slaPercent: number;
  /** Share of requests failing, as a percentage. */
  errorRate: number;
  tags: string[];
}

export const severityMeta: Record<
  Severity,
  { label: string; tone: BadgeTone; rank: number; description: string }
> = {
  sev1: {
    label: "SEV-1",
    tone: "danger",
    rank: 1,
    description: "Customer-facing outage, no workaround available.",
  },
  sev2: {
    label: "SEV-2",
    tone: "warning",
    rank: 2,
    description: "Partial degradation, a workaround exists for most users.",
  },
  sev3: {
    label: "SEV-3",
    tone: "info",
    rank: 3,
    description: "Minor degradation with no measurable customer impact.",
  },
  sev4: {
    label: "SEV-4",
    tone: "neutral",
    rank: 4,
    description: "Cosmetic or internal-only issue.",
  },
};

export const statusMeta: Record<
  IncidentStatus,
  { label: string; badge: StatusBadgeStatus }
> = {
  investigating: { label: "Investigating", badge: "degraded" },
  identified: { label: "Identified", badge: "degraded" },
  monitoring: { label: "Monitoring", badge: "idle" },
  resolved: { label: "Resolved", badge: "online" },
};

export const people: Person[] = [
  { name: "Ada Okonkwo", role: "Incident commander" },
  { name: "Ravi Menon", role: "Platform engineer" },
  { name: "Lin Zhao", role: "Site reliability engineer" },
  { name: "Tomas Berg", role: "Support lead" },
  { name: "Nora Haddad", role: "Network engineer" },
];

export const services = [
  "Checkout API",
  "Payments Gateway",
  "Search Index",
  "Media Transcoder",
  "Notifications",
  "Identity",
];

export const regions = ["eu-west-1", "us-east-1", "ap-south-1", "sa-east-1"];

export const incidents: Incident[] = [
  {
    id: "INC-2481",
    title: "Checkout API returning 503 for card payments",
    service: "Checkout API",
    severity: "sev1",
    status: "investigating",
    owner: people[0]!,
    responders: [people[0]!, people[1]!, people[4]!],
    opened: "08:12 UTC",
    updated: "4 min ago",
    regions: ["eu-west-1", "us-east-1"],
    slaPercent: 18,
    errorRate: 38,
    tags: ["payments", "p1"],
  },
  {
    id: "INC-2479",
    title: "Payments Gateway latency above 2s in ap-south-1",
    service: "Payments Gateway",
    severity: "sev2",
    status: "identified",
    owner: people[2]!,
    responders: [people[2]!, people[4]!],
    opened: "07:40 UTC",
    updated: "18 min ago",
    regions: ["ap-south-1"],
    slaPercent: 46,
    errorRate: 4,
    tags: ["latency", "payments"],
  },
  {
    id: "INC-2476",
    title: "Search index rebuild stalled at 62%",
    service: "Search Index",
    severity: "sev3",
    status: "monitoring",
    owner: people[1]!,
    responders: [people[1]!],
    opened: "05:55 UTC",
    updated: "41 min ago",
    regions: ["eu-west-1"],
    slaPercent: 72,
    errorRate: 1,
    tags: ["search", "indexing"],
  },
  {
    id: "INC-2474",
    title: "Media transcoder queue depth rising",
    service: "Media Transcoder",
    severity: "sev3",
    status: "investigating",
    owner: people[4]!,
    responders: [people[4]!, people[1]!],
    opened: "05:12 UTC",
    updated: "1 h ago",
    regions: ["us-east-1"],
    slaPercent: 58,
    errorRate: 2,
    tags: ["media", "capacity"],
  },
  {
    id: "INC-2471",
    title: "Notification digests delayed by up to 20 minutes",
    service: "Notifications",
    severity: "sev2",
    status: "identified",
    owner: people[2]!,
    responders: [people[2]!, people[3]!],
    opened: "03:48 UTC",
    updated: "2 h ago",
    regions: ["eu-west-1", "ap-south-1"],
    slaPercent: 34,
    errorRate: 9,
    tags: ["email", "delivery"],
  },
  {
    id: "INC-2468",
    title: "SSO login loop for users with two linked accounts",
    service: "Identity",
    severity: "sev2",
    status: "monitoring",
    owner: people[0]!,
    responders: [people[0]!, people[2]!],
    opened: "02:30 UTC",
    updated: "3 h ago",
    regions: ["eu-west-1", "us-east-1", "ap-south-1"],
    slaPercent: 51,
    errorRate: 6,
    tags: ["auth", "sso"],
  },
  {
    id: "INC-2463",
    title: "Discount code service returning empty carts",
    service: "Checkout API",
    severity: "sev1",
    status: "identified",
    owner: people[1]!,
    responders: [people[1]!, people[3]!],
    opened: "01:05 UTC",
    updated: "4 h ago",
    regions: ["us-east-1"],
    slaPercent: 22,
    errorRate: 27,
    tags: ["checkout", "promotions"],
  },
  {
    id: "INC-2458",
    title: "TLS certificate rotation pending on edge nodes",
    service: "Notifications",
    severity: "sev4",
    status: "monitoring",
    owner: people[4]!,
    responders: [people[4]!],
    opened: "Yesterday",
    updated: "6 h ago",
    regions: ["sa-east-1"],
    slaPercent: 88,
    errorRate: 0,
    tags: ["certificates", "housekeeping"],
  },
  {
    id: "INC-2452",
    title: "Intermittent 502s between gateway and upstream",
    service: "Payments Gateway",
    severity: "sev2",
    status: "resolved",
    owner: people[2]!,
    responders: [people[2]!],
    opened: "Yesterday",
    updated: "9 h ago",
    regions: ["eu-west-1"],
    slaPercent: 100,
    errorRate: 0,
    tags: ["gateway", "network"],
  },
  {
    id: "INC-2447",
    title: "Avatar upload endpoint rejects large images",
    service: "Media Transcoder",
    severity: "sev3",
    status: "resolved",
    owner: people[3]!,
    responders: [people[3]!],
    opened: "2 days ago",
    updated: "Yesterday",
    regions: ["us-east-1"],
    slaPercent: 100,
    errorRate: 0,
    tags: ["uploads"],
  },
  {
    id: "INC-2440",
    title: "Search facets missing for archived catalogues",
    service: "Search Index",
    severity: "sev4",
    status: "resolved",
    owner: people[1]!,
    responders: [people[1]!],
    opened: "2 days ago",
    updated: "2 days ago",
    regions: ["eu-west-1"],
    slaPercent: 100,
    errorRate: 0,
    tags: ["search", "catalogue"],
  },
  {
    id: "INC-2433",
    title: "Webhook retries queued behind a stuck consumer",
    service: "Notifications",
    severity: "sev3",
    status: "resolved",
    owner: people[0]!,
    responders: [people[0]!],
    opened: "3 days ago",
    updated: "3 days ago",
    regions: ["ap-south-1"],
    slaPercent: 100,
    errorRate: 0,
    tags: ["webhooks"],
  },
];

export interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
}

export const incidentTimeline: TimelineEntry[] = [
  {
    id: "t-1",
    title: "Incident opened",
    description: "Alerting rule fired on checkout error budget burn.",
    timestamp: "08:12",
    tone: "danger",
  },
  {
    id: "t-2",
    title: "Responder paged",
    description: "On-call platform engineer acknowledged the page.",
    timestamp: "08:14",
    tone: "warning",
  },
  {
    id: "t-3",
    title: "Cause narrowed to upstream pool",
    description: "Connection pool exhaustion confirmed in the gateway logs.",
    timestamp: "08:26",
    tone: "info",
  },
  {
    id: "t-4",
    title: "Mitigation applied",
    description: "Pool size raised and the queue drained without a restart.",
    timestamp: "08:44",
    tone: "success",
  },
  {
    id: "t-5",
    title: "Monitoring recovery",
    description: "Error rate holding below the 0.5% objective for 15 minutes.",
    timestamp: "09:02",
    tone: "neutral",
  },
];

export interface ActivityEntry {
  id: string;
  actorName: string;
  action: string;
  timestamp: string;
}

export const incidentActivity: ActivityEntry[] = [
  {
    id: "a-1",
    actorName: "Ada Okonkwo",
    action: "declared the incident and took command.",
    timestamp: "4 min ago",
  },
  {
    id: "a-2",
    actorName: "Ravi Menon",
    action: "raised the connection pool ceiling.",
    timestamp: "11 min ago",
  },
  {
    id: "a-3",
    actorName: "Nora Haddad",
    action: "attached regional dashboards to the incident.",
    timestamp: "26 min ago",
  },
  {
    id: "a-4",
    actorName: "Tomas Berg",
    action: "posted a customer-facing status update.",
    timestamp: "39 min ago",
  },
];

export interface NotificationEntry {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  read?: boolean;
}

export const notifications: NotificationEntry[] = [
  {
    id: "n-1",
    title: "INC-2481 breached its mitigation target",
    description: "Response SLA drops below 20%.",
    timestamp: "2 min ago",
    read: false,
  },
  {
    id: "n-2",
    title: "Screening switched to maintenance",
    description: "Traffic rerouted from eu-west-1.",
    timestamp: "24 min ago",
    read: false,
  },
  {
    id: "n-3",
    title: "Weekly reliability report is ready",
    timestamp: "Yesterday",
    read: true,
  },
];

export const resourceMeters = [
  { label: "Event storage", value: 78, max: 100, unit: "%" },
  { label: "Gateway connections", value: 92, max: 100, unit: "%" },
  { label: "Replica lag", value: 4, max: 30, unit: "s" },
];

export const statTiles = [
  {
    label: "Open incidents",
    value: "7",
    description: "across 6 services",
    trend: { label: "+2 vs. yesterday", direction: "down" as const },
  },
  {
    label: "Median time to acknowledge",
    value: "4m 12s",
    description: "target under 5m",
    trend: { label: "-18% this week", direction: "up" as const },
  },
  {
    label: "SLA compliance",
    value: "96.4%",
    description: "rolling 30 days",
    trend: { label: "+1.2 pts this month", direction: "up" as const },
  },
  {
    label: "Changes in flight",
    value: "12",
    description: "3 awaiting approval",
    trend: { label: "flat", direction: "neutral" as const },
  },
];
