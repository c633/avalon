import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';

export default class PlayerItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { user, role } = this.props;
    return (
      <TableRow selectable={false} style={Meteor.userId() == user._id ? { fontWeight: 'bold' } : {}}>
        <TableRowColumn>{user.username}</TableRowColumn>
        <TableRowColumn>{role}</TableRowColumn>
      </TableRow>
    );
  }
}

PlayerItem.propTypes = {
  user: React.PropTypes.object,
  role: React.PropTypes.string,
};

PlayerItem.contextTypes = {
  router: React.PropTypes.object,
};
