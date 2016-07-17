import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';

export default class PlayerItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { selected, user, part, selectable, role, ...others } = this.props;
    return (
      <TableRow selected={selected} {...others} selectable={selectable} style={Meteor.userId() == user._id ? { fontWeight: 'bold' } : {}}>
        {selectable ? others.children[0] : ''} {/* Explicitly render the checkbox passed down from TableBody */}
        <TableRowColumn>{user.username}</TableRowColumn>
        <TableRowColumn>{part}</TableRowColumn>
        <TableRowColumn>{role}</TableRowColumn>
      </TableRow>
    );
  }
}

PlayerItem.propTypes = {
  selected: React.PropTypes.bool,
  user: React.PropTypes.object,
  part: React.PropTypes.string,
  selectable: React.PropTypes.bool,
  role: React.PropTypes.string,
};

PlayerItem.contextTypes = {
  router: React.PropTypes.object,
};
