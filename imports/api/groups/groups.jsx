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
    group.players = [{ id: `${group.ownerId}` }];
    return super.insert(group, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }

  remove(selector) {
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
  role: { type: Number, defaultValue: 0 }, // Whether group player is good or evil
});

TeamsSchema = new SimpleSchema({
  // Index of leader's id which is included in `players.id`, corresponds to the index of this team in `missions.teams`
  memberIndices: { type: [Number], defaultValue: [] }, // Indices of players who were selected to be sent out on the mission, correspond to `players.id`
  approvals: { type: [Boolean], defaultValue: [] }, // Indicate players whether to approve the mission team make-up or not, with indices correspond to `players.id`
  successVotes: { type: [Boolean], defaultValue: [] }, // Indicate members whether to vote for the mission to success or not, with indices correspond to `missions.teams.memberIndices`
});

MissionsSchema = new SimpleSchema({
  teams: { type: [TeamsSchema], defaultValue: [] },
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
  missions: { type: [MissionsSchema], defaultValue: [] }, // Mission proposals
  guessMerlin: { type: Boolean, optional: true }, // Indicate whether Assassin correctly guesses Merlin's identity or not
  messages: { type: [MessagesSchema], defaultValue: [] }
});

Groups.attachSchema(Groups.schema);

// This represents the keys from Groups objects that should be published
// to the client. If we add secret properties to Group objects, don't list
// them here to keep them private to the server.
Groups.publicFieldsWhenFindAll = {
  ownerId: 1,
  name: 1,
  'players.id': 1,
  'missions.length': 1,
};

// TODO: Remove secret properties to keep them private
Groups.publicFieldsWhenFindOne = {
  ownerId: 1,
  name: 1,
  players: 1,
  missions: 1,
  guessMerlin: 1,
  messages: 1,
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
  getLastTeam() { // Force return `null` if missions list or teams list is empty (instead of `undefined`)
    const lastMission = this.missions[this.missions.length - 1];
    return (lastMission || null) && lastMission.teams && lastMission.teams[lastMission.teams.length - 1] || null;
  },
  getTeamsCount() {
    return this.missions.reduce((c, m) => c + m.teams.length, 0);
  },
  findRequiredFailVotesCount(missionIndex) {
    return missionIndex == 3 && this.players.length >= 7 ? 2 : 1;
  },
  getSummaries() {
    return this.missions.map((m, i) =>
      m.teams.map(t => {
        const summary = { memberIndices: t.memberIndices, denierIndices: [], failVotesCount: null, result: undefined };
        if (t.memberIndices.length != 0 && t.approvals.indexOf(null) == -1) {
          summary.denierIndices = t.approvals.map((a, i) => a ? -1 : i).filter(i => i >= 0);
          if (t.approvals.filter(a => !a).length >= t.approvals.filter(a => a).length) { // Denied
            summary.result = null;
          } else if (t.successVotes.indexOf(null) == -1) {
            summary.failVotesCount = t.successVotes.filter(a => !a).length;
            summary.result = summary.failVotesCount < this.findRequiredFailVotesCount(i) ? true : false;
          }
        }
        return summary;
      })
    );
  },
  startNewMission() {
    const summaryResults = this.getSummaries().map(m => m[m.length - 1].result);
    if (summaryResults.filter(m => !m).length >= Groups.MISSIONS_COUNT_TO_WIN) {
      this.finish();
      return;
    } else if (summaryResults.filter(m => m).length >= Groups.MISSIONS_COUNT_TO_WIN) {
      this.startGuessingMerlin();
      return;
    }
    const newMission = { teams: [] };
    Groups.update(this._id, {
      $push: { missions: newMission }
    });
    this.missions.push(newMission); // Update local variable
    this.startSelectingMembers();
  },
  startSelectingMembers() {
    if (this.missions[this.missions.length - 1].teams.length >= Groups.MISSION_TEAMS_COUNT) {
      this.finish();
      return;
    }
    // const memberIndices = _.shuffle(Array.from(new Array(this.players.length), (_, i) => i)).slice(0, Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1]); // TEST
    const memberIndices = [];
    Groups.update(this._id, {
      $push: { [`missions.${this.missions.length - 1}.teams`]: { memberIndices: memberIndices, approvals: [], successVotes: [] } }
    });
    // FIXME: Remove redundancy (@ref 'methods' `selectedMembers`)
    this.missions[this.missions.length - 1].teams.push({ memberIndices: memberIndices, approvals: [], successVotes: [] }); // Update local variable
    if (!this.isSelectingMembers()) {
      this.startWaitingForApproval();
    }
  },
  startWaitingForApproval() {
    // const approvals = Array.from(new Array(this.players.length), () => Math.random() > 0.5 ? true : false); // TEST
    const approvals = Array.from(new Array(this.players.length), () => null);
    Groups.update(this._id, {
      $set: { [`missions.${this.missions.length - 1}.teams.${this.missions[this.missions.length - 1].teams.length - 1}.approvals`]: approvals }
    });
    // FIXME: Remove redundancy (@ref 'methods' `approve`)
    this.getLastTeam().approvals = approvals; // Update local variable
    if (this.isDenied()) {
      this.startSelectingMembers();
    } else if (!this.isWaitingForApproval()) {
      this.startWaitingForVote();
    }
  },
  startWaitingForVote() {
    const lastMission = this.missions[this.missions.length - 1];
    // const successVotes = Array.from(new Array(Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1]), (_, i) => this.players[lastMission.teams[lastMission.teams.length - 1].memberIndices[i]].role > 0 ? true : Math.random() > 0.3 ? true : false); // TEST
    const successVotes = Array.from(new Array(Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1]), (_, i) => this.players[lastMission.teams[lastMission.teams.length - 1].memberIndices[i]].role > 0 ? null : null);
    Groups.update(this._id, {
      $set: { [`missions.${this.missions.length - 1}.teams.${lastMission.teams.length - 1}.successVotes`]: successVotes }
    });
    // FIXME: Remove redundancy (@ref 'methods' `vote`)
    this.getLastTeam().successVotes = successVotes; // Update local variable
    if (!this.isWaitingForVote()) {
      this.startNewMission();
    }
  },
  startGuessingMerlin() {
    Groups.update(this._id, {
      $set: { guessMerlin: null }
    });
  },
  finish() {
    const playerActivities = [];
    const result = this.getSituation().result;
    for (const p of this.players) {
      playerActivities.push({ id: p.id, activity: { finishedAt: new Date(), role: p.role, result: p.role > 0 ? result : !result, deniedTeamsCount: 0, successTeamsCount: 0, failTeamsCount: 0 } });
    };
    for (const m of this.getSummaries()) {
      for (const t of m) {
        for (const i of t.memberIndices) {
          if (t.result == null) {
            playerActivities[i].activity.deniedTeamsCount++;
          } else if (t.result) {
            playerActivities[i].activity.successTeamsCount++;
          } else {
            playerActivities[i].activity.failTeamsCount++;
          }
        }
      };
    };
    for (const p of playerActivities) {
      Meteor.users.update(p.id, {
        $push: { activities: p.activity }
      });
    }
  },
  getLeader() {
    return this.missions.length > 0 ? Meteor.users.findOne(this.players[(this.getTeamsCount() - 1) % this.players.length].id) : null;
  },
  hasLeader(userId) {
    return this.missions.length > 0 ? this.players[(this.getTeamsCount() - 1) % this.players.length].id == userId : false;
  },
  hasMember(userId) {
    return this.getLastTeam() != null && this.getLastTeam().memberIndices.find(i => this.players[i].id == userId) != undefined;
  },
  isSelectingMembers() {
    return this.getLastTeam() != null && this.getLastTeam().memberIndices.length == 0;
  },
  checkSelectedAdditionalRolesValidation(selectedAdditionalRoles) {
    return selectedAdditionalRoles.filter(r => r < 0).length <= this.getEvilPlayersCount() - 1 && (selectedAdditionalRoles.indexOf(Groups.Roles.PERCIVAL) != -1 ? selectedAdditionalRoles.indexOf(Groups.Roles.MORGANA) != -1 : true);
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
    return this.getLastTeam() != null && this.getLastTeam().successVotes.indexOf(null) != -1;
  },
  isGuessingMerlin() {
    return this.guessMerlin === null;
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
        if (this.guessMerlin === undefined) {
          if (this.missions[this.missions.length - 1].teams.length >= Groups.MISSION_TEAMS_COUNT) {
            situation.status = situation.status.concat([<br key="br"/>, `(With ${Groups.MISSION_TEAMS_COUNT} denied mission team proposals)`]);
          }
        } else {
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
    const playerIndex = this.players.map(p => p.id).indexOf(playerId);
    const playerRole = this.players[playerIndex].role;
    const otherPlayer = userId != playerId;
    let role = '';
    let side = null;
    if (playerRole == Groups.Roles.UNDECIDED) {
      role = 'Undecided';
    } else {
      switch (this.findPlayerRole(userId)) {
      case Groups.Roles.SERVANT:
        [role, side] = otherPlayer ? ['Unknown', null] : ['Servant', true];
        break;
      case Groups.Roles.MERLIN:
        [role, side] = otherPlayer ? playerRole > 0 || playerRole == Groups.Roles.MORDRED ? ['Good', true] : ['Evil', false] : ['Merlin', true];
        break;
      case Groups.Roles.PERCIVAL:
        [role, side] = otherPlayer ? playerRole == Groups.Roles.MERLIN || playerRole == Groups.Roles.MORGANA ? ['Merlin', true] : ['Unknown', null] : ['Percival', true];
        break;
      case Groups.Roles.MINION:
        [role, side] = otherPlayer ? playerRole > 0 || playerRole == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Minion', false];
        break;
      case Groups.Roles.ASSASSIN:
        [role, side] = otherPlayer ? playerRole > 0 || playerRole == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Assassin', false];
        break;
      case Groups.Roles.MORDRED:
        [role, side] = otherPlayer ? playerRole > 0 || playerRole == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Mordred', false];
        break;
      case Groups.Roles.MORGANA:
        [role, side] = otherPlayer ? playerRole > 0 || playerRole == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Morgana', false];
        break;
      case Groups.Roles.OBERON:
        [role, side] = otherPlayer ? ['Unknown', null] : ['Oberon', false];
        break;
      case null:
        [role, side] = ['Unknown', null]; // [Groups.RoleNames[playerRole], playerRole > 0 ? true : false];
        break;
      }
    }
    let status = '';
    if (this.isWaitingForApproval()) {
      const approval = this.getLastTeam().approvals[playerIndex];
      status = approval == null ? 'Undecided' : approval ? 'Approved' : 'Denied';
    }
    if (this.isWaitingForVote()) {
      const vote = this.getLastTeam().successVotes[this.getLastTeam().memberIndices.indexOf(playerIndex)];
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
      const vote = this.getLastTeam().successVotes[this.getLastTeam().memberIndices.indexOf(this.players.map(p => p.id).indexOf(userId))];
      suggestion =
        <p>
          Press buttons to vote for the mission success or fail
          <br/>
          <b>{vote == null ? '' : `(You voted for ${vote ? 'success' : 'fail'})`}</b>
        </p>;
    } else if (this.isGuessingMerlin() && this.findPlayerRole(userId) == Groups.Roles.ASSASSIN) {
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
Groups.Roles = {
  UNDECIDED: 0,
  // Good
  SERVANT: 1,         // Loyal servant of Arthur: only knows how many evil players exist, not who they are (green, #1ABB9C)
  MERLIN: 2,          // Knows who the evil players are (blue, #3498DB)
  PERCIVAL: 3,        // Knows who Merlin is and is in a position to help protect Merlin's identity (blue sky, #50C1CF)
  // Evil
  MINION: -1,         // Minion of Mordred: are made aware of each other without the good players knowing (red, #E74C3C)
  ASSASSIN: -2,       // Guesses Merlin's identity to take last chance of redeeming when the evil players lose the game (purple, #9B59B6)
  MORDRED: -3,        // Does not reveal his identity to Merlin, leaving Merlin in the dark (orange, #F39C12)
  MORGANA: -4,        // Appears to be Merlin, revealing herself to Percival as Merlin (dark, #34495E)
  OBERON: -5,         // Does not reveal himself to the other evil players, nor does he gain knowledge of the other evil players (aero, #9CC2CB)
};
Groups.RoleNames = (() => {
  const names = {};
  for (const role in Groups.Roles) {
    names[Groups.Roles[role]] = role;
  }
  return names;
})();
Groups.MISSIONS_COUNT = 5;
Groups.MISSIONS_COUNT_TO_WIN = 3;
Groups.MISSION_TEAMS_COUNT = 5;
Groups.MISSIONS_MEMBERS_COUNT = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
};
