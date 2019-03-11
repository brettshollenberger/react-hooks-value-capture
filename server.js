// Everything here is default json-server code (https://github.com/typicode/json-server).
// 
// This allows us to use a super simple database (just the file db.json),
// and the rewriter method allows us to map all expected REST commands
// (e.g. get /api/todos) to 
let port, dbFile;

if (process.env.NODE_ENV == 'test') {
  port = '3001'
  dbFile = 'db.test.json'
} else {
  port = '3000'
  dbFile = 'db.json'
}

const jsonServer = require('json-server')
const app = jsonServer.create()
var http = require('http')
const express = require('express')
const server = http.createServer(app);
const router = jsonServer.router(dbFile)
const middlewares = jsonServer.defaults({watch: true})
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server, port: 8080 });
const crypto = require("crypto");
const _ = require('lodash')
let sockets = {}

app.use(middlewares)
app.use(express.static('public'))
app.use(jsonServer.bodyParser)

app.use((req, res, next) => {
  router.db.assign(require('require-uncached')(`./${dbFile}`)).write();
  // Continue to JSON Server router
  next()
});

app.post('/api/todos/bulk_delete', ({body: { ids }}, res) => {
  let todos = router.db.get('todos').value().filter(todo => !ids.includes(todo.id) )
  router.db.setState({ todos: todos }).write()
  res.sendStatus(200)
})

app.put('/api/todos/bulk_update', ({body: { todos }}, res) => {
  todos.forEach((todo) => {
    router.db.get('todos').find({id: todo.id}).assign(todo).write()
  })
  res.sendStatus(200)
})

app.use(jsonServer.rewriter({
  '/api/*': '/$1'
}))

app.use(router)

function generateKey() {
  return crypto.randomBytes(20).toString('hex');
}

wss.on('connection', async function(ws) {
  console.log('received open socket request')

  let key = generateKey()

  while (sockets.hasOwnProperty(key)) {
    key = generateKey()
  }

  sockets[key] = ws

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    ws.send(JSON.stringify({key: 'msg_received', value: message}));
  });

  ws.send(JSON.stringify({key: 'connection_established', value: key}));
});

server.listen(port, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});