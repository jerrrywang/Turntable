# twitch-hackathon
My team and I created a Twitch extension for viewers (called Turntable) and a music player for streamers at the 2018 Twitch Hackathon.
We had to make use of Twitch's API and the Universal Music Group catalogue.

Technologies involved: React.js, Electron.js, Node.js, Express.js, MongoDB.

Finished 2nd place.

Here is a general summary of the problem we identified and our solution to it:

Currently, the only way viewers can successfully interact with their favorite streamers is to send them a direct message, which requires spending money on donations or subscriptions. That leaves many of their viewers, who are broke college students, unable to directly interact with their favorite streamers besides the only other alternative: competing with thousands of other viewers in a chaotic chat room. 

Turntable remedies the problem by establishing another avenue to directly interact with streamers that doesn’t require money or competing with others. 

Turntable is a Twitch extension that allows viewers to accumulate points as they watch their favorite streamers. The longer they watch, the more points they gain. We call these points “ardor,” and ardor is a currency that can be spent to choose the next song on a stream. Because entire Twitch communites are often brought together and sustained by a stream’s music, ardor becomes a powerful currency that fans will strive to gain. 

Every viewer gains ardor per minute of watching, and there are two ways for viewers to increase their rate of ardor accumulation. 

First, ardor will increase at a faster rate for viewers that tune into a stream early, which would also help streamers by expanding their initital view count.

Second, ardor will increase at a faster rate for each consecutive hour a viewer watches a stream, incentivizing longer viewing while helping the streamer develop a more consistent fan base. 

When viewers spend ardor to choose a stream’s song, the song is automatically added to a queue on the streamer’s music player, requiring no effort from the streamer. 

And to regulate the queue and filter out trolls, viewers are rewarded with ardor for upvoting or downvoting the song currently being played. If the song’s rating is net negative after 30 seconds, the song will be skipped. 

Finally, after a viewer’s song plays, the rating of that song contributes to that viewer’s DJ score, which is an average of all the ratings of the songs that viewer has queued. The viewer with the highest DJ score is designated as the stream’s top DJ and is rewarded with unique badges and more power over the streamer’s music.

Going forward we want to create more options for viewers to spend ardor on such as polls and direct messages to streamers. We’d also like to integrate the music player we built to the Twitch streamer dashboard and style our extension to be more consistent with Twitch's UI.

Unfortunately, wealth has become an indicator of loyalty for Twitch viewers. Turntable aims to give dedicated fans the rewards they deserve. 
