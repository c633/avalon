import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import AppContainer from '../../ui/containers/app_container.jsx';
import LobbyContainer from '../../ui/containers/lobby_container.jsx';
import GroupContainer from '../../ui/containers/group_container.jsx';
import UserContainer from '../../ui/containers/user_container.jsx';
import Auth from '../../ui/middlewares/auth.jsx';
import Login from '../../ui/pages/login.jsx';
import Signup from '../../ui/pages/signup.jsx';
import Rules from '../../ui/pages/rules.jsx';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="" component={AppContainer}>
      <Route path="/" component={LobbyContainer}/>
      <Route component={Auth}>
        <Route path="/groups/:name" component={GroupContainer}/>
      </Route>
      <Route path="/users/:username" component={UserContainer}/>
      <Route path="/login" component={Login}/>
      <Route path="/signup" component={Signup}/>
      <Route path="/rules" component={Rules}/>
    </Route>
  </Router>
);
