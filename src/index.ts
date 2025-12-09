import { tockenBucketRateLimiter } from "./services/tokenBucket";
import { createRateLimiterMiddleware } from "./middleware/rateLimitMiddleware";
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";

const worker = new Worker(path.resolve(__dirname, "worker/statsWorker.js"));

function logToWorker(key: string, allowed: boolean) {
  worker.postMessage({ type: "log", key, allowed });
}

const strategy = new tockenBucketRateLimiter(20, 10);
const rateLimiterMiddleware = createRateLimiterMiddleware(
  strategy,
  logToWorker
);

const app = express();

app.use(express.json());

app.post("/sendApi", rateLimiterMiddleware, (req, res) => {
  res.json({ ok: true });
});

function getStatsFromWorker(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const onMessage = (msg: unknown) => {
      worker.off("error", onError);
      resolve(msg);
    };

    const onError = (err: Error) => {
      worker.off("message", onMessage);
      reject(err);
    };

    worker.once("message", onMessage);
    worker.once("error", onError);

    worker.postMessage({ type: "getStats" });
  });
}

app.get("/stats", async (req, res) => {
  try {
    const stats = await getStatsFromWorker();
    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
