import moment from "moment";

export default function timeAgo(timestamp) {
  const now = moment();
  const createdAt = moment(timestamp);
  const diffSeconds = now.diff(createdAt, 'seconds');
  const diffMinutes = now.diff(createdAt, 'minutes');
  const diffHours = now.diff(createdAt, 'hours');
  const diffDays = now.diff(createdAt, 'days');
  const diffWeeks = now.diff(createdAt, 'weeks');

  if (diffSeconds < 60) {
    return `${diffSeconds}s`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays < 7) {
    return `${diffDays}d`;
  } else {
    return `${diffWeeks}w`;
  }
}