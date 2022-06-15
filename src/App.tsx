import { HipoWallet } from 'hipo-wallet';
import { HipoContract } from 'hipo-contract'
import { createContext, useMemo, useState } from 'react';
import './App.css';
import { Connect } from './Connect';


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
          const gateWallet = contract?.getGateWallet()
          const hashMessage = gateWallet.getHashMessage(12345);
          const signature = gateWallet.getSignature({}, 12345)
          console.log(hashMessage, 'hashMessage')
          console.log(signature, 'signature')
          console.log(gateWallet.publicKey, 'publicKey')
          // const signTran = gateWallet.signTransaction({}, 12345)
          // console.log(signTran)

          const data = {
            "msg": hashMessage.toString(),
            "signature": signature,
            "pubKey": gateWallet.publicKey
            // "signature": {
            //   "R8": [
            //     "19602813866576465703357186070219099591312511776598696092876895674233274777821",
            //     "14670319256236932579150389587469015881234319764653910790111918192488121098327"
            //   ],
            //   "S": "1790112333443916037504914606358436526863740258642454905203401441393479332555"
            // },
            // "pubKey": [
            //   "5400772877958519803378326692219798103688704552686062366482964182210824602355",
            //   "20751553000921232316228202827791856383953826507774460151557834514296471506694"
            // ]
          }

          const option = {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }

          console.log(option)

          fetch('http://127.0.0.1:3000/verify', option).then(res => res.json())
        }}>签名交易</button>
        <Connect />
      </div>
    </HipoWalletContext.Provider>
  );
}

export default App;

