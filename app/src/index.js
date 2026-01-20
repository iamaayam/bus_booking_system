const express = require('express');
const path = require('path');
const pool = require('./../db/db.js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// DB test
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('DB connected at:', res.rows[0].now);
  }
});

// Dummy users
const users = [
  { username: "admin", password: "1234" }
];

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home', 'home.html'));
});

// Signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup', 'signup.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Tickets page
app.get('/tickets', (req, res) => {
  res.sendFile(path.join(__dirname, 'buses', 'ticket.html'));
});

// Signup logic
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  const userExists = users.find(u => u.username === username);
  if (userExists) return res.send('Username already taken');

  users.push({ username, password });
  res.redirect('/login');
});

// Login logic
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.send('Invalid username or password');

  res.redirect('/');
});


// buses logic
app.get("/api/buses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        bus_name,
        bus_type,
        duration,
        price
      FROM buses
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch buses" });
  }
});


// SEAT BOOKING LOGIC


// GET seats (auto-release yellow after 1 min)

app.get("/api/seats", async (req, res) => {
  try {
    await pool.query(`
      UPDATE seats
      SET status = 'available',
          locked_at = NULL
      WHERE status = 'locked'
      AND locked_at < NOW() - INTERVAL '1 minute'
    `);

    const result = await pool.query(
      "SELECT seat_number, status FROM seats ORDER BY seat_number"
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch seats" });
  }
});

// Lock seat (white → yellow)
app.post("/api/seats/lock", async (req, res) => {
  const { seat } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE seats
      SET status = 'locked',
          locked_at = NOW()
      WHERE seat_number = $1
      AND status = 'available'
      RETURNING *
      `,
      [seat]
    );

    if (result.rowCount === 0) {
      return res.json({ success: false });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Book seats (yellow → red)
app.post("/api/seats/book", async (req, res) => {
  const { seats } = req.body;

  try {
    await pool.query(
      `
      UPDATE seats
      SET status = 'booked',
          locked_at = NULL
      WHERE seat_number = ANY($1)
      AND status = 'locked'
      `,
      [seats]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
