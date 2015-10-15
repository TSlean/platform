// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

const Utils = require('../utils/utils.jsx');
const Client = require('../utils/client.jsx');
const UserStore = require('../stores/user_store.jsx');
const BrowserStore = require('../stores/browser_store.jsx');

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {};
    }
    handleSubmit(e) {
        e.preventDefault();
        let state = {};

        const name = this.props.teamName;
        if (!name) {
            state.serverError = 'Virheellinen tiimin nimi';
            this.setState(state);
            return;
        }

        const email = React.findDOMNode(this.refs.email).value.trim();
        if (!email) {
            state.serverError = 'Sähköposti on pakollinen tieto';
            this.setState(state);
            return;
        }

        const password = React.findDOMNode(this.refs.password).value.trim();
        if (!password) {
            state.serverError = 'Salasana on pakollinen tieto';
            this.setState(state);
            return;
        }

        if (!BrowserStore.isLocalStorageSupported()) {
            state.serverError = 'Tätä palvelua ei voi käyttää selaimen yksityistilassa (Yksityinen Selailu/Private Mode/Incognito). Käytä selainta normaalitilassa.';
            this.setState(state);
            return;
        }

        state.serverError = '';
        this.setState(state);

        Client.loginByEmail(name, email, password,
            function loggedIn(data) {
                UserStore.setCurrentUser(data);
                UserStore.setLastEmail(email);

                const redirect = Utils.getUrlParameter('redirect');
                if (redirect) {
                    window.location.href = decodeURIComponent(redirect);
                } else {
                    window.location.href = '/' + name + '/channels/town-square';
                }
            },
            function loginFailed(err) {
                if (err.message === 'Login failed because email address has not been verified') {
                    window.location.href = '/verify_email?teamname=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email);
                    return;
                }
                state.serverError = err.message;
                this.valid = false;
                this.setState(state);
            }.bind(this)
        );
    }
    render() {
        let serverError;
        if (this.state.serverError) {
            serverError = <label className='control-label'>{this.state.serverError}</label>;
        }
        let priorEmail = UserStore.getLastEmail();

        const emailParam = Utils.getUrlParameter('email');
        if (emailParam) {
            priorEmail = decodeURIComponent(emailParam);
        }

        const teamDisplayName = this.props.teamDisplayName;
        const teamName = this.props.teamName;

        let focusEmail = false;
        let focusPassword = false;
        if (priorEmail === '') {
            focusEmail = true;
        } else {
            focusPassword = true;
        }

        let loginMessage = [];
        if (global.window.config.EnableSignUpWithGitLab === 'true') {
            loginMessage.push(
                    <a
                        className='btn btn-custom-login gitlab'
                        href={'/' + teamName + '/login/gitlab'}
                    >
                        <span className='icon' />
                        <span>GitLab</span>
                    </a>
           );
        }

        let errorClass = '';
        if (serverError) {
            errorClass = ' has-error';
        }

        const verifiedParam = Utils.getUrlParameter('verified');
        let verifiedBox = '';
        if (verifiedParam) {
            verifiedBox = (
                <div className='alert alert-success'>
                    <i className='fa fa-check' />
                    {' Email Verified'}
                </div>
            );
        }

        let emailSignup;
        if (global.window.config.EnableSignUpWithEmail === 'true') {
            emailSignup = (
                <div>
                    <div className={'form-group' + errorClass}>
                        <input
                            autoFocus={focusEmail}
                            type='email'
                            className='form-control'
                            name='email'
                            defaultValue={priorEmail}
                            ref='email'
                            placeholder='Sähköposti'
                            spellCheck='false'
                        />
                    </div>
                    <div className={'form-group' + errorClass}>
                        <input
                            autoFocus={focusPassword}
                            type='password'
                            className='form-control'
                            name='password'
                            ref='password'
                            placeholder='Salasana'
                            spellCheck='false'
                        />
                    </div>
                    <div className='form-group'>
                        <button
                            type='submit'
                            className='btn btn-primary'
                        >
                            Kirjaudu sisään
                        </button>
                    </div>
                </div>
            );
        }

        if (loginMessage.length > 0 && emailSignup) {
            loginMessage = (
                <div>
                    {loginMessage}
                    <div className='or__container'>
                        <span>tai</span>
                    </div>
                </div>
            );
        }

        let forgotPassword;
        if (emailSignup) {
            forgotPassword = (
                <div className='form-group'>
                    <a href={'/' + teamName + '/reset_password'}>Unohtuiko salasana?</a>
                </div>
            );
        }

        return (
            <div className='signup-team__container'>
                <h5 className='margin--less'>Kirjaudu</h5>
                <h2 className='signup-team__name'>{teamDisplayName}</h2>
                <h2 className='signup-team__subdomain'>{global.window.config.SiteName}</h2>
                <form onSubmit={this.handleSubmit}>
                    {verifiedBox}
                    <div className={'form-group' + errorClass}>
                        {serverError}
                    </div>
                    {loginMessage}
                    {emailSignup}
                    <div className='form-group margin--extra form-group--small'>
                        <span><a href='/find_team'>{'Etsi muita tiimejä'}</a></span>
                    </div>
                    {forgotPassword}
                    <div className='margin--extra'>
                        <span>{'Haluatko luoda oman tiimisi? '}
                            <a
                                href='/'
                                className='signup-team-login'
                            >
                                Rekisteröidy
                            </a>
                        </span>
                    </div>
                </form>
            </div>
        );
    }
}

Login.defaultProps = {
    teamName: '',
    teamDisplayName: ''
};
Login.propTypes = {
    teamName: React.PropTypes.string,
    teamDisplayName: React.PropTypes.string
};
