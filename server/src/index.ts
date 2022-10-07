import express from 'express'
import cors from 'cors'
import stats from './service/stats'
import wireguard from './service/wireguard'
import diagnose from './service/diagnose'
import { ORM } from './utils/orm'

const app = express()
const port = process.env.HTTP_SERVER_PORT || 5000
const router = express.Router()
export const ORMInstance = new ORM()

app.use(cors())
app.use(express.json())

// get all clients
router.get('/clients', async (req, res) => {
    try {
        res.send({
            data: await wireguard.getClients(),
        })
    } catch (error) {
        console.error(error)
    }
})

// create new client
router.post('/clients', async (req, res) => {
    try {
        return res.send({
            data: await wireguard.createClient({
                name: req.body.name,
                excludeIps: req.body.excludeIps,
                endpoint: req.body.endpoint,
                endpointListenPort: req.body.endpointPort
            }),
        })
    } catch (error) {
        console.error(error)
    }
})

// edit an existing client
router.patch('/clients/:pk', async (req, res) => {
    try {
        return res.send({
            data: await wireguard.editClient('', {}),
        })
    } catch (error) {
        console.error(error)
    }
})

// revoke an existing client by its public key
router.delete('/clients/:publicKey', async (req, res) => {
    try {
        return res.send({
            data: await wireguard.revokeClient(req.params.publicKey),
        })
    } catch (error) {
        console.error(error)
    }
})

// download client configuration
router.get('/clients/:pk/configuration', async (req, res) => {
    try {
    } catch (error) {
        console.error(error)
    }
})

router.get('/health', (req, res) => res.sendStatus(200))

router.get('/stats', async (req, res) => {
    try {
        res.send({
            data: await stats(),
        })
    } catch (error) {
        console.error(error)
    }
})

router.get('/diagnose', async (req, res) => {
    try {
        res.send({
            data: await diagnose.run()
        }) 
    } catch (error) {
        console.error(error)
    }
})

app.use('/api/v1/', router)

app.listen(port, async () => {
    await ORMInstance.loadInterfaces()
    console.log(`Example app listening on port ${port}`)
})
