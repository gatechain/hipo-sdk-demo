import { HipoWallet } from 'hipo-wallet';
import { HipoContract } from 'hipo-contract'
import { createContext, useMemo, useState } from 'react';
import './App.css';
import { Connect } from './Connect';
// import PriorityExample from './components/connectors/PriorityExample'


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
      {/* <PriorityExample/> */}
      <div>{walletType}</div>
        <Connect />
      </div>
    </HipoWalletContext.Provider>
  );
}

export default App;

