## redis-echo-node
### How to run
- `npm install`
- `node app.js`
- visit `localhost:3000/echoAtTime/?date={your date in format YYYY-MM-DDTHH:MM:SS}&message={message}`
- wait for the cho response

### How to test
There are some Mocha/Chai based tests for http-server and redis component.
- `npm install`
- `npm test`

### Idea
We have redis sets containing all messages scheduled for echo. Every one set contains messages scheduled for specified moment of time. If there are some echoes for the similar timestamp - they will be on common set. When we put new message, we use command `SADD message_{timestamp}_set value`. When we need to know which moments of time have scheduled actions, we can use `KEYS message_*` command which returns array of keys matched desired pattern and stored in redis. After it we can filter neccesssary sets and recieve messages. If node process will fail in this moment - something bad will not happen - data in redis is not modified. After filtering we iterate through every matching set with command `SMEMBERS message_{timestamp}_set`. We take all items from next set and start doing our work. If node process will fail in this moment - something bad will not happen - we took data but not printed and removed it from redis yet. For every message we print it and remove from redis by `SREM message_{timestamp}_set value` command. There are two narrow points - when we put and when we remove data. If node process will fail on putting data - there is no chances to get our message to be printed. If node process will fail on removing data - there is no chances to avoid duplicate message. 