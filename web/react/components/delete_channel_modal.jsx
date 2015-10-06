// Copyright (c) 2015 Spinpunch, Inc. All Rights Reserved.
// See License.txt for license information.

const Client = require('../utils/client.jsx');
const AsyncClient = require('../utils/async_client.jsx');
const ChannelStore = require('../stores/channel_store.jsx');
var TeamStore = require('../stores/team_store.jsx');

export default class DeleteChannelModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleDelete = this.handleDelete.bind(this);
        this.onShow = this.onShow.bind(this);

        this.state = {
            title: '',
            channelId: ''
        };
    }
    handleDelete() {
        if (this.state.channelId.length !== 26) {
            return;
        }

        Client.deleteChannel(this.state.channelId,
            function handleDeleteSuccess() {
                AsyncClient.getChannels(true);
                window.location.href = TeamStore.getCurrentTeamUrl() + '/channels/town-square';
            },
            function handleDeleteError(err) {
                AsyncClient.dispatchError(err, 'handleDelete');
            }
        );
    }
    onShow(e) {
        var button = $(e.relatedTarget);
        this.setState({
            title: button.attr('data-title'),
            channelId: button.attr('data-channelid')
        });
    }
    componentDidMount() {
        $(React.findDOMNode(this.refs.modal)).on('show.bs.modal', this.onShow);
    }
    render() {
        const channel = ChannelStore.getCurrent();
        let channelType = 'kanava';
        if (channel && channel.type === 'P') {
            channelType = 'yksityisryhmä';
        }

        return (
            <div
                className='modal fade'
                ref='modal'
                id='delete_channel'
                role='dialog'
                tabIndex='-1'
                aria-hidden='true'
            >
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <button
                                type='button'
                                className='close'
                                data-dismiss='modal'
                                aria-label='Sulje'
                            >
                                <span aria-hidden='true'>&times;</span>
                            </button>
                            <h4 className='modal-title'>Vahvista kanavan POISTO</h4>
                        </div>
                        <div className='modal-body'>
                            <p>
                                Oletko varma että haluat poistaa {this.state.title} ({channelType})?
                            </p>
                        </div>
                        <div className='modal-footer'>
                            <button
                                type='button'
                                className='btn btn-default'
                                data-dismiss='modal'
                            >
                                Peruuta
                            </button>
                            <button
                                type='button'
                                className='btn btn-danger'
                                data-dismiss='modal'
                                onClick={this.handleDelete}
                            >
                                Poista
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
