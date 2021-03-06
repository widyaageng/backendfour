require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

const bodyParser = require('body-parser');
const routerapi = express.Router();
const TIMEOUT = 2000; // 2secs timeout

// ---------------- custom middlewares ----------------
//app logger
function appLogger(req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
}
// ---------------- end of custom middlewares ----------------



// -------------------- utility methods --------------------
// -------------------- end of utility methods --------------------



// -------------------- apply middlewares --------------------
app.use(cors());
app.use(express.static('public'));
app.use(path = '/', middleWareFunction = appLogger);
app.use(path = '/', middleWareFunction = bodyParser.urlencoded({ extended: true }));
app.use(path = '/', middlewareFunction = bodyParser.json());
app.use(path = '/api', routerapi);
// -------------------- end of apply middlewares --------------------


// -------------------- REST handler and router --------------------
// get /root
app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/views/index.html');
});

// /api/users
const addUser = require("./modules/db").createUser;
routerapi.post('/users', function (req, res, next) {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  addUser(req.body['username'], function (err, data) {
    clearTimeout(t);
    if (err) return next(err);
    res.json({
      username: data['username'],
      _id: data['_id']
    });
    next();
  });
});

// /api/users/:_id/exercises
const addActivity = require("./modules/db").addActivityArray;
routerapi.post('/users/:_id/exercises', function (req, res, next) {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);
  console.log(req.body);
  addActivity(req.params['_id'], req.body, function (err, data) {
    clearTimeout(t);
    if (err) return next(err);
    res.json(data.slice(-1)[0]);
    next();
  });
});

// /api/users/:_id/logs?[from][&to][&limit]
const queryActivity = require("./modules/db").queryExerciseRange;
routerapi.get(/\/users\/([0-9abcdef]{24})\/logs\?*(from)*/, function(req, res, next) {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  let urlQueries = {
    start: req.query['from'] === undefined || req.query['from'] === '' ? (new Date(0)).toISOString().split('T')[0]: req.query['from'],
    end: req.query['to'] === undefined || req.query['to'] === '' ? (new Date(2147483647000)).toISOString().split('T')[0]: req.query['to'],
    limit: req.query['limit'] === undefined || req.query['limit'] === '' ? 'all': req.query['limit'],
    userid: req.params[0]
  }

  // console.log(urlQueries);

  queryActivity(urlQueries, function(err, data) {
    clearTimeout(t);
    if (err) return next(err);
    res.json(data);
    next();
  });
});

// /api/users get all users
const getUsers = require("./modules/db").getAllUsers;
routerapi.get('/users', function (req, res, next) {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  getUsers(function(err, data) {
    if (err) return next(err);
    res.json(data);
    next();
  })
});


// /api/deleteAll to clean existing database
const deleteAllActivity = require("./modules/db").deleteActivityPromise;
const deleteAllExercise = require("./modules/db").deleteExcercisePromise;
routerapi.get('/deleteall', function (req, res, next) {

  var deletedRecords = {
    nowUserCount: 0,
    nowActivityCount: 0
  };

  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  deleteAllActivity(function (err, data) {
    if (err) return next(err);
    deletedRecords.deletedUserCount = data;
    next();
  });

  deleteAllExercise(function (err, data) {
    clearTimeout(t);
    if (err) return next(err);
    deletedRecords.deletedActivityCount = data;
    next();
  });

  res.json(deletedRecords);
  next();
});

// -------------------- test --------------------



// -------------------- end of REST handler and router --------------------

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

// -------------------- exports to test --------------------
exports.app = app;
exports.listener = listener;