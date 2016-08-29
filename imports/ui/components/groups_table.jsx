import React from 'react';
import { Groups } from '../../api/groups/groups.jsx';
import GroupRow from './group_row.jsx';
import { MediumAndSmallDevice } from '../layouts/devices.jsx';

export default class GroupsTable extends React.Component {

  // REGION: Component Specifications

  render() {
    const { groups } = this.props;
    return (
      <table className="table table-bordered projects">
        <thead>
          <tr>
            <th>Group's name</th>
            <MediumAndSmallDevice><th>Players</th></MediumAndSmallDevice>
            <th>Situation</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {groups.map(g => <GroupRow key={g._id} group={g} joinedOtherGroup={Groups.find({ 'players.id': Meteor.userId() }).count() > 0}/>)}
        </tbody>
      </table>
    );
  }
}

GroupsTable.propTypes = {
  groups: React.PropTypes.array,
};
