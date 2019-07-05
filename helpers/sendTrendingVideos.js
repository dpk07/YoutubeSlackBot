const { log } = require("../utils");
const request = require("request-promise-native");
const dotenv = require("dotenv");
dotenv.config();

/**
 * This function fetches the trending videos for India
 * and pushes it to the webhook
 */
async function pushTrendingVideos() {
  try {
    //Lookup for the country supplied by the user
    let youtubeWatchUrl = "https://www.youtube.com/watch?v=";
    let attachments = [];
    //Options required to fetch the video data from Youtube API
    let googleOptions = {
      uri: "https://www.googleapis.com/youtube/v3/videos",
      qs: {
        part: "snippet",
        method: "POST",
        chart: "mostPopular",
        regionCode: "IN",
        maxResults: 25,
        key: process.env.GOOGLE_API_KEY
      },
      headers: {
        "User-Agent": "Request-Promise"
      },
      json: true // Automatically parses the JSON string in the response
    };
    //API call to the youtube api to fetch trending videos
    let googleResponse = await request(googleOptions);
    console.log(googleResponse);

    //creating the attachments ready,to send to the bot
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
    //options for making the post call to the webhook
    let slackOptions = {
      uri:
        "https://hooks.slack.com/services/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",
      method: "POST",
      headers: {
        "User-Agent": "Request-Promise",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        text:
          "Top 25 trending videos in your country\n<----------------------------------->",
        attachments: attachments
      })
    };
    //api call to post the videos to the webhook
    let slackResponse = await request(slackOptions);
    log.info("Trending videos sent successfully");
  } catch (err) {
    log.error(err);
  }
}

module.exports = pushTrendingVideos;
