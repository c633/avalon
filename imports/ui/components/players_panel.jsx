import React from 'react';
import { Groups } from '../../api/groups/groups.jsx'; // Constants only
import { start, selectMembers, approve, vote, guess } from '../../api/groups/methods.js';
import PlayerCard from './player_card.jsx';
import ErrorModal from './error_modal.jsx';

export default class PlayersPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMemberIndices: [], guessedIndex: -1, errorModal: { isShowing: false, reason: null } };
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
    const leader = group.getLeader();
    const summaries = group.getSummaries();
    return (
      <div className="x_panel">
        <div className="x_title">
          <div className="row">
            <div className="col-md-4 col-xs-4">
              <div className="avalon-hint">
                {
                  Array.from(new Array(Groups.MISSIONS_COUNT)).map((_, index) => {
                    const summary = summaries[index];
                    const result = summary && (summary.length > 0 || null) && summary[summary.length - 1].result;
                    const style = {};
                    if (result !== undefined) {
                      style.backgroundImage = `url("/images/tokens/mission-${result == null ? 'denied' : result ? 'success' : 'fail'}.png")`;
                    } else {
                      style.backgroundColor = '#3498DB';
                      style.borderRadius = '50%';
                    }
                    const membersCount = Groups.MISSIONS_MEMBERS_COUNT[group.players.length][index];
                    const needMoreFailVotes = group.findRequiredFailVotesCount(index) > 1;
                    const title = `<b>Mission ${index + 1}</b><br/>${index > summaries.length - 1 ? `Need <b><i>${membersCount}</i></b> team members` : result === undefined ? `<i>PLAYING</i><br/>Need <b><i>${membersCount}</i></b> team members` : result == null ? 'Denied' : result ? 'Success' : 'Fail'}` + (needMoreFailVotes ? '<br/>(Require <b><i>2</i></b> fail votes for the mission to fail)' : '');
                    return (
                      <div key={index} className="avalon-token" style={style} data-container="body" data-toggle="tooltip" data-html={true} title={title}>
                        {index == summaries.length - 1 ? <img className="img-responsive avalon-token-mark-top" src="/images/tokens/playing.png"/> : null}
                        <span>{result !== undefined ? '' : membersCount}</span>
                        {needMoreFailVotes ? <img className="img-responsive avalon-token-mark-bottom" src="/images/tokens/more-fail-votes.png"/> : null}
                      </div>
                    );
                  })
                }
              </div>
            </div>
            <div className="col-md-8 col-xs-8">
              <div className="avalon-hint">
                {(group.isPlaying() ? group.findSuggestion(Meteor.userId()) : null) || <p>{group.getSituation().status}</p>}
              </div>
            </div>
          </div>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <div className="row">
            <div className="clearfix"></div>
            {group.getPlayers().map((player, index) => {
              const isMember = group.getSituation().result === undefined && (this.state.selectedMemberIndices.indexOf(index) != -1 || group.hasMember(player.user._id));
              const isGuessed = this.state.guessedIndex == index;
              const isSelectable =
                isSelectingMembers ?
                  (isMember || this.state.selectedMemberIndices.length < Groups.MISSIONS_MEMBERS_COUNT[group.players.length][summaries.length - 1] ? true : null) :
                  isGuessingMerlin ? !isGuessed : false;
              return <PlayerCard
                key={player.user._id} onClick={() => { if (isSelectable) this.onPlayerCardClick(index); }}
                isSelectable={isSelectable} isMember={isMember} isGuessed={isGuessed} group={group} player={player.user}/>
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
            {group.hasOwner(Meteor.userId()) ? <div><button className="btn btn-primary" onClick={this.restart}>Restart game</button></div> : null}
          </div>
          {this.state.errorModal.isShowing ? <ErrorModal hide={() => this.setState({ errorModal: { isShowing: false } })} reason={this.state.errorModal.reason}/> : null}
        </div>
      </div>
    );
  }

  // REGION: Lifecycle Methods

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
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
