import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Number of players:   5   6   7   8   9   10

// Resistance           3   4   4   5   6   6       |
// Spies                2   2   3   3   3   4       | Number of Resistance Members & Government Spies

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
  isSpy: { type: Boolean, defaultValue: false }, // Whether group player is spy or not
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

Groups.schema = new SimpleSchema({
  ownerId: { type: String, regEx: SimpleSchema.RegEx.Id }, // Owner's id
  name: { type: String },
  players: { type: [PlayersSchema], defaultValue: [] }, // Group players, include the owner
  missions: { type: [MissionsSchema], defaultValue: [] }, // Mission proposals
});

Groups.attachSchema(Groups.schema);

// This represents the keys from Groups objects that should be published
// to the client. If we add secret properties to Group objects, don't list
// them here to keep them private to the server.
Groups.publicFieldsWhenFindAll = {
  ownerId: 1,
  name: 1,
  "players.id": 1,
  "missions.length": 1,
};

// TODO: Remove secret properties to keep them private
Groups.publicFieldsWhenFindOne = {
  ownerId: 1,
  name: 1,
  "players": 1,
  "missions": 1,
};

Groups.helpers({
  getOwner() {
    return Meteor.users.findOne(this.ownerId);
  },
  belongsTo(userId) {
    return this.ownerId == userId;
  },
  getPlayers() {
    return this.players.map(player => ({ user: Meteor.users.findOne(player.id), isSpy: player.isSpy }));
  },
  hasPlayer(userId) {
    return this.players.find(p => p.id == userId) != undefined;
  },
  hasSpy(userId) {
    return this.players.find(p => p.id == userId && p.isSpy) != undefined;
  },
  isPlaying() {
    return this.missions.length != 0
  },
  getLastTeam() { // Force return `null` if missions list or teams list is empty (instead of `undefined`)
    const lastMission = this.missions[this.missions.length - 1];
    return (lastMission || null) && lastMission.teams[lastMission.teams.length - 1] || null;
  },
  getTeamsCount() {
    return this.missions.reduce((c, m) => c + m.teams.length, 0);
  },
  startNewMission() {
    if (this.missions.length >= Groups.MISSIONS_COUNT) {
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
      return;
    }
    const newTeam = {};
    newTeam[`missions.${this.missions.length - 1}.teams`] = { memberIndices: [], approvals: [], successVotes: [] };
    Groups.update(this._id, {
      $push: newTeam
    });
  },
  startWaitingForApproval() {
    const initialApprovals = {};
    initialApprovals[`missions.${this.missions.length - 1}.teams.${this.missions[this.missions.length - 1].teams.length - 1}.approvals`] = Array.from(new Array(this.players.length), () => null);
    Groups.update(this._id, {
      $set: initialApprovals
    });
  },
  startWaitingForVote() {
    const initialVotes = {};
    initialVotes[`missions.${this.missions.length - 1}.teams.${this.missions[this.missions.length - 1].teams.length - 1}.successVotes`] = Array.from(new Array(Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1]), () => null);
    Groups.update(this._id, {
      $set: initialVotes
    });
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
  isSelectedMembersValid(selectedMemberIndices) {
    return selectedMemberIndices.length != Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1] || selectedMemberIndices.find(i => i >= this.players.length) != undefined ? false : true;
  },
  isWaitingForApproval() {
    return this.getLastTeam() != null && this.getLastTeam().approvals.indexOf(null) != -1;
  },
  isDenied() {
    return this.getLastTeam() != null && this.getLastTeam().approvals.indexOf(null) == -1 && this.getLastTeam().approvals.filter(a => a == false).length >= this.getLastTeam().approvals.filter(a => a == true).length;
  },
  isWaitingForVote() {
    return this.getLastTeam() != null && this.getLastTeam().successVotes.indexOf(null) != -1;
  },
  getMissionsHistory() {
    return this.missions.map((m, i) => m.teams.map(t => t.memberIndices.length == 0 || t.approvals.indexOf(null) != -1 || (t.successVotes.length != 0 && t.successVotes.indexOf(null) != -1) ? undefined : t.approvals.filter(a => a == false).length >= t.approvals.filter(a => a == true).length ? null : t.successVotes.filter(a => a == false).length < (i == 3 && this.players.length >= 7 ? 2 : 1) ? true : false));
  }
});

Groups.MIN_PLAYERS_COUNT = 5;
Groups.MAX_PLAYERS_COUNT = 10;
Groups.MISSIONS_COUNT = 5;
Groups.MISSION_TEAMS_COUNT = 5;
Groups.MISSIONS_MEMBERS_COUNT = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
};
