import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class GroupsCollection extends Mongo.Collection {
  insert(group, callback) {
    group.playerIds = [group.ownerId];
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
  playerIds: { type: [String], defaultValue: [] }, // Include the owner's id
});

Groups.attachSchema(Groups.schema);

// This represents the keys from Groups objects that should be published
// to the client. If we add secret properties to Group objects, don't list
// them here to keep them private to the server.
Groups.publicFields = {
  ownerId: 1,
  name: 1,
  playerIds: 1,
};

Groups.helpers({
  owner() {
    return Meteor.users.findOne(this.ownerId);
  },
  players() {
    return this.playerIds.map(playerId => Meteor.users.findOne(playerId));
  },
  hasPlayer(userId) {
    return this.playerIds.indexOf(userId) != -1;
  }
});
