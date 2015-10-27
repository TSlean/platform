const UserStore = require('../stores/user_store.jsx');

var AsyncClient = require('../utils/async_client.jsx');

export default class TsTeamList extends React.Component {
    constructor(props) {
        super(props);

        this.getStateFromStores = this.getStateFromStores.bind(this);
        this.onTeamsChange = this.onTeamsChange.bind(this);

        this.state = this.getStateFromStores();
    }

    componentDidMount() {
        UserStore.addTeamsChangeListener(this.onTeamsChange);
        AsyncClient.findTeams();
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

        return {teams};
    }

    render() {
        const teams = this.state.teams;

        const teamButtons = teams.map((team) => {
            const teamButton = (
                <p key={team.name}>
                    <a className="btn btn-primary btn-lg" href={'/' + team.name}>
                        {team.display_name}
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

            </div>
        );
    }
}
