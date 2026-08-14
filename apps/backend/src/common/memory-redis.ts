/**
 * Minimal in-memory stand-in for the Redis commands this backend uses
 * (matchmaking ZSET + leaderboard ZSET). Used when REDIS_URL is unreachable
 * so a single-process local Practice smoke test can still run without Docker.
 */
export class MemoryRedis {
  private readonly zsets = new Map<string, Map<string, number>>();

  on(_event: string, _listener: (...args: unknown[]) => void): this {
    return this;
  }

  disconnect(): void {
    this.zsets.clear();
  }

  duplicate(): MemoryRedis {
    return this;
  }

  private zset(key: string): Map<string, number> {
    let set = this.zsets.get(key);
    if (!set) {
      set = new Map();
      this.zsets.set(key, set);
    }
    return set;
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    const set = this.zset(key);
    const existed = set.has(member);
    set.set(member, score);
    return existed ? 0 : 1;
  }

  async zrem(key: string, member: string): Promise<number> {
    return this.zset(key).delete(member) ? 1 : 0;
  }

  async zrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    ...rest: Array<string | number>
  ): Promise<string[]> {
    const lo = Number(min === "-inf" ? -Infinity : min);
    const hi = Number(max === "+inf" ? Infinity : max);
    let offset = 0;
    let count = Infinity;
    const limitIdx = rest.findIndex((v) => v === "LIMIT");
    if (limitIdx >= 0) {
      offset = Number(rest[limitIdx + 1] ?? 0);
      count = Number(rest[limitIdx + 2] ?? Infinity);
    }

    const ranked = [...this.zset(key).entries()]
      .filter(([, score]) => score >= lo && score <= hi)
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));

    return ranked.slice(offset, offset + count).map(([member]) => member);
  }

  async zrevrange(key: string, start: number, stop: number, withScores?: string): Promise<string[]> {
    const ranked = [...this.zset(key).entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const end = stop < 0 ? ranked.length : stop + 1;
    const slice = ranked.slice(start, end);
    if (withScores === "WITHSCORES") {
      const out: string[] = [];
      for (const [member, score] of slice) {
        out.push(member, String(score));
      }
      return out;
    }
    return slice.map(([member]) => member);
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    const ranked = [...this.zset(key).entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const index = ranked.findIndex(([id]) => id === member);
    return index >= 0 ? index : null;
  }

  async zscore(key: string, member: string): Promise<string | null> {
    const score = this.zset(key).get(member);
    return score === undefined ? null : String(score);
  }
}
