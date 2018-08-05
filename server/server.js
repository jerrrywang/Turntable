const app = require('express')();
const bodyParser = require('body-parser');
const userModels = require('./models/users');
const loyaltyModels = require('./models/loyalties');
const Song = require('./models/songs');

const jwt = require('jsonwebtoken');
const request = require('request');
const rp = require('request-promise');
const mongoose = require('mongoose');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bearerPrefix = 'Bearer ';
const secret = new Buffer(process.env.CLIENT_SECRET, 'base64');


const User = userModels.Users;
const Loyalty = loyaltyModels.Loyalty;
const clientId = 'bm9aeu6ohsjbyy39ppufxbc6cbdtbc';


function makeServerToken(channelId) {
    const payload = {
        exp: Math.floor(Date.now() / 1000) + 30,
        channel_id: channelId,
        user_id: 'jerrywang',
        role: 'external',
        pubsub_perms: {
            send: ['*'],
        },
    };
    return jwt.sign(payload, secret);
};

function verifyAndDecode(header) {
    const token = header.substring(bearerPrefix.length);
    return jwt.verify(token, secret);
};

mongoose.connect(process.env.MONGODB_URI);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // * => allow all origins
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Accept'); // add remove headers according to your needs
    next()
})

io.on("connection", client => {
    client.on("getUser", (id) => {
        User.findOne({
            token: {
                user_id: req.body.user_id
            }
        }).then(user => {
            client.emit("gotUser", user)
        })
            .catch(err => console.log(err))
    });

})
app.get('/test', (req, res) => {
    res.send("Yup, this test is working!")
});

app.post('/queue', (req, res) => {
    console.log("req.bodyu:", req.body);
    var newSong = new Song(req.body);
    newSong.save().then(resp => {
        res.send('Success');
        console.log(resp);
    }).catch(err => console.log(err))
});

app.get('/getqueue', (req, res) => {
    console.log('hit get q');

    Song.find()
        .then(resp => {
            console.log(resp);
            res.send(resp);
        })
        .catch(err => console.log(err))
});

app.get('/')

app.post('/update', (req, res) => {
    //Receive req.body.user_id, type, toBeUpdated
    User.findOne({
        token: {
            user_id: req.body.user_id
        }
    }).then(
        user => {
            switch(req.body.type) {
                case "streak":
                    user.streak = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
                case "isSubbed":
                    user.streak = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
                case "loyaltyRate":
                    user.loyaltyRate = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
                case "currentLoyalty":
                    user.currentLoyalty = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
                case "totalLoyalty":
                    user.totalLoyalty = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
                case "djElo":
                    user.djElo = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
                case "songsQueued":
                    user.songsQueued = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
                case "djBadge":
                    user.djBadge = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
                case "loyaltyBadge":
                    user.loyaltyBadge = toBeUpdated;
                    user.save()
                        .then(response => console.log("Saved:", response))
                        .catch(err => console.log(err))
                    ;
            }
        }
    )
        .catch(err => console.log(err));
});

app.get('/auth', (req, res) => {
    const payload = verifyAndDecode(req.headers.authorization);
    const id = payload.user_id;
    User.findOne({
        twitchId: id
    })
        .then(user => {
            console.log(user);
            if (!user) {
                //User doesn't exist. Create new user.
                const newUser = new User ({
                    twitchId: id,
                    token: payload
                });
                newUser.save()
                    .then(resp => {
                        res.send(user);
                        console.log("saved new user");
                    })
                    .catch(err => console.log(err))
            } else {
                console.log("Found user");
                res.send(user);
                //User does exist. Send info back to front end.
                //         const body = JSON.stringify({
                //             content_type: 'application/json',
                //             message: 'done',
                //             targets: [`whisper-${user.token.user_id}`],
                //         });
                //
                //         console.log("body:", body);
                //
                //         const serverToken = makeServerToken(payload.channel_id);
                //
                //         console.log("serverTokjen:", serverToken);
                //
                //         rp({
                //             url: `https://api.twitch.tv/extensions/message/${payload.channel_id}`,
                //             method: 'POST',
                //             headers: {
                //                 "Authorization": `Bearer ${serverToken}`,
                //                 "Client-Id": clientId,
                //                 "Content-Type": "application/json"
                //             },
                //             body: body
                //         }).then(response => console.log(response))
                //             .catch(err => console.log(err));
                //     }
            }})
});


http.listen(1337, () => {
    console.log('listening on *:3000');
});
