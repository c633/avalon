import React from 'react';
import { Groups } from '../../api/groups/groups.jsx'; // Constants only

export default class PlayerCard extends React.Component {

  // REGION: Component Specifications

  render() {
    const { isSelectable, isMember, isGuessed, group, player } = this.props;
    const playersCount = group.players.length >= Groups.MIN_PLAYERS_COUNT ? group.players.length : Groups.MIN_PLAYERS_COUNT;
    const isLeader = group.hasLeader(player._id);
    const isHammer = group.hasHammer(player._id);
    const { role, side, status } = group.findInformation(Meteor.userId(), player._id);
    return (
      <div onClick={this.props.onClick} className={`avalon-col-card-player-${playersCount} profile_details`}>
        <button className={`well profile_view avalon-card${isSelectable == null ? '-disable' : isSelectable ? '' : '-unselectable'} ${side != null ? `avalon-${side ? 'good' : 'evil'}` : ''}`}>
          {isLeader ? <img data-container="body" data-toggle="tooltip" title="Leader" src="/images/tokens/leader.png" className="img-responsive avalon-card-mark-top"/> : null}
          {isHammer ? <img data-container="body" data-toggle="tooltip" data-html={true} title="Hammer<br/>(Mission team which is selected<br/>by this leader is always approved)" src="/images/tokens/hammer.png" className="img-responsive avalon-card-mark-left"/> : null}
          {isMember ? <img data-container="body" data-toggle="tooltip" title="Member" src="/images/tokens/member.png" className="img-responsive avalon-card-mark-right"/> : null}
          {isGuessed ? <img data-container="body" data-toggle="tooltip" title="Guessed as Merlin" src="/images/tokens/guessed.png" className="img-responsive avalon-card-mark-right"/> : null}
          <p><b>{Meteor.userId() == player._id ? <i>Me</i> : player.username}</b></p>
          <img src={player.getAvatarSrc()} className="img-responsive avalon-avatar avalon-card-player-avatar"/>
          <div className="bottom text-center">
            <div className="emphasis">
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
