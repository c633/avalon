import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';

export default class PlayerItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { selected, selectable, user, role, side, part, status, ...others } = this.props;
    const style = {};
    if (Meteor.userId() == user._id) {
      style['fontWeight'] = 'bold';
      style['fontStyle'] = 'italic';
    }
    style['color'] = side == null ? 'black' : side ? 'blue' : 'red';
    return (
      <TableRow selected={selected} {...others} selectable={selectable} style={style}>
        {selectable ? others.children[0] : ''} {/* Explicitly render the checkbox passed down from TableBody */}
        <TableRowColumn>{user.username}</TableRowColumn>
        <TableRowColumn>{role}</TableRowColumn>
        <TableRowColumn>{part}</TableRowColumn>
        <TableRowColumn>{status}</TableRowColumn>
      </TableRow>
    );
  }
}

PlayerItem.propTypes = {
  selected: React.PropTypes.bool,
  selectable: React.PropTypes.bool,
  user: React.PropTypes.object,
  role: React.PropTypes.string,
  side: React.PropTypes.bool,
  part: React.PropTypes.string,
  status: React.PropTypes.string,
};

PlayerItem.contextTypes = {
  router: React.PropTypes.object,
};
