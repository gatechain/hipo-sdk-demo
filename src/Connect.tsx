import {HipoWallet, WalletType} from 'hipo-wallet'
import {HipoContract} from 'hipo-contract'
import { useContext, useEffect, useMemo } from 'react';
import { HipoWalletContext, useHooks } from './App';
import {Main} from './Main'
import { config } from './config'
import { useUpdateEffect } from 'ahooks';

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
		const walletType =  localStorage.getItem('walletType') as WalletType
		if (walletType) {
			setWalletType(walletType as any)
		}
	// eslint-disable-next-line
	}, [])

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
	
	// 更改accounts、chainId  的时候，需要重新实例化
	useUpdateEffect(() => {
		if (!contract) {
			return
		}

		if ((chainId !== contract.chainId || (accounts as any)[0] !== contract.currAccount) && provider  ) {
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
	}, [accounts, provider, chainId])
	
  
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

	const checkChain = useMemo(() => {
		return chainId && (config as any)[chainId]
	}, [chainId])
  
	function connectingEle () {
	 return <>
		<p>chainId: {chainId}</p>
		<p>accounts: {accounts}</p>
		<button onClick={() => {
		  const walletType = (localStorage.getItem('walletType') || 'metaMask') as WalletType
		  setContract(null)
		  localStorage.removeItem('walletType')
		  HipoWallet.disconnect(walletType)
		}}>断开按钮</button>
		<hr></hr>
		{
			checkChain 
			?  <Main />
			: <p>请切换到 85链</p>
		}
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