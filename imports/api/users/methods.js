import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const changeAvatar = new ValidatedMethod({
  name: 'users.changeAvatar',
  validate: new SimpleSchema({
    avatarVersion: { type: Number },
  }).validator(),
  run({ avatarVersion }) {
    Meteor.users.update(this.userId, {
      $set: { 'brief.avatarVersion': avatarVersion }
    });
  },
});
