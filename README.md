# 🐉 Wireguard Insights

A self-hosted HTTP and web-based adapter for wireguard servers to manage peers and configuration.

## Features

- 🔐 Secure authentication
- 📊 Real-time Wireguard service status, Google and CloudFlare ping, server resources statistics
- 💾 Create, read, update and delete clients
- 🔎 search for and filter clients
- 🔌 Real-time client connection status and statistics
- 📄 Serving client configuration in file and QR code format
- 🎒 Backup methods for Wireguard server configuration
- ✅ Compatible with the widely used `wireguard-install.sh` script

## Story

I was looking for a usable and preferably good-looking UI to manage my Wireguard peers and server. I've tested many repositories with quite high number of starts but none of them satisfied me because I was looking for:

- Easy to deploy, least number of required environment variables
- Compatibility with the widely used `wireguard-install.sh` script (so I don't lose my previously generated peers)
- Almost no infrastructure dependencies such as databases
- Have amazing client side filtering and search capabilities

## Installation

You can try using this software on your local machine or deploy it else where and keep it running with PM2.

## Environment variables

### Local machine

1. Clone this git repository
2. Install dependencies for both `client` and `server` packages using single `pnpm install`
3. Run the server running `pnpm server:start`
4. Run the client running `pnpm client:start`

### PM2

```bash
# start both client and server
pm2 start ecosystem.config.js

# start the client only
pm2 start ecosystem.config.js --only @wg-insights/client

# start the server only
pm2 start ecosystem.config.js --only @wg-insights/server
```

## Development

1. Clone this git repository
2. Install dependencies for `client` and `server` packages running `pnpm install`
3. Run the server running `pnpm server:dev`
4. Run the client running `pnpm client:dev`

Client uses HMR in vite and the server uses nodemon for you to be able to iterate quickly.