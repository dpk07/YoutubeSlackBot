const config = require("config");
const express = require("express");
const http = require("http");
const bootstrap = require("./bootstrap");
const { log, normalizePort } = require("./utils");
const db = require("./helpers/setupDatabase");
//Initializing app with express
const app = express();

app.start = async () => {
  log.info("Starting Server...");
  const port = process.env.PORT || normalizePort(config.get("port"));
  app.set("port", port);
  bootstrap(app);
  const server = http.createServer(app);

  server.on("error", error => {
    if (error.syscall !== "listen") throw error;
    log.error(`Failed to start server: ${error}`);
    db.end();
    process.exit(1);
  });

  server.on("listening", () => {
    const address = server.address();
    log.info(`Server listening ${address.address}:${address.port}`);
  });

  server.listen(port);
};
//closing db connections on app end
process.on("SIGKILL", () => {
  db.end();
});

//closing db connections on app end
process.on("SIGKILL", () => {
  db.end();
});

//to handle uncaught exception
process.on("uncaughtException", err => {
  log.error(`Uncaught exception found${err}`);
  process.exit(1);
});

app.start().catch(err => {
  log.error(err);
});

module.exports = app;
