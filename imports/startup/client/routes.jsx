import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import AppContainer from '../../ui/containers/app_container.jsx';
import LobbyContainer from '../../ui/containers/lobby_container.jsx';
import GroupContainer from '../../ui/containers/group_container.jsx';
import UserContainer from '../../ui/containers/user_container.jsx';
import AuthLogin from '../../ui/pages/auth_login.jsx';
import AuthSignup from '../../ui/pages/auth_signup.jsx';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="" component={AppContainer}>
      <Route path="/" component={LobbyContainer}/>
      <Route path="/groups/:id" component={GroupContainer}/>
      <Route path="/users/:id" component={UserContainer}/>
      <Route path="/login" component={AuthLogin}/>
      <Route path="/signup" component={AuthSignup}/>
    </Route>
  </Router>
);
