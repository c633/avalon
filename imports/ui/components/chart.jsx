import React from 'react';
import ReactDom from 'react-dom';

export default class Chart extends React.Component {

  // REGION: Component Specifications

  render() {
    return <div className="avalon-chart"></div>;
  }

  // REGION: Lifecycle Methods

  componentDidMount() {
    const { type, config } = this.props;
    config['element'] = ReactDom.findDOMNode(this);
    switch (type) {
    case Chart.Types.BAR:
      this.chart = Morris.Bar(config);
      break;
    case Chart.Types.DONUT:
      this.chart = Morris.Donut(config);
      break;
    case Chart.Types.AREA:
      this.chart = Morris.Area(config);
      break;
    }
  }

  componentDidUpdate() {
    const { config } = this.props;
    this.chart.setData(config.data);
  }
}

Chart.propTypes = {
  type: React.PropTypes.number,
  config: React.PropTypes.object,
};

Chart.Types = {
  BAR: 0,
  DONUT: 1,
  AREA: 2
};
