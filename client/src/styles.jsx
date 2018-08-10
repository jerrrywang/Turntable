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
        borderRight: '1px solid black',
        flexGrow: 1,
        flexBasis: '50%',
        display: 'flex',
        flexDirection: 'column'
    },
    panelBodyRight: {
        flexGrow: 1,
        flexBasis: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    shop: {
        flexGrow: 1,
        flexBasis: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    leaderboard: {
        flexGrow: 1,
        flexBasis: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '18px'
    },
    leaderboardContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '80%',
        height: '80%',
    },
    leaderboardSlot: {
        flexGrow: 1,
        flexBasis: '25%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottom: {
        width: '100%',
        height: '3px',
        backgroundColor: 'gray'
    },
    currentPoints: {
        width: '80%',
        height: '90px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    multiplier: {
        width: '80%',
        height: '90px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    djScore: {
        width: '80%',
        height: '90px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    badge: {
        width: '80%',
        height: '90px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionsContainer: {
        width: '80%',
        height: '80%',
        marginTop: '40px'
    },
    options: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
};

export default styles;