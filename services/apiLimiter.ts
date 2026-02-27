type LimitState = {
  timestamps: number[];
  total: number;
};

type LimitResult = {
  allowed: boolean;
  reason?: 'rate' | 'total';
  retryAfterMs?: number;
  remaining?: number;
};

type LimiterOptions = {
  maxPerMinute?: number;
  maxTotal?: number;
  windowMs?: number;
};

const DEFAULT_OPTIONS: Required<LimiterOptions> = {
  maxPerMinute: 6,
  maxTotal: 20,
  windowMs: 60 * 1000,
};

const inMemoryState: Record<string, LimitState> = {};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const loadState = (key: string): LimitState => {
  const storage = getStorage();
  if (!storage) return inMemoryState[key] ?? { timestamps: [], total: 0 };
  const raw = storage.getItem(key);
  if (!raw) return { timestamps: [], total: 0 };
  try {
    const parsed = JSON.parse(raw) as LimitState;
    return {
      timestamps: Array.isArray(parsed.timestamps) ? parsed.timestamps : [],
      total: typeof parsed.total === 'number' ? parsed.total : 0,
    };
  } catch {
    return { timestamps: [], total: 0 };
  }
};

const saveState = (key: string, state: LimitState) => {
  const storage = getStorage();
  if (!storage) {
    inMemoryState[key] = state;
    return;
  }
  storage.setItem(key, JSON.stringify(state));
};

const prune = (state: LimitState, windowMs: number, now: number) => {
  const cutoff = now - windowMs;
  state.timestamps = state.timestamps.filter(ts => ts >= cutoff);
};

export const createLimiter = (key: string, options?: LimiterOptions) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const peek = (): LimitResult => {
    const now = Date.now();
    const state = loadState(key);
    prune(state, opts.windowMs, now);

    if (state.total >= opts.maxTotal) {
      return { allowed: false, reason: 'total', remaining: 0 };
    }

    if (state.timestamps.length >= opts.maxPerMinute) {
      const oldest = state.timestamps[0] ?? now;
      return {
        allowed: false,
        reason: 'rate',
        retryAfterMs: Math.max(0, opts.windowMs - (now - oldest)),
        remaining: Math.max(0, opts.maxTotal - state.total),
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, opts.maxTotal - state.total),
    };
  };

  const record = (): LimitResult => {
    const now = Date.now();
    const state = loadState(key);
    prune(state, opts.windowMs, now);
    state.timestamps.push(now);
    state.total += 1;
    saveState(key, state);
    return peek();
  };

  const checkAndRecord = (): LimitResult => {
    const result = peek();
    if (!result.allowed) return result;
    return record();
  };

  return { peek, record, checkAndRecord, options: opts };
};

export type { LimitResult };

