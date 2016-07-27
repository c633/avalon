import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.js';
import { createContainer } from 'meteor/react-meteor-data';
import App from '../layouts/app.jsx';

export default createContainer(() => {
  return {
    user: Meteor.user(),
  };
}, App);
