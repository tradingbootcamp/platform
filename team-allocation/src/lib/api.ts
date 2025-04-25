import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useEffect, useState } from 'react'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { websocket_api } from 'schema-js'

export const useServerAccounts = () => {
  const { getAccessToken } = useKindeAuth()
  const [accounts, setAccounts] = useState<websocket_api.IAccount[]>([])
  const [accountByPixieTransferAmount, setAccountByPixieTransferAmount] =
    useState<Record<number, number[]>>({})

  useEffect(() => {
    const socket = new ReconnectingWebSocket(import.meta.env.VITE_SERVER_URL)
    socket.binaryType = 'arraybuffer'

    socket.onopen = async () => {
      const jwt = await getAccessToken()
      const data = websocket_api.ClientMessage.encode({
        authenticate: { jwt },
      }).finish()
      socket.send(data)
    }

    let pixieId: number | null = null
    let actingAs: number | null = null

    socket.onmessage = (event: MessageEvent) => {
      const data = event.data
      const msg = websocket_api.ServerMessage.decode(new Uint8Array(data))
      if (msg.actingAs) {
        actingAs = msg.actingAs.accountId
      } else if (msg.accounts?.accounts) {
        setAccounts(msg.accounts.accounts)
        const arborPixieAccount = msg.accounts.accounts.find(
          (account) => account.name === 'Arbor Pixie',
        )
        if (arborPixieAccount) {
          pixieId = arborPixieAccount.id
          if (arborPixieAccount.id !== actingAs) {
            const data = websocket_api.ClientMessage.encode({
              actAs: { accountId: arborPixieAccount.id },
            }).finish()
            socket.send(data)
          }
        }
      } else if (msg.transfers?.transfers?.length) {
        if (!pixieId) {
          return
        }
        const pixieTransfers =
          msg.transfers.transfers?.filter(
            (transfer) => transfer.fromAccountId === pixieId,
          ) ?? []

        setAccountByPixieTransferAmount(
          pixieTransfers.reduce(
            (acc, transfer) => {
              const amount = transfer.amount
              const accountId = transfer.toAccountId
              ;(acc[amount!] ??= []).push(accountId)
              return acc
            },
            {} as Record<number, number[]>,
          ),
        )
      }
    }
  }, [getAccessToken, setAccounts, setAccountByPixieTransferAmount])

  return {
    accounts,
    accountByPixieTransferAmount,
  }
}
