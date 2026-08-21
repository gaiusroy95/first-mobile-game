/**
 * Counts down to a fixed deadline rather than decrementing a counter each
 * tick, so the remaining time is always `deadline - now`. That's the same
 * math a server-synced deadline needs: swapping this to multiplayer later
 * means the deadline comes from a server message (e.g. "prep phase ends at
 * timestamp X", sent to both clients at once) instead of
 * `Date.now() + durationSeconds * 1000` - nothing about the countdown math
 * or this class's public API changes.
 */
export class PrepTimer {
  private deadline = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  start(
    durationSeconds: number,
    onTick: (secondsRemaining: number) => void,
    onExpire: () => void
  ): void {
    this.stop();
    this.deadline = Date.now() + durationSeconds * 1000;

    const tick = () => {
      const secondsRemaining = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
      onTick(secondsRemaining);
      if (secondsRemaining <= 0) {
        this.stop();
        onExpire();
      }
    };

    tick();
    this.intervalId = setInterval(tick, 250);
  }

  stop(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
