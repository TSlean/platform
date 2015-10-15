// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

const Utils = require('../utils/utils.jsx');
const Client = require('../utils/client.jsx');
const Constants = require('../utils/constants.jsx');

export default class TeamSignupUrlPage extends React.Component {
    constructor(props) {
        super(props);

        this.submitBack = this.submitBack.bind(this);
        this.submitNext = this.submitNext.bind(this);
        this.handleFocus = this.handleFocus.bind(this);

        this.state = {nameError: ''};
    }
    submitBack(e) {
        e.preventDefault();
        this.props.state.wizard = 'team_display_name';
        this.props.updateParent(this.props.state);
    }
    submitNext(e) {
        e.preventDefault();

        const name = React.findDOMNode(this.refs.name).value.trim();
        if (!name) {
            this.setState({nameError: 'Tämä kenttä on pakollinen'});
            return;
        }

        const cleanedName = Utils.cleanUpUrlable(name);

        const urlRegex = /^[a-z]+([a-z\-0-9]+|(__)?)[a-z0-9]+$/g;
        if (cleanedName !== name || !urlRegex.test(name)) {
            this.setState({nameError: "Käytä vain pieniä kirjaimia, numeroita ja väliviivoja. Täytyy alkaa kirjaimella ja ei saa päättyä väliviivaan."});
            return;
        } else if (cleanedName.length <= 2 || cleanedName.length > 15) {
            this.setState({nameError: 'Nimen pituus pitää olla 3-15 merkkiä'});
            return;
        }

        for (let index = 0; index < Constants.RESERVED_TEAM_NAMES.length; index++) {
            if (cleanedName.indexOf(Constants.RESERVED_TEAM_NAMES[index]) === 0) {
                this.setState({nameError: 'Osoite on jo käytössä tai sisältää kielletyn sanan'});
                return;
            }
        }

        Client.findTeamByName(name,
              (data) => {
                  if (data) {
                      this.setState({nameError: 'Osoite ei ole saatavilla. Kokeile toista osoitetta.'});
                  } else {
                      this.props.state.wizard = 'send_invites';
                      this.props.state.team.type = 'O';

                      this.props.state.team.name = name;
                      this.props.updateParent(this.props.state);
                  }
              },
              (err) => {
                  this.setState({nameError: err.message});
              }
        );
    }
    handleFocus(e) {
        e.preventDefault();

        e.currentTarget.select();
    }
    render() {
        $('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover click'});

        Client.track('signup', 'signup_team_03_url');

        let nameError = null;
        let nameDivClass = 'form-group';
        if (this.state.nameError) {
            nameError = <label className='control-label'>{this.state.nameError}</label>;
            nameDivClass += ' has-error';
        }

        const title = `${Utils.getWindowLocationOrigin()}/`;

        return (
            <div>
                <form>
                    <img
                        className='signup-team-logo'
                        src='/static/images/logo.png'
                    />
                    <h2>{`Tiimin osoite`}</h2>
                    <div className={nameDivClass}>
                        <div className='row'>
                            <div className='col-sm-11'>
                                <div className='input-group input-group--limit'>
                                    <span
                                        data-toggle='tooltip'
                                        title={title}
                                        className='input-group-addon'
                                    >
                                        {title}
                                    </span>
                                    <input
                                        type='text'
                                        ref='name'
                                        className='form-control'
                                        placeholder=''
                                        maxLength='128'
                                        defaultValue={this.props.state.team.name}
                                        autoFocus={true}
                                        onFocus={this.handleFocus}
                                        spellCheck='false'
                                    />
                                </div>
                            </div>
                        </div>
                        {nameError}
                    </div>
                    <p>{`Valitse internet-osoite tiimillesi:`}</p>
                    <ul className='color--light'>
                        <li>Hyvä osoite on lyhyt ja helposti muistettava</li>
                        <li>Käytä vain pieniä kirjaimia, numeroita ja väliviivoja</li>
                        <li>Pitää alkaa kirjaimella eikä saa päättyä väliviivaan</li>
                    </ul>
                    <button
                        type='submit'
                        className='btn btn-primary margin--extra'
                        onClick={this.submitNext}
                    >
                        Seuraava<i className='glyphicon glyphicon-chevron-right'></i>
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

TeamSignupUrlPage.propTypes = {
    state: React.PropTypes.object,
    updateParent: React.PropTypes.func
};
