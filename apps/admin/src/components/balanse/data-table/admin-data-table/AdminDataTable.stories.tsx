import { FeedbackState } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "./AdminDataTable";
import { adminDataTableDefaultValues } from "./AdminDataTable.stories-data";

type DemoRow = {
  id: string;
  name: string;
  className: string;
  coach: string;
  status: "Published" | "Draft" | "Cancelled";
};

const DEMO_ROWS: DemoRow[] = [
  { id: "1", name: "Amina Cruz", className: "Reformer Flow", coach: "Maris", status: "Published" },
  { id: "2", name: "Ben Santos", className: "Tower Basics", coach: "Alec", status: "Draft" },
  { id: "3", name: "Cara Lim", className: "Chair Strength", coach: "Jodi", status: "Published" },
  { id: "4", name: "Diego Ramos", className: "Reformer Flow", coach: "Maris", status: "Cancelled" },
  { id: "5", name: "Elena Sy", className: "Tower Basics", coach: "Alec", status: "Published" },
];

const DEMO_COLUMNS: ColumnDef<DemoRow, unknown>[] = [
  { accessorKey: "name", header: "Name", meta: { mobile: { role: "title" } } },
  {
    accessorKey: "className",
    header: "Class",
    enableColumnFilter: true,
    meta: { enableFaceting: true, facetLabel: "Class", mobile: { role: "subtitle" } },
  },
  {
    accessorKey: "coach",
    header: "Coach",
    enableColumnFilter: true,
    meta: { enableFaceting: true, facetLabel: "Coach", mobile: { role: "meta" } },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: true,
    meta: { enableFaceting: true, facetLabel: "Status", mobile: { role: "status" } },
  },
];

function generateRows(count: number): DemoRow[] {
  const classes = ["Reformer Flow", "Tower Basics", "Chair Strength"] as const;
  const coaches = ["Maris", "Alec", "Jodi"] as const;
  const statuses = ["Published", "Draft", "Cancelled"] as const;
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `Guest ${index + 1}`,
    className: classes[index % classes.length],
    coach: coaches[index % coaches.length],
    status: statuses[index % statuses.length],
  }));
}

const meta: Meta<typeof AdminDataTable<DemoRow>> = {
  title: "Admin/Components/AdminDataTable",
  component: AdminDataTable,
  tags: ["autodocs"],
  args: {
    ...adminDataTableDefaultValues,
    tableId: "example",
    data: DEMO_ROWS,
    columns: DEMO_COLUMNS,
    getRowId: (row) => row.id,
    persistUrl: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Sortable: Story = {
  args: {
    title: "Sortable sessions",
  },
};

export const Searchable: Story = {
  args: {
    searchable: true,
    searchPlaceholder: "Search guests",
  },
};

export const SelectableBulkActions: Story = {
  args: {
    selectable: true,
    bulkActions: [
      {
        id: "export",
        label: "Mark reviewed",
        onClick: () => undefined,
      },
    ],
  },
};

export const FacetedFilters: Story = {
  args: {
    tableId: "story-facets",
    title: "Faceted filters",
  },
};

export const ColumnVisibility: Story = {
  args: {
    tableId: "story-columns",
    enableColumnVisibility: true,
  },
};

export const DensityComfortable: Story = {
  args: {
    tableId: "story-density-comfortable",
    enableDensity: true,
    density: "comfortable",
  },
};

export const DensityCompact: Story = {
  args: {
    tableId: "story-density-compact",
    enableDensity: true,
    density: "compact",
  },
};

export const StickyHeaderManyRows: Story = {
  args: {
    tableId: "story-sticky",
    data: generateRows(200),
    stickyHeader: true,
    enablePageSize: true,
    pageSize: 50,
    title: "Sticky header",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    loadingLabel: "Loading results",
  },
};

export const LoadingCards360: Story = {
  args: {
    loading: true,
    loadingLabel: "Loading results",
    layout: "cards",
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const LoadingTable1280: Story = {
  args: {
    loading: true,
    loadingLabel: "Loading results",
    layout: "table",
  },
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

export const ErrorState: Story = {
  args: {
    error: <FeedbackState id="calendar.load-failed" />,
  },
};

export const EmptyFeedback: Story = {
  args: {
    data: [],
    emptyStateId: "admin.no-sessions",
  },
};

export const EmptyFilterResult: Story = {
  args: {
    data: [],
    emptyFilterLabel: "No rows match your filter.",
  },
};

export const RowActions: Story = {
  args: {
    rowActions: (row) => [
      { id: "view", label: "View", href: `/sessions/${row.id}` },
      { id: "hide", label: "Hide", onClick: () => undefined },
    ],
  },
};

export const PrimaryLinkColumn: Story = {
  args: {
    columns: [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/customers/${row.id}` },
      },
      ...DEMO_COLUMNS.slice(1),
    ],
  },
};

export const CardsForced: Story = {
  args: {
    tableId: "story-cards",
    layout: "cards",
    enableColumnVisibility: true,
    selectable: true,
    rowActions: (row) => [{ id: "view", label: "View", href: `/sessions/${row.id}` }],
  },
};

export const TableForced: Story = {
  args: {
    tableId: "story-table",
    layout: "table",
  },
};

export const Mobile360: Story = {
  args: { tableId: "story-360", layout: "auto" },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const Tablet768: Story = {
  args: { tableId: "story-768", layout: "auto" },
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const Desktop1280: Story = {
  args: { tableId: "story-1280", layout: "auto" },
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};
