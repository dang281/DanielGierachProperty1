/**
 * Vercel Edge Middleware — protects /dashboard with Basic Auth.
 *
 * Set DASHBOARD_PASSWORD as an environment variable in your Vercel project settings.
 * The username is always "daniel".
 *
 * To access: visit /dashboard → browser will prompt for credentials.
 */

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
}

export default function middleware(request: Request): Response | undefined {
  const auth = request.headers.get('Authorization') ?? ''
  const [scheme, encoded] = auth.split(' ')

  if (!encoded || scheme !== 'Basic') {
    return unauthorised()
  }

  let user: string
  let pass: string
  try {
    const decoded = atob(encoded)
    const colon = decoded.indexOf(':')
    user = decoded.substring(0, colon)
    pass = decoded.substring(colon + 1)
  } catch {
    return unauthorised()
  }

  const validUser = 'daniel'
  const validPass = (process.env.DASHBOARD_PASSWORD ?? '').trim()

  // Constant-time comparison to prevent timing attacks
  if (!validPass || user !== validUser || !constantTimeEqual(pass, validPass)) {
    return unauthorised()
  }

  // Authenticated — allow request to proceed
  return undefined
}

function unauthorised(): Response {
  return new Response(
    '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h2>Access denied</h2><p>This area is private.</p></body></html>',
    {
      status: 401,
      headers: {
        'Content-Type': 'text/html',
        'WWW-Authenticate': 'Basic realm="Daniel Gierach Dashboard", charset="UTF-8"',
      },
    }
  )
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
