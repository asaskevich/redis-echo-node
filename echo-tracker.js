const redis = require('redis');

class EchoTracker {
  constructor(config) {
    this.client = redis.createClient(config);
  }

  addEcho(timestamp, value) {
    return new Promise((then, fail) => this.client.sadd(`message_${timestamp}_set`, value, function(err, data) {
      if (err) return fail(err);
      else return then(data);
    }));
  }

  getEcho(timestamp) {
    return new Promise((then, fail) => this.client.spop(`message_${timestamp}_set`, function(err, data) {
      if (err) return fail(err);
      else return then(data);
    }));
  }

  getEchoes(timestamp) {
    return new Promise((then, fail) => this.client.smembers(`message_${timestamp}_set`, function(err, data) {
      if (err) return fail(err);
      else return then(data);
    }));
  }

  delEcho(timestamp, value) {
    return new Promise((then, fail) => this.client.srem(`message_${timestamp}_set`, value, function(err, data) {
      if (err) return fail(err);
      else return then(data);
    }));
  }

  getScheduledEchoes() {
    return new Promise((then, fail) => this.client.keys('message_*', function(err, data) {
      if (err) return fail(err);
      else return then(data);
    }));
  }
}

module.exports = EchoTracker;