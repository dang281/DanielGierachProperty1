# Paperclip on Fly.io (Sydney)

Always-on Paperclip instance behind Cloudflare Access. Replaces the local Mac
`paperclipai` so the dashboard works from phone with Mac off.

## One-time setup

```bash
cd /Users/danielgierach/DanielGierachProperty/paperclip-fly

# 1. Authenticate flyctl (browser flow)
fly auth login

# 2. Launch app from this directory (creates app, picks region, builds image)
fly launch --no-deploy --copy-config --name dg-paperclip --region syd

# 3. Create a 5GB encrypted volume for the embedded Postgres + storage
fly volumes create paperclip_data --region syd --size 5 --yes

# 4. Set secrets (NEVER commit these)
fly secrets set \
  PAPERCLIP_AGENT_JWT_SECRET="$(cat ~/.paperclip/instances/default/.env | grep PAPERCLIP_AGENT_JWT_SECRET | cut -d= -f2-)"

# 5. Initial deploy with a placeholder; data will be loaded next step
fly deploy
```

## Migrate the 2.7GB instance data from Mac to volume

```bash
# A. Snapshot the local instance dir (stop local Paperclip first if running)
launchctl bootout "gui/$UID/com.danielgierach.paperclip" 2>/dev/null || true
tar czf /tmp/paperclip-instance.tgz -C ~/.paperclip/instances default

# B. Upload via fly ssh sftp
fly ssh sftp shell <<EOF
put /tmp/paperclip-instance.tgz /data/paperclip/instance.tgz
EOF

# C. Untar on the volume and patch config for authenticated mode
fly ssh console -C "sh -c '
  cd /data/paperclip
  mkdir -p instances
  tar xzf instance.tgz -C instances
  rm instance.tgz
  cat > /tmp/jq-patch.sh <<SH
sed -i "s/\"deploymentMode\": \"local_trusted\"/\"deploymentMode\": \"authenticated\"/" instances/default/config.json
sed -i "s/\"exposure\": \"private\"/\"exposure\": \"public\"/" instances/default/config.json
sed -i "s/\"host\": \"127.0.0.1\"/\"host\": \"0.0.0.0\"/" instances/default/config.json
SH
  sh /tmp/jq-patch.sh
'"

# D. Clean up local snapshot
rm /tmp/paperclip-instance.tgz

# E. Restart the machine to pick up the new config
fly machine restart
```

## Mint a Paperclip API key

```bash
# Generate a strong key
PAPERCLIP_API_KEY=$(openssl rand -hex 32)
echo "Save this key now: $PAPERCLIP_API_KEY"

# Set as a Fly secret (Paperclip reads it for incoming Authorization checks)
fly secrets set PAPERCLIP_API_KEY="$PAPERCLIP_API_KEY"
```

## Cloudflare Access (in front of Fly)

1. In Cloudflare dashboard for `danielgierach.com`:
   - DNS: add CNAME `paperclip` → `dg-paperclip.fly.dev`, proxied (orange cloud)
2. Cloudflare Zero Trust → Access → Applications → Add application:
   - Type: Self-hosted
   - Domain: `paperclip.danielgierach.com`
   - Policy: Service Auth → Service Token
3. Create a service token, save Client ID + Client Secret. These go into Vercel.

## Vercel env vars (Production + Preview)

```bash
cd /Users/danielgierach/DanielGierachProperty/dashboard

vercel env add PAPERCLIP_API_URL production   # https://paperclip.danielgierach.com
vercel env add PAPERCLIP_API_URL preview      # same value
vercel env add PAPERCLIP_API_KEY production   # the openssl rand key
vercel env add PAPERCLIP_API_KEY preview
vercel env add CF_ACCESS_CLIENT_ID production # from Cloudflare
vercel env add CF_ACCESS_CLIENT_ID preview
vercel env add CF_ACCESS_CLIENT_SECRET production
vercel env add CF_ACCESS_CLIENT_SECRET preview
```

## Verify end-to-end

```bash
# 1. Unauthenticated call should 401 at Cloudflare
curl -i https://paperclip.danielgierach.com/api/healthz

# 2. Authenticated call should 200
curl -i https://paperclip.danielgierach.com/api/healthz \
  -H "CF-Access-Client-Id: $CF_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CF_CLIENT_SECRET" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

## Disable local Paperclip after Fly is verified

```bash
# Stop any local launchd job if one exists
launchctl list | grep paperclip
launchctl bootout "gui/$UID/com.danielgierach.paperclip" 2>/dev/null || true
```
