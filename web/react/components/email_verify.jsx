// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

export default class EmailVerify extends React.Component {
    constructor(props) {
        super(props);

        this.handleResend = this.handleResend.bind(this);

        this.state = {};
    }
    handleResend() {
        const newAddress = window.location.href.replace('&resend_success=true', '');
        window.location.href = newAddress + '&resend=true';
    }
    render() {
        var title = '';
        var body = '';
        var resend = '';
        var resendConfirm = '';
        if (this.props.isVerified === 'true') {
            title = global.window.config.SiteName + ' Sähköposti on vahvistettu';
            body = <p>Sähköpostisi on vahvistettu! <a href={this.props.teamURL + '?email=' + this.props.userEmail}>Klikkaa tästä kirjautuaksesi.</a></p>;
        } else {
            title = global.window.config.SiteName + ': Melkein valmista';
            body = <p>Vahvista sähköpostiosoitteesi. Tarkista sähköpostilaatikkosi.</p>;
            resend = (
                <button
                    onClick={this.handleResend}
                    className='btn btn-primary'
                >
                    Lähetä sähköposti uudelleen
                </button>
            );
            if (this.props.resendSuccess) {
                resendConfirm = <div><br /><p className='alert alert-success'><i className='fa fa-check'></i>{' Vahvistusviesti lähetetty sähköpostiisi.'}</p></div>;
            }
        }

        return (
            <div className='col-sm-12'>
                <div className='panel panel-default verify_panel'>
                    <div className='panel-heading'>
                        <h3 className='panel-title'>{title}</h3>
                    </div>
                    <div className='panel-body'>
                        {body}
                        {resend}
                        {resendConfirm}
                    </div>
                </div>
            </div>
        );
    }
}

EmailVerify.defaultProps = {
    isVerified: 'false',
    teamURL: '',
    userEmail: '',
    resendSuccess: 'false'
};
EmailVerify.propTypes = {
    isVerified: React.PropTypes.string,
    teamURL: React.PropTypes.string,
    userEmail: React.PropTypes.string,
    resendSuccess: React.PropTypes.string
};
