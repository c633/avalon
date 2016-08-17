import React from 'react';
import { Groups } from '../../api/groups/groups.jsx'; // Constants only

export default class PlayerCard extends React.Component {
  constructor(props) {
    super(props);
  }

  // REGION: Component Specifications

  render() {
    const { isSelectable, isMember, isGuessed, group, player } = this.props;
    const playersCount = group.players.length >= Groups.MIN_PLAYERS_COUNT ? group.players.length : Groups.MIN_PLAYERS_COUNT;
    const isLeader = group.hasLeader(player._id);
    const { role, side, status } = group.findInformation(Meteor.userId(), player._id);
    return (
      <div onClick={this.props.onClick} className={`avalon-col-card-player-${playersCount} profile_details`}>
        <button className={`well profile_view avalon-card${isSelectable == null ? '-disable' : isSelectable ? '' : '-unselectable'} ${side != null ? `avalon-${side ? 'good' : 'evil'}` : ''}`}>
          <div className="col-sm-12">
            {isLeader ? <img data-container="body" data-toggle="tooltip" title="Leader" src="/images/tokens/leader.png" className="img-responsive avalon-card-mark-top"/> : null}
            {isMember ? <img data-container="body" data-toggle="tooltip" title="Member" src="/images/tokens/member.png" className="img-responsive avalon-card-mark-right"/> : null}
            {isGuessed ? <img data-container="body" data-toggle="tooltip" title="Guessed as Merlin" src="/images/tokens/selected.png" className="img-responsive avalon-card-mark-right"/> : null}
            <p><b>{player.username}{Meteor.userId() == player._id ? ' (Me)' : ''}</b></p>
            <img src={player.getAvatarSrc()} className="img-responsive avalon-avatar avalon-card-player-avatar"/>
          </div>
          <div className="col-xs-12 bottom text-center">
            <div className="col-xs-12 col-sm-12 emphasis">
              <h2 className="avalon-card-text"><b>{role}</b></h2>
            </div>
          </div>
          {status != '' ? <img data-container="body" data-toggle="tooltip" title={status} src={`/images/tokens/${status.replace(' ', '-').toLowerCase()}.png`} className="img-responsive avalon-card-mark-bottom"/> : null}
        </button>
      </div>
    );
  }

  // REGION: Lifecycle Methods

  componentDidUpdate() {
    $('[data-toggle="tooltip"]').tooltip('fixTitle');
  }
}

PlayerCard.propTypes = {
  isSelectable: React.PropTypes.bool,
  isMember: React.PropTypes.bool,
  isGuessed: React.PropTypes.bool,
  group: React.PropTypes.object,
  player: React.PropTypes.object,
};
