import React from 'react';
import { sendMessage } from '../../api/groups/methods.js';

export default class MissionsContent extends React.Component {

  // REGION: Component Specifications

  render() {
    const { group } = this.props;
    const players = group.getPlayers().map(p => p.user);
    return (
      <div className="avalon-missions">
        <div role="tablist" aria-multiselectable="true">
          {
            group.getMissions(true).map((m, i) => {
              const lastResult = (m.length > 0 || null) && m[m.length - 1].result;
              return (
                <div key={i} className="panel">
                  <div className="panel-heading" role="tab" aria-expanded="true">
                    <span className={`panel-title${lastResult === undefined ? '' : ` avalon-${lastResult ? 'good' : 'evil'}`}`}><b>Mission {i + 1}</b> ({lastResult === undefined ? 'Playing' : lastResult == null ? 'Denied' : lastResult ? 'Success' : 'Fail'})</span>
                    <img src={`/images/tokens/${lastResult === undefined ? 'playing' : `mission-${lastResult == null ? 'denied' : lastResult ? 'success' : 'fail'}`}.png`} className="pull-right avalon-mission-result"/>
                  </div>
                  <div role="tabpanel">
                    <div className="panel-body">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Leader</th>
                            <th>Team members</th>
                            <th>Deniers</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            m.map((t, j) =>
                              <tr key={j}>
                                <th scope="row">{j + 1}</th>
                                <td>{players[t.leaderIndex].username}</td>
                                <td>{t.memberIndices.map(i => <div key={i}>{players[i].username}</div>)}</td>
                                <td>{t.denierIndices.map(i => <div key={i}>{players[i].username}</div>)}</td>
                                <td>{t.result === undefined ? '' : t.result == null ? <div>Denied</div> : <div><b className={`avalon-${t.result ? 'good' : 'evil'}`}>{t.result ? 'Success' : 'Fail'}</b><br/>({t.failVotesCount} fail vote{t.failVotesCount == 1 ? '' : 's'})</div>}</td>
                              </tr>
                            )
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

MissionsContent.propTypes = {
  group: React.PropTypes.object,
};
