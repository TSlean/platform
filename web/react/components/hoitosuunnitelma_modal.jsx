var Modal = ReactBootstrap.Modal;
var AppDispatcher = require('../dispatcher/app_dispatcher.jsx');
var Constants = require('../utils/constants.jsx');
var ActionTypes = Constants.ActionTypes;
var TeamStore = require('../stores/team_store.jsx');
var Client = require('../utils/client.jsx');
var Utils = require('../utils/utils.jsx');

export default class HoitosuunnitelmaModal extends React.Component {
    constructor(props) {
        super(props);
        this.doHide = this.doHide.bind(this);
        this.updateTeam = this.updateTeam.bind(this);
        this.edit = this.edit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.save = this.save.bind(this);
        this.submitFile = this.submitFile.bind(this);

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
        this.setState({
            edit: false,
            serverError: null
        });
    }

    edit() {
        this.setState({edit: true});
    }

    cancelEdit() {
        this.setState({edit: false});
    }

    save() {
        let hoitosuunnitelmaText = this.refs.textInput.getDOMNode().value;
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
                    edit: false,
                    serverError: null
                });
            },
            (err) => {
                this.setState({
                    serverError: err.message
                });
            }
        );
    }

    submitFile(e) {
        e.preventDefault();

        let file;
        if (e.target.files && e.target.files[0]) {
            file = e.target.files[0];
            //this.setState({clientError: null});
        }

        if (!file) {
            return;
        }

        this.setState({
            uploadingFile: true
        });

        var formData = new FormData();
        formData.append('file', file, file.name);

        Client.uploadTeamFile(formData,
            () => {
                let data = {};
                let files = [{
                    name: file.name,
                    date: new Date().getTime()
                }];
                data.new_hoitosuunnitelma_files = JSON.stringify(files);
                data.team_id = this.state.team.id;
                Client.updateTeamHoitosuunnitelmaFiles(data,
                    () => {
                        let team = this.state.team;
                        team.hoitosuunnitelma_files = data.new_hoitosuunnitelma_files;
                        AppDispatcher.handleServerAction({
                            type: ActionTypes.UPDATED_TEAM,
                            team: team
                        });
                        this.setState({
                            uploadingFile: false,
                            serverError: null
                        });
                    },
                    (err) => {
                        this.setState({
                            uploadingFile: false,
                            serverError: err.message
                        });
                    }
                );
            },
            (err) => {
                this.setState({
                    uploadingFile: false,
                    serverError: err
                });
            }
        );
    }

    render() {
        let hoitosuunnitelmaTextRaw;
        if (this.state.team && this.state.team.hoitosuunnitelma_text) {
            hoitosuunnitelmaTextRaw = this.state.team.hoitosuunnitelma_text;
        } else {
            hoitosuunnitelmaTextRaw = '';
        }

        var currentFileName, currentFileDate;
        try {
            let files = JSON.parse(this.state.team.hoitosuunnitelma_files);
            if (files.length) {
                currentFileName = files[0].name;
                currentFileDate = Utils.displayCommentDateTime(files[0].date)
            }
        } catch (e) {}

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
            if (hoitosuunnitelmaTextRaw === '' && !currentFileName) {
                text = (
                    <p><em>(Ei vielä lisätty hoito- ja palvelusuunnitelmaa.)</em></p>
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
                    {'Muokkaa tekstiä'}
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
                    disabled={this.state.uploadingFile}
                >
                    {'Tallenna'}
                </button>
            );
            cancelButton = (
                <button
                    type='button'
                    className='btn btn-default'
                    onClick={this.cancelEdit}
                    disabled={this.state.uploadingFile}
                >
                    {'Peruuta'}
                </button>
            );
        }


        let uploadFile;

        if (this.state.uploadingFile) {
            uploadFile = (
                <div>Ladataan tiedostoa</div>
            )
        } else {
            let currentFile = '';
            if (currentFileName) {
                currentFile = (
                    <div>
                        Klikkaa tiedoston nimeä avataksesi:
                        <br />
                        <br />
                        <strong>
                            <a
                                href={'/api/v1/files/get/' + this.state.team.id + '/' + currentFileName}
                            >
                                {currentFileName}
                            </a>
                        </strong>
                        <br />
                        <br />
                        (Tiedosto lisätty: <em>{currentFileDate}</em>)
                        <hr />
                    </div>
                )
            }



            uploadFile = (
                <div>
                    {currentFile}
                    <span className='btn btn-sm btn-primary btn-file sel-btn'>
                        Lisää uusi tiedosto
                        <input
                            accept='.pdf'
                            type='file'
                            onChange={this.submitFile}
                        />
                    </span>
                    <br />
                    <br />
                    <small>Uuden tiedoston lisääminen korvaa edellisen tiedoston</small>
                </div>
            );
        }


        let error = '';
        if (this.state.serverError) {
            error = (
                <div className="alert alert-danger" role="alert">
                    Tapahtui virhe: {this.state.serverError}
                </div>
            );
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.doHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>{'Hoito- ja palvelusuunnitelma'}</Modal.Title>
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
                    <hr />
                    <div className='row'>
                        <div className="col-sm-12">
                            {uploadFile}
                        </div>
                    </div>
                    {error}

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