const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const plansRouter = require('./routes/plansRoutes');
const usersRouter = require('./routes/usersRoutes');

const app = express();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WorkOn API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'],
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/plans', plansRouter);
app.use('/users', usersRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

console.log('Server is running on port 4000');

module.exports = app;
