const CronJob = require("cron").CronJob;
const config = require("config");
const { log } = require("../utils");
const sendTrendingVideos = require("./sendTrendingVideos");
//setting up the new cron job
const job = new CronJob(
  `00 ${config.get("cronMinutes") || "00"} ${config.get("cronHour") ||
    "8"} * * *`,
  function() {
    const d = new Date();
    console.log("Sent Trending videos at: ", d);
    sendTrendingVideos();
  }
);
log.info(
  `Cron Job Instantiated to run everyday at ${config.get("cronHour") ||
    "8"}:${config.get("cronMinutes") || "00"}`
);
module.exports = job;
