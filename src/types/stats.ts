type KeyStats = {
  allowed: number;
  blocked: number;
};

type Stats = {
  totalAllowed: number;
  totalBlocked: number;
  perKey: Record<string, KeyStats>;
};

type GetStatsMessage = {
  type: "getStats";
};

export { KeyStats, Stats, GetStatsMessage };
