import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Number of players:   5   6   7   8   9   10

// Good                 3   4   4   5   6   6       |
// Evil                 2   2   3   3   3   4       | Number of Good players & Evil players

// Mission 1            2   2   2   3   3   3       |
// Mission 2            3   3   3   4   4   4       |
// Mission 3            2   4   3   4   4   4       | Number of members required to be sent on each mission
// Mission 4            3   3   4*	5*  5*  5*      |
// Mission 5            3   4   4   5   5   5       |

// Missions marked with an asterisk (*) require TWO fail cards to be played in order for the mission to fail, others require ONE fail card.

class GroupsCollection extends Mongo.Collection {
  insert(group, callback) {
    group.players = [{ id: `${group.ownerId}`, role: 'Undecided' }];
    group.createdAt = new Date();
    return super.insert(group, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }

  remove(selector, callback) {
    return super.remove(selector, callback);
  }
}

export const Groups = new GroupsCollection('Groups');

// Deny all client-side updates since we will be using methods to manage this collection
Groups.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

PlayersSchema = new SimpleSchema({
  id: { type: String, regEx: SimpleSchema.RegEx.Id }, // Group player's id
  role: { type: String, defaultValue: 'Undecided' }, // Whether group player is good or evil
});

TeamsSchema = new SimpleSchema({
  // Index of leader's id which is included in `players.id`, corresponds to the index of this team in `missions.teams`
  memberIndices: { type: [Number], defaultValue: [] }, // Indices of players who were selected to be sent out on the mission, correspond to `players.id`
  approvals: { type: [Boolean], defaultValue: [] }, // Indicate players whether to approve the mission team make-up or not, with indices correspond to `players.id`
});

MissionsSchema = new SimpleSchema({
  teams: { type: [TeamsSchema], defaultValue: [] },
  votes: { type: [Boolean], defaultValue: [] }, // Indicate members whether to vote for the mission to success or not, with indices correspond to `missions.teams.memberIndices`
});

MessagesSchema = new SimpleSchema({
  senderId: { type: String }, // Sender's id
  text: { type: String },
  sentAt: { type: Date },
});

Groups.schema = new SimpleSchema({
  ownerId: { type: String, regEx: SimpleSchema.RegEx.Id }, // Owner's id
  name: { type: String },
  players: { type: [PlayersSchema], defaultValue: [] }, // Group players, include the owner
  firstLeaderIndex: { type: Number, defaultValue: 0 },
  missions: { type: [MissionsSchema], defaultValue: [] }, // Mission proposals
  guessMerlin: { type: Boolean, optional: true }, // Indicate whether Assassin correctly guesses Merlin's identity or not
  messages: { type: [MessagesSchema], defaultValue: [] },
  createdAt: { type: Date }
});

Groups.attachSchema(Groups.schema);

Groups.publicFields = {
  findAll: {
    ownerId: 1,
    name: 1,
    'players.id': 1,
    'missions.length': 1,
  },
  findOne: { // TODO: Remove secret properties to keep them private
    ownerId: 1,
    name: 1,
    players: 1,
    firstLeaderIndex: 1,
    missions: 1,
    guessMerlin: 1,
    messages: 1,
  }
};

Groups.helpers({
  getOwner() {
    return Meteor.users.findOne(this.ownerId);
  },
  hasOwner(userId) {
    return this.ownerId == userId;
  },
  getPlayers() {
    return this.players.map(player => ({ user: Meteor.users.findOne(player.id), role: player.role }));
  },
  getEvilPlayersCount() {
    return Math.ceil(this.players.length / 3);
  },
  hasPlayer(userId) {
    return this.players.find(p => p.id == userId) != undefined;
  },
  findPlayerRole(userId) { // Force return `null` if group has no such user (instead of `undefined`)
    const player = this.players.find(p => p.id == userId);
    return (player || null) && player.role;
  },
  isPlaying() {
    return this.missions.length != 0;
  },
  getLastMission() { // Private use only
    return this.missions[this.missions.length - 1];
  },
  getLastTeam() { // Force return `null` if missions list or teams list is empty (instead of `undefined`)
    const lastMission = this.getLastMission();
    return (lastMission || null) && lastMission.teams && lastMission.teams[lastMission.teams.length - 1] || null;
  },
  getTeamsCount() {
    return this.missions.reduce((c, m) => c + m.teams.length, 0);
  },
  getLastTeamsCount() {
    return this.getLastMission().teams.length;
  },
  findRequiredFailVotesCount(missionIndex) {
    return missionIndex == 3 && this.players.length >= 7 ? 2 : 1;
  },
  getSummaries() {
    let lastMissionsTeamsCount = 0;
    return this.missions.map((m, i) => {
      const mission = m.teams.map((t, j) => {
        const team = { leaderIndex: (this.firstLeaderIndex + lastMissionsTeamsCount + j) % this.players.length, memberIndices: t.memberIndices, denierIndices: [], failVotesCount: null, result: undefined };
        if (t.memberIndices.length != 0 && t.approvals.indexOf(null) == -1) {
          team.denierIndices = t.approvals.map((a, i) => a ? -1 : i).filter(i => i >= 0);
          if (j < Groups.MISSION_TEAMS_COUNT - 1 && t.approvals.filter(a => !a).length >= t.approvals.filter(a => a).length) { // Denied, Hammer
            team.result = null;
          } else if (m.votes.indexOf(null) == -1) {
            team.failVotesCount = m.votes.filter(a => !a).length;
            team.result = team.failVotesCount < this.findRequiredFailVotesCount(i) ? true : false;
          }
        }
        return team;
      });
      lastMissionsTeamsCount += m.teams.length;
      return mission;
    });
  },
  getLeader() {
    return this.missions.length > 0 ? Meteor.users.findOne(this.players[(this.firstLeaderIndex + this.getTeamsCount() - 1) % this.players.length].id) : null;
  },
  hasLeader(userId) {
    return this.missions.length > 0 ? this.players[(this.firstLeaderIndex + this.getTeamsCount() - 1) % this.players.length].id == userId : false;
  },
  hasHammer(userId) {
    return this.missions.length > 0 ? this.players[(this.firstLeaderIndex + this.getTeamsCount() - this.getLastTeamsCount() + Groups.MISSION_TEAMS_COUNT - 1) % this.players.length].id == userId : false;
  },
  hasMember(userId) {
    return this.getLastTeam() != null && this.getLastTeam().memberIndices.find(i => this.players[i].id == userId) != undefined;
  },
  isSelectingMembers() {
    return this.getLastTeam() != null && this.getLastTeam().memberIndices.length == 0;
  },
  checkSelectedAdditionalRolesValidation(selectedAdditionalRoles) {
    return selectedAdditionalRoles.filter(r => !Groups.ROLES[r].side).length <= this.getEvilPlayersCount() - 1 && (selectedAdditionalRoles.indexOf('Percival') != -1 ? selectedAdditionalRoles.indexOf('Morgana') != -1 : true);
  },
  checkSelectedMembersValidation(selectedMemberIndices) {
    return selectedMemberIndices.length != Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1] || selectedMemberIndices.find(i => i >= this.players.length) != undefined ? false : true;
  },
  isWaitingForApproval() {
    return this.getLastTeam() != null && this.getLastTeam().approvals.indexOf(null) != -1;
  },
  isDenied() {
    return this.getLastTeam() != null && this.getLastTeam().approvals.indexOf(null) == -1 && this.getLastTeam().approvals.filter(a => !a).length >= this.getLastTeam().approvals.filter(a => a).length;
  },
  isWaitingForVote() {
    return this.getLastMission() != null && this.getLastMission().votes.indexOf(null) != -1;
  },
  isGuessingMerlin() {
    return this.guessMerlin === null;
  },
  checkPlayerHasApproved(userId) {
    return this.getLastTeam() != null && this.getLastTeam().approvals[this.players.map(p => p.id).indexOf(userId)] != null;
  },
  checkMemberHasVoted(userId) {
    return this.getLastMission() != null && this.getLastMission().votes[this.getLastTeam().memberIndices.indexOf(this.players.map(p => p.id).indexOf(userId))] != null;
  },
  getSituation() {
    const situation = { status: '', slot: undefined, result: undefined };
    if (!this.isPlaying()) {
      const playersCount = this.players.length;
      if (playersCount < Groups.MIN_PLAYERS_COUNT) {
        situation.status = ['Waiting for more players'];
        situation.slot = null;
      } else {
        situation.status = ['Ready to play', ' (Waiting for owner ', <b key="owner">{this.getOwner().username}</b>, ' to start game)'];
        situation.slot = playersCount < Groups.MAX_PLAYERS_COUNT ? true : false;
      }
    } else {
      if (this.getLastTeam() == null) {
        return situation;
      }
      if (this.isSelectingMembers()) {
        situation.status = ['Leader ', <b key="leader">{this.getLeader().username}</b>, ' is selecting team members'];
      } else if (this.isWaitingForApproval()) {
        situation.status = ['Waiting for players to approve the mission team members'];
      } else if (this.isWaitingForVote()) {
        situation.status = ['Waiting for team members to vote for the mission success or fail'];
      } else if (this.isGuessingMerlin()) {
        situation.status = ['Waiting for ', <i key="assassin" className="avalon-evil">Assassin</i>, ' to guess ', <i key="merlin" className="avalon-good">Merlin's</i>, ' identity'];
        situation.result = null;
      } else {
        const result = this.guessMerlin === undefined || this.guessMerlin ? false : true;
        situation.status = result ? [<b key="good" className="avalon-good">Good</b>, ' players win'] : [<b key="evil" className="avalon-evil">Evil</b>, ' players win'];
        if (this.guessMerlin !== undefined) {
          if (this.guessMerlin) {
            situation.status = situation.status.concat([<br key="br"/>, '(', <i key="assassin" className="avalon-evil">Assassin</i>, ' killed ', <i key="merlin" className="avalon-good">Merlin</i>, ')']);
          } else {
            situation.status = situation.status.concat([<br key="br"/>, '(', <i key="assassin" className="avalon-evil">Assassin</i>, ' failed at killing ', <i key="merlin" className="avalon-good">Merlin</i>, ')']);
          }
        }
        situation.result = result;
      }
    }
    return situation;
  },
  findInformation(userId, playerId) {
    const indices = this.players.map(p => p.id);
    const userRole = this.players[indices.indexOf(userId)] && this.players[indices.indexOf(userId)].role || 'Undecided';
    const playerIndex = indices.indexOf(playerId);
    const playerRole = this.players[playerIndex].role;
    const otherPlayer = userId != playerId;
    const role = this.isPlaying() && this.getSituation().result == null && otherPlayer ? Groups.ROLES[userRole] && Groups.ROLES[userRole].visions && Groups.ROLES[userRole].visions[playerRole] || 'Unknown' : playerRole;
    const side = (role == 'Good' ? true : role == 'Evil' ? false : (Groups.ROLES[role] || null) && Groups.ROLES[role].side);
    let status = '';
    if (this.isWaitingForApproval()) {
      const approval = this.getLastTeam().approvals[playerIndex];
      status = approval === undefined ? '' : otherPlayer || approval == null ? 'Waiting' : approval ? 'Approved' : 'Denied';
    }
    if (this.isWaitingForVote()) {
      const vote = this.getLastMission().votes[this.getLastTeam().memberIndices.indexOf(playerIndex)];
      status = vote === undefined ? '' : otherPlayer || vote == null ? 'Waiting' : vote ? 'Voted Success' : 'Voted Fail';
    }
    return { role: role, side: side, status: status };
  },
  findSuggestion(userId) {
    let suggestion;
    if (this.hasOwner(userId) && !this.isPlaying()) {
      suggestion =
        <p>
          Click to select additional roles if you want
          <br/>
          (You can only select up to <b>{this.getEvilPlayersCount() - 1}</b> additional <i className="avalon-evil">evil</i> role(s)).
          <br/>
          Note that <i className="avalon-good">PERCIVAL</i> must be selected with <i className="avalon-evil">MORGANA</i>
        </p>;
    } else if (this.isSelectingMembers() && this.hasLeader(userId)) {
      suggestion =
        <p>
          You are leader. Select player cards then press '<b>Select members</b>' button to select <b>{Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1]}</b> team members
        </p>;
    } else if (this.isWaitingForApproval() && this.hasPlayer(userId)) {
      const approval = this.getLastTeam().approvals[this.players.map(p => p.id).indexOf(userId)];
      suggestion =
        <p>
          Press buttons to approve or deny the mission team members
          <br/>
          <b>{approval == null ? '' : `(You ${approval ? 'approved' : 'denied'})`}</b>
        </p>;
    } else if (this.isWaitingForVote() && this.hasMember(userId)) {
      const vote = this.getLastMission().votes[this.getLastTeam().memberIndices.indexOf(this.players.map(p => p.id).indexOf(userId))];
      suggestion =
        <p>
          Press buttons to vote for the mission success or fail
          <br/>
          <b>{vote == null ? '' : `(You voted for ${vote ? 'success' : 'fail'})`}</b>
        </p>;
    } else if (this.isGuessingMerlin() && this.findPlayerRole(userId) == 'Assassin') {
      suggestion =
        <p>
          Select one player card then press '<b>Guess Merlin</b>' button to guess who is <i className="avalon-good">Merlin</i>
        </p>;
    }
    return suggestion;
  }
});

Groups.MIN_PLAYERS_COUNT = 5;
Groups.MAX_PLAYERS_COUNT = 10;
Groups.ROLES = {
  Servant: { // Loyal servant of Arthur: only knows how many evil players exist, not who they are (green, #1ABB9C)
    side: true,
  },
  Merlin: { // Knows who the evil players are (blue, #3498DB)
    side: true,
    visions: { Servant: 'Good', Percival: 'Good', Minion: 'Evil', Assassin: 'Evil', Mordred: 'Good', Morgana: 'Evil', Oberon: 'Evil' }
  },
  Percival: { // Knows who Merlin is and is in a position to help protect Merlin's identity (blue sky, #50C1CF)
    side: true,
    visions: { Merlin: 'Merlin', Morgana: 'Merlin' }
  },
  Minion: { // Minion of Mordred: are made aware of each other without the good players knowing (red, #E74C3C)
    side: false,
    visions: { Servant: 'Good', Merlin: 'Good', Percival: 'Good', Minion: 'Evil', Assassin: 'Evil', Mordred: 'Evil', Morgana: 'Evil', Oberon: 'Good' }
  },
  Assassin: { // Guesses Merlin's identity to take last chance of redeeming when the evil players lose the game (purple, #9B59B6)
    side: false,
    visions: { Servant: 'Good', Merlin: 'Good', Percival: 'Good', Minion: 'Evil', Assassin: 'Evil', Mordred: 'Evil', Morgana: 'Evil', Oberon: 'Good' }
  },
  Mordred: { // Does not reveal his identity to Merlin, leaving Merlin in the dark (orange, #F39C12)
    side: false,
    visions: { Servant: 'Good', Merlin: 'Good', Percival: 'Good', Minion: 'Evil', Assassin: 'Evil', Mordred: 'Evil', Morgana: 'Evil', Oberon: 'Good' }
  },
  Morgana: { // Appears to be Merlin, revealing herself to Percival as Merlin (dark, #34495E)
    side: false,
    visions: { Servant: 'Good', Merlin: 'Good', Percival: 'Good', Minion: 'Evil', Assassin: 'Evil', Mordred: 'Evil', Morgana: 'Evil', Oberon: 'Good' }
  },
  Oberon: { // Does not reveal himself to the other evil players, nor does he gain knowledge of the other evil players (aero, #9CC2CB)
    side: false
  }
};

Groups.MISSIONS_COUNT = 5;
Groups.MISSIONS_COUNT_TO_WIN = Math.ceil(Groups.MISSIONS_COUNT / 2);
Groups.MISSION_TEAMS_COUNT = 5;
Groups.MISSIONS_MEMBERS_COUNT = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
};
