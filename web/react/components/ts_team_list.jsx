const UserStore = require('../stores/user_store.jsx');
const ChannelStore = require('../stores/channel_store.jsx');
const BrowserStore = require('../stores/browser_store.jsx');


var AsyncClient = require('../utils/async_client.jsx');
var Client = require('../utils/client.jsx');


export default class TsTeamList extends React.Component {
    constructor(props) {
        super(props);

        this.getStateFromStores = this.getStateFromStores.bind(this);
        this.onTeamsChange = this.onTeamsChange.bind(this);
        this.updateUnreadMessages = this.updateUnreadMessages.bind(this);
        this.logout = this.logout.bind(this);

        this.state = this.getStateFromStores();
    }

    updateUnreadMessages() {
        let currentUser = UserStore.getCurrentUser();

        if (!currentUser || !currentUser.email) {
            return;
        }
        Client.getChannelsByEmail(currentUser.email,
            (ret) => {
                let channels = ret.channels;
                let members = ret.members;
                let teams = this.state.teams || [];
                for (var i = 0; i < teams.length; i++) {
                    let team = teams[i];
                    team.unread_count = 0;
                    let channelsInTeam = [];
                    for (var j = 0; j < channels.length; j++) {
                        let channel = channels[j];
                        if (channel.team_id === team.id) {
                            let channelMember = members[channel.id];
                            if (channelMember) {
                                let unreadInChannel = channel.total_msg_count - channelMember.msg_count;
                                team.unread_count += unreadInChannel;
                            }
                        }
                    }
                }
                this.setState({teams});
            } ,
            (err) => {
            }
        );
    }

    logout(e) {
        e.preventDefault();
        BrowserStore.clear();

        if (this.state.teams.length > 0) {
            let teamName = this.state.teams[0].name;
            let baseUrl = window.location.href.replace(/\/$/, '');
            let logoutUrl = baseUrl + '/' + teamName + '/logout';
            window.location.href = logoutUrl;
        }
    }

    componentDidMount() {
        UserStore.addTeamsChangeListener(this.onTeamsChange);
        AsyncClient.findTeams();

        this.updateUnreadMessages();
        setInterval(this.updateUnreadMessages, 60000)
    }

    onTeamsChange() {
        let state = this.getStateFromStores();

        if (state.teams.length === 1) {
            let channelPath = '/' + state.teams[0].name;
            window.location = channelPath;
        }

        this.setState(state);
    }

    getStateFromStores() {
        let teams = [];
        let teamsObject = UserStore.getTeams();
        for (let teamId in teamsObject) {
            if (teamsObject.hasOwnProperty(teamId)) {
                teams.push(teamsObject[teamId])
            }
        }

        teams.sort(function (teamA, teamB) {
            let teamADisplayName = teamA.display_name.toLowerCase();
            let teamBDisplayName = teamB.display_name.toLowerCase();
            if (teamADisplayName < teamBDisplayName) {
                return -1
            } else if (teamADisplayName > teamBDisplayName) {
                return 1;
            } else {
                return 0;
            }
        });

        const members = ChannelStore.getAllMembers();
        const channels = ChannelStore.getAll();

        return {
            teams,
            members,
            channels
        };
    }

    render() {
        const teams = this.state.teams;

        const teamButtons = teams.map((team) => {
            let unread = '';
            if (team.unread_count) {
                unread = (
                    <strong>
                        {'(' + team.unread_count + ')'}
                    </strong>
                );
            }
            const teamButton = (
                <p key={team.name}>
                    <a className="btn btn-primary btn-lg" href={'/' + team.name}>
                        {team.display_name} {unread}
                        &nbsp;<span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                    </a>
                </p>
            );
            return teamButton;
        });

        return (
            <div>
                <h3>Valitse asiakas:</h3>
                <div>
                    {teamButtons}
                </div>
                <div
                    className="btn-group"
                    style={{marginTop: '4em', marginBottom: '1em'}}>
                        <button
                            className='btn btn-danger'
                            onClick={this.logout}
                        >
                            Kirjaudu ulos
                        </button>
                </div>
            </div>
        );
    }
}
