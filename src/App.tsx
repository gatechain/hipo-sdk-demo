import { HipoWallet } from 'hipo-wallet';
import { HipoContract } from 'hipo-contract'
import { createContext, useEffect, useMemo, useState } from 'react';
import './App.css';
import { Connect } from './Connect';
import _, { chain } from 'lodash'


export function useHooks(type: string) {
  return useMemo(() => {
    return HipoWallet.getHooks(type as any)
  }, [type])
}

interface HipoWalletContextProps {
  walletType: string
  setWalletType: (value: string) => void
  contract: HipoContract | null
  setContract: (value: HipoContract | null) => void
}

export const HipoWalletContext = createContext<HipoWalletContextProps>({} as HipoWalletContextProps)

function App() {
  const [walletType, setWalletType] = useState('')
  const { useChainId, useAccount } = useHooks(walletType)
  const chainId = useChainId()
  const account = useAccount()
  // const [gateWallet, setGateWallet] = useState(null)
  const [contract, setContract] = useState<HipoContract | null>(null)
  // TODO 已经 完成user_id 和 address 绑定
  const [userId, setUserId] = useState('10')
  const [type, setType ] = useState('withdraw')

  const value: HipoWalletContextProps = {
    walletType,
    setWalletType,
    contract,
    setContract
  }

  useEffect(() => {
    // 2. 登陆时，调用sdk生成private key，存储在页面缓存中
    const privateKeyHex = localStorage.getItem(`privateKeyHex_${account}`)
    privateKeyHex && contract?.createWalletFromGateChainAccount(privateKeyHex)
  }, [contract])

  return (
    <HipoWalletContext.Provider value={value}>
      <div className="App">
        <div>{walletType}</div>
        <button onClick={async () => {
          const privateKeyHex = localStorage.getItem(`privateKeyHex_${account}`)
          if (privateKeyHex) {
            alert('已经存在私钥，和eddsa 钱包, 可以直接进行订单签名')
            return
          }

          // 第一步生成钱包
          // 1.1. Metamask 对指定字符串签名，通过签名派生 eddsa 钱包
          const res = await contract?.createWalletFromGateChainAccount()
          console.log(res?.gateWallet.privateKeyHex, 'res')
          // setGateWallet(res?.gateWallet)
          localStorage.setItem(`privateKeyHex_${account}`, res?.gateWallet.privateKeyHex)
          // 第二部，保存 res.publicKeyCompressedHex 压缩公钥 uid 账户地址 + publicKeyCompressedHex
          if (!res) {
            return
          }

          // 通过服务端来获取 publicKeyCompressedHex ， 如果没有，就重新关联
          const localData = JSON.parse(localStorage.getItem('accountAuthSignatures') as string) || {}

          const isNotAccountSignature =
            (chainId && res.gateAddress && localData[chainId as number] && localData[chainId as number][res.gateAddress as string])
              ? false : true

          console.log(isNotAccountSignature, 'isNotAccountSignature')
          if (isNotAccountSignature) {
            // 1.2. Metamask 再次对 eddsa pubkey 进行签名，然后将 eddsa pubkey、签名发送到后台
            const accountSignature = await contract?.signCreateAccountAuthorization()
            // 这需要传入
            console.log(accountSignature)
            const data = JSON.stringify({
              [chainId as number]: {
                [res.gateAddress]: accountSignature
              }
            })
            localStorage.setItem('accountAuthSignatures', data)

            const option = {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
                'x-gate-user-id': userId
              },
              body: JSON.stringify({
                signature: accountSignature.signature,
                BJJKey: accountSignature.BJJKey,
                chainId: chainId,
                address: account
              })
            }

            console.log(option)
            fetch('http://127.0.0.1:3000/address/verify', option).then(res => res.json())
          }
        }}>根据签名生成本地钱包</button>
        <button onClick={() => {
          // 获取本地钱包
          const gateWallet = contract?.getGateWallet()

          // order,cancelOrder的交易体
          // const tx = {
          //   contract: "BTC_USDT",
          //   price: "13458.9",
          //   size: -10000,
          //   user_id: parseInt(userId)
          // }

          // withdraw的交易体
          const tx = {
            user_id: parseInt(userId),
            amount: 10000
          }


          /**
           * @param {Object} tx - 交易体
           * @param {String} type - order,cancelOrder,withdraw 
           * 
           * @return {String} signature
           */
          // 3. 用户下单、撤单、提现时，调用sdk进行交易签名，将生成的sign字段加入交易体传送给后端
          const signature = gateWallet.getSignature(tx, type)
          console.log(signature, 'signature')

          const option = {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'x-gate-user-id': userId
            },
            body: JSON.stringify({
              signature: signature,
              tx: tx,
              type: type
            })
          }

          console.log(option)
          fetch('http://127.0.0.1:3000/verify', option).then(res => res.json()).then(res => { alert(res) })
        }}>签名交易</button>
        <Connect />
      </div>
    </HipoWalletContext.Provider>
  );
}

export default App;

