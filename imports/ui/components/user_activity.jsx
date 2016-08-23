import React from 'react';
import Chart from './chart.jsx';

export default class UserActivity extends React.Component {

  // REGION: Component Specifications

  render() {
    const { user } = this.props;
    const today = new Date();
    const month = today.getMonth();
    const activities = user.activities.filter(a => a.finishedAt.getYear() == today.getYear() && a.finishedAt.getMonth() == month);
    const dates = Array.from(new Array(new Date(today.getYear(), month, 0).getDate()), (_, i) => i + 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sepr', 'Oct', 'Nov', 'Dec'];
    const groupChartData = dates.map(date =>
      activities.filter(a =>
        a.finishedAt.getDate() == date).reduce((c, a) => {
          return { date: c.date, winTimesCount: c.winTimesCount + (a.result ? 1 : 0), loseTimesCount: c.loseTimesCount + (!a.result ? 1 : 0) };
        }, { date: date + ` ${monthNames[month]}`, winTimesCount: 0, loseTimesCount: 0 })
    );
    const teamChartData = dates.map(date =>
      activities.filter(a =>
        a.finishedAt.getDate() == date).reduce((c, a) => {
          return { date: c.date, deniedTeamsCount: c.deniedTeamsCount + a.deniedTeamsCount, successTeamsCount: c.successTeamsCount + a.successTeamsCount, failTeamsCount: c.failTeamsCount + a.failTeamsCount };
        }, { date: date + ` ${monthNames[month]}`, deniedTeamsCount: 0, successTeamsCount: 0, failTeamsCount: 0 })
    );
    const groupChartConfig = {
      data: groupChartData,
      xkey: 'date',
      ykeys: ['winTimesCount', 'loseTimesCount'],
      barColors: ['#26B99A', '#D9534F'],
      labels: ['Win', 'Lose'],
      hideHover: 'auto',
      resize: true
    };
    const teamChartConfig = {
      data: teamChartData,
      xkey: 'date',
      ykeys: ['deniedTeamsCount', 'successTeamsCount', 'failTeamsCount'],
      lineColors: ['#4B5F71', '#26B99A', '#D9534F'],
      trendLineColors: ['#4B5F71', '#26B99A', '#D9534F'],
      labels: ['Denied', 'Success', 'Fail'],
      pointSize: 2,
      hideHover: 'auto',
      parseTime: false,
      resize: true
    };
    return (
      <div>
        <Chart type={Chart.Types.BAR} config={groupChartConfig}/>
        <Chart type={Chart.Types.AREA} config={teamChartConfig}/>
      </div>
    );
  }
}

UserActivity.propTypes = {
  user: React.PropTypes.object,
};
