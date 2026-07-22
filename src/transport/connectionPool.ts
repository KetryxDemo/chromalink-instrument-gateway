/**
 * Connection pool.
 *
 * One live connection per instrument. The pool enforces that invariant so two concurrent
 * ingest paths cannot interleave writes from the same instrument and produce runs that
 * appear out of acquisition order in the portal.
 */

export interface PooledConnection {
  instrumentId: string;
  openedAt: string;
  inUse: boolean;
}

export class ConnectionLimitError extends Error {}

export class ConnectionPool {
  private readonly connections = new Map<string, PooledConnection>();

  constructor(private readonly maxConnections: number = 64) {}

  acquire(instrumentId: string): PooledConnection {
    const existing = this.connections.get(instrumentId);
    if (existing) {
      if (existing.inUse) {
        throw new ConnectionLimitError(
          `A connection for ${instrumentId} is already in use`,
        );
      }
      existing.inUse = true;
      return existing;
    }
    if (this.connections.size >= this.maxConnections) {
      throw new ConnectionLimitError('Connection pool exhausted');
    }
    const created: PooledConnection = {
      instrumentId,
      openedAt: new Date().toISOString(),
      inUse: true,
    };
    this.connections.set(instrumentId, created);
    return created;
  }

  release(instrumentId: string): void {
    const conn = this.connections.get(instrumentId);
    if (conn) conn.inUse = false;
  }

  close(instrumentId: string): void {
    this.connections.delete(instrumentId);
  }

  get openCount(): number {
    return this.connections.size;
  }
}
