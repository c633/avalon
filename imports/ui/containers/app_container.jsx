import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import App from '../layouts/app';

export default createContainer(() => {
  return {
    user: Meteor.user(),
  };
}, App);
