import "../src/app/globals.css";
import { BALANSE_BREAKPOINT_LABELS, BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  DEFAULT_MOCK_PRINCIPAL,
  type MockRole,
  type MockRuntimeOptions,
  normalizeMockPrincipal,
  resetMockRuntime,
  setMockRuntime,
} from "@balanse/mock";
import { adminAuthScope } from "../src/lib/query/auth-scope";
import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { type ReactNode, useEffect, useLayoutEffect } from "react";
import { Providers } from "../src/modules/providers/Providers";

const balanseViewports = {
  mobile: {
    name: BALANSE_BREAKPOINT_LABELS.mobile,
    styles: { width: `${BALANSE_BREAKPOINTS.mobile}px`, height: "800px" },
  },
  tablet: {
    name: BALANSE_BREAKPOINT_LABELS.tablet,
    styles: { width: `${BALANSE_BREAKPOINTS.tablet}px`, height: "1024px" },
  },
  desktop: {
    name: BALANSE_BREAKPOINT_LABELS.desktop,
    styles: { width: `${BALANSE_BREAKPOINTS.desktop}px`, height: "900px" },
  },
};

function ThemeClass({ theme, children }: { theme: "light" | "dark"; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [theme]);
  return children;
}

function MockRuntimeBridge({
  options,
  children,
}: {
  options?: Partial<MockRuntimeOptions>;
  children: ReactNode;
}) {
  // Module-global mutable state — reset on setup and teardown so latencyMs /
  // failNext / emptyAdminQueues cannot bleed into the next story.
  useLayoutEffect(() => {
    resetMockRuntime();
    if (options) setMockRuntime(options);
    return () => {
      resetMockRuntime();
    };
  }, [options]);
  return children;
}

const withAdminProviders: Decorator = (Story, context) => {
  const theme = (context.globals.theme as "light" | "dark") ?? "light";
  const role = (context.globals.principal as MockRole) ?? "admin";
  const initialPrincipal = normalizeMockPrincipal({ ...DEFAULT_MOCK_PRINCIPAL, role });
  const mockRuntime = context.parameters.mockRuntime as Partial<MockRuntimeOptions> | undefined;
  // Apply knobs during render, before useQuery fires in the story.
  resetMockRuntime();
  if (mockRuntime) setMockRuntime(mockRuntime);

  return (
    <ThemeClass theme={theme}>
      <div
        className={`min-h-screen bg-background text-foreground${theme === "dark" ? " dark" : ""}`}
      >
        <Providers
          // Fresh QueryClient per principal / mockRuntime so caches cannot leak.
          key={`${adminAuthScope(initialPrincipal)}:${JSON.stringify(mockRuntime ?? null)}`}
          initialPrincipal={initialPrincipal}
        >
          <MockRuntimeBridge options={mockRuntime}>
            <Story />
          </MockRuntimeBridge>
        </Providers>
      </div>
    </ThemeClass>
  );
};

const SHARED_UI_STORY_PREFIXES = ["Components/", "Shared/", "Foundation/", "Motion/"] as const;

function isSharedUiCatalog(title: string) {
  return SHARED_UI_STORY_PREFIXES.some((prefix) => title.startsWith(prefix));
}

const preview: Preview = {
  // Inherited @balanse/ui stories are browsable in this app's Storybook but
  // are not this ticket's a11y surface (Batch B #199–#203). CI enforcement
  // of a real axe gate is #240.
  beforeEach(context) {
    if (isSharedUiCatalog(context.title)) {
      context.parameters.a11y = {
        ...context.parameters.a11y,
        test: "todo",
      };
    }
  },
  decorators: [withAdminProviders],
  globalTypes: {
    theme: {
      description: "Color theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    principal: {
      description:
        "Mock shell role. Admin stories bind staff-rex; use the harness for Front Desk / Coach / custom / disabled.",
      defaultValue: "admin",
      toolbar: {
        title: "Principal",
        icon: "user",
        items: [
          { value: "admin", title: "Admin" },
          { value: "customer", title: "Customer" },
          { value: "guest", title: "Guest" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    a11y: {
      test: "error",
    },
    // `Providers` and several admin screens call `useRouter` from
    // `next/navigation`, which throws unless the App Router mock is on.
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      options: balanseViewports,
      viewports: balanseViewports,
    },
  },
};

export default preview;
