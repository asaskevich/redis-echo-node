const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('./app');
const echo = require('./echo-tracker.js');
const mocha = require('mocha');

chai.use(chaiHttp);

describe('GET /', () => {
  it('should respond with error', (done) => {
    chai.request(server)
      .get(`/`)
      .end((err, res) => {
        should.exist(err);
        res.status.should.eq(404);
        done();
      });
  });
});

describe('GET /echoAtTime/', () => {
  it('should respond with error for empty request', (done) => {
    chai.request(server)
      .get(`/echoAtTime/`)
      .end((err, res) => {
        should.exist(err);
        res.status.should.eq(500);
        done();
      });
  });

  it('should respond with error for empty message', (done) => {
    chai.request(server)
      .get(`/echoAtTime/?time=2017-01-01`)
      .end((err, res) => {
        should.exist(err);
        res.status.should.eq(500);
        done();
      });
  });

  it('should respond with error for empty date', (done) => {
    chai.request(server)
      .get(`/echoAtTime/?message=test`)
      .end((err, res) => {
        should.exist(err);
        res.status.should.eq(500);
        done();
      });
  });

  it('should respond with error for invalid date', (done) => {
    chai.request(server)
      .get(`/echoAtTime/?message=test&date=NaN`)
      .end((err, res) => {
        should.exist(err);
        res.status.should.eq(500);
        done();
      });
  });

  it('should not respond with error for valid input', (done) => {
    chai.request(server)
      .get(`/echoAtTime/?message=test&date=2017-12-12`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.eq(200);
        done();
      });
  });
});

describe('echo-tracker.js', () => {
  const tracker = new echo({
    host: '127.0.0.1',
    port: 6379
  });
  it('should not respond with error when add', (done) => {
    tracker.addEcho(0, 'test').then(data => {
      done();
    }).catch(err => {
      should.not.exist(err);
      done();
    });
  });

  it('should not respond with error when get echo', (done) => {
    tracker.getEcho(0).then(data => {
      data.should.eq('test');
      done();
    }).catch(err => {
      should.not.exist(err);
      done();
    });
  });

  it('should not respond with error when delete', (done) => {
    tracker.delEcho(0, 'test').then(data => {
      done();
    }).catch(err => {
      should.not.exist(err);
      done();
    });
  });

  it('should not respond with error when getting all echoes', (done) => {
    tracker.addEcho(0, 'test').then(data => {
      tracker.getEchoes(0).then(data => {
        data.length.should.eq(1);
        data[0].should.eq('test');
        done();
      }).catch(err => {
        should.not.exist(err);
        done();
      });
    }).catch(err => {
      should.not.exist(err);
      done();
    });
  });

  it('should not respond with error when getting all scheduled actions', (done) => {
    tracker.addEcho(0, 'test').then(_ => {
      tracker.getScheduledEchoes().then(data => {
        data.length.should.eq(2);
        data[0].should.eq('message_0_set');
        done();
      }).catch(err => {
        should.not.exist(err);
        done();
      });
    }).catch(err => {
      should.not.exist(err);
      done();
    });
  });
});