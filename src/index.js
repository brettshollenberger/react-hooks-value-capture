import React, {useContext} from 'react'
import { render } from 'react-dom'
import useWebsocket from './hooks/useWebsocket'
import { Box, Grommet } from 'grommet';
const _ = require('lodash')

function AdminDebugger() {
  const socket = useContext(SocketContext)

  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {_.map(socket.messages, function(msg) {
          return (
            <tr key={`tr-${msg.value}`}>
              <td>{msg.key}</td>
              <td>{JSON.stringify(msg.value)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const SocketContext = React.createContext(null)

const theme = {
  global: {
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
};

function App() {
  const socket = useWebsocket();

  return (
    <Grommet theme={theme}>
      <SocketContext.Provider value={socket} >
        <Box
          align='center'
          justify='center'>
          <Box
            tag='body'
            border={{ color: 'brand', size: 'large' }}
            direction='row'
            align='center'
            animation={['fadeIn', 'slideDown']}
            justify='center'
            flex='grow'
            margin='large'
            pad={{vertical: 'medium', horizontal: 'large'}}
          >
            <AdminDebugger />
          </Box>
        </Box>
      </SocketContext.Provider>
    </Grommet>
  )
}

render (
  <App />,
  document.getElementById('root')
)