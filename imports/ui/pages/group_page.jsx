import React from 'react';
import { Link } from 'react-router';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import RoleCard from '../components/role_card.jsx';
import PlayerCard from '../components/player_card.jsx';
import { start, selectRoles, selectMembers, approve, vote, guess } from '../../api/groups/methods.js';
import { findSituation, findPlayerInformation } from '../helpers/utils.js';

export default class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMemberIndices: [], selectedAdditionalRoles: [] };
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
    this.onRoleCardClick = this.onRoleCardClick.bind(this);
    this.onPlayerCardClick = this.onPlayerCardClick.bind(this);
    this.selectRoles = this.selectRoles.bind(this);
    this.selectMembers = this.selectMembers.bind(this);
    this.guess = this.guess.bind(this);
    this.approve = this.approve.bind(this);
    this.vote = this.vote.bind(this);
  }

  start() {
    const groupId = this.props.group._id;
    try {
      this.selectRoles();
    } catch (e) {
      alert('Cannot start game');
      return;
    }
    start.call({ groupId: groupId, reset: false }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  restart() {
    const groupId = this.props.group._id;
    start.call({ groupId: groupId, reset: true }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  onRoleCardClick(role) {
    const selectedAdditionalRoles = this.state.selectedAdditionalRoles;
    const index = selectedAdditionalRoles.indexOf(role);
    if (index == -1) {
      selectedAdditionalRoles.push(role);
    } else {
      selectedAdditionalRoles.splice(index, 1);
    }
    this.setState({ selectedAdditionalRoles: selectedAdditionalRoles });
  }

  onPlayerCardClick(memberIndex) {
    let selectedMemberIndices = [memberIndex];
    if (!this.props.group.isWaitingForGuessing()) {
      selectedMemberIndices = this.state.selectedMemberIndices;
      const index = selectedMemberIndices.indexOf(memberIndex);
      if (index == -1) {
        selectedMemberIndices.push(memberIndex);
      } else {
        selectedMemberIndices.splice(index, 1);
      }
    }
    this.setState({ selectedMemberIndices: selectedMemberIndices });
  }

  selectRoles() {
    const groupId = this.props.group._id;
    selectRoles.call({ groupId: groupId, selectedAdditionalRoles: this.state.selectedAdditionalRoles }, err => {
      if (err) {
        alert(err.reason);
        throw new Meteor.Error();
      }
    });
  }

  selectMembers() {
    const groupId = this.props.group._id;
    selectMembers.call({ groupId: groupId, selectedMemberIndices: this.state.selectedMemberIndices }, err => {
      if (err) {
        alert(err.reason);
      } else {
        this.setState({ selectedMemberIndices: [] });
      }
    });
  }

  guess() {
    const groupId = this.props.group._id;
    guess.call({ groupId: groupId, merlinIndex: this.state.selectedMemberIndices[0] }, err => {
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

  render() {
    const { group, loaded } = this.props;
    let content = null;
    if (loaded) {
      const panelAdditionalRoles = group.hasOwner(Meteor.userId()) && !group.isPlaying() ? (
        <div className="x_panel">
          <div className="x_title">
            <h2>Additional roles</h2>
            <div className="clearfix"></div>
          </div>
          <div className="x_content">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                Click to select additional roles if you want (you can only select up to <strong>{group.getEvilPlayersCount() - 1}</strong> additional evil role(s))
              </div>
              <div className="clearfix"></div>
              {
                [Groups.Roles.PERCIVAL, Groups.Roles.MORDRED, Groups.Roles.MORGANA, Groups.Roles.OBERON].map(r =>
                  <RoleCard key={r} onClick={() => this.onRoleCardClick(r)} role={r} selected={this.state.selectedAdditionalRoles.indexOf(r) != -1}/>
                )
              }
            </div>
            {
              group.getPlayers().length >= Groups.MIN_PLAYERS_COUNT ?
                <div className="form-group">
                  <button className="btn btn-success" onClick={this.start}>Start playing</button>
                </div> : ''
            }
          </div>
        </div>
      ) : '';
      const isGuessing = group.isWaitingForGuessing() && group.findPlayerRole(Meteor.userId()) == Groups.Roles.ASSASSIN;
      const selectable = group.isSelectingMembers() && group.hasLeader(Meteor.userId()) || isGuessing;
      const leader = group.getLeader();
      const panelPlayers = (
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
                const { role, side, status } = findPlayerInformation(group, Meteor.userId(), player, index);
                return <PlayerCard
                  key={player.user._id} onClick={() => { if(selectable) this.onPlayerCardClick(index); }}
                  isLeader={group.hasLeader(player.user._id)}
                  isMember={!group.isWaitingForGuessing() && (group.isSelectingMembers() && this.state.selectedMemberIndices.indexOf(index) != -1 || group.hasMember(player.user._id))}
                  isGuessed={group.isWaitingForGuessing() && this.state.selectedMemberIndices.indexOf(index) != -1}
                  selectable={selectable} user={player.user} role={role} side={side} status={status}/>
              })}
            </div>
            {
              selectable && !isGuessing ?
                <div className="form-group">
                  <button className="btn btn-info" onClick={this.selectMembers}>Select members</button>
                </div> : ''
            }
            {
              group.isWaitingForApproval() ?
                <div className="form-group">
                  <button className="btn btn-success" onClick={() => this.approve(true)}>Approve</button>
                  <button className="btn btn-danger" onClick={() => this.approve(false)}>Deny</button>
                </div> : ''
            }
            {
              group.isWaitingForVote() && group.hasMember(Meteor.userId()) ?
                <div className="form-group">
                  <button className="btn btn-success" onClick={() => this.vote(true)}>Vote Success</button>
                  {
                    group.findPlayerRole(Meteor.userId()) < 0 ?
                    <button className="btn btn-danger" onClick={() => this.vote(false)}>Vote Fail</button> : ''
                  }
                </div> : ''
            }
            {
              isGuessing ?
                <div className="form-group">
                  <button className="btn btn-info" onClick={this.guess}>Guess Merlin</button>
                </div> : ''
            }
          </div>
        </div>
      );
      const history = group.getMissionsHistory().map((m, i) => (
        <div key={i}>Mission {i + 1}: {m.map(t => t === undefined ? 'Playing' : t == null ? 'Denied' : t ? 'Success' : 'Fail').join(', ')}</div>
      ));
      const panelInformation = (
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
            {findSituation(group, Meteor.userId())}
          </div>
        </div>
      );
      content = (
        <div>
          <div className="page-title">
            <div className="title_left">
              <h3><small></small></h3>
            </div>
          </div>
          <div className="clearfix"></div>
          <div className="row">
            <div className="col-md-8">
              {panelAdditionalRoles}
              {panelPlayers}
            </div>
            <div className="col-md-4">
              {panelInformation}
            </div>
          </div>
        </div>
      );
    }
    return content;
  }
}

GroupPage.propTypes = {
  group: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
