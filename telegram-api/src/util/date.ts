function now() {
  const now = new Date(new Date().toISOString().split('T')[0]);
  return now;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { now, sleep };
