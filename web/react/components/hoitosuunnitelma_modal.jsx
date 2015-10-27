var Modal = ReactBootstrap.Modal;
var AppDispatcher = require('../dispatcher/app_dispatcher.jsx');
var Constants = require('../utils/constants.jsx');
var ActionTypes = Constants.ActionTypes;
var TeamStore = require('../stores/team_store.jsx');
var Client = require('../utils/client.jsx');

export default class HoitosuunnitelmaModal extends React.Component {
    constructor(props) {
        super(props);
        this.doHide = this.doHide.bind(this);
        this.updateTeam = this.updateTeam.bind(this);
        this.edit = this.edit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.save = this.save.bind(this);

        this.state = {
            edit: false,
            team: TeamStore.getCurrent()
        };
    }

    componentDidMount() {
        TeamStore.addChangeListener(() => {
            this.setState({
                team: TeamStore.getCurrent()
            });
        });
    }

    updateTeam() {
        this.setState({
            team: TeamStore.getCurrent()
        });
    }

    doHide() {
        this.props.onModalDismissed();
    }

    edit() {
        this.setState({edit: true});
    }

    cancelEdit() {
        this.setState({edit: false});
    }

    save() {
        let hoitosuunnitelmaText = this.refs.textInput.getDOMNode().value
        let data = {};
        data.new_hoitosuunnitelma_text = hoitosuunnitelmaText;


        Client.updateTeamHoitosuunnitelmaText(data,
            () => {
                let team = this.state.team;
                team.hoitosuunnitelma_text = hoitosuunnitelmaText;
                AppDispatcher.handleServerAction({
                    type: ActionTypes.UPDATED_TEAM,
                    team: team
                });
                this.setState({
                    edit: false
                });
            },
            (err) => {
                this.setState({
                    serverError: err.message
                });
            }
        );
    }

    render() {
        let hoitosuunnitelmaTextRaw = this.state.team.hoitosuunnitelma_text || '';

        let text = '';
        if (this.state.edit) {
            text = (
                <textarea
                    defaultValue={hoitosuunnitelmaTextRaw}
                    maxLength='4000'
                    rows='10'
                    style={{maxWidth: '40em', width: '100%;'}}
                    ref='textInput'
                />
            );
        } else {
            if (hoitosuunnitelmaTextRaw === '') {
                text = (
                    <p><em>(Ei vielä lisätty hoitosuunnitelmaa.)</em></p>
                )
            } else {
                const hoitosuunnitelmaText =
                    hoitosuunnitelmaTextRaw.split("\n").map((item) => {
                        return (
                            <span>
                                {item}
                                <br/>
                            </span>
                        )
                    });
                text = (
                    <p>{hoitosuunnitelmaText}</p>
                );
            }
        }

        let editButton = '';
        if (!this.state.edit) {
            editButton = (
                <button
                    type='button'
                    className='btn btn-primary'
                    onClick={this.edit}
                >
                    {'Muokkaa'}
                </button>
            );
        }

        let saveButton = '';
        let cancelButton = '';
        if (this.state.edit) {
            saveButton = (
                <button
                    type='button'
                    className='btn btn-primary'
                    onClick={this.save}
                >
                    {'Tallenna'}
                </button>
            );
            cancelButton = (
                <button
                    type='button'
                    className='btn btn-default'
                    onClick={this.cancelEdit}
                >
                    {'Peruuta'}
                </button>
            );
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.doHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>{'Hoitosuunnitelma'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className="col-sm-12">
                            {text}
                        </div>
                    </div>
                    <div className='row'>
                        <div className="col-sm-12">
                            {editButton}
                            {saveButton}
                            {cancelButton}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default'
                        onClick={this.doHide}
                    >
                        {'Sulje'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

HoitosuunnitelmaModal.defaultProps = {
    show: false
};

HoitosuunnitelmaModal.propTypes = {
    show: React.PropTypes.bool.isRequired,
    onModalDismissed: React.PropTypes.func.isRequired
};