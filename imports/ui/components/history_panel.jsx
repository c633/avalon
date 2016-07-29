import React from 'react';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import { start } from '../../api/groups/methods.js';

export default class HistoryPanel extends React.Component {
  constructor(props) {
    super(props);
    this.restart = this.restart.bind(this);
  }

  restart() {
    const groupId = this.props.group._id;
    start.call({ groupId: groupId, additionalRoles: [], reset: true }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  render() {
    const { group } = this.props;
    const history = group.getMissionsHistory().map((m, i) => (
      <div key={i}>Mission {i + 1}: {m.map(t => t === undefined ? 'Playing' : t == null ? 'Denied' : t ? 'Success' : 'Fail').join(', ')}</div>
    ));
    return (
      <div className="x_panel">
        <div className="x_title">
          <h2><strong>Group: {group.name}</strong> (Owner: {group.getOwner().username})</h2>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          {
            group.isPlaying() ?
              group.hasOwner(Meteor.userId()) ? <button className="btn btn-primary" onClick={this.restart}>Restart game</button> : '' :
              group.getPlayers().length >= Groups.MIN_PLAYERS_COUNT ? 'Ready' : 'Waiting for more players'
          }
          {history}
          {group.getSituation().status}
        </div>
      </div>
    );
  }
}

HistoryPanel.propTypes = {
  group: React.PropTypes.object,
};
