export default {
  level: 'info',
  log(message) {
    console.log(`[${this.level}] ${message}`);
  }
};
