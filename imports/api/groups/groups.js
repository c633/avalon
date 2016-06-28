import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class GroupsCollection extends Mongo.Collection {
  insert(group, callback) {
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
  userId: { type: String, regEx: SimpleSchema.RegEx.Id }, // Creator's id
  name: { type: String },
  playerIds: { type: [String], defaultValue: [] }, // Exclude the creator's id
});

Groups.attachSchema(Groups.schema);

// This represents the keys from Groups objects that should be published
// to the client. If we add secret properties to Group objects, don't list
// them here to keep them private to the server.
Groups.publicFields = {
  userId: 1,
  name: 1,
  playerIds: 1,
};

Groups.helpers({
});
