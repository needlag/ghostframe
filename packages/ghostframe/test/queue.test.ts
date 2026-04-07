import { describe, expect, it } from "vitest";
import { TransitionQueue } from "../src/core/queue";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("TransitionQueue", () => {
  it("runs queued tasks in order", async () => {
    const queue = new TransitionQueue<string>();
    const order: string[] = [];

    const first = queue.enqueue(
      async () => {
        order.push("first:start");
        await wait(10);
        order.push("first:end");
        return "first";
      },
      { strategy: "wait", onSkip: () => "skipped" }
    );
    const second = queue.enqueue(
      async () => {
        order.push("second:start");
        return "second";
      },
      { strategy: "wait", onSkip: () => "skipped" }
    );

    await expect(first).resolves.toBe("first");
    await expect(second).resolves.toBe("second");
    expect(order).toEqual(["first:start", "first:end", "second:start"]);
  });

  it("skips immediately when configured", async () => {
    const queue = new TransitionQueue<string>();
    void queue.enqueue(async () => wait(20).then(() => "running"), {
      strategy: "wait",
      onSkip: () => "skipped"
    });

    await expect(
      queue.enqueue(async () => "next", {
        strategy: "skip",
        onSkip: () => "queue-busy"
      })
    ).resolves.toBe("queue-busy");
  });

  it("replaces pending work with the latest request", async () => {
    const queue = new TransitionQueue<string>();

    void queue.enqueue(async () => wait(20).then(() => "first"), {
      strategy: "wait",
      onSkip: () => "skipped"
    });

    const stale = queue.enqueue(async () => "stale", {
      strategy: "wait",
      onSkip: () => "replaced"
    });
    const latest = queue.enqueue(async () => "latest", {
      strategy: "replace",
      onSkip: () => "replaced"
    });

    await expect(stale).resolves.toBe("replaced");
    await expect(latest).resolves.toBe("latest");
  });

  it("lets the current task observe skip requests", async () => {
    const queue = new TransitionQueue<string>();

    const running = queue.enqueue(
      async (controller) => {
        await wait(5);
        return controller.isSkipRequested() ? "skipped" : "completed";
      },
      { strategy: "wait", onSkip: () => "skipped" }
    );

    queue.skipCurrent("manual-skip");
    await expect(running).resolves.toBe("skipped");
  });
});

