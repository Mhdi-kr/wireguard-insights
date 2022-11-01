import express from 'express'
import cors from 'cors'
import * as jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'

import stats from './service/stats'
import wireguard from './service/wireguard'
import diagnose from './service/diagnose'
import { ORM } from './utils/orm'
import './utils/db'

const app = express()
const port = process.env.HTTP_SERVER_PORT || 5000
const origin = process.env.CLIENT_ORIGIN || /(http|https):\/\/(.*):(5173|4173)/
const router = express.Router()
export const ORMInstance = new ORM()

app.use(cookieParser())
app.use(cors({ credentials: true, origin }))
app.use(express.json())

// login route
app.post('/api/v1/login', (req, res) => {
    try {
        const { username, password } = req.body
        const u = process.env.AUTH_USERNAME || 'admin'
        const p = process.env.AUTH_PASSWORD || 'admin'
        if (username !== u || password !== p) return res.sendStatus(401)
        const secret = process.env.JWT_SECRET || 'somesuperlongstringofchars'
        const hash = bcrypt.hashSync(u + ':' + p, 10)
        const token = jwt.sign({
            hash
        }, secret, { expiresIn: '24h' })
        return res.cookie('token', token, { httpOnly: true }).json({
            success: token
        })
    } catch (error) {
        console.error(error)
    }
})

// auth middleware
const auth = (req, res) => {
    try {
        const token = req.cookies.token
        const u = process.env.AUTH_USERNAME || 'admin'
        const p = process.env.AUTH_PASSWORD || 'admin'
        const { hash: jwtHash } = jwt.decode(token) as { hash: string }
        const isEqual = bcrypt.compareSync(u + ':' + p, jwtHash)
        return isEqual ? req.next() : res.sendStatus(401)
    } catch (error) {
        console.error(error)
        return res.sendStatus(401)
    }
}

// register auth middleware
router.use(auth)

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

router.post('/clients/suspend', async (req, res) => {
    try {
        console.log(req.body);
        return res.send({
            data: await wireguard.suspendClient(req.body.publicKey),
        })
    } catch (error) {
        console.error(error)
    }
});

router.post('/clients/unsuspend/', async (req, res) => {
    try {
        return res.send({
            data: await wireguard.unsuspendClient(req.body.publicKey, req.body.resetRemaining),
        })
    } catch (error) {
        console.error(error)
    }
});

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
