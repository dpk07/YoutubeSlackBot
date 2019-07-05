# YoutubeSlackBot
A slack bot that will deliver the trending videos from Youtube and also deliver videos based on user interests.
# Steps
To run the project on your local machine,
* npm install in project root
* Update postgres url in helpers/setupDatabase.js
* run npm start

# Url
https://youtube-slack-bot-new.herokuapp.com

# Commands
* /trending [Country name] Gets the top 25 trending videos in the specified country[Defaulted to India]
* /search [Keyword] Gets the top 25 search results as per the specified keyword[If not specified fetches the videos as per user interests]
* /updateInteres [Interest] Updates the user interest in the database
