FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      libicu72 \
      tini \
      wget \
    && wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared \
    && chmod +x /usr/local/bin/cloudflared \
    && apt-get purge -y wget \
    && rm -rf /var/lib/apt/lists/*

ARG PAPERCLIP_VERSION=2026.626.0
RUN npm install -g paperclipai@${PAPERCLIP_VERSION}

RUN chown -R 1001:0 /usr/local/lib/node_modules/paperclipai/node_modules/@embedded-postgres/ || true

WORKDIR /app

ENV NODE_ENV=production \
    PAPERCLIP_HOME=/data/paperclip

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY auth-proxy.js /app/auth-proxy.js
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN useradd -r -u 1001 -g root paperclip \
    && mkdir -p /data/paperclip \
    && chown -R paperclip:root /data/paperclip /app

USER paperclip

EXPOSE 8080

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/entrypoint.sh"]
