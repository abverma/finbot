/* eslint-disable no-undef */
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs')
const multer = require('multer')

const db = require('./db')
const importer = require('./importFileToDb')
const uploadDestination = './data/new'
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})
const upload = multer({ storage })
const {
  getExpenses,
  graphByMonths,
  updateExpense,
  getFixedExpenses,
  getMonthBalance,
  searchExpenses,
  getMonthList,
  addToMonthList,
  updateMonthList,
  getExpenseCategories,
  getAccounts,
  addAccount,
  updateAccounts,
} = require('./route')
const { convert } = require('./readFile')
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
app.get('/expenses', (req, res, next) => getExpenses(req, res, next, db))
app.put('/expenses', (req, res, next) => updateExpense(req, res, next, db))
app.get('/fixedExpenses', (req, res, next) =>
  getFixedExpenses(req, res, next, db)
)
app.get('/graphByMonths', (req, res, next) => graphByMonths(req, res, next, db))
app.post('/importFile', (req, res) => {
  const { data, fileName, account } = req.body
  db.bulkCreateExpense(importer.process(data, fileName, account))
    .then(() => {
      console.log('expense added')
      res.json({
        success: true,
      })
    })
    .catch((e) => {
      console.log(e)
      res.json({
        success: false,
        details: e,
      })
    })
    .finally(() => {
      if (fileName) {
        try {
          fs.renameSync(
            path.join(__dirname, './data/new', fileName),
            path.join(__dirname, './data/archive', fileName)
          )
        } catch (e) {
          console.log(e)
        }
      }
    })
})
app.get('/getMonthBalance', (req, res, next) =>
  getMonthBalance(req, res, next, db)
)
app.get('/searchExpenses', (req, res, next) =>
  searchExpenses(req, res, next, db)
)
app.get('/monthList', (req, res, next) => getMonthList(req, res, next, db))
app.post('/monthList', (req, res, next) => addToMonthList(req, res, next, db))
app.put('/monthList', (req, res, next) => updateMonthList(req, res, next, db))
app.get('/expenseCategories', (req, res, next) =>
  getExpenseCategories(req, res, next, db)
)
app.get('/accounts', (req, res, next) => getAccounts(req, res, next, db))
app.post('/accounts', (req, res, next) => addAccount(req, res, next, db))
app.put('/accounts', (req, res, next) => updateAccounts(req, res, next, db))
app.put('/convertPdf', upload.any(), async (req, res) => {
  try {
    const file = req.files[0]
    const csvData = await convert(file.path)
    res.send(csvData)
  } catch (e) {
    console.log(e)
    res.status(500)
    res.send(e)
  }
})

app.listen(3001, async () => {
  try {
    await db.connect()
    console.log('connected to database ...')
  } catch (e) {
    console.log(e)
  }
  console.log('listening at port 3001 ...')
})
