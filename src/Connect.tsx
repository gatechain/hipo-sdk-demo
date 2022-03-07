import {HipoWallet, WalletType} from 'hipo-wallet'
import {HipoContract} from 'hipo-contract'
import { useContext, useEffect, useMemo } from 'react';
import { HipoWalletContext, useHooks } from './App';
import {Main} from './Main'
import { config } from './config'

export function Connect () {
	const {  walletType, setWalletType, contract, setContract } = useContext(HipoWalletContext)
	const { useChainId, useAccounts, useIsActive, useProvider, useError, useIsActivating } = useHooks(walletType  as any)
	const err = useError()
	const isActive = useIsActive()
	const isActivating = useIsActivating()
	const chainId = useChainId()
	const accounts =  useAccounts()
	const provider = useProvider()

	useEffect(() => {
		if (contract) {
			return
		}
		if (provider && chainId && (accounts as string[]).length ) {
			setContract(
				new HipoContract({
					provider,
					chainId,
					currAccount: accounts ? accounts[0] : '',
					config
				}) as HipoContract
			)
		}
	// eslint-disable-next-line
	}, [provider, chainId, accounts]) 
	
	useEffect(() => {
		if (!contract) {
			return
		}
		
		if (accounts?.length) {
			contract?.setAccount((accounts as any)[0])
		}

		if (provider) {
			contract?.setProvider(provider)
		}

		if (chainId) {
			contract?.setChainId(chainId)
		}
	// eslint-disable-next-line
	}, [accounts, provider, chainId])

	useEffect(() => {
	  const walletType =  localStorage.getItem('walletType') as WalletType
	  if (walletType) {
		setWalletType(walletType as any)
	  }
	// eslint-disable-next-line
	}, [])
	
  
	const isLogin = useMemo(() => {
	  return isActive && walletType
	// eslint-disable-next-line
	}, [isActive, walletType, chainId])
  
	function setType (str: any) {
	  localStorage.setItem('walletType', str)
	  setWalletType(str as any)
	}
  
	function connectBtn() {
	  return <>
		<hr />
		<div style={{margin: '20px'}}>
		  <button onClick={() => {
			HipoWallet.connect('metaMask').then(() => {
				setType('metaMask')
			})
		  }}>metaMask</button>
		</div>
		<div>
		  <button onClick={() => {
			HipoWallet.connect('walletLink').then((data: any) => {
				setType('walletLink')
			})
		  }
		  }>walletLink</button>
		</div>
		<hr />
	  </>
	}
  
	function connectingEle () {
	 return <>
		<p>chainId: {chainId}</p>
		<p>accounts: {accounts}</p>
		<button onClick={() => {
		  const walletType = (localStorage.getItem('walletType') || 'metaMask') as WalletType
		  HipoWallet.disconnect(walletType)
		  localStorage.removeItem('walletType')
		  setContract(null)
		}}>断开按钮</button>
		<hr></hr>
		<Main />
	  </>
	}

	return <div>
		{
			err  &&  <span>
				{err.message} |   --- {err.name}
			</span>
		}
		{
			isActivating ? 'true' : 'false'
		}
		{isLogin ? connectingEle() : connectBtn() }
	</div>
}