import React from 'react';
import Chart from './chart.jsx';
import { Groups } from '../../api/groups/groups.jsx';

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
    const roleChartData = activities.reduce((c, a) => {
      c[c.findIndex(r => r.role == a.role)].count++;
      return c;
    }, Object.keys(Groups.Roles).map(r => { return { name: r, role: Groups.Roles[r], count: 0 }; }).filter(r => r.role != Groups.Roles.UNDECIDED)).map(r => {
      return { label: r.name, value: r.count };
    });
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
    const hasData = roleChartData.filter(r => r.value > 0).length > 0;
    const roleChartConfig = {
      data: hasData ? roleChartData : [{ label: 'No data', value: 1 }],
      colors: ['#1ABB9C', '#3498DB', '#50C1CF', '#E74C3C', '#9B59B6', '#F39C12', '#34495E', '#9CC2CB'],
      formatter: y => hasData ? y + ' times' : '',
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
        <div className="row">
          <div className="col-sm-3">
            <Chart type={Chart.Types.DONUT} config={roleChartConfig}/>
          </div>
          <div className="col-sm-9">
            <Chart type={Chart.Types.AREA} config={teamChartConfig}/>
          </div>
        </div>
      </div>
    );
  }
}

UserActivity.propTypes = {
  user: React.PropTypes.object,
};
