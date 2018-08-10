import React from 'react'
import Search from './Search'
import Info from './Info'
import Queue from './Queue'
import oauthSignature from 'oauth-signature'
var consumerKey = process.env.CONSUMER_KEY;
var consumerSecret = process.env.CONSUMER_SECRET;
var signatureMethod = "HMAC-SHA1"
var oauthVersion = "1.0"
var shopId = "2020"
var streamURL = "https://stream.svc.7digital.net/stream/catalogue"
var apiURL = "https://api.7digital.com/1.2"
var searchType = "/track/search"
var urlKeys = "?shopId=2020&oauth_consumer_key=7d4vr6cgb392&"
var fields = {shopId: "2020", trackId: ""}
const ngrok = "https://900824df.ngrok.io";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }
}

class SongModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // What ever is returned, we just need these 3 values
            track: {
                stream_url: 'none',
                title: 'Stronger',
                artwork_url: 'http://artwork-cdn.7static.com/static/img/sleeveart/00/004/056/0000405628_350.jpg',
                id:'none',
                artist: 'Kanye West'},
            autoCompleteValue: '',
            tracks: [],
            search: [],
        }
    }

    handleSelect(value, item){
        this.setState({ autoCompleteValue: value});
        this.enqueue(item);
        if (this.state.tracks.length === 0) {
            this.getTrack(item);
        }
        this.props.song();
        this.props.spend();
    }

    // handle input box change NEED TO CHANGE
    handleChange(event, value) {
        let search = [];
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
            track: {stream_url: url, title: track.title, artwork_url: track.album_art, id: track.id, artist: track.artist},
        }, () => {
            this.props.nowPlaying(this.state.track.artwork_url, this.state.track.artist, this.state.track.title);
        })
    }

    enqueue(item) {
        var tracks = this.state.tracks.concat(item);
        fetch(`${ngrok}/queue`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        })
            .then((resp)=>{
                console.log(resp)
                if(resp.status===200){
                    fetch(`${ngrok}/getqueue`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(res=>res.json())
                        .then((json) => {
                            console.log('json', json)
                            var queue = json.map((song) => {
                                return {title: song.title, id: song.id, artist: song.artist, album_art: song.album_art}
                            })
                            this.setState({
                                tracks: queue
                            })
                        })
                        .catch(err => console.log(err))
                } else {
                    throw "The queue did not work, please try again."
                }
            })
    }

    componentDidMount() {
        fetch(`${ngrok}/getqueue`)
            .then(res=>res.json())
            .then((json) => {
                var queue = json.map((song) => {
                    return {title: song.title, id: song.id, artist: song.artist, album_art: song.album_art}
                })
                this.setState({
                    tracks: queue,
                    track: queue[0]
                })
            })
    }

    render() {
        return (
            <div style={styles.container}>
                <Search
                    autoCompleteValue={this.state.autoCompleteValue}
                    tracks={this.state.search}
                    handleSelect={this.handleSelect.bind(this)}
                    handleChange={this.handleChange.bind(this)}
                />
                <Info
                    title={this.state.track ? this.state.track.title : 'Stronger'}
                    artist={this.state.track ? this.state.track.artist : 'Kanye West'}
                />
                <Queue
                    queue={this.state.tracks}
                />
            </div>
        )
    }
}

export default SongModal