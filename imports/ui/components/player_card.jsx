import React from 'react';

export default class PlayerCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { playersCount, isLeader, isMember, isGuessed, selectable, user, role, side, status } = this.props;
    return (
      <div onClick={this.props.onClick} className={`avalon-col-card-player-${playersCount} profile_details`}>
        <button className={`well profile_view avalon-card${selectable ? '' : '-unselectable'} ${side != null ? `avalon-${side ? 'good' : 'evil'}` : ''}`}>
          <div className="col-sm-12">
            {isLeader ? <img src="/images/items/leader.png" className="img-responsive avalon-mark-top"/> : null}
            {isMember ? <img src="/images/items/member.png" className="img-responsive avalon-mark-right"/> : null}
            {isGuessed ? <img src="/images/items/selected.png" className="img-responsive avalon-mark-right"/> : null}
            <p><strong>{user.username}{Meteor.userId() == user._id ? ' (Me)' : ''}</strong></p>
            <img src="/images/avatar.png" className="img-responsive avalon-card-player-avatar"/>
          </div>
          <div className="col-xs-12 bottom text-center">
            <div className="col-xs-12 col-sm-12 emphasis">
              <h2 className="avalon-card-text"><strong>{role}</strong></h2>
            </div>
          </div>
          {status != '' ? <img src={`/images/items/${status.replace(' ', '-').toLowerCase()}.png`} className="img-responsive avalon-mark-bottom"/> : null}
        </button>
      </div>
    );
  }
}

PlayerCard.propTypes = {
  playersCount: React.PropTypes.number,
  isLeader: React.PropTypes.bool,
  isMember: React.PropTypes.bool,
  isGuessed: React.PropTypes.bool,
  selectable: React.PropTypes.bool,
  user: React.PropTypes.object,
  role: React.PropTypes.string,
  side: React.PropTypes.bool,
  status: React.PropTypes.string,
};

PlayerCard.contextTypes = {
};
