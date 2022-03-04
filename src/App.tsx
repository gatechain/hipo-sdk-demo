import { HipoContract, HipoSdk } from 'hipo-sdk';
import { createContext, useMemo, useState } from 'react';
import './App.css';
import { Connect } from './Connect';
import PriorityExample from './components/connectors/PriorityExample'


export function useHooks (type: string) {
	return useMemo(() => {
	  return HipoSdk.getHooks(type as any)
	}, [type])
}

interface HipoSdkContextProps {
  walletType: string
  setWalletType: (value: string) => void
  contract: HipoContract | null
  setContract: (value: HipoContract | null) => void
}

export const HipoSdkContext = createContext<HipoSdkContextProps>({} as HipoSdkContextProps)

function App() {
	const [walletType, setWalletType] = useState('')
	const [contract, setContract] = useState<HipoContract | null>(null)
  
  const value: HipoSdkContextProps  = {
    walletType,
    setWalletType,
    contract,
    setContract
  }
  return (
    <HipoSdkContext.Provider value={value}>
      <div className="App">
      <PriorityExample/>
      <div>{walletType}</div>
        <Connect />
      </div>
    </HipoSdkContext.Provider>
  );
}

export default App;

