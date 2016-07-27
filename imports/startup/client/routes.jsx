import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import AppContainer from '../../ui/containers/app_container';
import LobbyContainer from '../../ui/containers/lobby_container';
import GroupContainer from '../../ui/containers/group_container.jsx';
import AuthLogin from '../../ui/pages/auth_login';
import AuthSignup from '../../ui/pages/auth_signup';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="" component={AppContainer}>
      <Route path="/" component={LobbyContainer}/>
      <Route path="/groups/:id" component={GroupContainer}/>
      <Route path="/login" component={AuthLogin}/>
      <Route path="/signup" component={AuthSignup}/>
    </Route>
  </Router>
);
