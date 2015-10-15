// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

var utils = require('../utils/utils.jsx');
var client = require('../utils/client.jsx');

export default class FindTeam extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();

        var state = { };

        var email = React.findDOMNode(this.refs.email).value.trim().toLowerCase();
        if (!email || !utils.isEmail(email)) {
            state.email_error = 'Syötä toimiva sähköpostiosoite';
            this.setState(state);
            return;
        }

        state.email_error = '';

        client.findTeamsSendEmail(email,
            function success() {
                state.sent = true;
                this.setState(state);
            }.bind(this),
            function fail(err) {
                state.email_error = err.message;
                this.setState(state);
            }.bind(this)
        );
    }

    render() {
        var emailError = null;
        var emailErrorClass = 'form-group';

        if (this.state.email_error) {
            emailError = <label className='control-label'>{this.state.email_error}</label>;
            emailErrorClass = 'form-group has-error';
        }

        if (this.state.sent) {
            return (
                <div>
                    <h4>{'Etsi tiimisi'}</h4>
                    <p>{'Sinulle on lähetetty sähköposti, jossa on linkit kaikkiin tiimeihisi.'}</p>
                </div>
            );
        }

        return (
        <div>
                <h4>Etsi tiimisi</h4>
                <form onSubmit={this.handleSubmit}>
                    <p>{'Sinulle lähetetään sähköposti, jossa on linkit kaikkiin tiimeihisi.'}</p>
                    <div className='form-group'>
                        <label className='control-label'>Sähköposti</label>
                        <div className={emailErrorClass}>
                            <input
                                type='text'
                                ref='email'
                                className='form-control'
                                placeholder='nimi@domain.fi'
                                maxLength='128'
                                spellCheck='false'
                            />
                            {emailError}
                        </div>
                    </div>
                    <button
                        className='btn btn-md btn-primary'
                        type='submit'
                    >
                        Lähetä
                    </button>
                </form>
                </div>
        );
    }
}
