module.exports = {
    apps: [
        {
            name: "@wg-insights/client",
            script: "pnpm",
            args: "client:start"
        },
        {
            name: "@wg-insights/server",
            script: "pnpm",
            args: "server:start"
        },
    ],
};
