import { HipoWallet } from 'hipo-wallet';
import { HipoContract } from 'hipo-contract'
import { createContext, useMemo, useState } from 'react';
import './App.css';
import { Connect } from './Connect';


export function useHooks (type: string) {
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
  const {useChainId} = useHooks(walletType)
  const chainId = useChainId()
	const [contract, setContract] = useState<HipoContract | null>(null)
  
  const value: HipoWalletContextProps  = {
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
        const data = JSON.stringify({[chainId as number]: {
          [res.gateAddress]: accountSignature
        }})
        localStorage.setItem('accountAuthSignatures', data)
      }

			}}>根据签名生成本地钱包</button>
      <button onClick={() => {
        const gateWallet = contract?.getGateWallet()
        const signTran = gateWallet.signTransaction({}, 12345)
        console.log(signTran)
      }}>签名交易</button>
        <Connect />
      </div>
    </HipoWalletContext.Provider>
  );
}

export default App;

