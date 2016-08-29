import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class MessagesCollection extends Mongo.Collection {
  insert(message, callback) {
    return super.insert(message, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }

  remove(selector, callback) {
    return super.remove(selector, callback);
  }
}

export const Messages = new MessagesCollection('Messages');

// Deny all client-side updates since we will be using methods to manage this collection
Messages.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Messages.schema = new SimpleSchema({
  senderId: { type: String }, // Sender's id
  text: { type: String },
  sentAt: { type: Date },
});

Messages.attachSchema(Messages.schema);

Messages.publicFields = {
  findAll: {
    senderId: 1,
    text: 1,
    sentAt: 1
  }
};
