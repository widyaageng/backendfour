require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const routerapi = express.Router();
const Activity = require("./modules/db.js").ActivityModel;
const TIMEOUT = 2000; // 2secs timeout

// -------------------------------- custom middlewares --------------------------------
//app logger
function appLogger(req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
}

// -------------------------------- end of custom middlewares --------------------------------

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
app.get('/', (req, res) => {
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

  addActivity(req.params['_id'], req.body, function (err, data) {
    clearTimeout(t);
    if (err) return next(err);
    res.json(data.slice(-1)[0]);
    next();
  });
});

const deleteAll = require("./modules/db").deleteActivityPromise;
routerapi.get('/deleteall', function (req, res, next) {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  deleteAll(function (err, data) {
    clearTimeout(t);
    if (err) return next(err);
    res.json(data);
    next();
  })

});


// -------------------- end of REST handler and router --------------------

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
