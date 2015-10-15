// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

var Utils = require('../utils/utils.jsx');
var Client = require('../utils/client.jsx');

export default class TeamSignupUsernamePage extends React.Component {
    constructor(props) {
        super(props);

        this.submitBack = this.submitBack.bind(this);
        this.submitNext = this.submitNext.bind(this);

        this.state = {};
    }
    submitBack(e) {
        e.preventDefault();
        this.props.state.wizard = 'send_invites';
        this.props.updateParent(this.props.state);
    }
    submitNext(e) {
        e.preventDefault();

        var name = React.findDOMNode(this.refs.name).value.trim().toLowerCase();

        var usernameError = Utils.isValidUsername(name);
        if (usernameError === 'Cannot use a reserved word as a username.') {
            this.setState({nameError: 'Tämä käyttänimi on käytössä. Valitse uusi.'});
            return;
        } else if (usernameError) {
            this.setState({nameError: 'Käyttäjänimen pitää alkaa kirjaimella, sisältää 3-15 merkkiä ja se voi koostua kirjaimista, numeroista sekä merkeistä  \'.\', \'-\', ja \'_\''});
            return;
        }

        this.props.state.wizard = 'password';
        this.props.state.user.username = name;
        this.props.updateParent(this.props.state);
    }
    render() {
        Client.track('signup', 'signup_team_06_username');

        var nameError = null;
        var nameDivClass = 'form-group';
        if (this.state.nameError) {
            nameError = <label className='control-label'>{this.state.nameError}</label>;
            nameDivClass += ' has-error';
        }

        return (
            <div>
                <form>
                    <img
                        className='signup-team-logo'
                        src='/static/images/logo.png'
                    />
                    <h2 className='margin--less'>Käyttäjänimesi</h2>
                    <h5 className='color--light'>{'Valitse helposti muistettava käyttäjänimi, josta muut tiimiläiset voivat tunnistaa sinut:'}</h5>
                    <div className='inner__content margin--extra'>
                        <div className={nameDivClass}>
                            <div className='row'>
                                <div className='col-sm-11'>
                                    <h5><strong>Valitse käyttäjänimesi</strong></h5>
                                    <input
                                        autoFocus={true}
                                        type='text'
                                        ref='name'
                                        className='form-control'
                                        placeholder=''
                                        defaultValue={this.props.state.user.username}
                                        maxLength='128'
                                        spellCheck='false'
                                    />
                                    <span className='color--light help-block'>Käyttäjänimen pitää alkaa kirjaimella, sisältää 3-15 merkkiä ja se voi koostua kirjaimista, numeroista sekä merkeistä '.', '-' ja '_'</span>
                                </div>
                            </div>
                            {nameError}
                        </div>
                    </div>
                    <button
                        type='submit'
                        className='btn btn-primary margin--extra'
                        onClick={this.submitNext}
                    >
                        Seuraava
                        <i className='glyphicon glyphicon-chevron-right'></i>
                    </button>
                    <div className='margin--extra'>
                        <a
                            href='#'
                            onClick={this.submitBack}
                        >
                            Takaisin
                        </a>
                    </div>
                </form>
            </div>
        );
    }
}

TeamSignupUsernamePage.defaultProps = {
    state: null
};
TeamSignupUsernamePage.propTypes = {
    state: React.PropTypes.object,
    updateParent: React.PropTypes.func
};
