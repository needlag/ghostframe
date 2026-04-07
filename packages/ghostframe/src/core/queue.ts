import { createGhostFrameId } from "../utils/ids";

export interface TransitionController {
  id: string;
  isSkipRequested(): boolean;
  isCancelRequested(): boolean;
  requestSkip(reason?: string): void;
  requestCancel(reason?: string): void;
  reason(): string | undefined;
}

class QueueController implements TransitionController {
  id = createGhostFrameId("gft");
  private skipRequested = false;
  private cancelRequested = false;
  private currentReason: string | undefined;

  isSkipRequested(): boolean {
    return this.skipRequested;
  }

  isCancelRequested(): boolean {
    return this.cancelRequested;
  }

  requestSkip(reason?: string): void {
    this.skipRequested = true;
    this.currentReason = reason;
  }

  requestCancel(reason?: string): void {
    this.cancelRequested = true;
    this.currentReason = reason;
  }

  reason(): string | undefined {
    return this.currentReason;
  }
}

type QueueStrategy = "wait" | "skip" | "replace";

interface QueueTask<T> {
  controller: QueueController;
  run: (controller: TransitionController) => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  onSkip: (reason: string) => T;
}

export class TransitionQueue<T> {
  private pending: QueueTask<T>[] = [];
  private current: QueueTask<T> | null = null;

  enqueue(
    run: (controller: TransitionController) => Promise<T>,
    options: {
      strategy: QueueStrategy;
      onSkip: (reason: string) => T;
    }
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task: QueueTask<T> = {
        controller: new QueueController(),
        run,
        resolve,
        reject,
        onSkip: options.onSkip
      };

      if (!this.current) {
        this.start(task);
        return;
      }

      if (options.strategy === "skip") {
        resolve(options.onSkip("queue-busy"));
        return;
      }

      if (options.strategy === "replace") {
        this.flushPending("replaced-by-newer-transition");
      }

      this.pending.push(task);
    });
  }

  cancelPending(reason = "cancelled"): void {
    this.flushPending(reason);
    this.current?.controller.requestCancel(reason);
  }

  skipCurrent(reason = "skipped"): void {
    this.current?.controller.requestSkip(reason);
  }

  isRunning(): boolean {
    return this.current !== null;
  }

  private flushPending(reason: string): void {
    while (this.pending.length > 0) {
      const task = this.pending.shift();
      task?.resolve(task.onSkip(reason));
    }
  }

  private async start(task: QueueTask<T>): Promise<void> {
    this.current = task;

    try {
      const value = await task.run(task.controller);
      task.resolve(value);
    } catch (error) {
      task.reject(error);
    } finally {
      this.current = null;
      const next = this.pending.shift();
      if (next) {
        void this.start(next);
      }
    }
  }
}

