# Wireguard Insights

A self hosted wiregaurd administration tool that can be accessed throught HTTP API or a Web-based portal for managing wireguard server and clients.

This HTTP portal uses `wg` command under the hood to make changes to the wireguard servser and its peers.

## Prerequisites

make sure you have wiregaurd installed on your machine.

## Installation

### PM2

```BASH
cd client && pm2 start --name wg-insights/client pnpm -- prod
```

```BASH
cd server && pm2 start --name wg-insights/server yarn -- start
```
### Docker

```BASH
docker build -t wireguard-insights ./
```