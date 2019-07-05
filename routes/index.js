const express = require("express");
const countryData = require("country-data");
const { log } = require("../utils");
const router = new express.Router();
const request = require("request-promise-native");
const dotenv = require("dotenv");
const db = require("../helpers/setupDatabase");

//setup dotenv
dotenv.config();

router.all("/slack/command/trending", async (req, res) => {
  try {
    //Lookup for the country supplied by the user
    let country = countryData.lookup.countries({ name: req.body.text });
    //base url for youtube watch
    let youtubeWatchUrl = "https://www.youtube.com/watch?v=";
    //attachments array for adding the videos
    let attachments = [];
    //Options required to fetch the video data from Youtube API
    let options = {
      uri: "https://www.googleapis.com/youtube/v3/videos",
      qs: {
        part: "snippet",
        method: "POST",
        chart: "mostPopular",
        regionCode: country[0] ? country[0].alpha2 : null || "IN",
        maxResults: 25,
        key: process.env.GOOGLE_API_KEY
      },
      headers: {
        "User-Agent": "Request-Promise"
      },
      json: true // Automatically parses the JSON string in the response
    };
    let googleResponse = await request(options);
    console.log(googleResponse);
    //add individual videos to attachments
    googleResponse.items.map(elem => {
      attachments.push({
        fallback: elem.snippet.title,
        color: "#2eb886",
        author_name: elem.snippet.channelTitle,
        title: elem.snippet.title,
        title_link: youtubeWatchUrl + elem.id,
        text: elem.snippet.description,
        thumb_url: elem.snippet.thumbnails.default
          ? elem.snippet.thumbnails.default.url
          : " "
      });
    });
    return res.send({
      text:
        "Top 25 trending videos in your country\n<----------------------------------->",
      attachments: attachments
    });
  } catch (err) {
    log.error(err);
    return res.status(500).send("Something blew up. We're looking into it.");
  }
});

router.all("/slack/command/search", async (req, res) => {
  try {
    let response = await db.query(
      `SELECT * FROM "user" WHERE "user_id"='${req.body.user_id}'`
    );
    let keyword = req.body.text
      ? req.body.text
      : response.rows[0]
      ? response.rows[0].user_interest
      : "";
    //if no keyword found in text as well in db return error
    if (keyword.length == 0) {
      return res.send({
        attachments: [
          {
            title: "Invalid request",
            text:
              "Please send a keyword with /search or use /updateInterest to update your interest",
            color: "danger"
          }
        ]
      });
    }
    //base url for youtube watch
    let youtubeWatchUrl = "https://www.youtube.com/watch?v=";
    //attachments array for adding the videos
    let attachments = [];
    //Options required to fetch the video data from Youtube API
    let options = {
      uri: "https://www.googleapis.com/youtube/v3/search",
      qs: {
        part: "snippet",
        q: keyword,
        maxResults: 25,
        key: process.env.GOOGLE_API_KEY
      },
      headers: {
        "User-Agent": "Request-Promise"
      },
      json: true // Automatically parses the JSON string in the response
    };
    let googleResponse = await request(options);
    console.log(googleResponse);

    //add individual videos to attachments
    googleResponse.items.map(elem => {
      attachments.push({
        fallback: elem.snippet.title,
        color: "#2eb886",
        author_name: elem.snippet.channelTitle,
        title: elem.snippet.title,
        title_link: youtubeWatchUrl + elem.id,
        text: elem.snippet.description,
        thumb_url: elem.snippet.thumbnails.default
          ? elem.snippet.thumbnails.default.url
          : " "
      });
    });
    //return the result to the bot
    return res.send({
      text: `Top 25 search results for ${keyword}\n<----------------------------------->`,
      attachments: attachments
    });
  } catch (err) {
    log.error(err);
    return res.status(500).send("Something blew up. We're looking into it.");
  }
});

router.all("/slack/command/updateInterest", async (req, res) => {
  try {
    //check if record already exists
    let response = await db.query(
      `SELECT * FROM "user" WHERE "user_id"='${req.body.user_id}'`
    );

    if (response.rows.length > 0) {
      if (req.body.text.length > 0) {
        //if record exists and keyword exists update the db
        await db.query(
          `UPDATE "user" SET "user_interest" = '${
            req.body.text
          }' WHERE "user_id" = '${req.body.user_id}'`
        );
      } else {
        //if record exists and keyword doesn't exist send an error
        return res.send({
          attachments: [
            {
              title: "Invalid request",
              text: "Please send a keyword with /updateInterest",
              color: "danger"
            }
          ]
        });
      }
    } else {
      if (req.body.text.length > 0) {
        //if record doesn't exist and keyword exists create the record
        await db.query(
          `INSERT INTO "user"("user_id", "user_name","user_interest") VALUES ('${
            req.body.user_id
          }', '${req.body.user_name}','${req.body.text}');`
        );
      } else {
        //if record and keyword both don't exist send an error
        return res.send({
          attachments: [
            {
              title: "Invalid request",
              text: "Please send a keyword with /updateInterest",
              color: "danger"
            }
          ]
        });
      }
    }
    //send updated message to user
    return res.send({
      attachments: [
        {
          title: "Interest updated",
          text: `Interest updated to ${req.body.text}`,
          color: "good"
        }
      ]
    });
  } catch (err) {
    log.error(err);
    return res.status(500).send("Something blew up. We're looking into it.");
  }
});

module.exports = router;
