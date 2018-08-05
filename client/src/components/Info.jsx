import React from 'react';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }
}
class Info extends React.Component {
    // Render
    render(){
        return(
            <div style={styles.container} className="details">
                <h2>Now playing:</h2>
                <h3>{this.props.artist}</h3>
                <h3>{this.props.title}</h3>
            </div>
        )
    }

}
// Export
export default Info