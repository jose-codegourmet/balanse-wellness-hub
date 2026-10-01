"use client";

import { formatRatioPercent, type MarketingInsights } from "@balanse/domain";
import { isMockAuthorizationError } from "@balanse/mock";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DateRangePicker,
  FeedbackState,
  Skeleton,
} from "@balanse/ui";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  type LucideIcon,
  Share2Icon,
  SkipForwardIcon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminTodayYmd } from "@/lib/clock";
import { adminMarketingInsightsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import {
  defaultMarketingInsightsRange,
  isAllDatesRange,
  MARKETING_INSIGHTS_ALL_DATES,
} from "../../_lib/marketing-insights-range";
import { InsightsBarChart } from "../insights-bar-chart/InsightsBarChart";
import { InsightsShareSplit } from "../insights-share-split/InsightsShareSplit";
import type { MarketingInsightsPageProps } from "./MarketingInsightsPage.meta";

export type { MarketingInsightsPageProps } from "./MarketingInsightsPage.meta";

const TITLE = "Marketing insights";
const DESCRIPTION =
  "Who signs up and why: where people heard about us, what they want, and how much sharing drives sign-ups. Counts only.";
const BREADCRUMB = [{ label: TITLE }];
const NO_SIGNUPS = "No sign-ups in this range";
const NO_ANSWERS = "No answers to this question in this range.";

type Kpi = {
  id: string;
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: 1 | 2 | 3 | 4 | 5;
};

const TONE_ICON: Record<Kpi["tone"], string> = {
  1: "bg-chart-1/15 text-chart-1",
  2: "bg-chart-2/15 text-chart-2",
  3: "bg-chart-3/15 text-chart-3",
  4: "bg-chart-4/15 text-chart-4",
  5: "bg-chart-5/15 text-chart-5",
};

function percent(count: number, total: number): string {
  return total > 0 ? formatRatioPercent(count / total) : "—";
}

function sum(rows: { count: number }[]): number {
  return rows.reduce((total, row) => total + row.count, 0);
}

function kpisFor(insights: MarketingInsights): Kpi[] {
  const { signups, onboarding, sharedLinkSignups } = insights;
  return [
    {
      id: "signups",
      label: "Sign-ups",
      value: String(signups),
      note: "New accounts in this range",
      icon: UserPlusIcon,
      tone: 1,
    },
    {
      id: "completed",
      label: "Onboarding completed",
      value: percent(onboarding.completed, signups),
      note: `${onboarding.completed} of ${signups}`,
      icon: CircleCheckIcon,
      tone: 2,
    },
    {
      id: "skipped",
      label: "Skipped",
      value: percent(onboarding.skipped, signups),
      note: `${onboarding.skipped} of ${signups}`,
      icon: SkipForwardIcon,
      tone: 4,
    },
    {
      id: "not-started",
      label: "Not started",
      value: percent(onboarding.not_started, signups),
      note:
        onboarding.in_progress > 0
          ? `${onboarding.not_started} of ${signups} · ${onboarding.in_progress} in progress`
          : `${onboarding.not_started} of ${signups}`,
      icon: CircleDashedIcon,
      tone: 5,
    },
    {
      id: "shared",
      label: "From shared links",
      value: String(sharedLinkSignups),
      note: `${percent(sharedLinkSignups, signups)} of sign-ups`,
      icon: Share2Icon,
      tone: 3,
    },
  ];
}

function KpiTiles({ insights }: { insights: MarketingInsights }) {
  return (
    <dl className="grid grid-cols-2 gap-3 @2xl:grid-cols-3 @5xl:grid-cols-5" aria-live="polite">
      {kpisFor(insights).map((kpi) => (
        <div
          key={kpi.id}
          className="rounded-(--radius) border border-border bg-card p-4 last:col-span-2 @2xl:last:col-span-1"
        >
          <span
            className={`grid size-9 place-items-center rounded-sm ${TONE_ICON[kpi.tone]}`}
            aria-hidden
          >
            <kpi.icon className="size-4" />
          </span>
          <dt className="mt-4 text-xs text-muted-foreground">{kpi.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{kpi.value}</dd>
          <dd className="mt-1 text-xs text-muted-foreground tabular-nums">{kpi.note}</dd>
        </div>
      ))}
    </dl>
  );
}

function OtherAnswers({ answers }: { answers: MarketingInsights["heardFromOther"] }) {
  if (answers.length === 0) return null;
  return (
    <Collapsible className="mt-4 border-t border-border/70 pt-3">
      <CollapsibleTrigger
        render={<Button type="button" variant="ghost" size="sm" className="group/other" />}
      >
        <ChevronDownIcon
          aria-hidden
          className="transition-transform group-data-[panel-open]/other:rotate-180 motion-reduce:transition-none"
        />
        “Other” answers ({answers.length})
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul
          className="mt-2 flex flex-wrap gap-2"
          aria-label="Other answers, lowercased, with counts"
        >
          {answers.map((answer) => (
            <li
              key={answer.text}
              className="rounded-sm border border-border bg-muted/30 px-2 py-1 text-xs"
            >
              {answer.text}
              <span className="ml-1.5 text-muted-foreground tabular-nums">× {answer.count}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Free-text answers, lowercased and de-duplicated. Top 20 by count.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

function InsightsBody({ insights }: { insights: MarketingInsights }) {
  const empty = insights.signups === 0;
  const heardTotal = sum(insights.heardFrom);
  const experienceTotal = sum(insights.experience);
  const channelTotal = sum(insights.referralChannels);
  const countOf = (keys: string[]) =>
    sum(insights.referralChannels.filter((row) => keys.includes(row.key)));
  const emptyOr = (answered: number) => (empty ? NO_SIGNUPS : answered === 0 ? NO_ANSWERS : null);

  return (
    <div className="grid gap-6">
      <KpiTiles insights={insights} />
      <div className="grid gap-4 @4xl:grid-cols-2">
        <InsightsBarChart
          id="insights-heard-from"
          title="How they heard about us"
          description={`Single choice from onboarding · ${heardTotal} answered`}
          rows={insights.heardFrom}
          percentOf={{ total: heardTotal, label: "answers" }}
          countLabel="Answers"
          emptyLabel={emptyOr(heardTotal)}
          tone={1}
        >
          <OtherAnswers answers={insights.heardFromOther} />
        </InsightsBarChart>
        <InsightsBarChart
          id="insights-goals"
          title="Goals"
          description={`${insights.goalRespondents} respondents`}
          rows={insights.goals}
          percentOf={{ total: insights.goalRespondents, label: "respondents" }}
          countLabel="Respondents"
          caption={`Multi-select: percentages are of the ${insights.goalRespondents} people who answered, so they don't add up to 100%.`}
          emptyLabel={emptyOr(insights.goalRespondents)}
          tone={2}
        />
        <InsightsBarChart
          id="insights-experience"
          title="Experience level"
          description={`Single choice · ${experienceTotal} answered`}
          rows={insights.experience}
          percentOf={{ total: experienceTotal, label: "answers" }}
          countLabel="Answers"
          emptyLabel={emptyOr(experienceTotal)}
          tone={3}
        />
        <InsightsBarChart
          id="insights-interests"
          title="Class interest"
          description="Classes people said they're curious about (multi-select)."
          rows={insights.interests.map((row) => ({
            key: row.classId,
            label: row.active ? row.label : `${row.label} (inactive)`,
            count: row.count,
          }))}
          countLabel="People"
          emptyLabel={emptyOr(sum(insights.interests))}
          tone={4}
        />
        <div className="@4xl:col-span-2">
          <InsightsBarChart
            id="insights-sharing"
            title="Sharing"
            description="Sign-ups by the link or QR code they arrived through."
            rows={insights.referralChannels}
            percentOf={{ total: channelTotal, label: "sign-ups" }}
            emptyLabel={empty ? NO_SIGNUPS : null}
            tone={5}
          >
            <InsightsShareSplit
              total={channelTotal}
              segments={[
                {
                  key: "customer",
                  label: "Customer referrals",
                  count: countOf(["CUSTOMER_LINK", "CUSTOMER_QR"]),
                },
                {
                  key: "studio",
                  label: "Studio marketing",
                  count: countOf(["STUDIO_LINK", "STUDIO_QR"]),
                },
                { key: "none", label: "No shared link", count: countOf(["NONE"]) },
              ]}
            />
          </InsightsBarChart>
        </div>
      </div>
    </div>
  );
}

/** Route `loading.tsx` and the Loading story share this skeleton. */
export function MarketingInsightsPageSkeleton() {
  return (
    <AdminPageShell
      title={TITLE}
      eyebrow="Studio"
      description={DESCRIPTION}
      breadcrumb={BREADCRUMB}
    >
      <div className="@container grid gap-6" aria-busy="true">
        <p className="sr-only" role="status">
          Loading marketing insights
        </p>
        <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-3 @5xl:grid-cols-5">
          {["a", "b", "c", "d", "e"].map((key) => (
            <Skeleton key={key} className="h-32 rounded-(--radius)" />
          ))}
        </div>
        <div className="grid gap-4 @4xl:grid-cols-2">
          {["a", "b", "c", "d"].map((key) => (
            <Skeleton key={key} className="h-72 rounded-(--radius)" />
          ))}
        </div>
      </div>
    </AdminPageShell>
  );
}

export function MarketingInsightsPage({ initialRange }: MarketingInsightsPageProps) {
  const { principal } = useMockPrincipal();
  const [range, setRange] = useState(() => initialRange ?? defaultMarketingInsightsRange());
  const query = useQuery({
    ...adminMarketingInsightsQuery(principal, range),
    placeholderData: keepPreviousData,
  });

  if (query.isError) {
    if (isMockAuthorizationError(query.error)) return <AccessDenied kind="denied" />;
    return (
      <AdminPageShell title={TITLE} eyebrow="Studio" breadcrumb={BREADCRUMB}>
        <FeedbackState
          id="calendar.load-failed"
          title="Insights could not load"
          description="Retry the request or pick another date range."
          actionLabel="Retry"
          onAction={() => {
            void query.refetch();
          }}
        />
      </AdminPageShell>
    );
  }

  if (!query.data) return <MarketingInsightsPageSkeleton />;

  return (
    <AdminPageShell
      title={TITLE}
      eyebrow="Studio"
      description={DESCRIPTION}
      breadcrumb={BREADCRUMB}
      actions={
        <DateRangePicker
          aria-label="Sign-up date range"
          placeholder="All sign-up dates"
          className="w-full sm:w-72"
          today={adminTodayYmd()}
          value={isAllDatesRange(range) ? undefined : range}
          onValueChange={(next) => setRange(next ?? { ...MARKETING_INSIGHTS_ALL_DATES })}
        />
      }
    >
      <div className="@container" aria-busy={query.isFetching}>
        <p className="mb-4 text-xs text-muted-foreground">
          Filtered on sign-up date, Asia/Manila. Aggregate counts only — no names or contact
          details.
        </p>
        <InsightsBody insights={query.data} />
      </div>
    </AdminPageShell>
  );
}
