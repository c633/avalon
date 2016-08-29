import React from 'react';
import { Groups } from '../../api/groups/groups.jsx';
import GroupsTable from '../components/groups_table.jsx';
import MessagesContent from '../components/messages_content.jsx';
import { insert } from '../../api/groups/methods.js';
import { MediumDevice, SmallAndTinyDevice } from '../layouts/devices.jsx';

export default class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.createGroup = this.createGroup.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { error } = this.state;
    const { groups, messages, loaded } = this.props;
    const formCreateGroup = !!Meteor.userId() ? (
      <div className="x_content">
        <br/>
        <form data-parsley-validate className="form-horizontal form-label-left" onSubmit={this.createGroup}>
          <div className="form-group">
            <label className="control-label col-xs-12 col-sm-3" htmlFor="first-name">Group Name <span className="required">*</span>
            </label>
            <div className={`col-xs-12 col-sm-6 ${error ? 'avalon-error' : ''}`}>
              <input type="text" ref="name" name="name" className="form-control"/>
              <span>{error}</span>
            </div>
            <div className="col-xs-12 col-sm-3">
              <button type="submit" className="btn btn-default">Create new group</button>
            </div>
          </div>
        </form>
      </div>
    ) : null;
    return loaded ? (
      <div>
        <MediumDevice>
          <div className="row">
            <div className="col-xs-8">
              <div className="x_panel">
                <div className="x_content">
                  {formCreateGroup}
                  <GroupsTable groups={groups}/>
                </div>
              </div>
            </div>
            <div className="col-xs-4">
              <div className="x_panel">
                <div className="x_title">
                  <h2><b>Messages</b></h2>
                  <div className="clearfix"></div>
                </div>
                <div className="x_content">
                  <MessagesContent messages={messages} canSend={!!Meteor.userId()}/>
                </div>
              </div>
            </div>
          </div>
        </MediumDevice>
        <SmallAndTinyDevice>
          <div className="x_panel">
            <div className="x_content">
              <div role="tabpanel">
                <ul className="nav nav-tabs bar_tabs" role="tablist">
                  <li role="presentation" className="active"><a href="#tab_groups" role="tab" data-toggle="tab" aria-expanded="false">Groups</a></li>
                  <li role="presentation" className=""><a href="#tab_messages" role="tab" data-toggle="tab" aria-expanded="false">Messages</a></li>
                </ul>
                <div className="tab-content">
                  <div role="tabpanel" className="tab-pane fade active in" id="tab_groups">
                    {formCreateGroup}
                    <GroupsTable groups={groups}/>
                  </div>
                  <div role="tabpanel" className="tab-pane fade" id="tab_messages">
                    <MessagesContent messages={messages} canSend={!!Meteor.userId()}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SmallAndTinyDevice>
      </div>
    ) : null;
  }

  // REGION: Handlers

  createGroup(event) {
    event.preventDefault();
    const { router } = this.context;
    const name = this.refs.name.value;
    let error = null;
    if (Groups.find({ 'players.id': Meteor.userId() }).count() > 0) {
      error = 'You cannot create new group while joining another one';
    } else if (name.length < 6) {
      error = 'Please use at least 6 characters';
    } else if (!name.match(/^[a-zA-Z0-9_]+$/)) {
      error = 'Group name can use only letters (a-z), numbers, and underscores';
    }
    this.setState({ error });
    if (error) {
      return;
    }
    const groupId = insert.call({ name: name }, err => {
      if (err) {
        this.setState({ error: err.reason });
      } else {
        router.push(`/groups/${name}`);
      }
    });
  }
}

Lobby.propTypes = {
  groups: React.PropTypes.array,
  messages: React.PropTypes.array,
  loaded: React.PropTypes.bool,
};

Lobby.contextTypes = {
  router: React.PropTypes.object,
};
