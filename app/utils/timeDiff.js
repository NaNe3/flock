import moment from "moment";

function getTimeDiff(timestamp) {
  const now = moment()
  const createdAt = moment(timestamp)
  const diffSeconds = now.diff(createdAt, 'seconds');
  const diffMinutes = now.diff(createdAt, 'minutes');
  const diffHours = now.diff(createdAt, 'hours');
  const diffDays = now.diff(createdAt, 'days');
  const diffWeeks = now.diff(createdAt, 'weeks');

  return {
    diffSeconds,
    diffMinutes,
    diffHours,
    diffDays,
    diffWeeks
  }
}

export function timeAgo(timestamp) {
  const { diffSeconds, diffMinutes, diffHours, diffDays, diffWeeks } = getTimeDiff(timestamp)

  if (diffSeconds < 60) {
    return `${diffSeconds}s`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m`
  } else if (diffHours < 24) {
    return `${diffHours}h`
  } else if (diffDays < 7) {
    return `${diffDays}d`
  } else {
    return `${diffWeeks}w`
  }
}

export function timeAgoGeneral(timestamp) {
  if (!timestamp) {
    return 'never'
  } else {
    const { diffSeconds, diffMinutes, diffHours, diffDays, diffWeeks } = getTimeDiff(timestamp)

    if (diffSeconds < 60) {
      return 'today'
    } else if (diffMinutes < 60) {
      return 'today'
    } else if (diffHours < 24) {
      return 'today'
    } else if (diffDays < 7) {
      if (diffDays === 1) {
        return 'yesterday'
      } else {
        return 'this week'
      }
    } else {
      return `${diffWeeks}w ago`;
    }
  }
}