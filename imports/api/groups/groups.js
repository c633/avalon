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

Groups.schema = new SimpleSchema({
  ownerId: { type: String, regEx: SimpleSchema.RegEx.Id }, // Owner's id
  name: { type: String },
  players: { type: [Object], defaultValue: [] }, // Group players, include the owner
  "players.$.id": { type: String, regEx: SimpleSchema.RegEx.Id }, // Group player's id
  "players.$.isSpy": { type: Boolean, defaultValue: false }, // Whether group player is spy or not
  missions: { type: [Object], defaultValue: [] }, // Mission proposals
  "missions.$.leaderId": { type: String, regEx: SimpleSchema.RegEx.Id }, // Mission leader's id
  "missions.$.memberIds": { type: [String], defaultValue: [] }, // Id of players who were selected to be sent out on the mission, included in `players.$.id`
  "missions.$.approverIds": { type: [String], defaultValue: [] }, // Id of players who approved the mission, included in `players.$.id`
  "missions.$.failVoterIds": { type: [String], defaultValue: [] }, // Id of members who voted for the mission to fail, included in `missions.$.memberIds`
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
  getPlayers() {
    return this.players.map(player => Meteor.users.findOne(player.id));
  },
  hasPlayer(userId) {
    return this.players.find((p) => { return p.id == userId }) != undefined;
  },
  isPlaying() {
    return this.missions.length != 0
  }
});

Groups.MIN_PLAYERS_COUNT = 5;
Groups.MAX_PLAYERS_COUNT = 10;
