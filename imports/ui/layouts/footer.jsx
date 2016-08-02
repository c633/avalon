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
          <strong>Avalon game</strong>
        </div>
        <div className="clearfix"></div>
      </footer>
    );
  }
}
