import { HipoWallet } from 'hipo-wallet';
import { HipoContract } from 'hipo-contract'
import { createContext, useEffect, useMemo, useState } from 'react';
import './App.css';
import { Connect } from './Connect';
import _ from 'lodash'


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
          // 刷新之后，重新生成钱包
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
          }
        }}>根据签名生成本地钱包</button>
        <button onClick={() => {
          // 获取本地钱包
          const gateWallet = contract?.getGateWallet()
          
          // order,cancelOrder的交易体
          const tx = {
            contract: "BTC_USDT",
            price: "13458.9",
            size: -10000,
            user_id: 12
          }

          // withdraw的交易体
          // const tx = {
          //   user_id: 12,
          //   amount: 10000
          // }


          /**
           * @param {Object} tx - 交易体
           * @param {String} type - order,cancelOrder,withdraw 
           * 
           * @return {String} signature
           */
          // 3. 用户下单、撤单、提现时，调用sdk进行交易签名，将生成的sign字段加入交易体传送给后端
          const signature = gateWallet.getSignature(tx, 'cancelOrder')
          console.log(signature, 'signature')
        }}>签名交易</button>
        <Connect />
      </div>
    </HipoWalletContext.Provider>
  );
}

export default App;

