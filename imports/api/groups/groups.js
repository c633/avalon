import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Number of players:   5   6   7   8   9   10

// Resistance           3   4   4   5   6   6       |
// Spies	              2   2   3   3   3   4       | Number of Resistance Members & Government Spies

// Mission 1            2   2   2   3   3   3       |
// Mission 2            3   3   3   4   4   4       |
// Mission 3	          2   3   3   4   4   4       | Number of members required to be sent on each mission
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

MissionsSchema = new SimpleSchema({
  leaderId: { type: String, regEx: SimpleSchema.RegEx.Id }, // Mission leader's id
  memberIndices: { type: [Number], defaultValue: [] }, // Indices of players who were selected to be sent out on the mission, correspond to `players.id`
  approvals: { type: [Boolean], defaultValue: [] }, // Indicate players whether to approve the mission team make-up or not, with indices correspond to `players.id`
  failVotes: { type: [Boolean], defaultValue: [] }, // Indicate members whether to vote for the mission to fail or not, with indices correspond to `missions.memberIndices`
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
Groups.publicFieldsWhileFindAll = {
  ownerId: 1,
  name: 1,
  "players.id": 1,
  "missions.length": 1,
};

// TODO: Remove secret properties to keep them private
Groups.publicFieldsWhileFindOne = {
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
  lastMissionHasLeader(userId) {
    return this.missions.length > 0 ? this.missions[this.missions.length - 1].leaderId == userId : false;
  },
  lastMissionHasMember(userId) {
    return this.missions.length > 0 ? this.missions[this.missions.length - 1].memberIndices.find(i => this.players[i].id == userId) != undefined : false;
  },
  lastMissionIsSelectingMembers() {
    return this.missions.length > 0 ? this.missions[this.missions.length - 1].memberIndices.length < Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1] : false;
  },
  lastMissionMembersIsValid(selectedMemberIndices) {
    return selectedMemberIndices.length != Groups.MISSIONS_MEMBERS_COUNT[this.players.length][this.missions.length - 1] || selectedMemberIndices.find(i => i >= this.players.length) != undefined ? false : true;
  },
  lastMissionIsWaitingForApproval() {
    return this.missions.length > 0 ? this.missions[this.missions.length - 1].approvals.find(a => a == undefined) != undefined : false;
  }
});

Groups.MIN_PLAYERS_COUNT = 5;
Groups.MAX_PLAYERS_COUNT = 10;
Groups.MISSIONS_MEMBERS_COUNT = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 3, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5], 
};
