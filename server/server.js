const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs')

const db = require('./db')
const importer = require('./importFileToDb')
const { getExpenses, graphByMonths, updateExpense, getFixedExpenses } = require('./route')
const app = express()

app.use(express.static(path.join(__dirname, '../client/dist')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})
app.get('/expenses',  (req, res, next) => getExpenses(req, res, next, db))
app.put('/expenses',  (req, res, next) => updateExpense(req, res, next, db))
app.get('/fixedExpenses', (req, res, next) => getFixedExpenses(req, res, next, db))
app.get('/graphByMonths', (req, res, next) => graphByMonths(req, res, next, db))
app.post('/importFile', (req, res) => {
    const data = req.body.data
    const fileName = req.body.fileName
    db.bulkCreateExpense(importer.process(data, fileName))
    .then((result) => {
        console.log('expense added')
        res.json({
            success: true
        })  
    })
    .catch((e) => {
        console.log(e)
        res.json({
            success: false,
            details: e
        })
    })
    .finally(() => {
        if (fileName) {
            try {
                fs.renameSync(path.join(__dirname, './data/new', fileName), path.join(__dirname, './data/archive', fileName))
            }
            catch (e) {
                console.log(e)
            }
        }
    })
    
})
app.listen(3001, async () => {
    try {
        await db.connect()
        console.log('connected to database ...')
    }
    catch (e) {
        console.log(e)
    }
    console.log('listening at port 3001 ...')
})