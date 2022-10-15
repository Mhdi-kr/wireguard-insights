module.exports = {
    apps: [
        {
            name: "@wg-insights/client",
            script: "pnpm",
            args: "client:dev"
        },
        {
            name: "@wg-insights/server",
            script: "pnpm",
            args: "server:dev"
        },
    ],
};
