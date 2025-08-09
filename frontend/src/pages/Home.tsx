import React from 'react'
import { useAccount, useChainId } from 'wagmi'

export default function Home() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  return (
    <div>
      <p>Welcome to the OKX ETHCC Hackathon demo.</p>
      <ul>
        <li>Connected: {isConnected ? 'Yes' : 'No'}</li>
        <li>Address: {address ?? '-'}</li>
        <li>Chain ID: {chainId}</li>
      </ul>
      <p>Next: Add NGO registry and staking flows.</p>
    </div>
  )
}
