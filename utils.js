const fs = require("fs");
const path = require("path");
const config = require("config");
const morgan = require("morgan");
const tracer = require("tracer");

const log = (() => {
  const logger = tracer.colorConsole();
  logger.requestLogger = morgan("dev");
  return logger;
})();

const normalizePort = val => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

module.exports = { log, normalizePort };
