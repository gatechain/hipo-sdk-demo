import {HipoSdk, WalletType, HipoContract} from 'hipo-sdk'
import { useContext, useEffect, useMemo, useState } from 'react';
import { HipoSdkContext, useHooks } from './App';


var config = {
	// chainID
	85: {
		perpetualContract: {
			// 合约地址
			address: '0x4F091e8f52092E7Ce70Fc385ae3B2d1301476293'
		},
		// 币的地址 (USDT)
		usdt: '0x475EbfBF2367d5C42f55bd997f9E65D8b35Ded65',
	}
}

export function Connect () {
	const {  walletType, setWalletType, contract, setContract } = useContext(HipoSdkContext)
	const { useChainId, useAccounts, useIsActive, useProvider, useError, useIsActivating } = useHooks(walletType  as any)
	const err = useError()
	const isActive = useIsActive()
	const isActivating = useIsActivating()
	const chainId = useChainId()
	const accounts =  useAccounts()
	const provider = useProvider()

	// useEffect(() => {
	// 	err && HipoSdk.init()
	// }, [err])
  console.log(err)
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
	}, [provider, chainId, accounts])  
	useEffect(() => {
	  const walletType =  localStorage.getItem('walletType') as WalletType
	  if (walletType) {
		setWalletType(walletType as any)
	  }
	}, [])
  
	const isLogin = useMemo(() => {
		console.log(isActive, 'isActive')
	  return isActive && walletType
	}, [isActive, walletType, chainId])
  
	function setA (str: any) {
	  localStorage.setItem('walletType', str)
	  setWalletType(str as any)
	}
  
	function connectBtn() {
	  return <>
		<hr />
		<div>
		  <button onClick={() => {
			HipoSdk.connect('metaMask').then(() => {
			  setA('metaMask')
			})
		  }}>metaMask</button>
		</div>
		<div>
		  <button onClick={() => {
			HipoSdk.connect('walletLink').then((data: any) => {
			  setA('walletLink')
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
		  HipoSdk.disconnect(walletType)
		  localStorage.removeItem('walletType')
		  setContract(null)
		}}>断开按钮</button>
		<hr></hr>
		<button onClick={() => {
			contract?.sign('123')
		}}>签名</button>

		&nbsp;&nbsp;
		<button onClick={() => {
			contract?.ERC20?.approve('0x475EbfBF2367d5C42f55bd997f9E65D8b35Ded65', '0x4F091e8f52092E7Ce70Fc385ae3B2d1301476293', '100')
			.then((res) => {
				console.log(res)
			}).catch((err) => {
				console.log(err)
			})
		}}>授权</button>
		&nbsp;&nbsp;
		<button onClick={() => {
			contract?.sign('123')
		}}>充值</button>
		&nbsp;&nbsp;
		<button onClick={() => {
			contract?.sign('123')
		}}>提现</button>
	  </>
	}

	return <div>
			 	{
			err 
			&& 
			<span>
				{err.message}
				|   --- {err.name}
			</span>
		}
		{
			isActivating ? 'true' : 'false'
		}
		{isLogin ? connectingEle() : connectBtn() }
	</div>
	
}