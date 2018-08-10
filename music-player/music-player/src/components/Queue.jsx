import React from 'react';

class Queue extends React.Component {
  constructor(props) {
    super(props)
  }
  list() {
    const songs = this.props.queue.map((song) => {
      return (
        <div>
          {song.title}
        </div>
      )
    })
    return songs
  }
  render() {
    return (
      <div className="queue">
        <h3>Queue</h3>
        <div>
          {this.list()}
        </div>
      </div>
    )
  }
}

export default Queue
