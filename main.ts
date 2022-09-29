import { opine, serveStatic } from "https://deno.land/x/opine@2.3.3/mod.ts";

const app = opine();

app.use(serveStatic("public"));

app.get("/api/v1/peerss", async function (req, res) {
    const p = Deno.run({
        cmd: [
            "bash",
            "~/wireguard-install.sh"
        ],
        stdout: "piped",
        stderr: "piped",
    });
    console.log(await p.status())
    res.send({
        data: new TextDecoder().decode(await p.output()) 
    })
})

app.get("/api/v1/peers", async function (req, res) {
    const p = Deno.run({
        cmd: [
            "wg",
            "show"
        ],
        stdout: "piped",
        stderr: "piped",
    });
    const b = Deno.run({
        cmd: [
            "cat",
            "/etc/wireguard/wg0.conf"
        ],
        stdout: "piped",
        stderr: "piped",
    });

    const { code } = await p.status();
    const { codes } = await b.status();
    // Reading the outputs closes their pipes
    const rawOutput = await p.output();
    const rawError = await p.stderrOutput();

    const clientsRawOutput = await b.output();
    const clientsRawError = await b.stderrOutput();
    
    if (code === 0) {
        const clientRawString = new TextDecoder().decode(clientsRawOutput);
        const rawString = new TextDecoder().decode(rawOutput);
        
        // console.log(clientRawString.split('\n\n')[1].map(i => i.split('\n')))
        const { peers } = wireguardParser(rawString)
        const aggeregate = 

        const aggeregateWithStatus = aggeregate.map(async (client) => {
            const pingIp = Deno.run({
                cmd: [
                    "ping",
                    "-c1",
                    "-w3",
                    client.allowedIps.split('/')[0]
                ],
                stdout: "piped",
                stderr: "piped",
            })
            const status = await pingIp.status();
            return {
                ...client,
                isConnected: status.success
            }
        })
        return res.send({ status: 200, data: await Promise.all(aggeregateWithStatus), message: 'peers' });
    } else {
        return res.send({});
        const errorString = new TextDecoder().decode(rawError);
    }
});

app.listen(5000, () =>
    console.log("server has started on http://localhost:5000 🚀")
);