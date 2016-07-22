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

Groups.schema = new SimpleSchema({
  ownerId: { type: String, regEx: SimpleSchema.RegEx.Id }, // Owner's id
  name: { type: String },
  players: { type: [PlayersSchema], defaultValue: [] }, // Group players, include the owner
  additionalRoles: { type: [Number], defaultValue: [] }, // Additional roles
  missions: { type: [MissionsSchema], defaultValue: [] }, // Mission proposals
  guessMerlin: { type: Boolean, optional: true, defaultValue: null }, // Indicate whether Assassin correctly guesses Merlin's identity or not
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
  additionalRoles: 1,
  missions: 1,
  guessMerlin: 1,
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
  findPlayerRole(userId) {
    return this.players.find(p => p.id == userId).role;
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
    const missionsHistory = this.getMissionsHistory().map(m => m[m.length - 1]);
    if (missionsHistory.filter(m => m).length >= Groups.MISSIONS_COUNT_TO_WIN || missionsHistory.filter(m => !m).length >= Groups.MISSIONS_COUNT_TO_WIN) {
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
    const lastMission = this.missions[this.missions.length - 1];
    const initialVotes = {};
    const successVotes = Array.from(new Array(Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1]), (_, i) => this.players[lastMission.teams[lastMission.teams.length - 1].memberIndices[i]].role > 0 ? true : null);
    initialVotes[`missions.${this.missions.length - 1}.teams.${lastMission.teams.length - 1}.successVotes`] = successVotes;
    Groups.update(this._id, {
      $set: initialVotes
    });
    this.getLastTeam().successVotes = successVotes; // Update local variable
    if (!this.isWaitingForVote()) {
      this.startNewMission();
    }
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
  isWaitingForGuessing() {
    return this.getMissionsHistory().map(m => m[m.length - 1]).filter(m => m).length >= Groups.MISSIONS_COUNT_TO_WIN && this.guessMerlin == null;
  },
  getMissionsHistory() {
    return this.missions.map((m, i) => m.teams.map(t => t.memberIndices.length == 0 || t.approvals.indexOf(null) != -1 || (t.successVotes.length != 0 && t.successVotes.indexOf(null) != -1) ? undefined : t.approvals.filter(a => a == false).length >= t.approvals.filter(a => a == true).length ? null : t.successVotes.filter(a => a == false).length < (i == 3 && this.players.length >= 7 ? 2 : 1) ? true : false));
  },
  getResult() {
    return this.guessMerlin == null || this.guessMerlin ? false : true;
  },
});

Groups.MIN_PLAYERS_COUNT = 5;
Groups.MAX_PLAYERS_COUNT = 10;
Groups.Roles = {
  UNDECIDED: 0,
  // Good
  SERVANT: 1,         // Loyal servant of Arthur: only knows how many evil players exist, not who they are
  MERLIN: 2,          // Knows who the evil players are
  PERCIVAL: 3,        // Knows who Merlin is and is in a position to help protect Merlin's identity
  // Evil
  MINION: -1,         // Minion of Mordred: are made aware of each other without the good players knowing
  ASSASSIN: -2,       // Guesses Merlin's identity to take last chance of redeeming when the evil players lose the game
  MORDRED: -3,        // Does not reveal his identity to Merlin, leaving Merlin in the dark
  MORGANA: -4,        // Appears to be Merlin, revealing herself to Percival as Merlin
  OBERON: -5,         // Does not reveal himself to the other evil players, nor does he gain knowledge of the other evil players
};
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
