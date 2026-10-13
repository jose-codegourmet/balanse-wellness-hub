import { defaultMockRuntime, type MockRuntimeOptions } from "./adapter";

let runtime: MockRuntimeOptions = { ...defaultMockRuntime };

export function getMockRuntime(): MockRuntimeOptions {
  return { ...runtime };
}

export function setMockRuntime(next: Partial<MockRuntimeOptions>): MockRuntimeOptions {
  runtime = { ...runtime, ...next };
  return getMockRuntime();
}

export function resetMockRuntime(): void {
  runtime = { ...defaultMockRuntime };
}

export async function applyMockEffects<T>(
  work: () => T | Promise<T>,
  options?: { publicSessions?: boolean },
): Promise<T> {
  const { latencyMs, failNext, failPublicSessions } = runtime;
  if (latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
  }
  if (failNext) {
    runtime = { ...runtime, failNext: false };
    throw new Error("Mocked request failed. Toggle simulated failure off to continue.");
  }
  if (options?.publicSessions && failPublicSessions) {
    throw new Error("Mocked request failed. Toggle simulated failure off to continue.");
  }
  return work();
}
