const express = require('express')
const cors = require('cors')
require('./db/mongoose')
const userRouter = require('./routers/user')

const app = express()
const port = process.envPORT || 3000

app.use(cors({
        origin: "http://localhost:3001",
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'UPDATE', 'PATCH']}
        
))

app.use(express.json())
app.use(userRouter)


app.listen(port, () => {
    console.log('Server is listening on port', port)
})


