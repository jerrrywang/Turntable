import React, {Component} from 'react';

export class Leaderboard extends Component {
  constructor(props){
    super(props);
    this.state = {
      users: null
    }
  }

componentDidMount() {
  
}

  runder() {
    return (
      <div>
        {.sort(function(a,b){b-a})}
      </div>
    )
  }
}
