const METAMASK_MESSAGE = 'GateChain Network account access.\n\nSign this message if you are in a trusted application only.'

const CREATE_ACCOUNT_AUTH_MESSAGE = 'Account creation'
const EIP_712_VERSION = '1'
const EIP_712_PROVIDER = 'GateChain Network'

const ContractNames = {
  GateChain: 'GateChain',
  WithdrawalDelayer: 'WithdrawalDelayer'
}

const CONTRACT_ADDRESSES = {
  [ContractNames.GateChain]: '0x10465b16615ae36F350268eb951d7B0187141D3B',
  [ContractNames.WithdrawalDelayer]: '0x8EEaea23686c319133a7cC110b840d1591d9AeE0'
}
export const config = {
	// chainID
	85: {
		perpetualContractAddress: '0x609d24024F3DFe4cB5021A2686b8B67c3db6A0dd'
	},
	GateWalletConfig: {
		METAMASK_MESSAGE,
    EIP_712_PROVIDER,
    EIP_712_VERSION,
    CONTRACT_ADDRESSES,
    CREATE_ACCOUNT_AUTH_MESSAGE,
    contractLeftMap: {
      BTC: 0,
      ETH: 1
    },
    contractRightMap: {
        USDC: 0,
        USDT: 1
    }
	}
}