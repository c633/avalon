import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.js';
import { createContainer } from 'meteor/react-meteor-data';
import Lobby from '../pages/lobby';

export default createContainer(() => {
  Meteor.subscribe('groups.public');
  return {
    user: Meteor.user(),
    groups: Groups.find().fetch(),
  };
}, Lobby);
