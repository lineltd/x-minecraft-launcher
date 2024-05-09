import { createServer } from 'http'
import { PeerSession } from './connection'

export function createHosting(peers: Record<string, PeerSession>) {
  const server = createServer((req, res) => {
    const url = req.url ?? '/'
    if (url.startsWith('/files')) {
      // /files/<id>?path=<path>
      const peerId = url.split('/')[2]
      const filePath = new URL(url, 'http://localhost').searchParams.get('path')
      if (!filePath) {
        res.writeHead(400)
        res.end()
        return
      }
      const peer = peers[peerId]
      if (!peer) {
        res.writeHead(404)
        res.end()
        return
      }
      const stream = peer.createReadStream(filePath)
      res.writeHead(200)
      stream.pipe(res)
    } else {
      res.writeHead(404)
      res.end()
    }
  })
  return server
}
