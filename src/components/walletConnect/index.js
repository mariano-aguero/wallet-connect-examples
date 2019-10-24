import React, { Component } from 'react'
import WalletConnect from '@walletconnect/browser'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { ethers } from 'ethers'

class WalletConnectComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      walletConnector: null,
      connected: false,
      chainId: null,
      accounts: null,
      address: null,
      web3: null,
    }
  }

  walletConnectInit = async () => {
    const bridge = 'https://bridge.walletconnect.org'

    const walletConnector = new WalletConnect({ bridge })

    window.walletConnector = walletConnector

    if (!walletConnector.connected) {
      await walletConnector.createSession()

      const uri = walletConnector.uri

      WalletConnectQRCodeModal.open(uri, () => {
        console.log('QR Code Modal closed')
      })
    }
    const { chainId, accounts } = walletConnector
    const address = accounts[0]

    this.setState({ walletConnector, connected: true, accounts, address, chainId })

    await this.subscribeToEvents()
  }

  subscribeToEvents = async () => {
    const { walletConnector } = this.state

    if (!walletConnector) {
      return
    }

    walletConnector.on('session_update', async (error, payload) => {
      console.log('walletConnector.on("session_update")')

      if (error) {
        throw error
      }

      const { chainId, accounts } = payload.params[0]
      this.onSessionUpdate(accounts, chainId)
    })

    walletConnector.on('connect', (error, payload) => {
      console.log('walletConnector.on("connect")')
      if (error) {
        throw error
      }

      this.onConnect(payload)
    })

    walletConnector.on('disconnect', error => {
      console.log('walletConnector.on("disconnect")')
      if (error) {
        throw error
      }

      this.onDisconnect()
    })

    walletConnector.on('chainChanged', chainId => {
      console.log('walletConnector.on("chainChanged")')
      this.setState({
        chainId,
      })
    })

    walletConnector.on('networkChanged', () => {
      console.log('walletConnector.on("networkChanged")')
    })

    if (walletConnector.connected || walletConnector.isWalletConnect) {
      this.setState({
        connected: true,
      })
    }

    this.setState({ walletConnector })
  }

  onConnect = async payload => {
    const { chainId, accounts } = payload.params[0]
    const address = accounts[0]

    this.setState({
      connected: true,
      chainId,
      accounts,
      address,
    })
    WalletConnectQRCodeModal.close()
  }

  onDisconnect = async () => {
    WalletConnectQRCodeModal.close()
  }

  onSessionUpdate = async (accounts, chainId) => {
    const address = accounts[0]
    this.setState({ chainId, accounts, address })
  }

  singleTransaction = async () => {
    const { walletConnector, address } = this.state
    const tx = {
      from: address,
      to: address,
      value: '0x0',
    }
    const txHash = await walletConnector.sendTransaction(tx)
    console.log(`Transaction hash ${txHash}`)
  }

  contractTransaction = async () => {
    const { walletConnector, address } = this.state

    const abi = ['function changeGreeting(string _greeting) public']

    const iface = new ethers.utils.Interface(abi)
    const data = iface.functions.changeGreeting.encode(['test2'])
    const tx = {
      from: address,
      to: '0x664f6b4987d9db811867f431911124109ed5a475',
      data: data,
    }

    walletConnector
      .sendTransaction(tx)
      .then(result => {
        console.log(`Transaction hash ${result}`)
      })
      .catch(error => {
        console.error(error)
      })
  }

  render = () => {
    return (
      <>
        <div>
          <button onClick={this.walletConnectInit}> Connect with WalletConnect </button>
          <button onClick={this.singleTransaction}> Send single transaction </button>
          <button onClick={this.contractTransaction}> Send contract transaction </button>
        </div>
        <div>
          Connected: {this.state.connected ? 'Yes' : 'No'} - Network ID: {this.state.chainId}
        </div>
      </>
    )
  }
}

export default WalletConnectComponent
