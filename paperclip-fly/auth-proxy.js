const http = require('http')
const crypto = require('crypto')

const API_KEY = process.env.PAPERCLIP_API_KEY
const UPSTREAM_HOST = '127.0.0.1'
const UPSTREAM_PORT = 3100
const LISTEN_PORT = parseInt(process.env.PROXY_PORT || '8080', 10)

if (!API_KEY) {
  console.error('[auth-proxy] PAPERCLIP_API_KEY missing; refusing to start')
  process.exit(1)
}

const EXPECTED = Buffer.from(`Bearer ${API_KEY}`)

function tokensMatch(got) {
  if (!got) return false
  const gotBuf = Buffer.from(got)
  if (gotBuf.length !== EXPECTED.length) return false
  return crypto.timingSafeEqual(gotBuf, EXPECTED)
}

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'X-Robots-Tag': 'noindex' })
    res.end('ok')
    return
  }

  if (!tokensMatch(req.headers.authorization)) {
    res.writeHead(401, { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' })
    res.end(JSON.stringify({ error: 'unauthorized' }))
    return
  }

  const forwardHeaders = { ...req.headers }
  delete forwardHeaders.authorization
  forwardHeaders.host = `${UPSTREAM_HOST}:${UPSTREAM_PORT}`

  const upstream = http.request(
    { hostname: UPSTREAM_HOST, port: UPSTREAM_PORT, method: req.method, path: req.url, headers: forwardHeaders },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode, upstreamRes.headers)
      upstreamRes.pipe(res)
    }
  )

  upstream.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'upstream_error', message: err.message }))
  })

  req.pipe(upstream)
})

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`[auth-proxy] listening on 0.0.0.0:${LISTEN_PORT} -> ${UPSTREAM_HOST}:${UPSTREAM_PORT}`)
})
