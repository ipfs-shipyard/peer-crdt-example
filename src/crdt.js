'use strict'

const IPFS = require('ipfs')
const PeerCRDT = require('peer-crdt')
const PeerCrdtIpfs = require('peer-crdt-ipfs')
const Crypto = require('./crypto')

const KEYS = {
  read: '4XTTM9VV6TEVgtnEcKz5xmFcYHxPXVfYGrAZXdpT4bn1349Yj',
  write: 'K3TgUXcwYReXvP1Uq9xdsRnNLBx3p7a9VtDk6iaWeWw9fAURdAXxvmdr1mBSJhrgJjmPeBAEMkBd7FDgMug16pmCq8Z14FkcQkDdNoTsjvzmxWgpwbexQtKU6LyhNw8x9au19QXZ'
}

module.exports = async (type, id) => {
  const { encrypt, decrypt} = await Crypto(KEYS.read, KEYS.write)
  const ipfs = window.IPFS = new IPFS({
    EXPERIMENTAL: {
      pubsub: true
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
        ]
      }
    }
  })

  const peerCrdtIpfs = PeerCrdtIpfs(ipfs)
  const CRDT = PeerCRDT
    .defaults(peerCrdtIpfs)
    .defaults({ encrypt, decrypt })
  const crdt = CRDT.create(type, id)
  await crdt.network.start()
  return crdt
}
