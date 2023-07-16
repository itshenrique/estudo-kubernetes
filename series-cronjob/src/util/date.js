module.exports = {
  now() {
    const now = new Date(new Date().toISOString().split('T')[0]);
    return now;
  },
  removeTimeZone(date) {
    const now = new Date(date.toISOString().split('T')[0]);
    return now;
  },
};
