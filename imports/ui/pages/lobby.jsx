import React from 'react';
import GroupsTable from '../components/groups_table.jsx';
import { insert } from '../../api/groups/methods.js';

export default class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.createGroup = this.createGroup.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { error } = this.state;
    const { groups, loaded } = this.props;
    const formCreateGroup = !!Meteor.userId() ? (
      <div className="x_content">
        <br/>
        <form data-parsley-validate className="form-horizontal form-label-left" onSubmit={this.createGroup}>
          <div className="form-group">
            <label className="control-label col-sm-3" htmlFor="first-name">Group Name <span className="required">*</span>
            </label>
            <div className={`col-sm-6 ${error ? 'avalon-error' : ''}`}>
              <input type="text" ref="name" name="name" className="form-control"/>
              <span>{error}</span>
            </div>
            <div className="col-sm-3">
              <button type="submit" className="btn btn-default">Create new group</button>
            </div>
          </div>
        </form>
      </div>
    ) : null;
    return loaded ? (
      <div>
        <div className="page-title">
          <div className="title_left">
            <h3>Groups<small></small></h3>
          </div>
        </div>
        <div className="clearfix"></div>
        <div className="x_panel">
          {formCreateGroup}
          <GroupsTable groups={groups}/>
        </div>
      </div>
    ) : null;
  }

  // REGION: Handlers

  createGroup(event) {
    event.preventDefault();
    const { router } = this.context;
    const name = this.refs.name.value;
    let error = null;
    if (name.length < 6) {
      error = "Please use at least 6 characters"
    }
    this.setState({ error });
    if (error) {
      return;
    }
    const groupId = insert.call({ name: name }, err => {
      if (err) {
        this.setState({ error: err.reason });
      } else {
        router.push(`/groups/${groupId}`);
      }
    });
  }
}

Lobby.propTypes = {
  groups: React.PropTypes.array,
  loaded: React.PropTypes.bool,
};

Lobby.contextTypes = {
  router: React.PropTypes.object,
};
