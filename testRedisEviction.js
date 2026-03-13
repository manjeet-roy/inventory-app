const redis = require("redis");

async function testEviction() {

  const client = redis.createClient({
    socket: {
      host: "localhost",
      port: 6379
    }
  });

  await client.connect();

  console.log("Connected to Redis");

  const largeValue = "x".repeat(10000); // 10KB

  for (let i = 0; i < 5000; i++) {

    const key = `key:${i}`;

    await client.set(key, largeValue);

    if (i % 100 === 0) {
      const info = await client.info("memory");
      console.log(`Inserted ${i} keys`);
    }

  }

  await client.quit();
}

testEviction();