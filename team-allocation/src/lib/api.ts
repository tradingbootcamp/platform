import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useEffect, useState } from 'react'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { websocket_api } from 'schema-js'

export const useServerAccounts = () => {
  const { getAccessToken } = useKindeAuth()
  const [accounts, setAccounts] = useState<websocket_api.IAccount[]>([])

  useEffect(() => {
    const socket = new ReconnectingWebSocket(import.meta.env.VITE_SERVER_URL)
    socket.binaryType = 'arraybuffer'

    socket.onopen = async () => {
      const jwt = await getAccessToken()
      console.log({ jwt })
      const data = websocket_api.ClientMessage.encode({
        authenticate: { jwt },
      }).finish()
      socket.send(data)
    }

    socket.onmessage = (event: MessageEvent) => {
      const data = event.data
      const msg = websocket_api.ServerMessage.decode(new Uint8Array(data))
      console.log(msg)
      if (msg.accounts?.accounts) {
        setAccounts(msg.accounts.accounts)
      }
    }

    return () => {
      socket.close()
    }
  }, [getAccessToken])

  return accounts
}
