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
    const groupId = insert.call({ name: this.refs.name.getValue() }, (err) => {
      if (err) {
        alert(err.reason);
      } else {
        router.push(`/groups/${ groupId }`);
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
        </div>); 
    }
    return (
      <div>
        {formCreateGroup}
        <div>
          <Table fixedHeader={true}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Owner</TableHeaderColumn>
                <TableHeaderColumn>Number of players</TableHeaderColumn>
                <TableHeaderColumn></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {groups.map(group => (
                <GroupItem group={group} key={group._id}/>
              ))}
            </TableBody>
          </Table>
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
