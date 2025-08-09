import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Home from './pages/Home'

export default function App() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>OKX ETHCC — NGO Yield Donations</h1>
        <ConnectButton />
      </header>
      <Home />
    </div>
  )
}
