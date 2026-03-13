# Redis Caching Demo with Node.js, PostgreSQL, and Docker

This repository demonstrates how to use **Redis caching with a Node.js application** and how to handle **Redis cache stampede scenarios** using different caching strategies.

The project uses:

* **Node.js + Express** for the API server
* **PostgreSQL** for persistent data storage
* **Redis** for caching
* **Docker** to run Redis and PostgreSQL locally

---

# Prerequisites

Before running the project, install the following tools:

* **Docker Desktop**
* **DBeaver** (or any database client for table visualization)
* **VS Code** (or any preferred code editor)
* **Node.js**
* **Postman** (or any API testing tool)

---

# Setup Instructions

Follow the steps below to run the project locally.

---

## 1. Pull PostgreSQL Docker Image

```bash
docker pull postgres
```

---

## 2. Run PostgreSQL Container

```bash
docker run -d \
  --name postgres-local \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=testdb \
  -p 5432:5432 \
  postgres
```

**Notes**

* You can change the **username, password, and database name** as per your preference.
* In this project, the database used is `testdb`.
* An **inventory table** is created inside this database.

Once the container is running, connect to the database using **DBeaver**.

### PostgreSQL Connection Details

| Field    | Value     |
| -------- | --------- |
| Host     | localhost |
| Port     | 5432      |
| Database | testdb    |
| Username | postgres  |
| Password | pass      |

---

## 3. Pull Redis Docker Image

```bash
docker pull redis
```

---

## 4. Run Redis Container

```bash
docker run -d \
  --name redis-cache \
  -p 6379:6379 \
  redis
```

Redis will now run on:

```
localhost:6379
```

---

## 5. Clone the Repository

```bash
git clone <repo-url>
cd <repo-folder>
```

---

## 6. Install Dependencies

Run the following command to install all project dependencies:

```bash
npm install
```

This will install the packages listed in `package.json` and create the `node_modules` folder.

---

## 7. Run the Application

```bash
node index.js
```

The application will start on:

```
http://localhost:3000
```

---

# Testing the API

Use **Postman** (or any API testing tool) and send the following request:

```
GET http://localhost:3000/getInventory?id=12
```

The API will fetch inventory data and demonstrate **Redis caching behavior**.

---

# Topics Covered in This Repository

This repository explores several Redis caching concepts, including:

## Redis Caching

Basic implementation of Redis caching with a Node.js application.

## Types of Redis Caching Strategies

### Cache Aside Pattern

The application checks Redis first and queries the database if the cache is empty.

### Write Through Cache

Data is written to both the database and cache simultaneously.

### Write Back Cache

Data is written to cache first and persisted to the database asynchronously.

---

## Redis Cache Stampede

A **cache stampede** occurs when multiple requests hit the database simultaneously after the cache expires.

### Techniques to Handle Cache Stampede

The project demonstrates different approaches such as:

* Redis caching
* Distributed locking
* Cache rebuilding logic
* Retry mechanisms

---

# Purpose of This Repository

This project was created to **experiment with Redis caching techniques** and understand how caching can be used to:

* Reduce database load
* Improve API performance
* Handle high traffic scenarios
* Prevent cache stampede situations

---

# Project Structure

```
project-root
│
├── index.js
├── package.json
├── package-lock.json
├── node_modules
└── README.md
```

All Redis caching experiments and API endpoints are implemented inside **index.js**.

---

# Example Workflow

```
Client Request
      ↓
Node.js API
      ↓
Redis Cache
      ↓
(Cache Miss)
      ↓
PostgreSQL
      ↓
Update Redis Cache
      ↓
Return Response
```

---

# Final Notes

This repository is meant for **learning and experimenting with Redis caching concepts** in a simple Node.js environment.

Feel free to explore the different endpoints inside `index.js` to understand how each caching technique works.
