import { HipoWallet } from 'hipo-wallet';
import { HipoContract } from 'hipo-contract'
import { createContext, useMemo, useState } from 'react';
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
  const { useChainId } = useHooks(walletType)
  const chainId = useChainId()
  const [contract, setContract] = useState<HipoContract | null>(null)

  const value: HipoWalletContextProps = {
    walletType,
    setWalletType,
    contract,
    setContract
  }
  return (
    <HipoWalletContext.Provider value={value}>
      <div className="App">
        <div>{walletType}</div>
        <button onClick={async () => {
          const res = await contract?.createWalletFromGateChainAccount()
          console.log(res, 'res')
          if (!res) {
            return
          }

          const localData = JSON.parse(localStorage.getItem('accountAuthSignatures') as string) || {}

          const isNotAccountSignature =
            (chainId && res.gateAddress && localData[chainId as number] && localData[chainId as number][res.gateAddress as string])
              ? false : true

          console.log(isNotAccountSignature, 'isNotAccountSignature')
          if (isNotAccountSignature) {
            const accountSignature = await contract?.signCreateAccountAuthorization()
            const data = JSON.stringify({
              [chainId as number]: {
                [res.gateAddress]: accountSignature
              }
            })
            localStorage.setItem('accountAuthSignatures', data)
          }

        }}>根据签名生成本地钱包</button>
        <button onClick={() => {
          // 生成本地钱包
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
          console.log(tx, 'tx交易体(order,cancelOrder,withdraw)')
          /**
           * @param {Object} tx - 交易体
           * @param {String} type - order,cancelOrder,withdraw 
           * 
           * @return  {
           *            signature: Object - 签名
           *            hashMessage: BigInt - 交易体压缩后的数据
           *            data: Object - 服务端验签数据
           *          }
           */
          const { signature , hashMessage, data } = gateWallet.getSignature(tx, 'cancelOrder')
          console.log(signature, 'signature')
          const isTrur =  gateWallet.verifySignature(hashMessage, signature)
          console.log(isTrur)
          const txPackSignature = gateWallet.packSignature(tx, signature)
          console.log(txPackSignature)
          console.log(gateWallet.publicKey, 'publicKey -- 公钥')
          console.log(data, '服务端需要的验证数据')

        }}>签名交易</button>
        <Connect />
      </div>
    </HipoWalletContext.Provider>
  );
}

export default App;

