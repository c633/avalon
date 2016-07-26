import React from 'react';

export default class Footer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <footer>
        <div className="pull-right">
          Avalon game
        </div>
        <div className="clearfix"></div>
      </footer>
    );
  }
}

Footer.propTypes = {
};

Footer.contextTypes = {
};
