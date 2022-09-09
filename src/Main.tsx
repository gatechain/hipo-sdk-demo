import { useUpdateEffect } from "ahooks"
import { ChangeEvent, FC, useContext, useEffect, useMemo, useState } from "react"
import { HipoWalletContext, useHooks } from "./App"
import { config } from './config'

// const token = '0xb90952cF803E931654d1b8F71b64B356e0833c32'

function useToken() {
  const { contract, walletType } = useContext(HipoWalletContext)
  const [token, setToken] = useState('')
  useEffect(() => {
    if (!contract) {
      return
    }
    contract.perpetual.getDepositToken().then(setToken)

  }, [contract])
  return token
}

export const Main: FC = () => {
  const { contract, walletType } = useContext(HipoWalletContext)
  const { useAccounts, useChainId, useProvider } = useHooks(walletType as any)
  const [balance, setBalance] = useState('0')
  const [value, setValue] = useState('1')
  const [tokenBalance, setTokenBalance] = useState('')
  const chainId = useChainId()
  const [approveStatus, setApproveStatus] = useState(0)
  const accounts = useAccounts()
  const provider = useProvider()
  const token = useToken()


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
  }, [contract, accounts, token])


  useUpdateEffect(() => {
    getApproveStatus()
    // eslint-disable-next-line
  }, [value, token])

  function getApproveStatus() {
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
    }).catch(() => {
      setBalance('0')
    })
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
  }

  return <div>
    <p>balance: {balance}</p>
    <label htmlFor="input">金额：</label>
    <input id="input" type="text" value={value} onChange={handleChange} />

    &nbsp;&nbsp;
    <button onClick={() => {
      const jsonData = JSON.stringify({ test: '1', test2: '2' })
      contract?.sign(jsonData).then(console.log).catch(console.log)
    }}>签名</button>
    <button onClick={() => {
      contract?.perpetual.getDepositToken().then(console.log)
    }}>获取token地址</button>


    &nbsp;&nbsp;
    {
      // 0 需要授权 ， 1 不需要授权
      approveStatus === 0
        ? <button onClick={() => {
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
    <button onClick={async () => {
      // const exit = {
      //   "itemId": 1,
      //   "batchNum": 1,
      //   "accountIndex": "2",
      //   "bjj": "71518274403314255847822263721828525103471289019462150568854180202794041422788",
      //   "ethereumAddress": "0xdcd4B351D4b1E8a4df40ed316AcDdc9F3229f910",
      //   "merkleProof": {
      //     "root": "20992965521517311477389399360935607766009952145103157444358331509200244425673",
      //     "siblings": [],
      //     "oldKey": "0",
      //     "oldValue": "0",
      //     "isOld0": false,
      //     "key": "2",
      //     "value": "10122391622415437852621627642046011700725456793725453543010501409332059279721",
      //     "fnc": 0
      //   },
      //   "balance": "20000000000000000000"
      // }

      const exit = {
        "itemId": 2,
        "batchNum": 2,
        "accountIndex": "2",
        "bjj": "71518274403314255847822263721828525103471289019462150568854180202794041422788",
        "ethereumAddress": "0xdcd4B351D4b1E8a4df40ed316AcDdc9F3229f910",
        "merkleProof": {
          "root": "11953055349369024811071119401547790278125445659220919492229286266819711526185",
          "siblings": [],
          "oldKey": "0",
          "oldValue": "0",
          "isOld0": false,
          "key": "2",
          "value": "20730088328751825131420882186542153392940019011199347760487915590196598833494",
          "fnc": 0
        },
        "balance": "60000000000000000000"
      }

      console.log(contract?.perpetual.withdrawMerkleProof)
      const tx = await contract?.perpetual.withdrawMerkleProof(exit)
      console.log('提现中...')
      await tx.wait()
      console.log('提现成功')
      // old
      // contract?.perpetual.withdraw(token).then(async (data) => {
      //   console.log('提现中...')
      //   await data.wait()
      //   console.log('提现成功')
      //   getBalance()
      // })
    }}>提现</button>
    <button onClick={() => {
      const gateWallet = contract?.getGateWallet()
      const tx = {
        user_id: 2,
        amount: 60
      }
      const type = 'withdraw'
      //签名交易 （第一个参数是tx，第二个参数type）
      const signature = gateWallet.getSignature(tx, type)
      const body = {
        tx,
        amount: tx.amount,
        currency: 'usd',
        signature,
        type
      }
      console.log(body)
    }}>获取提现交易体</button>
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
