require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const redis = require("redis");

const app = express();

// PostgreSQL Pool
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

// Redis Client
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.connect()
  .then(() => console.log("Connected to Redis"))
  .catch(console.error);

// Endpoint
app.get("/getInventory", async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  const cacheKey = `inventory:${id}`;
  const lockKey = `lock:${id}`;

  try {
    // 1️⃣ Check Redis first
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Cache HIT");
      return res.json({
        source: "redis",
        data: JSON.parse(cachedData),
      });
    }

    console.log("Cache MISS → Querying DB");

    // 2️⃣ Query Postgres
    const result = await pool.query(
      "SELECT * FROM inventory WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    const data = result.rows[0];

    // 3️⃣ Store in Redis (TTL 60 seconds)
    await redisClient.setEx(cacheKey, 60, JSON.stringify(data));

    res.json({
      source: "postgres",
      data: data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getInventoryWarm", async (req, res) => {

  const id = req.query.id;
  const cacheKey = `inventory:${id}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("Cache HIT");
      const ttl = await redisClient.ttl(cacheKey);
      // If cache about to expire, refresh in background
      console.log('ttl is ::', ttl)
      if (ttl < 20) {
        console.log("Triggering background refresh");
        refreshCache(id).catch(console.error);
      }

      return res.json({
        source: "redis",
        data: JSON.parse(cached)
      });

    }
    console.log("Cache MISS → Query DB");
    const data = await fetchFromDB(id);
    await redisClient.setEx(
      cacheKey,
      60,
      JSON.stringify(data)
    );
    res.json({
      source: "postgres",
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Internal server error"
    });

  }

});

app.get("/getInventoryWithLock", async (req, res) => {
  const id = req.query.id;
  const cacheKey = `inventory:${id}`;
  const lockKey = `lock:${cacheKey}`;

  try {

    // 1️⃣ Check Redis cache
    const cached = await redisClient.get(cacheKey);

    if (cached) {

      console.log("Cache HIT");

      return res.json({
        source: "redis",
        data: JSON.parse(cached)
      });

    }

    console.log("Cache MISS");

    // 2️⃣ Try acquiring lock
    const lock = await redisClient.set(lockKey, "locked", {
      NX: true,
      EX: 5
    });

    if (lock) {

      console.log("Lock acquired");

      try {

        // Fetch from DB
        const result = await pool.query(
          "SELECT * FROM inventory WHERE id=$1",
          [id]
        );

        const data = result.rows[0];

        // Random TTL to avoid simultaneous expiry
        const ttl = 60 + Math.floor(Math.random() * 30);

        await redisClient.setEx(
          cacheKey,
          ttl,
          JSON.stringify(data)
        );

        return res.json({
          source: "postgres",
          data: data
        });

      } finally {

        // Release lock
        await redisClient.del(lockKey);
        console.log("Lock deleted");
      }

    } else {

      console.log("Waiting for cache rebuild");

      // Wait a little before retrying
      await new Promise(resolve => setTimeout(resolve, 100));

      const cachedRetry = await redisClient.get(cacheKey);

      if (cachedRetry) {

        return res.json({
          source: "redis-after-wait",
          data: JSON.parse(cachedRetry)
        });

      }

      // fallback if cache still not ready
      return res.status(503).json({
        message: "Cache rebuilding, try again"
      });

    }

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Internal server error"
    });

  }
});

async function refreshCache(id) {
  const cacheKey = `inventory:${id}`;
  console.log("Refreshing cache for id:", id);
  const data = await fetchFromDB(id);
  const ttl = 60 + Math.floor(Math.random() * 20);
  await redisClient.setEx(
    cacheKey,
    ttl,
    JSON.stringify(data)
  );
  console.log("Cache refreshed");
}

async function fetchFromDB(id) {
  const result = await pool.query(
    "SELECT * FROM inventory WHERE id=$1",
    [id]
  );
  return result.rows[0];
}

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});