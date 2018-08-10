import React, {Component} from 'react';
import styles from './styles';
import SongModal from './components/SongModal';
import Modal from 'react-modal';
import Leaderboard from './components/leaderboard';
import Banner from './components/song_vote';
const ngrok = "https://900824df.ngrok.io";

const _ = require('lodash');

const update = (twitch_id, type, toBeUpdated) => {
    console.log("trying to update", twitch_id, type, toBeUpdated);
    fetch(`${ngrok}/update`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            twitchId: twitch_id,
            type: type,
            toBeUpdated: toBeUpdated
        })
    }).then(res => console.log(res))
        .catch(err => console.log(err))
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalUsers: [],
            user: {
                twitchId: "245208288",
                streak: 0,
                loyaltyRate: 0,
                currentLoyalty: 50000,
                totalLoyalty: 50000,
                djElo: 0,
                songsQueued: 0,
                djBadge: "None",
                loyaltyBadge: {
                    innerLocal: "None",
                    outerGlobal: "None"
                }
            },
            twitchId: "245208288",
            isEarly: false,
            upvotes: 0,
            downvotes: 0,
            vote: ``,
            baseRate: 5, //per min, 300 per hour
            bonusSubRate: 5,
            bonusStreakRate: 1, //increases per hour watched
            queuePrice: 200,
            genrePrice: 350,
            showModel: false,
            nowPlaying: {
                coverArt: 'http://artwork-cdn.7static.com/static/img/sleeveart/00/004/056/0000405628_350.jpg',
                artist: 'Kanye West',
                title: 'Stronger'
            },
            leaderboard: [
                {
                    3500: {
                        user: 'Jerrito'
                    }
                }, {
                    3134: {
                        user: 'Salman'
                    }
                }, {
                    2897: {
                        user: 'Benito'
                    }
                }
            ]
        };
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }
    componentDidMount() {
        var self = this;
        //When the component mounts, request ID share
        window.Twitch.ext.actions.requestIdShare();
        //if yes, onAuthorized() will be invoked with the user's id
        window.Twitch.ext.onAuthorized(function(auth) {
            console.log('The JWT that will be passed to the EBS is', auth.token);
            console.log('The channel ID is', auth.channelId);
            fetch(`${ngrok}/auth`, {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `Bearer ${auth.token}`
                }
            }).then(result => result.json())
                .then(resp => {
                    self.setState({user: resp, twitchId: resp.twitchId}, () => {
                        let track = 0;
                        //ON MINUTE LOYALTY
                        console.log("before first set interval");
                        setInterval(function() { //also should be a setTimeout with anonymous function
                            console.log("UPDATING:", track);
                            let initialRate = self.state.baseRate;
                            let finalRate = initialRate + self.state.user.streak * self.state.bonusStreakRate;
                            let currentState = _.cloneDeep(self.state);
                            console.log("CURR STATE USER CURR LOY:", currentState.user.currentLoyalty);
                            console.log("THIS STATE USER CURR LOY:", self.state.user.currentLoyalty);
                            currentState.user.loyaltyRate = finalRate;
                            currentState.user.currentLoyalty = self.state.user.currentLoyalty + finalRate;
                            currentState.user.totalLoyalty = self.state.user.totalLoyalty + finalRate;
                            self.setState(currentState, () => {
                                update(self.state.twitchId, "loyaltyRate", finalRate);
                                update(self.state.twitchId, "currentLoyalty", self.state.user.currentLoyalty);
                                update(self.state.twitchId, "totalLoyalty", self.state.user.totalLoyalty);
                                track++;
                            });
                        }, 1000 * 60);

                        console.log("before second set interval");
                        setInterval(function() {
                            const currState = _.cloneDeep(self.state);
                            currState.user.streak = self.state.user.streak + 1;
                            self.setState(currState);
                            update(self.state.twitchId, "streak", self.state.user.streak + 1);
                            let user = self.state.user;
                            let initialRate = self.state.baseRate;
                            let finalRate;
                            finalRate = initialRate + self.state.user.streak * self.state.bonusStreakRate;
                            this.setState({
                                user: {
                                    loyaltyRate: finalRate
                                }
                            });
                            update(self.state.twitchId, "loyaltyRate", finalRate);
                        }, 1000 * 60 * 60);
                        console.log("end...right before catch")
                    });
                }).catch(err => console.log(err))
        });
    }

    spendPoints = () => {
        const currState = _.cloneDeep(this.state.user);
        currState.currentLoyalty = this.state.user.currentLoyalty - this.state.queuePrice;
        currState.songsQueued = ++this.state.user.songsQueued;
        this.setState({user: currState}, () => {
            console.log("STATE TWTIHC ID:", this.state.twitchId, "CURR STATE CURR LOYAL:", this.state.user.currentLoyalty)
            update(this.state.twitchId, "currentLoyalty", this.state.user.currentLoyalty);
            update(this.state.twitchId, "songsQueued", this.state.songsQueued);
            console.log("songs Q", this.state.songsQueued)
        });
    };

    nowPlaying = (coverArt, artist, title) => {
        const nowPlayingState = _.cloneDeep(this.state.nowPlaying);
        nowPlayingState.coverArt = coverArt;
        nowPlayingState.artist = artist;
        nowPlayingState.title = title;
        this.setState({nowPlaying: nowPlayingState});
    };

    stateOnClick = () => {
        this.setState({nowPlaying: {
                coverArt: 'https://i.ebayimg.com/images/g/0o8AAOSwK6RZEdkK/s-l1600.jpg',
                artist: 'Chuck Berry',
                title: 'Go Go Go'
            }})
    };
        // isEarly = () => {
        //     fetch(`https://api.twitch.tv/kraken/streams/`, {
        //         headers: {
        //             'Accept': 'application/vnd.twitchtv.v5+json',
        //             'Client-ID': clientId,
        //         }
        //     })
        //         .then(resp => resp.json())
        //         .then(json => {
        //             const watchingStream = json.filter(stream => stream._id === this.state.user.token.channel_id);
        //             const startTime = watchingStream.created_at; //save as a var
        //             if (new Date() - startTime > 1000 * 60 * 60) { //one hour (we can scale this)
        //                 this.setState({isEarly: false});
        //             } else {
        //                 this.setState({isEarly: true});
        //                 //add function to add multiplier
        //             }
        //         }).catch(err => console.log(err));
        // };
        //
        // updateLoyaltyRate = () => {
        //     let user = this.state.user;
        //     let initialRate = this.state.baseRate;
        //     let finalRate;
        //     // if (user.isSubbed) {
        //     //     finalRate = initialRate + this.state.bonusSubRate + user.streak * this.state.bonusStreakRate
        //     //     this.setState({
        //     //         user: {
        //     //             loyaltyRate: finalRate
        //     //         }
        //     //     });
        //     //     update(this.state.twitchId, "loyaltyRate", finalRate);
        //     // } else {
        //         finalRate = initialRate + user.streak * this.state.bonusStreakRate;
        //         this.setState({
        //             user: {
        //                 loyaltyRate: finalRate
        //             }
        //         });
        //         update(this.state.twitchId, "loyaltyRate", finalRate);
        //     // }
        //
        // };
        //
        // updateStreak = () => { //probably should change to setTimeout with an anonymous function but idk how to
        //     setInterval(function() {
        //         this.setState({
        //             user: {
        //                 streak: this.state.user.streak + 1
        //             }
        //         });
        //         update(this.state.twitchId, "streak", this.state.user.streak + 1);
        //         let user = this.state.user;
        //         let initialRate = this.state.baseRate;
        //         let finalRate;
        //         finalRate = initialRate + user.streak * this.state.bonusStreakRate;
        //         this.setState({
        //             user: {
        //                 loyaltyRate: finalRate
        //             }
        //         });
        //         update(this.state.twitchId, "loyaltyRate", finalRate);
        //     }, 1000 * 60 * 60)
        // };
        // onMinuteLoyalty = () => { //adds loyaltyRate to total and current loyalty every minute
        //     let user = this.state.user;
        //     setInterval(function() { //also should be a setTimeout with anonymous function
        //         let initialRate = this.state.baseRate;
        //         let finalRate;
        //         finalRate = initialRate + user.streak * this.state.bonusStreakRate;
        //         this.setState({
        //             user: {
        //                 loyaltyRate: finalRate
        //             }
        //         });
        //         update(this.state.twitchId, "loyaltyRate", finalRate);
        //         this.setState({
        //             user: {
        //                 currentLoyalty: user.currentLoyalty + user.loyaltyRate
        //             }
        //         });
        //         update(this.state.twitchId, "currentLoyalty", user.currentLoyalty + user.loyaltyRate);
        //         this.setState({
        //             user: {
        //                 totalLoyalty: user.totalLoyalty + user.loyaltyRate
        //             }
        //         });
        //         update(this.state.twitchId, "totalLoyalty", user.totalLoyalty + user.loyaltyRate);
        //     }, 1000 * 60)
        // };
        //
        // onVote = () => {
        //     this.setState({
        //         user: {
        //             currentLoyalty: this.state.user.currentLoyalty + 10
        //         }
        //     });
        //     update(this.state.twitchId, "currentLoyalty", this.state.user.currentLoyalty + 10);
        //     this.setState({
        //         user: {
        //             totalLoyalty: this.state.user.currentLoyalty + 10
        //         }
        //     });
        //     update(this.state.twitchId, "totalLoyalty", this.state.user.currentLoyalty + 10);
        // }
        //
        // onBits = (data) => {
        //     //GET https://api.twitch.tv/kraken/channel // this IS A LISTENER
        //     //.then(resp => {channel-bits-events-v1.resp._id})
        //     Users.findOne({twitchId: data.user_id})
        //         .then((user) => {
        //             if(user) {
        //                 user.currentLoyalty = 'current + bits*.1' //if i find by userId and then update the user object in Mongo, the state wont update for the user, how do i do this
        //                 user.totalLoyalty = 'total + bits*.1'
        //             }
        //         })
        //     this.setState({
        //         user: {
        //             currentLoyalty: this.state.user.currentLoyalty //scale off bits
        //         }
        //     })
        // }
        // Todo ADD GLOBAL FUNCTIONALITY (see model)
        //PubSubs for onSub, onBits
        //Buy functions
        //refund currency on leave/voted off
        //update djElo
        //Frontend
        //add catch
        handleOpenModal () {
            if (this.state.user.currentLoyalty < this.state.queuePrice) {
                return;
            }
            this.setState({ showModal: true });
        }
        handleCloseModal () {
            this.setState({ showModal: false });
        }

        onSongPlay() {
            //some kind of listener?
            console.log('new song playing!')
            this.setState({upvotes: 0, downvotes: 0, vote: ``})
        }

        songSkip() {
            //some sort of emit
        }

        voteCalc() {
            let upvotes = this.state.upvotes
            let downvotes = this.state.downvotes
            let decimal = upvotes / (upvotes + downvotes)
            this.setState({
                vote: `${Math.floor(decimal * 100)}%`
            })
        }

        checkBadVote() {
            if (this.state.downvotes / this.state.upvotes >= 3) {
                this.songSkip()
            }
        }
        voteTester(e) {
            e.preventDefault();
            let user = this.state.user
            for (var i = 0; i < 30; i++) {
                if (Math.random() > .3) {
                    this.setState({
                        upvotes: this.state.upvotes + 1
                    })
                    this.voteCalc()
                    this.checkBadVote()
                } else {
                    this.setState({
                        downvotes: this.state.downvotes + 1
                    })
                    this.voteCalc()
                    this.checkBadVote()
                }
                this.setState({
                    user: {
                        twitchId: user.twitchId,
                        isSubbed: user.isSubbed,
                        streak: user.streak,
                        loyaltyRate: user.loyaltyRate,
                        currentLoyalty: this.state.user.currentLoyalty + 10,
                        totalLoyalty: this.state.user.totalLoyalty + 10,
                        djElo: user.djElo,
                        songsQueued: user.songsQueued,
                        djBadge: user.djBadge,
                        loyaltyBadge: user.loyaltyBadge
                    }

                })
            }}
        // onUpvote(e) {
        //     e.preventDefault();
        //     let user = this.state.user
        //     this.setState({
        //         user: {
        //             twitchId: user.twitchId,
        //             isSubbed: user.isSubbed,
        //             streak: user.streak,
        //             loyaltyRate: user.loyaltyRate,
        //             currentLoyalty: this.state.user.currentLoyalty + 10,
        //             totalLoyalty: this.state.user.totalLoyalty + 10,
        //             djElo: user.djElo,
        //             songsQueued: user.songsQueued,
        //             djBadge: user.djBadge,
        //             loyaltyBadge: user.loyaltyBadge
        //         },
        //         upvotes: this.state.upvotes + 1
        //     })
        //     console.log(this.state.user)
        //     e.target.disabled = true
        //     this.voteCalc()
        //     this.checkBadVote()
        // }

        onDownvote(e) { //THIS NEEDS TO BE AN EMIT SO ITS ALL DISPLAYED AT ONCE
            e.preventDefault();
            let user = this.state.user
            this.setState({
                user: {
                    twitchId: user.twitchId,
                    isSubbed: user.isSubbed,
                    streak: user.streak,
                    loyaltyRate: user.loyaltyRate,
                    currentLoyalty: this.state.user.currentLoyalty + 10,
                    totalLoyalty: this.state.user.totalLoyalty + 10,
                    djElo: user.djElo,
                    songsQueued: user.songsQueued,
                    djBadge: user.djBadge,
                    loyaltyBadge: user.loyaltyBadge
                },
                downvotes: this.state.downvotes + 1
            })
            console.log(this.state.user)
            e.target.disabled = true
            this.voteCalc()
            this.checkBadVote()
        }

        render() {
            console.log(this.state);

            console.log("this", this);
            return (
                <div className="App">
                    <div style={styles.panelContainer} className="panelContainer">
                        <div style={styles.panelSongBanner} className="panelSongBanner">
                            <Banner upvote={(e) => this.voteTester(e)} downvote={(e) => this.onDownvote(e)} skip={() => this.songSkip()} badVote={() => this.checkBadVote()} vote={this.state.vote} voteCalc={() => this.voteCalc()} startSong={() => this.onSongPlay()} nowPlaying={this.state.nowPlaying}/>
                        </div>
                        <div style={styles.panelBody} className="panelBody">
                            <div style={styles.panelBodyLeft} className="panelBodyLeft">
                                <div style={styles.shop} className="shop">
                                    <div style={styles.optionsContainer} className="optionsContainer">
                                        <button onClick={this.handleOpenModal}
                                             className="option">
                                            <h3 style={{fontSize: '20px'}}>Queue a song!</h3>
                                        </button>
                                        <Modal isOpen={this.state.showModal}
                                               onRequestClose={this.handleCloseModal}
                                               contentLabel="Example Modal" >
                                            <SongModal spend={this.spendPoints} nowPlaying={this.nowPlaying} song={this.stateOnClick}/>
                                            <button onClick={this.handleCloseModal}>close</button>
                                        </Modal>
                                    </div>
                                </div>
                                <div style={styles.leaderboard} className="leaderboard">
                                    <h3 className="leaderboardHead">Leaderboard</h3>
                                    <div style={styles.leaderboardContainer} className="leaderboardContainer">
                                        <span style={styles.bottom} className="bottom"></span>
                                        <div style={styles.leaderboardSlot} className="leaderboardSlot">
                                            1. benito
                                        </div>
                                        <span style={styles.bottom} className="bottom"></span>
                                        <div style={styles.leaderboardSlot} className="leaderboardSlot">
                                            2. salman
                                        </div>
                                        <span style={styles.bottom} className="bottom"></span>
                                        <div style={styles.leaderboardSlot} className="leaderboardSlot">
                                            3. trelol
                                        </div>
                                        <span style={styles.bottom} className="bottom"></span>
                                        <div style={styles.leaderboardSlot} className="leaderboardSlot">
                                            24. hctiwt</div>
                                        <span style={styles.bottom} className="bottom"></span>
                                    </div>
                                </div>
                            </div>
                            <div style={styles.panelBodyRight} className="panelBodyRight">
                                <div style={styles.currentPoints} className="currentPoints">
                                    {this.state.user.currentLoyalty}
                                    <br />
                                    Current points
                                </div>
                                <div style={styles.multiplier} className="multiplier">
                                    +{this.state.user.loyaltyRate}
                                    <br />
                                    points per minute
                                </div>
                                <div style={styles.djScore} className="djScore">
                                    {this.state.user.djElo}/1000
                                    <br />
                                    DJ Score
                                </div>
                                <div style={styles.badge} className="badge">
                                    {this.state.user.songsQueued} songs queued
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
    export default App;




