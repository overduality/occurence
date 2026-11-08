interface SchedulerWithYield {
  yield?: () => Promise<void>;
}

/**
 * Yields to the main thread using scheduler.yield() so pending user input
 * paints within <16ms, falling back to setTimeout when unavailable.
 */
export async function yieldToMain(): Promise<void> {
  if (typeof window !== "undefined") {
    const win = window as Window & { scheduler?: SchedulerWithYield };
    if (win.scheduler && typeof win.scheduler.yield === "function") {
      await win.scheduler.yield();
      return;
    }
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}
