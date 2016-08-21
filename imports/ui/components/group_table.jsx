import React from 'react';
import { insert } from '../../api/groups/methods.js';
import GroupRow from './group_row.jsx';
import { MediumAndSmallDevice } from '../layouts/devices.jsx';

export default class GroupTable extends React.Component {
  constructor(props) {
    super(props);
    this.createGroup = this.createGroup.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { groups } = this.props;
    const formCreateGroup = !!Meteor.userId() ? (
      <div className="x_content">
        <br/>
        <form data-parsley-validate className="form-horizontal form-label-left" onSubmit={this.createGroup}>
          <div className="form-group">
            <label className="control-label col-sm-3" htmlFor="first-name">Group Name <span className="required">*</span>
            </label>
            <div className="col-sm-6">
              <input type="text" ref="name" name="name" required="required" className="form-control"/>
            </div>
            <div className="col-sm-3">
              <button type="submit" className="btn btn-default">Create new group</button>
            </div>
          </div>
        </form>
      </div>
    ) : null;
    return (
      <div className="x_panel">
        {formCreateGroup}
        <div className="x_title">
          <h2>Groups</h2>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <p>Simple table with group listing with players, situation and options</p>
          <table className="table table-bordered projects">
            <thead>
              <tr>
                <th>Group</th>
                <MediumAndSmallDevice><th>Players</th></MediumAndSmallDevice>
                <th>Situation</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => <GroupRow group={g} key={g._id}/>)}
            </tbody>
          </table>
        </div>
      </div>
    );
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

GroupTable.propTypes = {
  groups: React.PropTypes.array,
};

GroupTable.contextTypes = {
  router: React.PropTypes.object,
};
