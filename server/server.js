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
const AppMetadata = require('./appMetadata')
const upload = multer({ storage })
const {
  getExpenses,
  graphByMonths,
  updateExpense,
  getFixedExpenses,
  getPeriodBalance,
  searchExpenses,
  getMonthList,
  addToMonthList,
  updateMonthList,
  getExpenseCategories,
  getAccounts,
  addAccount,
  updateAccounts,
  getCategoryCatchwords,
  updateCategoryCatchwords,
  addCategoryCatchwords,
  getMiscellaneousCatchwords,
  updateMiscellaneousCatchwords,
  addMiscellaneousCatchwords,
  addExpenseCategory,
  updateExpenseCategory,
  getMutualFunds,
  getYearList,
  addToYearList,
  updateYearList,
} = require('./route')
const { convert } = require('./readFile')
const exp = require('constants')
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
app.post('/expenses', async (req, res, next) => {
  const expenses = req.body
  try {
    console.log(JSON.stringify(expenses))
    await db.bulkCreateExpense(expenses)
    res.json({
      success: true,
    })
  } catch (e) {
    console.log(e)
    res.json({
      success: false,
      details: e,
    })
  }
})
app.get('/fixedExpenses', (req, res, next) =>
  getFixedExpenses(req, res, next, db)
)
app.get('/graphByMonths', (req, res, next) => graphByMonths(req, res, next, db))
app.post('/importFile', async (req, res) => {
  const { data, fileName, account } = req.body
  const expenses = await importer.processFile(data, account, db)
  db.bulkCreateExpense(expenses)
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
app.get('/getPeriodBalance', (req, res, next) =>
  getPeriodBalance(req, res, next, db)
)
app.get('/searchExpenses', (req, res, next) =>
  searchExpenses(req, res, next, db)
)
app.get('/monthList', (req, res, next) => getMonthList(req, res, next, db))
app.post('/monthList', (req, res, next) => addToMonthList(req, res, next, db))
app.put('/monthList', (req, res, next) => updateMonthList(req, res, next, db))
app.get('/yearList', (req, res, next) => getYearList(req, res, next, db))
app.post('/yearList', (req, res, next) => addToYearList(req, res, next, db))
app.put('/yearList', (req, res, next) => updateYearList(req, res, next, db))
app.get('/expenseCategories', (req, res, next) =>
  getExpenseCategories(req, res, next, db)
)
app.post('/expenseCategories', (req, res, next) =>
  addExpenseCategory(req, res, next, db)
)
app.put('/expenseCategories', (req, res, next) =>
  updateExpenseCategory(req, res, next, db)
)
app.get('/accounts', (req, res, next) => getAccounts(req, res, next, db))
app.post('/accounts', (req, res, next) => addAccount(req, res, next, db))
app.put('/accounts', (req, res, next) => updateAccounts(req, res, next, db))
app.get('/categorycatchwords', (req, res, next) =>
  getCategoryCatchwords(req, res, next, db)
)
app.post('/categorycatchwords', (req, res, next) =>
  addCategoryCatchwords(req, res, next, db)
)
app.put('/categorycatchwords', (req, res, next) =>
  updateCategoryCatchwords(req, res, next, db)
)
app.get('/miscellaneouscatchwords', (req, res, next) =>
  getMiscellaneousCatchwords(req, res, next, db)
)
app.post('/miscellaneouscatchwords', (req, res, next) =>
  addMiscellaneousCatchwords(req, res, next, db)
)
app.put('/miscellaneouscatchwords', (req, res, next) =>
  updateMiscellaneousCatchwords(req, res, next, db)
)
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
app.get('/mutualfunds', (req, res, next) => getMutualFunds(req, res, next, db))

app.listen(3001, async () => {
  try {
    await db.connect()
    console.log('connected to database ...')
    const ignoredExpenses = await db.queryIgnoredExpenses()
    if (ignoredExpenses) {
      const appMetadata = AppMetadata.instance
      appMetadata.ignoredExpenses = ignoredExpenses
    }
  } catch (e) {
    console.log(e)
  }
  console.log('listening at port 3001 ...')
})
