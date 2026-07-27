import express from "express";
import path  from "node:path";
import { fileURLToPath } from 'url';
import conn from "./db.mjs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set("view engine", "ejs");
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

//routes
// trying to learn how to use routes.
import quotesRouter from './routes/quotes.mjs'; 
app.use('/quotes', quotesRouter);

app.get('/', (req, res) => res.redirect('/quotes'));

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
