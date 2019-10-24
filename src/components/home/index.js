import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class HomeComponent extends Component {
  render = () => {
    return (
      <>
        <div>
          <Link to="/walletconnect">Try wallet connect</Link>
        </div>
        <div>
          <Link to="/web3">Try web3</Link>
        </div>
        <div>
          <Link to="/ethers">Try ethers.js</Link>
        </div>
      </>
    )
  }
}

export default HomeComponent
