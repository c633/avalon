import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Messages } from './messages.js';

export const send = new ValidatedMethod({
  name: 'messages.send',
  validate: new SimpleSchema({
    text: { type: String },
  }).validator(),
  run({ text }) {
    if (text.length > 0) {
      Messages.insert({
        senderId: this.userId,
        text: text,
        sentAt: new Date(),
      });
    }
  },
});
