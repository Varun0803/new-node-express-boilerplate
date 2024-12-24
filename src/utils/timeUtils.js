const calculateDuration = (startDate, endDate) => {
  // const startDate = moment(startTimestamp);
  // const endDate = moment(endTimestamp);

  // if (!startDate.isValid() || !endDate.isValid()) {
  //   return false;
  // }

  // const duration = moment.duration(endDate.diff(startDate) + 86400000 );
  const durationInMilliseconds = endDate - startDate + 86400000; // Add 24 hours in milliseconds

  const days = Math.floor(durationInMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (durationInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (durationInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((durationInMilliseconds % (1000 * 60)) / 1000);
  const milliseconds = durationInMilliseconds % 1000;

  const readable = [
    days > 0 ? `${days}d` : '',
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}m` : '',
    seconds > 0 ? `${seconds}s` : '',
    milliseconds > 0 ? `${milliseconds}ms` : '',
  ]
    .filter((part) => part !== '')
    .join(' ');

  return readable || '0ms';
};

module.exports = {
  calculateDuration,
};
