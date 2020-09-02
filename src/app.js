const express = require('express');
const basicAuth = require('express-basic-auth');
const boom = require('express-boom');
const cookieParser = require('cookie-parser');
const httpLogger = require('morgan');
const log4js = require("log4js");
const DataService = require('./services/data-service');
const dataService = new DataService().getInstance();
require('dotenv-defaults').config();

const logger = log4js.getLogger();
logger.level = process.env.LOG_LEVEL || 'debug';

const divvyRouter = require('./routes/v1/divvy');
const app = express();

app.use(httpLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(boom());

let users = {
}
if(process.env.BASIC_USER && process.env.BASIC_SECRET){
  users[process.env.BASIC_USER] = process.env.BASIC_SECRET;
}
app.use(basicAuth({
  users: users
}))
dataService.initTripsCache().then(()=>{app.emit("cacheInitialized");}).catch(()=>{});

app.use('/api/v1/', divvyRouter);

module.exports = app;
