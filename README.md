To run this repo in local, try to follow below steps -

Install docker desktop.
Install DBeaver (any other tool would also work). It would be just used for DB table visualization.
Install VSCode (or any other code editor)
Now fetch image for postgres -> docker pull postgres
Run PostgreSQL Container  ->
  docker run -d \
  --name postgres-local \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=testdb \
  -p 5432:5432 \
  postgres

Note : You just set the user, pw and db name as per your choice but I added inventorydb as my DB and inventory table inside this DB.
Once container starts, you can use those creds and connect to postgresql local server using DBeaver.
Now fetch image for redis -> docker pull redis
Run Redis conatainer ->
  docker run -d \
  --name redis-cache \
  -p 6379:6379 \
  redis

Install Node.
Clone this repo and run npm i. This will install all the dependencies from package.json and you can see them in the node_modules folder in your project.
To run the application -> node index.js
This will start localhost server at port 3000
Now you can install postman (or any other API testing application) and create a request like below and trigger -
http://localhost:3000/getInventory?id=12



In this repo, I just tried to play with redis cache. In the same index.js file I put different endpoints each serving or explaining different logic.
We can go through - 
Redis cache
Types of redis cache - cache aside, write back cache, write through cache
What is redis stampede 
How to handle redis stampede situation ans what are the ways to handle them.

These topics helped me to understand redis more. 

