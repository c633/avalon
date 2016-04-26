import React from 'react';
import { Router, Route, browserHistory } from 'react-router';

import AppContainer from '../../ui/containers/app_container';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={AppContainer}>
    </Route>
  </Router>
);
