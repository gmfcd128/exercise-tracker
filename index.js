const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let users = [];
let exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST /api/users to create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const user = { username, _id: uuidv4() };
  users.push(user);
  res.json(user);
});

// GET /api/users to get a list of all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST /api/users/:_id/exercises to log exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: uuidv4(),
    userId: _id
  };

  exercises.push(exercise);
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

// GET /api/users/:_id/logs to retrieve exercise logs
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let log = exercises.filter(exercise => exercise.userId === _id);

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(exercise => new Date(exercise.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(exercise => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(({ description, duration, date }) => ({
      description,
      duration,
      date
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
