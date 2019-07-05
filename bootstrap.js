const bodyParser = require("body-parser");
const { log } = require("./utils");
const routes = require("./routes");
const job = require("./helpers/setupCronJob");

/**
 * Sets the app up with required modules
 */
module.exports = function(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  //starting the cron job to send trending videos everyday
  log.info("Started cronJob");
  job.start();
  // Routes
  app.use(routes);

  // 404
  app.use((req, res) => {
    res.status(404).send({
      status: 404,
      message: "The requested resource was not found"
    });
  });

  // 5xx
  app.use((err, req, res) => {
    log.error(err.stack);
    const message =
      process.env.NODE_ENV === "production"
        ? "Something went wrong, we're looking into it..."
        : err.stack;
    res.status(500).send({
      status: 500,
      message
    });
  });
};
