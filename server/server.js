const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const db = require('./db')
const { start } = require('repl')
const app = express()

app.use(express.static(path.join(__dirname, '../client')))
app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'))
})
app.get('/expenses', async (req, res) => {
    const query = req.query
    const startDate = new Date(query.startDate)
    const endDate = new Date(startDate).setMonth(startDate.getMonth() + 1)
    console.log(startDate)
    console.log(new Date(endDate))
    try {
        const data = await db.queryExpense({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        })
        const aggregate = await db.aggregate(startDate, endDate)
        res.send({
            expenses: data,
            aggregate
        })
    }
    catch (e) {
        res.status(500).send({
            error: e.message
        })
        console.log(e)
    }
})
app.listen(3000, async () => {
    try {
        await db.connect()
        console.log('connected to database ...')
    }
    catch (e) {
        console.log(e)
    }
    console.log('listening at port 3000 ...')
})