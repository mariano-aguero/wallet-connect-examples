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

  realitioContractTransaction = async () => {
    const { walletConnector, address } = this.state

    const abi = [
      'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) public payable returns (bytes32)',
    ]
    const arbitratorAddress = '0xdc0a2185031ecf89f091a39c63c2857a7d5c301a'
    const realitioAddress = '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47'

    const openingTimestamp = Math.floor(Date.now() / 1000)
    const number = Math.floor(Math.random() * 600) + 1
    const args = [
      0,
      `Test this question please ${number}`,
      arbitratorAddress,
      '86400',
      openingTimestamp,
      0,
    ]

    const iface = new ethers.utils.Interface(abi)
    const dataRealitio = iface.functions.askQuestion.encode(args)
    const tx = {
      from: address,
      to: realitioAddress,
      data: dataRealitio,
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
          <button onClick={this.realitioContractTransaction}>
            {' '}
            Send realiltio contract transaction{' '}
          </button>
        </div>
        <div>
          Connected: {this.state.connected ? 'Yes' : 'No'} - Network ID: {this.state.chainId}
        </div>
      </>
    )
  }
}

export default WalletConnectComponent
