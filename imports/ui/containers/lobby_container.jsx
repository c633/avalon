import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.js';
import { createContainer } from 'meteor/react-meteor-data';
import Lobby from '../pages/lobby';

export default createContainer(() => {
  const loaded = Meteor.subscribe('groups.findAll').ready() && Meteor.subscribe('users.findAll').ready();
  return {
    user: Meteor.user(), // NOTE: Additional props: make 'group_table' automatically re-render even if user logged out
    groups: Groups.find().fetch(),
    loaded: loaded
  };
}, Lobby);
