// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

var Client = require('../utils/client.jsx');
var BrowserStore = require('../stores/browser_store.jsx');
var UserStore = require('../stores/user_store.jsx');

export default class TeamSignupPasswordPage extends React.Component {
    constructor(props) {
        super(props);

        this.submitBack = this.submitBack.bind(this);
        this.submitNext = this.submitNext.bind(this);

        this.state = {};
    }
    submitBack(e) {
        e.preventDefault();
        this.props.state.wizard = 'username';
        this.props.updateParent(this.props.state);
    }
    submitNext(e) {
        e.preventDefault();

        var password = React.findDOMNode(this.refs.password).value.trim();
        if (!password || password.length < 5) {
            this.setState({passwordError: 'Syötä vähintään 5 merkkiä'});
            return;
        }

        this.setState({passwordError: null, serverError: null});
        $('#finish-button').button('loading');
        var teamSignup = JSON.parse(JSON.stringify(this.props.state));
        teamSignup.user.password = password;
        teamSignup.user.allow_marketing = true;
        delete teamSignup.wizard;

        Client.createTeamFromSignup(teamSignup,
            function success() {
                Client.track('signup', 'signup_team_08_complete');

                var props = this.props;

                Client.loginByEmail(teamSignup.team.name, teamSignup.team.email, teamSignup.user.password,
                    function loginSuccess(data) {
                        UserStore.setLastEmail(teamSignup.team.email);
                        UserStore.setCurrentUser(data);
                        if (this.props.hash > 0) {
                            BrowserStore.setGlobalItem(this.props.hash, JSON.stringify({wizard: 'finished'}));
                        }

                        $('#sign-up-button').button('reset');
                        props.state.wizard = 'finished';
                        props.updateParent(props.state, true);

                        window.location.href = '/' + teamSignup.team.name + '/channels/town-square';
                    }.bind(this),
                    function loginFail(err) {
                        if (err.message === 'Login failed because email address has not been verified') {
                            window.location.href = '/verify_email?email=' + encodeURIComponent(teamSignup.team.email) + '&teamname=' + encodeURIComponent(teamSignup.team.name);
                        } else {
                            this.setState({serverError: err.message});
                            $('#finish-button').button('reset');
                        }
                    }.bind(this)
                );
            }.bind(this),
            function error(err) {
                this.setState({serverError: err.message});
                $('#finish-button').button('reset');
            }.bind(this)
        );
    }
    render() {
        Client.track('signup', 'signup_team_07_password');

        var passwordError = null;
        var passwordDivStyle = 'form-group';
        if (this.state.passwordError) {
            passwordError = <div className='form-group has-error'><label className='control-label'>{this.state.passwordError}</label></div>;
            passwordDivStyle = ' has-error';
        }

        var serverError = null;
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        return (
            <div>
                <form>
                    <img
                        className='signup-team-logo'
                        src='/static/images/logo.png'
                    />
                    <h2 className='margin--less'>Salasanasi</h2>
                    <h5 className='color--light'>Valitse salasana jota käytät kirjautuessasi:</h5>
                    <div className='inner__content margin--extra'>
                        <h5><strong>Sähköposti</strong></h5>
                        <div className='block--gray form-group'>{this.props.state.team.email}</div>
                        <div className={passwordDivStyle}>
                            <div className='row'>
                                <div className='col-sm-11'>
                                    <h5><strong>Valitse salasanasi</strong></h5>
                                    <input
                                        autoFocus={true}
                                        type='password'
                                        ref='password'
                                        className='form-control'
                                        placeholder=''
                                        maxLength='128'
                                        spellCheck='false'
                                    />
                                    <span className='color--light help-block'>Salasanan pitää olla 5-50 merkkiä pitkä. Turvallinen salasana sisältää numeroita, erikoismerkkejä sekä isoja ja pieniä kirjaimia.</span>
                                </div>
                            </div>
                            {passwordError}
                            {serverError}
                        </div>
                    </div>
                    <div className='form-group'>
                        <button
                            type='submit'
                            className='btn btn-primary margin--extra'
                            id='finish-button'
                            data-loading-text={'<span class=\'glyphicon glyphicon-refresh glyphicon-refresh-animate\'></span> Luodaan tiimiä...'}
                            onClick={this.submitNext}
                        >
                            Valmis
                        </button>
                    </div>
                    <p>Luomalla tilin palveluun {global.window.config.SiteName} hyväksyt <a href='/static/help/terms.html'>käyttöehdot</a> ja <a href='/static/help/privacy.html'>yksityisyyskäytännöt</a>. Jos et hyväksy näitä, et saa käyttää {global.window.config.SiteName}-palvelua.</p>
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

TeamSignupPasswordPage.defaultProps = {
    state: {},
    hash: ''
};
TeamSignupPasswordPage.propTypes = {
    state: React.PropTypes.object,
    hash: React.PropTypes.string,
    updateParent: React.PropTypes.func
};
