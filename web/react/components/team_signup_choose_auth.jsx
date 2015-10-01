// Copyright (c) 2015 Spinpunch, Inc. All Rights Reserved.
// See License.txt for license information.

export default class ChooseAuthPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        var buttons = [];
        if (global.window.config.EnableSignUpWithGitLab === 'true') {
            buttons.push(
                    <a
                        className='btn btn-custom-login gitlab btn-full'
                        href='#'
                        onClick={
                            function clickGit(e) {
                                e.preventDefault();
                                this.props.updatePage('gitlab');
                            }.bind(this)
                        }
                    >
                        <span className='icon' />
                        <span>{'Luo uusi tiimi käyttäen GitLab-tiliä'}</span>
                    </a>
            );
        }

        if (global.window.config.EnableSignUpWithEmail === 'true') {
            buttons.push(
                    <a
                        className='btn btn-custom-login email btn-full'
                        href='#'
                        onClick={
                            function clickEmail(e) {
                                e.preventDefault();
                                this.props.updatePage('email');
                            }.bind(this)
                        }
                    >
                        <span className='fa fa-envelope' />
                        <span>{'Luo uusi tiimi käyttäen sähköpostiosoitetta'}</span>
                    </a>
            );
        }

        if (buttons.length === 0) {
            buttons = <span>{'Rekisteröitymistapoja ei ole määritelty. Ota yhteys järjestelmän ylläpitäjään.'}</span>;
        }

        return (
            <div>
                {buttons}
                <div className='form-group margin--extra-2x'>
                    <span><a href='/find_team'>{'Etsi tiimini'}</a></span>
                </div>
            </div>
        );
    }
}

ChooseAuthPage.propTypes = {
    updatePage: React.PropTypes.func
};
