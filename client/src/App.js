import React, {Component} from 'react';
import './App.css';
const ngrok = "https://81139028.ngrok.io";

const update = (user_id, type, toBeUpdated) => {
    fetch(`${ngrok}/update`, {
        method: 'POST',
        body: {
            user_id,
            type,
            toBeUpdated
        }
    })
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            twitchId: null,
            isEarly: false,
            baseRate: 5, //per min, 300 per hour
            bonusSubRate: 5,
            bonusStreakRate: 1, //increases per hour watched
            queuePrice: 200,
            genrePrice: 350,
            started: false
        }
    }

    componentDidMount() {
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
            }).then(resp => {
                this.setState({user: resp, twitchId: resp.twitchId}, () => {
                    let user = this.state.user;
                    //ON MINUTE LOYALTY
                    setInterval(function() { //also should be a setTimeout with anonymous function
                        let initialRate = this.state.baseRate;
                        let finalRate;
                        let loyaltyRate;
                        finalRate = initialRate + user.streak * this.state.bonusStreakRate;
                        update(this.state.twitchId, "loyaltyRate", finalRate);
                        update(this.state.twitchId, "currentLoyalty", user.currentLoyalty + user.loyaltyRate);

                        this.setState({
                            user: {
                                loyaltyRate: finalRate
                            }
                        });

                        this.setState({
                            user: {
                                currentLoyalty: user.currentLoyalty + user.loyaltyRate
                            }
                        });

                        this.setState({
                            user: {
                                totalLoyalty: user.totalLoyalty + user.loyaltyRate
                            }
                        });
                        update(this.state.twitchId, "totalLoyalty", user.totalLoyalty + user.loyaltyRate);
                    }, 1000 * 60)


                });
            }).then
                .catch(err => console.log(err))
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
    updateLoyaltyRate = () => {
        let user = this.state.user;
        let initialRate = this.state.baseRate;
        let finalRate;
        // if (user.isSubbed) {
        //     finalRate = initialRate + this.state.bonusSubRate + user.streak * this.state.bonusStreakRate
        //     this.setState({
        //         user: {
        //             loyaltyRate: finalRate
        //         }
        //     });
        //     update(this.state.twitchId, "loyaltyRate", finalRate);
        // } else {
            finalRate = initialRate + user.streak * this.state.bonusStreakRate;
            this.setState({
                user: {
                    loyaltyRate: finalRate
                }
            });
            update(this.state.twitchId, "loyaltyRate", finalRate);
        // }

    };
    //
    updateStreak = () => { //probably should change to setTimeout with an anonymous function but idk how to
        setInterval(function() {
            this.setState({
                user: {
                    streak: this.state.user.streak + 1
                }
            });
            update(this.state.twitchId, "streak", this.state.user.streak + 1);
            let user = this.state.user;
            let initialRate = this.state.baseRate;
            let finalRate;
            finalRate = initialRate + user.streak * this.state.bonusStreakRate;
            this.setState({
                user: {
                    loyaltyRate: finalRate
                }
            });
            update(this.state.twitchId, "loyaltyRate", finalRate);
        }, 1000 * 60 * 60)
    };

    onMinuteLoyalty = () => { //adds loyaltyRate to total and current loyalty every minute
        let user = this.state.user;
        setInterval(function() { //also should be a setTimeout with anonymous function
            let initialRate = this.state.baseRate;
            let finalRate;
            finalRate = initialRate + user.streak * this.state.bonusStreakRate;
            this.setState({
                user: {
                    loyaltyRate: finalRate
                }
            });
            update(this.state.twitchId, "loyaltyRate", finalRate);
            this.setState({
                user: {
                    currentLoyalty: user.currentLoyalty + user.loyaltyRate
                }
            });
            update(this.state.twitchId, "currentLoyalty", user.currentLoyalty + user.loyaltyRate);
            this.setState({
                user: {
                    totalLoyalty: user.totalLoyalty + user.loyaltyRate
                }
            });
            update(this.state.twitchId, "totalLoyalty", user.totalLoyalty + user.loyaltyRate);
        }, 1000 * 60)
    };
    //
    onVote = () => {
        this.setState({
            user: {
                currentLoyalty: this.state.user.currentLoyalty + 10
            }
        });
        update(this.state.twitchId, "currentLoyalty", this.state.user.currentLoyalty + 10);
        this.setState({
            user: {
                totalLoyalty: this.state.user.currentLoyalty + 10
            }
        });
        update(this.state.twitchId, "totalLoyalty", this.state.user.currentLoyalty + 10);
    }
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
    start = () => {
        if (!this.state.started) {
            this.onMinuteLoyalty();
            this.updateStreak();
            this.setState({started: true})
        }
    };

    render() {
        this.start();
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
                border: '1px solid black',
                flexGrow: 1,
                flexBasis: '50%',
                display: 'flex',
                flexDirection: 'column'
            },
            panelBodyRight: {
                border: '1px solid black',
                flexGrow: 1,
                flexBasis: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly'
            },
            shop: {
                border: '1px solid black',
                flexGrow: 1,
                flexBasis: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            leaderboard: {
                border: '1px solid black',
                flexGrow: 1
            },
            leaderboardContainer: {
                border: '1px solid black',
                display: 'flex',
                flexDirection: 'column',
                width: '80%',
            },

            leaderboardSlot: {
                flexGrow: 1,
                flexBasis: '25%',
                border: '1px solid black',
                display: 'flex'
            },
            bottom: {
                width: '100%',
                height: '3px',
                backgroundColor: 'gray'
            },
            currentPoints: {
                width: '80%',
                height: '90px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            },
            multiplier: {
                width: '80%',
                height: '90px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            },
            djScore: {
                width: '80%',
                height: '90px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            },
            badge: {
                width: '80%',
                height: '90px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            },
            optionsContainer: {
                width: '80%',
                height: '80%',

            },
            options: {

            }
        }
        return (
            <div className="App">
                <div style={styles.panelContainer} className="panelContainer">
                    <div style={styles.panelSongBanner} className="panelSongBanner">
                        <button onClick={this.onVote}>Like</button>
                        <button onClick={this.onVote}>Dislike</button>
                    </div>
                    <div style={styles.panelBody} className="panelBody">
                        <div style={styles.panelBodyLeft} className="panelBodyLeft">
                            <div style={styles.shop} className="shop">
                                <div style={styles.optionsContainer} className="optionsContainer">
                                    <div style={styles.option} className="option">Queue a song</div>
                                    <div style={styles.option} className="option">Buy a badge</div>
                                </div>
                            </div>
                            <div style={styles.leaderboard} className="leaderboard">
                                <div style={styles.leaderboardContainer} className="leaderboardContainer">
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
                                </div>

                            </div>
                        </div>
                        <div style={styles.panelBodyRight} className="panelBodyRight">
                            <div style={styles.currentPoints} className="currentPoints">
                                90
                                <br />
                                Current points
                            </div>
                            <div style={styles.multiplier} className="multiplier">
                                2.3x
                                <br />
                                Multiplier
                            </div>
                            <div style={styles.djScore} className="djScore">
                                875/1000
                                <br />
                                DJ Score
                            </div>
                            <div style={styles.badge} className="badge">
                                BADGE IMG
                                {this.state.twitchId}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
