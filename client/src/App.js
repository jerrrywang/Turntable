import React, {Component} from 'react';
import './App.css';
import Extension from './components/Extension';
import Modal from 'react-modal';
import Leaderboard from './components/leaderboard';
import Banner from './components/song_vote';
const ngrok = "https://81139028.ngrok.io";
const update = (user_id, type, toBeUpdated) => {
    fetch(`${ngrok}/update`, {
        method: 'POST',
        body: {
            user_id: user_id,
            type: type,
            toBeUpdated: toBeUpdated
        }
    })
};
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                twitchId: 245208288,
                isSubbed: true,
                streak: 0,
                loyaltyRate: 0,
                currentLoyalty: 500,
                totalLoyalty: 100,
                djElo: 897,
                songsQueued: 8,
                djBadge: 'Unranked',
                loyaltyBadge: {
                    innerLocal: 'Fan',
                    outerGlobal: 'Veteran'
                }
            },
            twitchId: null,
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
                    console.log(resp);
                    console.log("Got a response back after sending in auth token");
                    console.log("this:", this);
                    console.log("self:", self);
                    self.setState({user: resp, twitchId: resp.twitchId}, () => {
                        console.log(self.state);
                        let user = self.state.user;
                        //ON MINUTE LOYALTY
                        console.log("before first set interval");
                        setInterval(function() { //also should be a setTimeout with anonymous function
                            let initialRate = self.state.baseRate;
                            let finalRate = initialRate + user.streak * self.state.bonusStreakRate;
                            const currentState = {...self.state};
                            currentState.user.loyaltyRate = finalRate;
                            currentState.user.currentLoyalty = user.currentLoyalty + finalRate;
                            currentState.user.totalLoyalty = user.totalLoyalty + finalRate;
                            self.setState(currentState);
                            update(self.state.twitchId, "loyaltyRate", finalRate);
                            update(self.state.twitchId, "currentLoyalty", user.currentLoyalty + finalRate);
                            update(self.state.twitchId, "totalLoyalty", user.totalLoyalty + finalRate);
                        }, 1000 * 60);
                        console.log("before second set interval");
                        setInterval(function() {
                            const currState = {...self.state};
                            currState.user.streak = self.state.user.streak + 1;
                            self.setState(currState);
                            update(self.state.twitchId, "streak", self.state.user.streak + 1);
                            let user = self.state.user;
                            let initialRate = self.state.baseRate;
                            let finalRate;
                            finalRate = initialRate + user.streak * self.state.bonusStreakRate;
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
    //     //HOW TO SPECIFY SCOPE USER SUBS FOR EXTENSION WHEN ONLY ASKING FOR ID
    // isSubbed = () => {
    //     fetch(`https://api.twitch.tv/kraken/channels/${this.state.user.token.channel_id}/subscriptions/${this.state.twitchId}`)
    //         .then((resp) => {
    //             if (resp.user._id === this.state.user.twitchId) {
    //                 this.setState({
    //                     user: {
    //                         isSubbed: true
    //                     }
    //                 });
    //                 update(this.state.twitchId, "isSubbed", true);
    //             } else {
    //                 this.setState({
    //                     user: {
    //                         isSubbed: false
    //                     }
    //                 });
    //                 update(this.state.twitchId, "isSubbed", false);
    //             }
    //         })
    //         .catch(error)
    // }
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
        const styles = {
            panelContainer: {
                width: '320px',
                height: '500px',
                border: '1px solid black',
                display: 'flex',
                flexDirection: 'column'
            },
            panelSongBanner: {
                border: '1px solid black',
                flexGrow: 1,
                flexBasis: '10%'
            },
            panelBody: {
                border: '1px solid black',
                flexGrow: 9,
                flexBasis: '90%',
                display: 'flex'
            },
            panelBodyLeft: {
                borderRight: '1px solid black',
                flexGrow: 1,
                flexBasis: '50%',
                display: 'flex',
                flexDirection: 'column'
            },
            panelBodyRight: {
                flexGrow: 1,
                flexBasis: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly'
            },
            shop: {
                flexGrow: 1,
                flexBasis: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            leaderboard: {
                flexGrow: 1,
                flexBasis: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
            },
            leaderboardContainer: {
                display: 'flex',
                flexDirection: 'column',
                width: '80%',
                height: '80%',
            },
            leaderboardSlot: {
                flexGrow: 1,
                flexBasis: '25%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            bottom: {
                width: '100%',
                height: '3px',
                backgroundColor: 'gray'
            },
            currentPoints: {
                width: '80%',
                height: '90px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            },
            multiplier: {
                width: '80%',
                height: '90px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            },
            djScore: {
                width: '80%',
                height: '90px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            },
            badge: {
                width: '80%',
                height: '90px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            },
            optionsContainer: {
                width: '80%',
                height: '80%',
                marginTop: '40px'
            },
            options: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }
        };
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
                                    <div onClick={this.handleOpenModal}
                                         style={styles.option} className="option">
                                        <h3 style={{fontSize: '30px'}}>Queue a song!</h3>
                                    </div>
                                    <Modal isOpen={this.state.showModal}
                                           onRequestClose={this.handleCloseModal}
                                           contentLabel="Example Modal" >
                                        <Extension />
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
                                {this.state.user.loyaltyRate}x
                                <br />
                                Multiplier
                            </div>
                            <div style={styles.djScore} className="djScore">
                                {this.state.user.djElo}/1000
                                <br />
                                DJ Score
                            </div>
                            <div style={styles.badge} className="badge">
                                8 songs queued
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default App;