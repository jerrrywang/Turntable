import React, {Component} from 'react';

export default class Leaderboard extends Component {
  // constructor(props){
  //   super(props);
  //   this.state = {
  //     users: null
  //   }
  // }

  //top 5 users by totalPoints
  //current user's rank

  render() {
    console.log('LEADERBOARD: ', this.props.leaderboard)
    return (<div styles={{
        border: '1px solid black'
      }}>
      <ol>
        {
          this.props.leaderboard.map((leader) => {
            for (var key in leader) {
              console.log(leader[key]['user'])
              return (<li>
                {leader[key]['user']}
                <br/> {key}
              </li>)
            }

          })
        }
      </ol>
    </div>)
  }
}
