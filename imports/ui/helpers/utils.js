import { Groups } from '../../api/groups/groups.js'; // Constants only

export const findSituation = (group, userId) => {
  let situation;
  if (group.isSelectingMembers()) {
    situation = 'Leader is selecting team members';
    if (group.hasLeader(userId)) {
      situation += ` (Must select ${Groups.MISSIONS_MEMBERS_COUNT[group.players.length][group.missions.length - 1]} members)`;
    }
  } else if (group.isWaitingForApproval()) {
    situation = 'Waiting for players to approve the mission team members';
  } else if (group.isWaitingForVote()) {
    situation = 'Waiting for team members to vote for the mission success or fail';
  } else if (group.isWaitingForGuessing()) {
    situation = 'Waiting for Assassin to guess Merlin\'s identity';
  } else if (group.isPlaying()) {
    situation = group.getResult() ? 'Good players win' : 'Evil players win';
  }
  return situation;
};

export const findPlayerInformation = (group, userId, player, index) => {
  const otherPlayer = userId != player.user._id;
  let role;
  let side = null;
  if (player.role == Groups.Roles.UNDECIDED) {
    role = 'Undecided';
  } else {
    switch (group.findPlayerRole(userId)) {
    case Groups.Roles.SERVANT:
      [role, side] = otherPlayer ? ['Unknown', null] : ['Servant', true];
      break;
    case Groups.Roles.MERLIN:
      [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.MORDRED ? ['Good', true] : ['Evil', false] : ['Merlin', true];
      break;
    case Groups.Roles.PERCIVAL:
      [role, side] = otherPlayer ? player.role == Groups.Roles.MERLIN || player.role == Groups.Roles.MORGANA ? ['Merlin', true] : ['Unknown', null] : ['Percival', true];
      break;
    case Groups.Roles.MINION:
      [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Minion', false];
      break;
    case Groups.Roles.ASSASSIN:
      [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Assassin', false];
      break;
    case Groups.Roles.MORDRED:
      [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Mordred', false];
      break;
    case Groups.Roles.MORGANA:
      [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Morgana', false];
      break;
    case Groups.Roles.OBERON:
      [role, side] = otherPlayer ? ['Unknown', null] : ['Oberon', false];
      break;
    }
  }
  let status = '';
  if (group.isWaitingForApproval()) {
    const approval = group.getLastTeam().approvals[index];
    status = approval == null ? 'Undecided' : approval ? 'Approved' : 'Denied';
  }
  if (group.isWaitingForVote()) {
    const vote = group.getLastTeam().successVotes[group.getLastTeam().memberIndices.indexOf(index)];
    status = vote === undefined ? '' /* : otherPlayer ? 'Going on mission' */ : vote == null ? 'Undecided' : vote ? 'Voted Success' : 'Voted Fail';
  }
  return { role: role, side: side, status: status }
};
