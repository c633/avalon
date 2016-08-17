import React from 'react';

export default class Footer extends React.Component {
  constructor(props) {
    super(props);
  }

  // REGION: Component Specifications

  render() {
    return (
      <footer>
        <div className="pull-right">
          <b>Avalon game</b>
        </div>
        <div className="clearfix"></div>
      </footer>
    );
  }
}
