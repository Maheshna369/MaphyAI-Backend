import { createClient } from "redis";

const redisUri = process.env.REDIS_URI;

export const redisClient = createClient({
  url: redisUri,
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

redisClient.on("connect", () =>
  console.log("Connected to Redis successfully!"),
);

// connect once
redisClient.connect();
