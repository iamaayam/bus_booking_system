const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Dummy user 
const users = [
    {  username: "admin",
       password: "1234"}
    ];

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home','home.html'));
});
// Signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup', 'signup.html'));
});


// Signup logic
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  
  const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.send('Username already taken');
    }
    users.push({username,password});
    res.redirect('/login');
});


// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Login logic
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.send('Invalid username or password');
  }

  res.redirect('/');
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
