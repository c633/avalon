import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow } from 'material-ui/Table';
import Main from '../layouts/main';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import PlayerItem from '../components/player_item.jsx';
import { start } from '../../api/groups/methods.js';

export default class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
  }

  start() {
    const groupId = this.props.group._id;
    start.call({ groupId: groupId, reset: false }, (err) => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  restart() {
    const groupId = this.props.group._id;
    start.call({ groupId: groupId, reset: true }, (err) => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  render() {
    const { group, loaded } = this.props;
    let content;
    if (loaded) {
      const buttonStart = (
        <div>
          {
            group.getPlayers().length >= Groups.MIN_PLAYERS_COUNT ?
            (
              group.belongsTo(Meteor.userId()) ?
              <div>
                {!group.isPlaying() ? <RaisedButton label='Start playing' onClick={this.start}></RaisedButton> : ''}
                <RaisedButton label='Restart game' onClick={this.restart}></RaisedButton>
              </div> : group.isPlaying() ? 'Playing' : 'Ready'
            ) : ('Waiting')
          }
        </div>
      );
      content = (
        <div>
          <RaisedButton primary={true} containerElement={<Link to="/"/>} linkButton={true} label="Home"/>
          <div>Group's name: {group.name}</div>
          <div>Owner: {group.getOwner().username}</div>
          {buttonStart}
          Players:
          <Table fixedHeader={true}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Role</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {group.getPlayers().map(player => (
                <PlayerItem user={player.user} role={!group.isPlaying() || (Meteor.userId() != player.user._id && !group.hasSpy(Meteor.userId())) ? 'Unknown' : player.isSpy ? 'Spy' : 'Resistance'} key={player.user._id}/>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    return <Main content={content}/>;
  }
}

GroupPage.propTypes = {
  group: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
