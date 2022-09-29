
const express = require('express')
const app = express()
const port = 5000
const Wireguard = require('./service/wireguard')
const mainRouter = express.Router();

app.use(express.static('public'))

mainRouter.get('/peers', (req, res) => {
  res.send('Hello World!')
})

mainRouter.get('/clients', async (req, res) => {
    res.send({
        data: await Wireguard.getClients()
    })
})

app.use('/api/v1/', mainRouter); 
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  