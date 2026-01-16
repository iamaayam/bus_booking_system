const express = require('express');
const path = require('path');
const pool = require('./../db/db.js');

const app = express();
const port = process.env.PORT || 3000;

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Static files */
app.use('/home', express.static(path.join(__dirname, 'home')));
app.use('/signup', express.static(path.join(__dirname, 'signup')));
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/buses', express.static(path.join(__dirname, 'buses')));

/* Dummy users (temporary) */
const users = [
  { username: 'admin', password: '1234' }
];
//database seat fetching
app.get('/api/seats', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT seat_number FROM seats WHERE booked = true'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});
//book selected seats
app.post('/api/seats/book', async (req, res) => {
  const { seats } = req.body; // [1,2,3]

  if (!seats || seats.length === 0) {
    return res.status(400).json({ error: 'No seats selected' });
  }
  try {
    await pool.query(
      'UPDATE seats SET booked = true WHERE seat_number = ANY($1)',
      [seats]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

/* Routes */
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

/* Auth logic */
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);
  if (exists) return res.send('Username already taken');

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

/* DB check */
pool.query('SELECT NOW()', (err, result) => {
  if (err) console.error('DB connection error:', err);
  else console.log('DB connected at:', result.rows[0].now);
});

/* Start server */
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
