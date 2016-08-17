import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.jsx';
import { createContainer } from 'meteor/react-meteor-data';
import Lobby from '../pages/lobby.jsx';

export default createContainer(() => {
  const loaded = Meteor.subscribe('groups.findAll').ready() && Meteor.subscribe('users.findAll').ready();
  return {
    _user: Meteor.user(), // NOTE: Additional prop: make page automatically re-render even if user logged out
    groups: Groups.find().fetch(),
    loaded: loaded
  };
}, Lobby);
