import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import User from '../../server/models/user.js'
import mongoose from 'mongoose'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isEarly: true,
      baseRate: 5, //per min, 300 per hour
      bonusSubRate: 5,
      bonusStreakRate: 1, //increases per hour watched
      queuePrice: 200,
      genrePrice: 350,
      channelId: null, //NEED TO GET CHANNEL ID ONMOUNT
    }
  }




  getChannelId = () => {

  }

  findUser = (id) => {
    User.findOne({twitchId: id}).then((user) => {
      if (user) {
        this.setState({user: user})
      } else {
        console.log('MERGE ACCOUNT')
      }
    })
  };

  isEarly = () => { //SUDO CODE AHEAD
    //get stream start time from twitch API
      .then((streamStats) => {
      const startTime = streamStats.startTime //save as a var
      return startTime
    }).then((startTime) => {
      if (new Date() - startTime > 1000 * 60 * 60) { //one hour (we can scale this)
        this.setState({isEarly: false})
      } else {
        this.setState({isEarly: true})
      }
    })
  }

  isSubbed = () => {
  fetch(`https://api.twitch.tv/kraken/channels/${this.state.channelId}/subscriptions/${this.state.user.twitchId}`)
      .then((resp) => {
      resp.user._id === this.state.user.twitchId //Probably an uncessesary check
        ? this.setState({
          user: {
            isSubbed: true
          }
        })
        : this.setState({
          user: {
            isSubbed: false
          }
        })
    })
    .catch(error)
  }

  updateLoyaltyRate = () => {
    let user = this.state.user
    let initialRate = this.state.baseRate
    let finalRate;
    if (user.isSubbed) {
      finalRate = initialRate + this.state.bonusSubRate + user.streak * this.state.bonusStreakRate
      this.setState({
        user: {
          loyaltyRate: finalRate
        }
      })
    } else {
      finalRate = initialrate + user.streak * this.state.bonusStreakRate
      this.setState({
        user: {
          loyaltyRate: finalRate
        }
      })
    }
  }

  updateStreak = () => { //probably should change to setTimeout with an anonymous function but idk how to
    setInterval(function() {
      this.setState({
        user: {
          streak: this.state.user.streak + 1
        }
      })
      updateLoyaltyRate()
    }, 1000 * 60 * 60)
  }

  onMinuteLoyalty = () => { //adds loyaltyRate to total and current loyalty every minute
    let user = this.state.user
    setInterval(function() { //also should be a setTimeout with anonymous function
      updateLoyaltyRate()
      this.setState({
        user: {
          currentLoyalty: user.currentLoyalty + user.loyaltyRate
        }
      })
      this.setState({
        user: {
          totalLoyalty: user.totalLoyalty + user.loyaltyRate
        }
      })
    }, 1000 * 60)
  }

  onVote = () => {
    e.preventDefault();
    this.setState({
      user: {
        currentLoyalty: this.state.user.currentLoyalty + 10
      }
    })
    this.setState({
      user: {
        totalLoyalty: this.state.user.currentLoyalty + 10
      }
    })
  }

  onBits = (data) => {
    //GET https://api.twitch.tv/kraken/channel // this IS A LISTENER
    //.then(resp => {channel-bits-events-v1.resp._id})
    User.findOne({twitchId: data.user_id})
    .then((user) => {
      if(user) {
        user.currentLoyalty = 'current + bits*.1' //if i find by userId and then update the user object in Mongo, the state wont update for the user, how do i do this
        user.totalLoyalty = 'total + bits*.1'
      }
    })
    this.setState({
      user: {
        currentLoyalty: this.state.user.currentLoyalty //scale off bits
      }
    })
  }

  //Todo ADD GLOBAL FUNCTIONALITY (see model)
  //PubSubs for onSub, onBits
  //Buy functions
  //refund currency on leave/voted off
  //update djElo
  //Frontend
  //add catch


  render() {
    return (<div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <h1 className="App-title">Welcome to React</h1>
      </header>
      <p className="App-intro">
        To get started, edit
        <code>src/App.js</code>
        and save to reload.
      </p>
    </div>);
  }
}

export default App;
