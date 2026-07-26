import express from "express";
import mysql from "mysql2/promise";
import path  from "node:path";
import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set("view engine", "ejs");
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));


//for Express to get values using POST method
app.use(express.urlencoded({ extended: true }));

function logDatabaseError(err) {
  console.error("Database error:", err.message);

  if (err instanceof AggregateError && Array.isArray(err.errors)) {
    err.errors.forEach((innerErr, index) => {
      console.error(`Inner error ${index + 1}:`, innerErr.message);
    });
  }
}

//setting up database connection pool
const conn = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
});

//routes
app.get("/", async (req, res) => {
  let qry = `select authorid, firstName, lastName
               from q_authors
               order by lastname`;
  const [rows] = await conn.query(qry);

  let categoryQry = `select distinct(category) from q_quotes order by category`;
  const [categoryRows] = await conn.query(categoryQry);

  let ds = { authors: rows, categories: categoryRows };
  console.log(ds);

  res.render("index", ds);
});

app.get("/searchByKeyword", async (req, res) => {
  try {
    let userKeyword = req.query.keyword || "";
    let qry = `select authorid, firstName, lastName, quote 
                   from q_quotes NATURAL JOIN q_authors
                   where  quote LIKE ?`;
    let sqlParams = [`%${userKeyword}%`];
    const [rows] = await conn.query(qry, sqlParams);

    console.log("User keyword:", userKeyword);
    res.render("results", { quotes: rows });
  } catch (err) {
    logDatabaseError(err);
    res
      .status(500)
      .send(
        "Database error in /searchByKeyword. Check server logs for details.",
      );
  }
});

app.get("/searchByAuthor", async (req, res) => {
  try {
    let authorId = req.query.authorId || "";
    let qry = `select authorid, firstName, lastName, quote 
                   from q_quotes NATURAL JOIN q_authors
                   where  authorid = ?`;
    let sqlParams = [authorId];
    const [rows] = await conn.query(qry, sqlParams);

    console.log("User authorId:", authorId);
    res.render("results", { quotes: rows });
  } catch (err) {
    logDatabaseError(err);
    res
      .status(500)
      .send(
        "Database error in /searchByAuthor. Check server logs for details.",
      );
  }
});

app.get("/searchByCategory", async (req, res) => {
  try {
    let category = req.query.category || "";
    let qry = `select q.quote, a.firstName, a.lastName, a.authorid
                from q_quotes q inner join q_authors a
                on q.authorId = a.authorId
                where category = ?`;

    const [rows] = await conn.query(qry, [category]);

    console.log(rows);
    res.render("results", { quotes: rows });
  } catch (err) {
    logDatabaseError(err);
    res
      .status(500)
      .send(
        "Database error in /searchByCategory. Check server logs for details.",
      );
  }
});

app.post("/searchByLikes", async (req, res) => {
  try {
    // console.log("body", req.body)
    // console.log("query", req.query)
    // console.log("parms", req.params)
    let min = Number(req.body.minLike) || 0;
    let max = Number(req.body.maxLike) || 0;
    let qry = `select q.quote, a.firstName, a.lastName, a.authorid
                from q_quotes q inner join q_authors a
                on q.authorId = a.authorId
                where likes between ? and ?`;

    let sqlParams = [min, max];
    const [rows] = await conn.query(qry, sqlParams);

    console.log(rows);
    res.render("results", { quotes: rows });
  } catch (err) {
    logDatabaseError(err);
    res
      .status(500)
      .send(
        "Database error in /searchByLikes. Check server logs for details.",
      );
  }
});

app.get("/api/category", async (req, res) => {
  try {
    let qry = `select distinct(category) from q_quotes order by category`;
    const [rows] = await conn.query(qry);

    // console.log(rows);

    res.send(rows);
  } catch (err) {
    logDatabaseError(err);
    res
      .status(500)
      .send(
        "Database error in /category. Check server logs for details.",
      );
  }
});

app.get("/api/author/:id", async (req, res) => {
  let authorId = req.params.id;
  let qry = `select *
                from q_authors
                where authorId = ?`;
  const [rows] = await conn.query(qry, [authorId]);
  res.send(rows);
});

app.get("/dbTest", async (req, res) => {
  try {
    const [rows] = await conn.query("select * from q_quotes limit 5;");
    res.send(rows);
  } catch (err) {
    logDatabaseError(err);
    res.status(500).send("Database error");
  }
}); //dbTest

app.listen(3000, () => {
  console.log("Express server running. http://localhost:3000");
});
