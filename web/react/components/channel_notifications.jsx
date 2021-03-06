// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

var SettingItemMin = require('./setting_item_min.jsx');
var SettingItemMax = require('./setting_item_max.jsx');

var Utils = require('../utils/utils.jsx');
var Client = require('../utils/client.jsx');
var UserStore = require('../stores/user_store.jsx');
var ChannelStore = require('../stores/channel_store.jsx');

export default class ChannelNotifications extends React.Component {
    constructor(props) {
        super(props);

        this.onListenerChange = this.onListenerChange.bind(this);
        this.updateSection = this.updateSection.bind(this);

        this.handleSubmitNotifyLevel = this.handleSubmitNotifyLevel.bind(this);
        this.handleUpdateNotifyLevel = this.handleUpdateNotifyLevel.bind(this);
        this.createNotifyLevelSection = this.createNotifyLevelSection.bind(this);

        this.handleSubmitMarkUnreadLevel = this.handleSubmitMarkUnreadLevel.bind(this);
        this.handleUpdateMarkUnreadLevel = this.handleUpdateMarkUnreadLevel.bind(this);
        this.createMarkUnreadLevelSection = this.createMarkUnreadLevelSection.bind(this);
        this.onShow = this.onShow.bind(this);

        this.state = {
            notifyLevel: '',
            markUnreadLevel: '',
            title: '',
            channelId: '',
            activeSection: ''
        };
    }
    onShow(e) {
        var button = e.relatedTarget;
        var channelId = button.getAttribute('data-channelid');

        const member = ChannelStore.getMember(channelId);
        var notifyLevel = member.notify_props.desktop;
        var markUnreadLevel = member.notify_props.mark_unread;

        this.setState({
            notifyLevel,
            markUnreadLevel,
            title: button.getAttribute('data-title'),
            channelId
        });
    }
    componentDidMount() {
        ChannelStore.addChangeListener(this.onListenerChange);

        $(React.findDOMNode(this.refs.modal)).on('show.bs.modal', this.onShow);
    }
    componentWillUnmount() {
        ChannelStore.removeChangeListener(this.onListenerChange);
    }
    onListenerChange() {
        if (!this.state.channelId) {
            return;
        }

        const member = ChannelStore.getMember(this.state.channelId);
        var notifyLevel = member.notify_props.desktop;
        var markUnreadLevel = member.notify_props.mark_unread;

        var newState = this.state;
        newState.notifyLevel = notifyLevel;
        newState.markUnreadLevel = markUnreadLevel;

        if (!Utils.areStatesEqual(this.state, newState)) {
            this.setState(newState);
        }
    }
    updateSection(section) {
        this.setState({activeSection: section});
    }
    handleSubmitNotifyLevel() {
        var channelId = this.state.channelId;
        var notifyLevel = this.state.notifyLevel;

        if (ChannelStore.getMember(channelId).notify_props.desktop === notifyLevel) {
            this.updateSection('');
            return;
        }

        var data = {};
        data.channel_id = channelId;
        data.user_id = UserStore.getCurrentId();
        data.desktop = notifyLevel;

        Client.updateNotifyProps(data,
            () => {
                var member = ChannelStore.getMember(channelId);
                member.notify_props.desktop = notifyLevel;
                ChannelStore.setChannelMember(member);
                this.updateSection('');
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }
    handleUpdateNotifyLevel(notifyLevel) {
        this.setState({notifyLevel});
        React.findDOMNode(this.refs.modal).focus();
    }
    createNotifyLevelSection(serverError) {
        var handleUpdateSection;

        const user = UserStore.getCurrentUser();
        const globalNotifyLevel = user.notify_props.desktop;

        let globalNotifyLevelName;
        if (globalNotifyLevel === 'all') {
            globalNotifyLevelName = 'For all activity';
        } else if (globalNotifyLevel === 'mention') {
            globalNotifyLevelName = 'Only for mentions';
        } else {
            globalNotifyLevelName = 'Never';
        }

        if (this.state.activeSection === 'desktop') {
            var notifyActive = [false, false, false, false];
            if (this.state.notifyLevel === 'default') {
                notifyActive[0] = true;
            } else if (this.state.notifyLevel === 'all') {
                notifyActive[1] = true;
            } else if (this.state.notifyLevel === 'mention') {
                notifyActive[2] = true;
            } else {
                notifyActive[3] = true;
            }

            var inputs = [];

            inputs.push(
                <div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={notifyActive[0]}
                                onChange={this.handleUpdateNotifyLevel.bind(this, 'default')}
                            >
                                {`Global default (${globalNotifyLevelName})`}
                            </input>
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={notifyActive[1]}
                                onChange={this.handleUpdateNotifyLevel.bind(this, 'all')}
                            >
                                {'For all activity'}
                            </input>
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={notifyActive[2]}
                                onChange={this.handleUpdateNotifyLevel.bind(this, 'mention')}
                            >
                                {'Only for mentions'}
                            </input>
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={notifyActive[3]}
                                onChange={this.handleUpdateNotifyLevel.bind(this, 'none')}
                            >
                                {'Never'}
                            </input>
                        </label>
                    </div>
                </div>
            );

            handleUpdateSection = function updateSection(e) {
                this.updateSection('');
                this.onListenerChange();
                e.preventDefault();
            }.bind(this);

            const extraInfo = (
                <span>
                    {'Selecting an option other than "Default" will override the global notification settings. Desktop notifications are available on Firefox, Safari, and Chrome.'}
                </span>
            );

            return (
                <SettingItemMax
                    title='Send desktop notifications'
                    inputs={inputs}
                    submit={this.handleSubmitNotifyLevel}
                    server_error={serverError}
                    updateSection={handleUpdateSection}
                    extraInfo={extraInfo}
                />
            );
        }

        var describe;
        if (this.state.notifyLevel === 'default') {
            describe = `Global default (${globalNotifyLevelName})`;
        } else if (this.state.notifyLevel === 'mention') {
            describe = 'Only for mentions';
        } else if (this.state.notifyLevel === 'all') {
            describe = 'For all activity';
        } else {
            describe = 'Never';
        }

        handleUpdateSection = function updateSection(e) {
            this.updateSection('desktop');
            e.preventDefault();
        }.bind(this);

        return (
            <SettingItemMin
                title='Send desktop notifications'
                describe={describe}
                updateSection={handleUpdateSection}
            />
        );
    }

    handleSubmitMarkUnreadLevel() {
        const channelId = this.state.channelId;
        const markUnreadLevel = this.state.markUnreadLevel;

        if (ChannelStore.getMember(channelId).notify_props.mark_unread === markUnreadLevel) {
            this.updateSection('');
            return;
        }

        const data = {
            channel_id: channelId,
            user_id: UserStore.getCurrentId(),
            mark_unread: markUnreadLevel
        };

        Client.updateNotifyProps(data,
            () => {
                var member = ChannelStore.getMember(channelId);
                member.notify_props.mark_unread = markUnreadLevel;
                ChannelStore.setChannelMember(member);
                this.updateSection('');
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleUpdateMarkUnreadLevel(markUnreadLevel) {
        this.setState({markUnreadLevel});
        React.findDOMNode(this.refs.modal).focus();
    }

    createMarkUnreadLevelSection(serverError) {
        let content;

        if (this.state.activeSection === 'markUnreadLevel') {
            const inputs = [(
                <div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={this.state.markUnreadLevel === 'all'}
                                onChange={this.handleUpdateMarkUnreadLevel.bind(this, 'all')}
                            >
                                {'For all unread messages'}
                            </input>
                        </label>
                        <br />
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={this.state.markUnreadLevel === 'mention'}
                                onChange={this.handleUpdateMarkUnreadLevel.bind(this, 'mention')}
                            >
                                {'Only for mentions'}
                            </input>
                        </label>
                        <br />
                    </div>
                </div>
            )];

            const handleUpdateSection = function handleUpdateSection(e) {
                this.updateSection('');
                this.onListenerChange();
                e.preventDefault();
            }.bind(this);

            const extraInfo = <span>{'The channel name is bolded in the sidebar when there are unread messages. Selecting "Only for mentions" will bold the channel only when you are mentioned.'}</span>;

            content = (
                <SettingItemMax
                    title='Mark Channel Unread'
                    inputs={inputs}
                    submit={this.handleSubmitMarkUnreadLevel}
                    server_error={serverError}
                    updateSection={handleUpdateSection}
                    extraInfo={extraInfo}
                />
            );
        } else {
            let describe;

            if (!this.state.markUnreadLevel || this.state.markUnreadLevel === 'all') {
                describe = 'For all unread messages';
            } else {
                describe = 'Only for mentions';
            }

            const handleUpdateSection = function handleUpdateSection(e) {
                this.updateSection('markUnreadLevel');
                e.preventDefault();
            }.bind(this);

            content = (
                <SettingItemMin
                    title='Mark Channel Unread'
                    describe={describe}
                    updateSection={handleUpdateSection}
                />
            );
        }

        return content;
    }

    render() {
        var serverError = null;
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        return (
            <div
                className='modal fade'
                id='channel_notifications'
                ref='modal'
                tabIndex='-1'
                role='dialog'
                aria-hidden='true'
            >
                <div className='modal-dialog settings-modal'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <button
                                type='button'
                                className='close'
                                data-dismiss='modal'
                            >
                                <span aria-hidden='true'>&times;</span>
                                <span className='sr-only'>Close</span>
                            </button>
                            <h4 className='modal-title'>Notification Preferences for <span className='name'>{this.state.title}</span></h4>
                        </div>
                        <div className='modal-body'>
                            <div className='settings-table'>
                            <div className='settings-content'>
                                <div
                                    ref='wrapper'
                                    className='user-settings'
                                >
                                    <br/>
                                    <div className='divider-dark first'/>
                                    {this.createNotifyLevelSection(serverError)}
                                    <div className='divider-light'/>
                                    {this.createMarkUnreadLevelSection(serverError)}
                                    <div className='divider-dark'/>
                                </div>
                            </div>
                            </div>
                            {serverError}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
