import { ChangeEvent, FC, useContext, useEffect, useState } from "react"
import { HipoWalletContext, useHooks } from "./App"

export const Main:FC = () => {
	const {contract, walletType} = useContext(HipoWalletContext)
	const { useAccounts} = useHooks(walletType  as any)
	const [balance, setBalance] = useState('0')
	const [value, setValue] = useState('0')
	const [approveStatus, setApproveStatus] = useState(0)
	const accounts = useAccounts()

	useEffect(() => {
		if (!contract) {
			return
		}
		console.log('contract', accounts)
		getBalance()
		getApproveStatus()
	// eslint-disable-next-line
	}, [contract, accounts])


	useEffect(() => {
		getApproveStatus()
	// eslint-disable-next-line
	}, [value])
	
	function getApproveStatus () {
		contract?.ERC20.getApproveStatus(
			'0x475EbfBF2367d5C42f55bd997f9E65D8b35Ded65',
			'0x4F091e8f52092E7Ce70Fc385ae3B2d1301476293',
			value
		).then((data) => {
			setApproveStatus(data)
		})
	}

	// 获取余额
	function getBalance() {
		contract?.perpetual.getWithdrawalBalance('0x475EbfBF2367d5C42f55bd997f9E65D8b35Ded65').then(data => {
			setBalance(data.toString())
		}).catch(error => {
			console.log(error, 'error --- banlance')
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
				contract?.ERC20?.approve('0x475EbfBF2367d5C42f55bd997f9E65D8b35Ded65', '0x4F091e8f52092E7Ce70Fc385ae3B2d1301476293', value)
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
				contract?.perpetual.deposit('0x475EbfBF2367d5C42f55bd997f9E65D8b35Ded65', value).then(async (data) => {
					console.log('充值中...')
					await data.wait()
					console.log('充值成功')
				})
			}}>充值</button>
		}
		
	
		&nbsp;&nbsp;
		<button onClick={() => {
			 contract?.perpetual.withdraw('0x475EbfBF2367d5C42f55bd997f9E65D8b35Ded65').then(async (data) => {
				 console.log('提现中...')
				 await data.wait()
				 console.log('提现成功')
				 getBalance()
			 })
		 }}>提现</button>	
	</div>
}