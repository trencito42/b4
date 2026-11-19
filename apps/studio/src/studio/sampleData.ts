import type { ActivityFeedItem } from "@b4/react";
import type { FileExplorerNode } from "@b4/react";

export const analyticsActivity: ActivityFeedItem[] = [
  { id: "1", actorName: "Elena Vogel", action: "published dashboard v2.4", timestamp: "12 min ago" },
  { id: "2", actorName: "System", action: "ingested 1.2M events from edge cluster", timestamp: "38 min ago" },
  { id: "3", actorName: "Marcus Reid", action: "shared filter preset “EU traffic”", timestamp: "2 h ago" },
];

export const invoiceRows = [
  { id: "inv-1042", customer: "Northwind Labs", plan: "Growth", amount: 2480, status: "Paid" as const },
  { id: "inv-1041", customer: "Palette Studio", plan: "Team", amount: 890, status: "Paid" as const },
  { id: "inv-1040", customer: "Riverbank Cloud", plan: "Enterprise", amount: 6200, status: "Open" as const },
  { id: "inv-1039", customer: "Signal Works", plan: "Team", amount: 890, status: "Overdue" as const },
];

export const infraFiles: FileExplorerNode[] = [
  {
    id: "cluster",
    name: "eu-west-cluster",
    type: "folder",
    children: [
      {
        id: "nodes",
        name: "nodes",
        type: "folder",
        children: [
          { id: "n1", name: "edge-01.yaml", type: "file" },
          { id: "n2", name: "edge-02.yaml", type: "file" },
        ],
      },
      { id: "queries", name: "queries.sql", type: "file" },
    ],
  },
  { id: "readme", name: "README.md", type: "file" },
];

export const weeklyRequests = [42, 58, 51, 73, 68, 82, 77];