import React from 'react';
import GroupRow from './group_row.jsx';
import { MediumAndSmallDevice } from '../layouts/devices.jsx';

export default class GroupTable extends React.Component {

  // REGION: Component Specifications

  render() {
    const { groups } = this.props;
    return (
      <div className="x_content">
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
            {groups.map(g => <GroupRow group={g} key={g._id}/>)}
          </tbody>
        </table>
      </div>
    );
  }
}

GroupTable.propTypes = {
  groups: React.PropTypes.array,
};
