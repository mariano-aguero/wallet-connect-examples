import React, { useEffect } from 'react'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { ethers } from 'ethers'
import { useWeb3Context } from 'web3-react'

const WalletConnectWithEthersComponent = () => {
  const context = useWeb3Context()

  useEffect(() => {
    if (context.active && !context.account && context.connectorName === 'WalletConnect') {
      const uri = context.connector.walletConnector.uri
      WalletConnectQRCodeModal.open(uri, () => {})
      context.connector.walletConnector.on('connect', () => {
        WalletConnectQRCodeModal.close()
      })
    }
  }, [context, context.active])

  const walletConnectInit = () => {
    context.setConnector('WalletConnect')
  }

  const singleTransaction = async () => {
    const { library } = context
    const signer = library.getSigner()

    const txHash = await signer.sendTransaction({
      to: ethers.constants.AddressZero,
      value: ethers.utils.bigNumberify('0'),
    })
    console.log(`Transaction hash ${txHash.hash}`)
  }

  const contractTransactionOne = async () => {
    const { library } = context
    const signer = library.getSigner()

    const abi = ['function changeGreeting(string _greeting) public']

    const iface = new ethers.utils.Interface(abi)
    const data = iface.functions.changeGreeting.encode(['test5'])
    // const contractAddressRinkeby = '0x664f6b4987d9db811867f431911124109ed5a475'
    const contractAddressMainnet = '0x2640cf35d6735ed7a59e47bbeb21ffac4f746b9a'
    const tx = {
      to: contractAddressMainnet,
      data: data,
    }

    const txHash = await signer.sendTransaction(tx)
    console.log(`Transaction hash ${txHash.hash}`)
  }

  const contractTransactionTwo = async () => {
    const { library } = context
    const signer = library.getSigner()

    const abi = ['function changeGreeting(string _greeting) public']

    const contract = new ethers.Contract(
      '0x2640cf35d6735ed7a59e47bbeb21ffac4f746b9a',
      abi,
      library,
    ).connect(signer)

    const txHash = await contract.changeGreeting('Welcome back')

    console.log(`Transaction hash ${txHash.hash}`)
  }

  return (
    <>
      <div>
        <button onClick={walletConnectInit}> Connect with WalletConnect </button>
        <button onClick={singleTransaction}> Send single transaction </button>
        <button onClick={contractTransactionOne}> Send contract transaction one </button>
        <button onClick={contractTransactionTwo}> Send contract transaction two </button>
      </div>
      <div>
        Connected: {context.active ? 'Yes' : 'No'} - Network ID: {context.networkId}
      </div>
    </>
  )
}

export default WalletConnectWithEthersComponent
