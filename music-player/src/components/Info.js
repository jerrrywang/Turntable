import React from 'react';

class Info extends React.Component {
  // Render
  render(){
    return(
      <div className="details">
        <h3>{this.props.artist}</h3>
        <h3>{this.props.title}</h3>
      </div>
    )
  }

}
// Export
export default Info
