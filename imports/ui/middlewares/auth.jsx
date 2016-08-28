import React from 'react';
import { browserHistory } from 'react-router';

export default Auth = React.createClass({

  // REGION: 'ReactMeteorData' mixin

  getMeteorData() {
    return { isAuthenticated: Meteor.userId() !== null };
  },

  // REGION: Component Specifications

  render() {
    return this.props.children;
  },

  mixins: [ReactMeteorData], // Retrieve current userId

  // REGION: Lifecycle Methods

  componentWillMount() {
    if (!this.data.isAuthenticated) {
      browserHistory.replace('/login');
    }
  },

  componentDidUpdate() {
    if (!this.data.isAuthenticated) {
      browserHistory.replace('/login');
    }
  }
});
