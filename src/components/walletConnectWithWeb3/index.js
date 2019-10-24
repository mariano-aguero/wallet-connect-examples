import React, { Component } from 'react'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'
import { ethers } from 'ethers/index'

class WalletConnectWithWeb3Component extends Component {
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
    const walletConnector = new WalletConnectProvider({
      infuraId: '7e977d73f2f143ce84ea5ff54f1601fd',
      qrcode: true,
    })

    window.walletConnector = walletConnector

    if (!walletConnector.connected) {
      await walletConnector.enable()

      const web3 = new Web3(walletConnector)
      const accounts = await web3.eth.getAccounts()
      const chainId = await web3.eth.getChainId()
      const address = accounts[0]

      this.setState({ walletConnector, web3, chainId, accounts, address })
    }

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
    const { web3, address } = this.state
    const tx = {
      from: address,
      to: address,
      value: '0x0',
    }

    web3.eth
      .sendTransaction(tx)
      .then(result => {
        console.log(`Transaction hash ${result}`)
      })
      .catch(error => {
        console.error(error)
      })
  }

  contractTransaction = async () => {
    const { web3, address } = this.state

    const abi = ['function changeGreeting(string _greeting) public']

    const iface = new ethers.utils.Interface(abi)
    const data = iface.functions.changeGreeting.encode(['test4'])
    const tx = {
      from: address,
      to: '0x664f6b4987d9db811867f431911124109ed5a475',
      data: data,
    }

    web3.eth
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
          <button onClick={this.walletConnectInit}> Connect with web3 </button>
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

export default WalletConnectWithWeb3Component
