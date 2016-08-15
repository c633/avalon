import React from 'react';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import { start, selectMembers, approve, vote, guess } from '../../api/groups/methods.js';
import PlayerCard from './player_card.jsx';
import ErrorModal from './error_modal.jsx';

export default class PlayersPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMemberIndices: [], guessedIndex: -1, errorModal: { isShowing: false, reason: '' } };
    this.restart = this.restart.bind(this);
    this.onPlayerCardClick = this.onPlayerCardClick.bind(this);
    this.selectMembers = this.selectMembers.bind(this);
    this.approve = this.approve.bind(this);
    this.vote = this.vote.bind(this);
    this.guess = this.guess.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { group } = this.props;
    const isSelectingMembers = group.isSelectingMembers() && group.hasLeader(Meteor.userId());
    const isGuessingMerlin = group.isGuessingMerlin() && group.findPlayerRole(Meteor.userId()) == Groups.Roles.ASSASSIN;
    const selectable = isSelectingMembers || isGuessingMerlin;
    const leader = group.getLeader();
    const summaries = group.getSummaries();
    return (
      <div className="x_panel">
        <div className="x_title">
          <div className="row">
            {
              summaries.length > 0 ?
                <div className="col-md-4 col-xs-4">
                  <div className="avalon-hint">
                    <img src="/images/tokens/leader.png" className="img-responsive"/>
                    <div>
                      <p>Mission {summaries.length}, team {summaries[summaries.length - 1].length}</p>
                      <p>Leader: <strong>{leader && leader.username}</strong></p>
                    </div>
                  </div>
                </div> : null
            }
            {
              group.isSelectingMembers() ?
                <div className="col-md-2 col-xs-2">
                  <div className="avalon-hint">
                    <img src="/images/tokens/member.png" className="img-responsive"/>
                    <p>Team member</p>
                  </div>
                </div> : null
            }
            {
              group.isWaitingForApproval() ?
                ['Approved', 'Denied'].map(a =>
                  <div key={a} className="col-md-2 col-xs-2">
                    <div className="avalon-hint">
                      <img src={`/images/tokens/${a.toLowerCase()}.png`} className="img-responsive"/>
                      <p>{a}</p>
                    </div>
                  </div>
                ) : null
            }
            {
              group.isWaitingForVote() ?
                ['Voted Success', 'Voted Fail'].map(v =>
                  <div key={v} className="col-md-2 col-xs-2">
                    <div className="avalon-hint">
                      <img src={`/images/tokens/${v.replace(' ', '-').toLowerCase()}.png`} className="img-responsive"/>
                      <p>{v}</p>
                    </div>
                  </div>
                ) : null
            }
            <div className="col-md-4 col-xs-4">
              <div className="avalon-hint">
                <strong>{group.getSituation().status}</strong>
              </div>
            </div>
          </div>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <div className="row">
            <div className="clearfix"></div>
            {group.getPlayers().map((player, index) => {
              return <PlayerCard
                key={player.user._id} onClick={() => { if (selectable) this.onPlayerCardClick(index); }}
                selectable={selectable}
                isMember={group.getSituation().result === undefined && (this.state.selectedMemberIndices.indexOf(index) != -1 || group.hasMember(player.user._id))}
                isGuessed={this.state.guessedIndex == index}
                group={group} player={player.user}/>
            })}
          </div>
          <div className="form-group">
            {isSelectingMembers ? <button className="btn btn-info" onClick={this.selectMembers}>Select members</button> : null}
            {
              group.isWaitingForApproval() && group.hasPlayer(Meteor.userId()) ?
                <span>
                  <button className="btn btn-success" onClick={() => this.approve(true)}>Approve</button>
                  <button className="btn btn-danger" onClick={() => this.approve(false)}>Deny</button>
                </span> : null
            }
            {
              group.isWaitingForVote() && group.hasMember(Meteor.userId()) ?
                <span>
                  <button className="btn btn-success" onClick={() => this.vote(true)}>Vote Success</button>
                  {
                    group.findPlayerRole(Meteor.userId()) < 0 ?
                      <button className="btn btn-danger" onClick={() => this.vote(false)}>Vote Fail</button> : null
                  }
                </span> : null
            }
            {isGuessingMerlin ? <button className="btn btn-dark" onClick={this.guess}>Guess Merlin</button> : null}
            <strong>{group.findSuggestion(Meteor.userId())}</strong>
            {group.hasOwner(Meteor.userId()) ? <div><button className="btn btn-primary" onClick={this.restart}>Restart game</button></div> : null}
          </div>
          {this.state.errorModal.isShowing ? <ErrorModal hide={() => this.setState({ errorModal: { isShowing: false } })} reason={this.state.errorModal.reason}/> : null}
        </div>
      </div>
    );
  }

  // REGION: Handlers

  restart() {
    const groupId = this.props.group._id;
    start.call({ groupId: groupId, additionalRoles: [], reset: true }, err => {
      if (err) {
        alert(err.reason);
      }
    });
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
    const { group } = this.props;
    selectMembers.call({ groupId: group._id, memberIndices: this.state.selectedMemberIndices }, err => {
      if (err) {
        this.setState({ errorModal: { isShowing: true, reason: group.findSuggestion(Meteor.userId()) } });
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
}

PlayersPanel.propTypes = {
  group: React.PropTypes.object,
};
