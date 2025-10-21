const DAY = 24 * 60 * 60 * 1000;
const LIMIT = 100;

class UsageStore {
  constructor() {
    this.map = new Map();
  }

  _getKey(userId) {
    return userId || 'anonymous';
  }

  getUsage(userId) {
    const key = this._getKey(userId);
    const record = this.map.get(key);
    if (!record || Date.now() - record.timestamp > DAY) {
      return { count: 0, timestamp: Date.now() };
    }
    return record;
  }

  increment(userId) {
    const key = this._getKey(userId);
    const record = this.getUsage(userId);
    const next = { count: record.count + 1, timestamp: record.timestamp || Date.now() };
    this.map.set(key, next);
    return next;
  }

  canUse(userId) {
    const record = this.getUsage(userId);
    return record.count < LIMIT;
  }
}

export const usageStore = new UsageStore();
export const DAILY_LIMIT = LIMIT;
