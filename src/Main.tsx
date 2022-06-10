import { useUpdateEffect } from "ahooks"
import { ChangeEvent, FC, useContext, useMemo, useState } from "react"
import { HipoWalletContext, useHooks } from "./App"
import {config} from './config'

const token = '0xa1fDF3a05a5515AE309c28F35deF1fC33dBfb94d'

export const Main:FC = () => {
	const {contract, walletType} = useContext(HipoWalletContext)
	const { useAccounts, useChainId, useProvider} = useHooks(walletType  as any)
	const [balance, setBalance] = useState('0')
	const [value, setValue] = useState('1')
	const [tokenBalance, setTokenBalance] = useState('')
	const chainId = useChainId()
	const [approveStatus, setApproveStatus] = useState(0)
	const accounts = useAccounts()
	const provider = useProvider()
	

	const perpetualContractAddress = useMemo(() => {
		if (chainId && (config as any)[chainId]) {
			return (config as any)[chainId]?.perpetualContractAddress
		}
		return null
	}, 
	[chainId])

	useUpdateEffect(() => {
		if (!contract) {
			return
		}
		getBalance()
		getApproveStatus()
	// eslint-disable-next-line
	}, [contract, accounts])


	useUpdateEffect(() => {
		getApproveStatus()
	// eslint-disable-next-line
	}, [value])
	
	function getApproveStatus () {
		contract?.ERC20.getApproveStatus(
			token,
			perpetualContractAddress,
			value
		).then((data) => {
			setApproveStatus(data)
		})
	}

	// 获取余额
	function getBalance() {
		contract?.perpetual?.getWithdrawalBalance(token).then(data => {
			setBalance(data.toString())
		}).catch(error => {
			setBalance('0')
		})
	}

	function handleChange (e: ChangeEvent<HTMLInputElement>) {
		setValue(e.target.value)
	}

	return <div>
		<p>balance: {balance}</p>
		<label htmlFor="input">金额：</label>
		<input id="input" type="text" value={value} onChange={handleChange} />
		
		&nbsp;&nbsp;
		<button onClick={() => {
			const jsonData = JSON.stringify({test:'1', test2: '2'})
			contract?.sign(jsonData).then(console.log).catch(console.log)
		}}>签名</button>
		

		&nbsp;&nbsp;
		{
			// 0 需要授权 ， 1 不需要授权
			approveStatus === 0
			?  <button onClick={() => {
				contract?.ERC20?.approve(token, perpetualContractAddress, value)
				.then(async (res) => {
					console.log('授权中')
					await res.wait()
					console.log('授权成功')
					getApproveStatus()
				}).catch((err) => {
					console.log(err)
				})
			}}>授权</button>
			:
			<button onClick={() => {
				contract?.perpetual.deposit(token, value).then(async (data) => {
					console.log('充值中...')
					await data.wait()
					console.log('充值成功')
				})
			}}>充值</button>
		}
		
		&nbsp;&nbsp;
		<button onClick={() => {
			 contract?.perpetual.withdraw(token).then(async (data) => {
				 console.log('提现中...')
				 await data.wait()
				 console.log('提现成功')
				 getBalance()
			 })
		 }}>提现</button>	
		 <div>
			 <input type="text" placeholder="请输入token地址" onChange={(e) => handleBlanceof(e.target.value)} />
			 <p>token 余额: {tokenBalance}</p>
		 </div>
		 
		 <div>
		 </div>
	</div>

	function handleBlanceof(value: string) {
		// console.log(provider, '.provider')
		// console.log(accounts)
		(provider as any).getBalance((accounts as any[])[0]).then((data: any) => {
			console.log(data)
		})
		// 0xA08Bf99247CdF9B8D51dAd5C589ed782922A925c
		contract?.ERC20?.getBalanceOf(value).then(([balanceStr, bigNumber]) => {
			console.log(bigNumber.toString())
			setTokenBalance(balanceStr)
		})
	}
}