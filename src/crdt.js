'use strict'

const IPFS = require('ipfs')
const PeerCRDT = require('peer-crdt')
const PeerCrdtIpfs = require('peer-crdt-ipfs')

module.exports = async (type, id) => {
  const ipfs = new IPFS({
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
  const CRDT = PeerCRDT.defaults(peerCrdtIpfs)
  const crdt = CRDT.create(type, id)
  await crdt.network.start()
  return crdt
}
