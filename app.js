const express = require('express');
const echo = require('./echo-tracker.js');
const app = express();
const CronJob = require('cron').CronJob;
const tracker = new echo({
  host: '127.0.0.1',
  port: 6379
});
const job = new CronJob({
  cronTime: '* * * * * *',
  onTick: function() {
    return tracker
      .getScheduledEchoes()
      .then(data => {
        const now = +new Date();

        return data
          .filter(set => set.match(/message_(\d+)_set/))  // filter sets in format `message_DDDDD_set`
          .map(set => set.split('_')[1])                  // take timestamps
          .map(timestamp => +timestamp)
          .filter(timestamp => timestamp <= now)          // filter timestamps already left
          .forEach(timestamp => {
            return tracker
              .getEchoes(timestamp)                       // for every timestamp take all scheduled messages
              .then(messages => {
                const promises = messages.map(message => {
                  return tracker
                    .delEcho(timestamp, message)          // remove message and print it
                    .then(() => console.log(`app.js: echo "${message}" at "${new Date(timestamp)}"`));
                });
                return Promise.all(promises);
              })
              .catch(err => console.error(err));
          });
      })
      .catch(err => console.error(`app.js: getScheduledEchoes() failed with error ${err}`));
  },
  start: false,
});

/**
 * /echoAtTime/?date=2017-10-10T01:20:30&message=Hello,World!
 * /echoAtTime/?date=2017-10-10T01:20&message=Hello,World!
 * /echoAtTime/?date=2017-10-10&message=Hello,World!
 */
app.get('/echoAtTime/', function (req, res) {
  const date = req.query.date;
  const message = req.query.message;

  if (!date || !message) {
    return res.status(500).send('One of parameters is invalid');
  } else {
    const timestamp = Date.parse(date);
    if (isFinite(timestamp)) {
      return tracker
        .addEcho(timestamp, message)
        .then((data) => res.status(200).send(`${data}`))
        .catch((err) => res.status(500).send(`${err}`));
    } else {
      return res.status(500).send('Date is not valid');
    }
  }
});

app.listen(3000, function () {
  console.log('app.js: listen 3000 port');
});
job.start();

module.exports = app;