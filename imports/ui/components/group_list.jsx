import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow } from 'material-ui/Table';
import { insert } from '../../api/groups/methods.js';
import GroupItem from './group_item.jsx';

export default class GroupList extends React.Component {
  constructor(props) {
    super(props);
    this.createGroup = this.createGroup.bind(this);
  }

  createGroup(event) {
    event.preventDefault();
    const { router } = this.context;
    const groupId = insert.call({ name: this.refs.name.getValue() }, err => {
      if (err) {
        alert(err.reason);
      } else {
        router.push(`/groups/${groupId}`);
      }
    });
  }

  render() {
    const { groups } = this.props;
    let formCreateGroup;
    if (!!Meteor.userId()) { // Render form for creating new 'Group' if user has already logged in
      formCreateGroup = (
        <div>
          <form onSubmit={this.createGroup}>
            <TextField hintText="Name" ref="name" name="name"/>
            <RaisedButton primary={true} label="Create new group" type="submit"/>
          </form>
        </div>
      ); 
    }
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="x_panel">
            <div className="x_title">
              <h2>Groups</h2>
              <div className="clearfix"></div>
            </div>
            <div className="x_content">
              <p>Simple table with group listing with members, status and options</p>
              <table className="table table-striped projects">
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Group</th>
                    <th>Players</th>
                    <th>Status</th>
                    <th style={{ width: '20%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(g => <GroupItem group={g} key={g._id}/>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

GroupList.propTypes = {
  groups: React.PropTypes.array,
};

GroupList.contextTypes = {
  router: React.PropTypes.object,
};
