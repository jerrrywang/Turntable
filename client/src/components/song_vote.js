import React, {Component} from 'react';

export default class Banner extends Component {
  constructor(props){
    super(props);
  }

// nowPlaying: coverArt, title, artist
// up/down vote
// vote % results
//after downvote or upvote we want to dispay live voting %
  render(){
    return (<div style={{border: '1px solid black', display: 'flex', }}>
      <img src={this.props.nowPlaying.coverArt} height='80' width='80'/>
      <div>
        <h3>{this.props.nowPlaying.artist}</h3>
        <span>{this.props.nowPlaying.title}</span>
      </div>
      <button type='submit' onClick={this.props.upvote}>▲</button>
      <button type='submit' onClick={this.props.downvote}>▼</button>
      <span>{this.props.vote}</span>
    </div>)
  }
}
