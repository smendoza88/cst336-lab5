import express from "express";
const router = express.Router();

import conn from "../db.mjs"

router.get('/search', async (req, res, next) => {
  try {
    const { keyword, author, category, minLikes, maxLikes } = req.query;

    // Build WHERE clause dynamically — only add what was provided via the filters
    const conditions = [];
    const params = [];

    // The quote text
    if (keyword) {
      conditions.push('q.quote LIKE ?');
      params.push(`%${keyword}%`);
    }

    // AuthorID
    if (author) {
      conditions.push('q.authorId = ?');
      params.push(author);
    }

    // Quote category
    if (category) {
      conditions.push('q.category = ?');
      params.push(category);
    }

    // Quote min number of likes
    if (minLikes) {
      conditions.push('q.Likes >= ?');
      params.push(minLikes);
    }

    // Quote max number of likes. 
    if (maxLikes) {
      conditions.push('q.Likes <= ?');
      params.push(maxLikes);
    }

    let sql = `
        select q.quote, concat(a.firstName, ' ', a.lastName) as authorName
               , a.authorid, q.likes, category, likes
        from q_quotes q inner join q_authors a
         on q.authorId = a.authorId
    `;

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY q.likes DESC';

    const [quotes] = await conn.query(sql, params);

    // Reload dropdown lists so selections persist after searching
    const [authors]    = await conn.query(`select authorid, concat(firstname, ' ', lastname) as authorName from q_authors order by lastname`);
    const [categories] = await conn.query('select distinct(category) from q_quotes order by category');

    res.render('index', {
      quotes,
      authors,
      categories,
      filters: req.query   // used to re-populate the form
    });
  } catch (err) {
    next(err);
  }
});


router.get('/', async (req, res, next) => {
  try {
    const [authors] = await conn.query(`select authorid, concat(firstname, ' ', lastname) as authorName from q_authors order by lastname`);
    const [categories] = await conn.query('select distinct(category) from q_quotes order by category');

    console.log(authors)
    res.render('index', {
      authors,
      categories,
      filters: {}
      // note: no `quotes` key → results section is hidden on first load
    });
  } catch (err) {
    next(err);
  }
});

router.get("/author/:id", async (req, res) => {
  let authorId = req.params.id;
  let qry = `select *
                from q_authors
                where authorId = ?`;
  const [rows] = await conn.query(qry, [authorId]);
  res.send(rows);
});

//Need to export to all me to import in the  index.mjs

export default router;