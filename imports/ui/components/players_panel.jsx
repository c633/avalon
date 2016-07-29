import React from 'react';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import PlayerCard from '../components/player_card.jsx';
import { selectMembers, approve, vote, guess } from '../../api/groups/methods.js';

export default class PlayersPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMemberIndices: [], guessedIndex: -1 };
    this.onPlayerCardClick = this.onPlayerCardClick.bind(this);
    this.selectMembers = this.selectMembers.bind(this);
    this.approve = this.approve.bind(this);
    this.vote = this.vote.bind(this);
    this.guess = this.guess.bind(this);
  }

  onPlayerCardClick(memberIndex) {
    if (this.props.group.isSelectingMembers()) {
      const selectedMemberIndices = this.state.selectedMemberIndices;
      const index = selectedMemberIndices.indexOf(memberIndex);
      if (index == -1) {
        selectedMemberIndices.push(memberIndex);
      } else {
        selectedMemberIndices.splice(index, 1);
      }
      this.setState({ selectedMemberIndices: selectedMemberIndices });
    } else {
      this.setState({ guessedIndex: memberIndex });
    }
  }

  selectMembers() {
    const groupId = this.props.group._id;
    selectMembers.call({ groupId: groupId, memberIndices: this.state.selectedMemberIndices }, err => {
      if (err) {
        alert(err.reason);
      } else {
        this.setState({ selectedMemberIndices: [] });
      }
    });
  }

  approve(approval) {
    const groupId = this.props.group._id;
    approve.call({ groupId: groupId, approval: approval }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  vote(success) {
    const groupId = this.props.group._id;
    vote.call({ groupId: groupId, success: success }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  guess() {
    const groupId = this.props.group._id;
    guess.call({ groupId: groupId, merlinIndex: this.state.guessedIndex }, err => {
      if (err) {
        alert(err.reason);
      } else {
        this.setState({ guessedIndex: -1 });
      }
    });
  }

  render() {
    const { group } = this.props;
    const isSelectingMembers = group.isSelectingMembers() && group.hasLeader(Meteor.userId());
    const isGuessingMerlin = group.isGuessingMerlin() && group.findPlayerRole(Meteor.userId()) == Groups.Roles.ASSASSIN; 
    const selectable = isSelectingMembers || isGuessingMerlin;
    const leader = group.getLeader();
    return (
      <div className="x_panel">
        <div className="x_title">
          <div className="row">
            <div className="col-md-6 col-xs-6">
              <div className="avalon-hint">
                <img src="/images/items/leader.png" className="img-responsive"/>
                <p>Leader: <strong>{leader && leader.username}</strong></p>
              </div>
            </div>
            {
              group.isSelectingMembers() ?
                <div className="col-md-offset-3 col-md-3 col-xs-3">
                  <div className="avalon-hint">
                    <img src="/images/items/member.png" className="img-responsive"/>
                    <p><span>Team member</span></p>
                  </div>
                </div> : ''
            }
            {
              group.isWaitingForApproval() ?
                ['Approved', 'Denied'].map(a =>
                  <div key={a} className="col-md-3 col-xs-3">
                    <div className="avalon-hint">
                      <img src={`/images/items/${a.toLowerCase()}.png`} className="img-responsive"/>
                      <p><span>{a}</span></p>
                    </div>
                  </div>
                ) : ''
            }
            {
              group.isWaitingForVote() ?
                ['Voted Success', 'Voted Fail'].map(v =>
                  <div key={v} className="col-md-3 col-xs-3">
                    <div className="avalon-hint">
                      <img src={`/images/items/${v.replace(' ', '-').toLowerCase()}.png`} className="img-responsive"/>
                      <p><span>{v}</span></p>
                    </div>
                  </div>
                ) : ''
            }
          </div>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <div className="row">
            <div className="clearfix"></div>
            {group.getPlayers().map((player, index) => {
              const { role, side, status } = group.findInformation(Meteor.userId(), index);
              return <PlayerCard
                key={player.user._id} onClick={() => { if (selectable) this.onPlayerCardClick(index); }}
                playersCount={group.players.length}
                isLeader={group.hasLeader(player.user._id)}
                isMember={group.getSituation().result === undefined && (this.state.selectedMemberIndices.indexOf(index) != -1 || group.hasMember(player.user._id))}
                isGuessed={this.state.guessedIndex == index}
                selectable={selectable} user={player.user} role={role} side={side} status={status}/>
            })}
          </div>
          <div className="form-group">
            {isSelectingMembers ? <button className="btn btn-info" onClick={this.selectMembers}>Select members</button> : ''}
            {
              group.isWaitingForApproval() && group.hasPlayer(Meteor.userId()) ?
                <div>
                  <button className="btn btn-success" onClick={() => this.approve(true)}>Approve</button>
                  <button className="btn btn-danger" onClick={() => this.approve(false)}>Deny</button>
                </div> : ''
            }
            {
              group.isWaitingForVote() && group.hasMember(Meteor.userId()) ?
                <div>
                  <button className="btn btn-success" onClick={() => this.vote(true)}>Vote Success</button>
                  {
                    group.findPlayerRole(Meteor.userId()) < 0 ?
                      <button className="btn btn-danger" onClick={() => this.vote(false)}>Vote Fail</button> : ''
                  }
                </div> : ''
            }
            {isGuessingMerlin ? <button className="btn btn-dark" onClick={this.guess}>Guess Merlin</button> : ''}
            {group.findSuggestion(Meteor.userId())}
          </div>
        </div>
      </div>
    );
  }
}

PlayersPanel.propTypes = {
  group: React.PropTypes.object,
};
