import { useEffect } from 'react'
import { metaMaskHooks, metaMask } from 'hipo-wallet'
import { Card } from '../Card'
import { ConnectWithSelect } from '../ConnectWithSelect'
import { Status } from '../Status'

const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = metaMaskHooks

export default function MetaMaskCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const error = useError()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()

  useEffect(() => {
    void metaMask.connectEagerly()
  }, [])

  return (
    <Card>
      <div>
        <b>MetaMask</b>
        <p>chainId: {chainId}</p>
        <p>accounts: {accounts}</p>
        <p>isActivating: {isActivating ? 'true' : 'false'}</p>
        <p>isActive: {isActive ? 'true' : 'false'}</p>
        <Status isActivating={isActivating} error={error} isActive={isActive} />
        <div style={{ marginBottom: '1rem' }} />
      </div>
      <div style={{ marginBottom: '1rem' }} />
      <ConnectWithSelect
        connector={metaMask}
        chainId={chainId}
        isActivating={isActivating}
        error={error}
        isActive={isActive}
      />
    </Card>
  )
}
