# CST 366 Lab 5 Quote Finder

## Setup

### .env file
This app is using a mysql db.

``` javascript
MYSQL_HOST="server URI"
MYSQL_USER="db user name"
MYSQL_PASSWORD="db password"
MYSQL_DATABASE="database name"
```

### Run App
Review package.json for run options.

#### Start app locally

``` bash
    npm run dev
```

## Lession learned

### Routes

To use routes I had to create a db.js file that contain the db connection. The issuse that had me stuck for a while was forgetting to add the at the export.

``` javascript 
import mysql from "mysql2/promise";

//setting up database connection pool
const conn = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
});

export default conn;
```

After creating the db.js file I had to remove all the references from the index.mjs of the db connection.

To setup the route, you need to import the route into the index.mjs

``` javascript
import quotesRouter from './routes/quotes.mjs'; 
app.use('/quotes', quotesRouter);

app.get('/', (req, res) => res.redirect('/quotes'));
```
