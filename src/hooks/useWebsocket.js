import {useState, useEffect, useRef} from 'react'
const _ = require('lodash')

export default function useWebsocket() {
  const [socket, setSocket] = useState();
  const [socketOpen, setSocketOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const onMessage = useRef()

  function closeSocket() {
    setSocket(undefined)
    setSocketOpen(false)
    createSocket();
  }

  function receiveMsg(msg) {
    console.log(`messages ${JSON.stringify(messages)}`)
    setMessages(messages.concat(JSON.parse(msg.data)))
  }

  function createSocket() {
    onMessage.current = receiveMsg

    if (_.isUndefined(socket)) {
      let ws = new WebSocket('ws://127.0.0.1:8080/')
      setSocket(ws)

      ws.onopen = () => { setSocketOpen(false)}
      ws.onmessage = (msg) => { onMessage.current(msg) }

      let i = 1;
      setInterval(function() {
        ws.send(`Hello ${i}`)
        i += 1
      }, 500)
    }
  }

  useEffect(createSocket)

  return {
    open: socketOpen,
    reconnect: closeSocket,
    messages: messages
  };
}
