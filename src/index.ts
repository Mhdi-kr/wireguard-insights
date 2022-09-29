import express from 'express'
import wireguard from './service/wireguard'

const app = express()
const port = process.env || 5000
const router = express.Router()

app.use(express.json())
app.use(express.static('public'))

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
        const req = res.send({
            data: await wireguard.createClient({}),
        })
    } catch (error) {
        console.error(error)
    }
})

// edit an existing client
router.patch('/clients/:pk', async (req, res) => {
    try {
        const req = res.send({
            data: await wireguard.editClient('', {}),
        })
    } catch (error) {
        console.error(error)
    }
})

// revoke an existing client by its public key
router.delete('/clients/:pk', async (req, res) => {
    try {
    } catch (error) {}
})

//
app.use('/api/v1/', router)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
