import React from 'react';
import Sound from 'react-sound';
import Search from './Search'
import Info from './Info'
import Player from './Player'
import Progress from './Progress'
import Queue from './Queue'
import oauthSignature from 'oauth-signature'
var consumerKey = "7d4vr6cgb392"
var consumerSecret = 'm4ntskavq56rddsa'
var signatureMethod = "HMAC-SHA1"
var oauthVersion = "1.0"
var shopId = "2020"
var streamURL = "https://stream.svc.7digital.net/stream/catalogue"
var apiURL = "http://api.7digital.com/1.2"
var searchType = "/track/search"
var urlKeys = "?shopId=2020&oauth_consumer_key=7d4vr6cgb392&"
var fields = {shopId: "2020", trackId: ""}

// AppContainer class
class AppContainer extends React.Component {
  // AppContainer constructor
  constructor(props) {
    super(props);
    this.state = {
      // What ever is returned, we just need these 3 values
      track: {stream_url: '', artist: '', title: '', album_art: '', id:''},
      playStatus: Sound.status.STOPPED,
      elapsed: '00:00',
      total: '00:00',
      position: 0,
      playFromPosition: 0,
      autoCompleteValue: '',
      tracks: [],
      search: [],
    }
  }
  // MUSIC PLAYER
  // how to handle position of song
  handleSongPlaying(audio) {
    console.log(audio,'d')
    let elapsed = this.formatMilliseconds(audio.position)
    let total = this.formatMilliseconds(audio.duration)
    let position = audio.position / audio.duration
    console.log(elapsed,total,position)

    this.setState({
      elapsed: elapsed,
      total: total,
      position: position
    })
  }

  handleSongFinished () {
    var tracks = this.state.tracks.slice(1)
    fetch('https://900824df.ngrok.io/getqueue')
    .then(res=>res.json())
    .then((json) => {
      console.log(json)
      var queue = json.map((song) => {
        return {title: song.title, id: song.id, artist: song.artist, album_art: song.album_art}
      })
      var tracks = queue.slice(1)
      this.setState({
        tracks: tracks,
      })
      fetch('https://900824df.ngrok.io/remove')
    })
    if (this.state.tracks.length > 0) {
      this.getTrack(this.state.tracks[0])
    } else {
      this.stop()
    }
  }

  // SEARCH BOX
  // handle search selection NEED TO CHANGE
  handleSelect(value, item){
    console.log(item)
    this.setState({ autoCompleteValue: value});
    this.enqueue(item)
    console.log(this.state.tracks)
    if (this.state.tracks.length === 0) {
      this.getTrack(item)
    }
  }

  // handle input box change NEED TO CHANGE
  handleChange(event, value) {
    let search = []
    this.setState({autoCompleteValue: event.target.value});
    let _this = this;
    //Search for song with entered value
    var trackUrl = apiURL + searchType + urlKeys + "q=" + value + "&usageTypes=adsupportedstreaming"
    fetch(trackUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        accept: 'application/json'

      }
    })
    .then(res => res.json())
    .then(json => {
      console.log(json.searchResults)
      if (json.searchResults && json.searchResults.totalItems > 0) {
        if (json.searchResults.totalItems < 5) {
          for (let i = 0; i < json.searchResults.totalItems; i++) {
            var trackId = json.searchResults.searchResult[i].track.id;
            var title = json.searchResults.searchResult[i].track.title;
            var artist = json.searchResults.searchResult[i].track.artist;
            var art = json.searchResults.searchResult[i].track.release.image;
            search = search.concat({title: title, id: trackId, artist: artist.name, album_art: art})
          }
          console.log(search)
          this.setState({
            search: search
          })
        } else {
          for (let i = 0; i < 5; i++) {
            var trackId = json.searchResults.searchResult[i].track.id;
            var title = json.searchResults.searchResult[i].track.title;
            var artist = json.searchResults.searchResult[i].track.artist;
            var art = json.searchResults.searchResult[i].track.release.image;
            search = search.concat({title: title, id: trackId, artist: artist.name, album_art: art})
          }
          console.log(search)
          this.setState({
            search: search
          })
        }
      } else {
        this.setState({
          search: search
        })
      }
    })
  }

  // MORE SOUND STUFF
  // format time
  formatMilliseconds(milliseconds) {
    // Format hours
    var hours = Math.floor(milliseconds / 3600000);
    milliseconds = milliseconds % 3600000;

    // Format minutes
    var minutes = Math.floor(milliseconds / 60000);
    milliseconds = milliseconds % 60000;

    // Format seconds
    var seconds = Math.floor(milliseconds / 1000);
    milliseconds = Math.floor(milliseconds % 1000);

    // Return as string
    return (minutes < 10 ? '0' : '') + minutes + ':' +
    (seconds < 10 ? '0' : '') + seconds;
  }

  prepareOauthUrl(trackId) {
    var randomString = function(length) {
        var text = "";
        var possible = "0123456789";
        for(var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    var parameters = {
        oauth_consumer_key: consumerKey,
        oauth_nonce: randomString(9),
        oauth_timestamp: Math.floor((new Date()).getTime() / 1000),
        oauth_signature_method: "HMAC-SHA1",
        oauth_version: '1.0',
        shopId: '2020',
        trackId: trackId.toString()
    }
    //console.log(parameters.oauth_nonce)
    //console.log(parameters.oauth_timestamp)
    var preppedURL = streamURL + "?oauth_consumer_key=" + consumerKey + "&oauth_nonce=" + parameters.oauth_nonce + "&oauth_signature_method=HMAC-SHA1&oauth_timestamp=" + parameters.oauth_timestamp + "&oauth_version=1.0&shopId=2020&trackId=" + trackId;
    var signature = oauthSignature.generate("GET", streamURL, parameters, consumerSecret)
    return preppedURL + '&oauth_signature=' + signature.toString();
  }
  // need to add fetch request and set the state equal to the result
  getTrack (track) {
    var url = this.prepareOauthUrl(track.id)

    this.setState({
      track: {stream_url: url, title: track.title, album_art: track.album_art, id: track.id, artist: track.artist},
    })
  }

  // changes state based on event trigger
  togglePlay(){

    // Check current playing state
    if(this.state.playStatus === Sound.status.PLAYING){
      // Pause if playing
      this.setState({playStatus: Sound.status.PAUSED})
    } else {
      // Resume if paused
      this.setState({playStatus: Sound.status.PLAYING})
    }
  }

  // stop!
  stop(){
    // Stop sound
   this.setState({playStatus: Sound.status.STOPPED});
  }

  // rewind and fast forward
  forward(){
    this.setState({playFromPosition: this.state.playFromPosition+=1000*10});
  }

  backward(){
    this.setState({playFromPosition: this.state.playFromPosition-=1000*10});
  }

  next() {
    this.handleSongFinished();
  }

  previous () {}

  componentDidMount() {
    setInterval(() => {
      fetch('https://900824df.ngrok.io/getqueue')
      .then(res=>res.json())
      .then((json) => {
        console.log(json)
        var queue = json.map((song) => {
          return {title: song.title, id: song.id, artist: song.artist, album_art: song.album_art}
        })
        console.log(queue)
        this.setState({
          tracks: queue
        })
      })
    }, 1000 * 5)
  }

  enqueue(item) {
    var tracks = this.state.tracks.concat(item)
    fetch('https://900824df.ngrok.io/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'cross-origin', // <- this is mandatory to deal with cookies
      body: JSON.stringify(item),
    })
    .then((resp)=>{
      console.log(resp)
      if(resp.status===200){
        fetch('https://900824df.ngrok.io/getqueue')
        .then(res=>res.json())
        .then((json) => {
          console.log(json)
          var queue = json.map((song) => {
            return {title: song.title, id: song.id, artist: song.artist, album_art: song.album_art}
          })
          console.log(queue)
          this.setState({
            tracks: queue
          })
        })
      } else {
        throw "The queue did not work, please try again."
      }
    })
    console.log(this.state.tracks)
  }

  enlarge(url){
    var arr = url.split('_');
    console.log(arr)
    var enlarged = arr[0] + '_350.jpg'
    console.log(enlarged)
    return enlarged
  }

  // Render method
  render () {
    var albumArt = {
      width: '700px',
      height: '700px',
      backgroundImage: `linear-gradient(
        rgba(0, 0, 0, 0.7),
        rgba(0, 0, 0, 0.7)
      ), url(${this.enlarge(this.state.track.album_art)})`
    }
    return (
      <div className="turntable" style={albumArt}>
        <Search
          autoCompleteValue={this.state.autoCompleteValue}
          tracks={this.state.search}
          handleSelect={this.handleSelect.bind(this)}
          handleChange={this.handleChange.bind(this)}
        />
        <Info
          artist={this.state.track.artist}
          title={this.state.track.title}
        />
        <Player
          togglePlay={this.togglePlay.bind(this)}
          stop={this.stop.bind(this)}
          playStatus={this.state.playStatus}
          forward={this.forward.bind(this)}
          backward={this.backward.bind(this)}
          previous={this.previous.bind(this)}
          next={this.next.bind(this)}
          random={this.getTrack.bind(this)}
        />
        <Progress
          elapsed={this.state.elapsed}
          total={this.state.total}
          position={this.state.position}
        />
        <Queue
          queue={this.state.tracks}
        />
        <Sound
         url={this.state.track.stream_url}
         playStatus={this.state.playStatus}
         onPlaying={this.handleSongPlaying.bind(this)}
         playFromPosition={this.state.playFromPosition}
         onFinishedPlaying={this.handleSongFinished.bind(this)}
        />
      </div>
    );
  }
}

// Export AppContainer Component
export default AppContainer
