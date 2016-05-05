import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Lobby from '../pages/lobby';

export default createContainer(() => {
  return {
    user: Meteor.user(),
  };
}, Lobby);
