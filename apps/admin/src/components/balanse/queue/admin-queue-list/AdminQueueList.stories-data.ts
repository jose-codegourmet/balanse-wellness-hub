import type { AdminQueueListProps } from "./AdminQueueList.meta";

export type AdminQueueDemoItem = {
  id: string;
  who: string;
  what: string;
  when: string;
  body: string;
  status: "PAYMENT_SUBMITTED" | "CANCELLATION_REQUESTED" | "RESCHEDULE_REQUESTED";
};

const sampleItems: AdminQueueDemoItem[] = [
  {
    id: "demo-1",
    who: "Ana Delgado",
    what: "Caliyoga · Wed 16 Sep",
    when: "Requested 9:10 AM",
    body: "GCash proof uploaded.",
    status: "PAYMENT_SUBMITTED",
  },
  {
    id: "demo-2",
    who: "Ben Santos",
    what: "Yoga · Thu 17 Sep",
    when: "Requested 8:40 AM",
    body: "Pay at counter hold.",
    status: "PAYMENT_SUBMITTED",
  },
  {
    id: "demo-3",
    who: "Lina Cruz",
    what: "Kickboxing · Sat 19 Sep",
    when: "Requested 7:15 AM",
    body: "Schedule conflict.",
    status: "CANCELLATION_REQUESTED",
  },
  {
    id: "demo-4",
    who: "Marco Reyes",
    what: "Dance Fitness · Sun 20 Sep",
    when: "Requested 6:50 AM",
    body: "Move to the Sunday Alec class.",
    status: "RESCHEDULE_REQUESTED",
  },
  {
    id: "demo-5",
    who: "Ivy Tan",
    what: "Calisthenics · Sun 20 Sep",
    when: "Requested 6:20 AM",
    body: "Travel conflict this week.",
    status: "CANCELLATION_REQUESTED",
  },
];

export const adminQueueListDefaultValues: Partial<AdminQueueListProps<AdminQueueDemoItem>> = {
  label: "Admin request queue",
  items: sampleItems,
  getItemKey: (item) => item.id,
  estimateSize: 168,
  totalCount: sampleItems.length,
  virtualizeThreshold: 30,
  hasNextPage: false,
  isFetchingNextPage: false,
};
