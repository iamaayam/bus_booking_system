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

// Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home', 'home.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

app.get('/tickets', (req, res) => {
  res.sendFile(path.join(__dirname, 'buses', 'ticket.html'));
});

//admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

app.get("/api/admin/seats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id AS bus_id,
        b.bus_name,
        s.seat_number,
        s.status
      FROM seats s
      JOIN buses b ON b.id = s.bus_id
      ORDER BY b.bus_name, s.seat_number
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin seats" });
  }
});
app.post("/api/admin/seats/force-book", async (req, res) => {
  const { busId, seat } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE seats
      SET status = 'booked',
          locked_at = NULL
      WHERE bus_id = $1
      AND seat_number = $2
      RETURNING *
      `,
      [busId, seat]
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


// Make seat available (admin reject)
app.post("/api/admin/make-available", async (req, res) => {
  const { busId, busName, seatNumber } = req.body;

  try {
    // 1. store soft delete
    await pool.query(
      `
      INSERT INTO deleted (bus_name, seat_number)
      VALUES ($1, $2)
      `,
      [busName, seatNumber]
    );

    // 2. free the seat
    await pool.query(
      `
      UPDATE seats
      SET status = 'available',
          locked_at = NULL
      WHERE bus_id = $1
      AND seat_number = $2
      `,
      [busId, seatNumber]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// View deleted history
app.get("/api/admin/deleted", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT bus_name, seat_number, deleted_at
      FROM deleted
      ORDER BY deleted_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch deleted history" });
  }
});

// Auth
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.send('Username already taken');
  }
  users.push({ username, password });
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    u => u.username === username && u.password === password
  );
  if (!user) return res.send('Invalid username or password');
  res.redirect('/');
});

// ---------------- BUS LIST ----------------
app.get("/api/buses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, bus_name, bus_type, duration, price
      FROM buses
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch buses" });
  }
});



// Get single bus details
app.get("/api/bus/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT bus_name, bus_type, duration
      FROM buses
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bus not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bus details" });
  }
});

// ---------------- SEATS ----------------

// Get seats for a bus + auto unlock expired locks
app.get("/api/seats", async (req, res) => {
  const { bus_id } = req.query;

  if (!bus_id) {
    return res.status(400).json({ error: "bus_id is required" });
  }

  try {
    // Auto-release expired locks (GLOBAL, SAFE)
    await pool.query(`
      UPDATE seats
      SET status = 'available',
          locked_at = NULL
      WHERE status = 'locked'
      AND locked_at < NOW() - INTERVAL '1 minute'
    `);

    // Fetch seats for specific bus
    const result = await pool.query(
      `
      SELECT seat_number, status
      FROM seats
      WHERE bus_id = $1
      ORDER BY seat_number
      `,
      [bus_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch seats" });
  }
});

// Lock seat (white → yellow)
app.post("/api/seats/lock", async (req, res) => {
  const { seat, bus_id } = req.body;

  if (!bus_id || !seat) {
    return res.status(400).json({ success: false });
  }

  try {
    const result = await pool.query(
      `
      UPDATE seats
      SET status = 'locked',
          locked_at = NOW()
      WHERE bus_id = $1
      AND seat_number = $2
      AND status = 'available'
      RETURNING seat_number
      `,
      [bus_id, seat]
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
  const { seats, bus_id } = req.body;

  if (!bus_id || !Array.isArray(seats)) {
    return res.status(400).json({ success: false });
  }

  try {
    await pool.query(
      `
      UPDATE seats
      SET status = 'booked',
          locked_at = NULL
      WHERE bus_id = $1
      AND seat_number = ANY($2)
      AND status = 'locked'
      `,
      [bus_id, seats]
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
