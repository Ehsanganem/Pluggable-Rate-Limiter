import { KeyStats, Stats, LogMessage, GetStatsMessage } from "../types";
import { parentPort } from "node:worker_threads";

if (!parentPort) {
  throw new Error("This file must be run as a worker thread");
}

type IncomingMessage = LogMessage | GetStatsMessage;

const statsState: {
  totalAllowed: number;
  totalBlocked: number;
  perKey: Map<string, KeyStats>;
} = {
  totalAllowed: 0,
  totalBlocked: 0,
  perKey: new Map(),
};

function logRequest(key: string, allowed: boolean) {
  const current: KeyStats = statsState.perKey.get(key) ?? {
    allowed: 0,
    blocked: 0,
  };

  if (allowed) {
    statsState.totalAllowed += 1;
    current.allowed += 1;
  } else {
    statsState.totalBlocked += 1;
    current.blocked += 1;
  }

  statsState.perKey.set(key, current);
}

function serializeStats(): Stats {
  const perKey: Record<string, KeyStats> = {};
  for (const [key, value] of statsState.perKey.entries()) {
    perKey[key] = value;
  }
  return {
    totalAllowed: statsState.totalAllowed,
    totalBlocked: statsState.totalBlocked,
    perKey,
  };
}

parentPort.on("message", (msg: IncomingMessage) => {
  if (msg.type === "log") {
    logRequest(msg.key, msg.allowed);
  } else if (msg.type === "getStats") {
    const snapshot = serializeStats();
    parentPort!.postMessage(snapshot);
  }
});
