import "../src/app/globals.css";
import { BALANSE_BREAKPOINT_LABELS, BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  DEFAULT_MOCK_PRINCIPAL,
  type MockRole,
  type MockRuntimeOptions,
  resetMockRuntime,
  setMockRuntime,
} from "@balanse/mock";
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
  const initialPrincipal = { ...DEFAULT_MOCK_PRINCIPAL, role };

  return (
    <ThemeClass theme={theme}>
      <div
        className={`min-h-screen bg-background text-foreground${theme === "dark" ? " dark" : ""}`}
      >
        <Providers initialPrincipal={initialPrincipal}>
          <MockRuntimeBridge
            options={context.parameters.mockRuntime as Partial<MockRuntimeOptions> | undefined}
          >
            <Story />
          </MockRuntimeBridge>
        </Providers>
      </div>
    </ThemeClass>
  );
};

const preview: Preview = {
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
        "Mock session role. MockPrincipal has no separate staff role — use admin vs customer/guest.",
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
