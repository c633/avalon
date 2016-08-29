import React from 'react';
import GroupsTable from '../components/groups_table.jsx';
import { insert } from '../../api/groups/methods.js';

export default class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.createGroup = this.createGroup.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { groups, loaded } = this.props;
    const formCreateGroup = !!Meteor.userId() ? (
      <div className="x_content">
        <br/>
        <form data-parsley-validate className="form-horizontal form-label-left" onSubmit={this.createGroup}>
          <div className="form-group">
            <label className="control-label col-sm-3" htmlFor="first-name">Group Name <span className="required">*</span>
            </label>
            <div className="col-sm-6">
              <input type="text" ref="name" name="name" className="form-control"/>
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
    const groupId = insert.call({ name: this.refs.name.value }, err => {
      if (err) {
        alert(err.reason);
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
