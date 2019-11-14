import React, { Component } from 'react'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { Connectors } from 'web3-react'
import WalletConnectApi from '@walletconnect/web3-subprovider'
import Web3Provider from 'web3-react'

import './App.css'
import WalletConnectComponent from './components/walletConnect'
import WalletConnectWithWeb3Component from './components/walletConnectWithWeb3'
import WalletConnectWithEthersComponent from './components/walletConnectWithEthers'
import HomeComponent from './components/home'

const { WalletConnectConnector } = Connectors

const WalletConnect = new WalletConnectConnector({
  api: WalletConnectApi,
  bridge: 'https://bridge.walletconnect.org',
  supportedNetworkURLs: {
    1: 'https://mainnet.infura.io/v3/7e977d73f2f143ce84ea5ff54f1601fd',
    4: 'https://rinkeby.infura.io/v3/7e977d73f2f143ce84ea5ff54f1601fd',
    50: 'http://localhost:8545',
  },
  defaultNetwork: 1,
})

const RedirectToHome = () => <Redirect to="/" />

class App extends Component {
  render() {
    return (
      <>
        <Router>
          <Switch>
            <Route exact path="/" component={HomeComponent} />
            <Route exact path="/walletconnect" component={WalletConnectComponent} />
            <Route exact path="/web3" component={WalletConnectWithWeb3Component} />
            <Web3Provider connectors={{ WalletConnect: WalletConnect }} libraryName={'ethers.js'}>
              <Route exact path="/ethers" component={WalletConnectWithEthersComponent} />
            </Web3Provider>

            <Route component={RedirectToHome} />
          </Switch>
        </Router>
      </>
    )
  }
}

export default App
