import { Network, MetaMask,metaMaskHooks, metaMask, getPriorityConnector, WalletConnect, WalletLink } from 'hipo-sdk'
import type { Connector } from 'hipo-sdk'

function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof WalletLink) return 'WalletLink'
  if (connector instanceof Network) return 'Network'
  return 'Unknown'
}

const { usePriorityConnector } = getPriorityConnector(
  [metaMask, metaMaskHooks],
  // [walletConnect, walletConnectHooks],
  // [walletLink, walletLinkHooks],
  // [network, networkHooks]
)

export default function PriorityExample() {
  const priorityConnector = usePriorityConnector()
  console.log(`Priority Connector: ${getName(priorityConnector)}`)
  return null
}
