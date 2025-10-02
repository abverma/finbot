const appMetadata = require('./appMetadata').instance
const totalClause = {
  $sum: {
    $cond: [
      {
        $eq: ['$exclude', true],
      },
      0,
      {
        $cond: [
          {
            $gt: ['$debit_amount', 0],
          },
          '$debit_amount',
          { $multiply: ['$credit_amount', -1] },
        ],
      },
    ],
  },
}

const getExpenses = async (req, res, next, db) => {
  const { month, year, timezone } = req.query
  const filter = {
    $and: [
      {
        $expr: { $eq: [{ $year: '$date' }, parseInt(year)] },
      },
      {
        details: {
          $nin: appMetadata.ignoredExpenses,
        },
      },
    ],
  }
  if (month) {
    filter.$and.push({
      $expr: {
        $eq: [{ $month: { date: '$date', timezone } }, parseInt(month)],
      },
    })
  }

  try {
    const expenses = await db.queryExpense(filter)
    filter.$and.push({
      expense_source: {
        $ne: 'ora sal',
      },
    })
    const pipelines = [
      {
        $match: filter,
      },
      {
        $group: {
          _id: '$category',
          total: totalClause,
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ]
    const aggregate = await db.aggregate(pipelines)

    res.send({
      expenses,
      aggregate,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getPeriodBalance = async (req, res, next, db) => {
  const { month, year, timezone } = req.query
  const query = {
    $and: [
      { source: 'hdfc account' },
      {
        $expr: { $eq: [{ $year: '$date' }, parseInt(year)] },
      },
    ],
  }
  if (month) {
    query.$and.push({
      $expr: {
        $eq: [{ $month: { date: '$date', timezone } }, parseInt(month)],
      },
    })
  }

  try {
    const firstexpense = await db.queryExpense(query, 1)

    const lastexpense = await db.queryExpense(query, 1, { _id: -1 })

    res.send({
      opening_balance: firstexpense.length
        ? firstexpense[0].closing_balance
        : null,
      closing_balance: lastexpense.length
        ? lastexpense[0].closing_balance
        : null,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const graphByMonths = async (req, res, next, db) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { year } = req.query
  const pipelines = [
    {
      $match: {
        $and: [
          {
            $expr: { $eq: [{ $year: '$date' }, parseInt(year)] },
          },
          {
            expense_source: {
              $ne: 'ora sal',
            },
            category: {
              $ne: 'investment',
            },
            details: {
              $nin: appMetadata.ignoredExpenses,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        month: {
          $month: {
            date: '$date',
            timezone,
          },
        },
        year: {
          $year: {
            date: '$date',
            timezone,
          },
        },
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        total_expense: totalClause,
        count: { $sum: 1 },
        closing_balance: { $last: '$closing_balance' },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]
  try {
    res.send(await db.aggregate(pipelines))
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const graphCategoriesByMonths = async (req, res, next, db) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { year } = req.query
  const pipelines = [
    {
      $match: {
        $and: [
          {
            $expr: { $eq: [{ $year: '$date' }, parseInt(year)] },
          },
          {
            expense_source: {
              $ne: 'ora sal',
            },
            details: {
              $nin: appMetadata.ignoredExpenses,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        month: {
          $month: {
            date: '$date',
            timezone,
          },
        },
        year: {
          $year: {
            date: '$date',
            timezone,
          },
        },
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year', category: '$category' },
        total_expense: totalClause,
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]
  try {
    res.send(await db.aggregate(pipelines))
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const updateExpense = async (req, res, next, db) => {
  const id = req.query['_id']
  const row = req.body
  delete row['_id']
  row['update_date'] = Date.now()
  try {
    const data = await db.updateExpense(
      {
        _id: id,
      },
      row
    )

    res.send({
      expenses: undefined,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getFixedExpenses = async (req, res, next, db) => {
  const startDate = new Date(req.query.startDate)
  const endDate = new Date(
    new Date(startDate).setMonth(startDate.getMonth() + 1)
  )
  try {
    const pipelines = [
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate,
          },
          details: {
            $nin: appMetadata.ignoredExpenses,
          },
          $or: [
            {
              expense_source: {
                $in: ['maintenance', 'netflix', 'max life ins'],
              },
            },
            {
              details: /EAW-512967XXXXXX5130/,
              debit_amount: 10000,
            },
            {
              category: {
                $in: ['car-emi', 'phone', 'electricity'],
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          fixed_expenses: { $sum: '$debit_amount' },
        },
      },
    ]

    const data = await db.aggregate(pipelines)
    res.send({
      expenses: data,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const searchExpenses = async (req, res, next, db) => {
  try {
    const searchParams = JSON.parse(req.query?.search)
    const filter = {
      $and: [],
      $or: [],
    }
    searchParams.forEach((q) => {
      const condition = {}
      condition[q.query.field] = {}
      condition[q.query.field][q.query.operator] = q.query.value

      if (q.query.operator === '$regex') {
        condition[q.query.field]['$options'] = 'i'
      }

      if (!q.operand) {
        q.operand = '$and'
      }
      filter[q.operand].push(condition)
    })
    if (!filter['$and'].length) {
      delete filter['$and']
    }
    if (!filter['$or'].length) {
      delete filter['$or']
    }
    console.log(JSON.stringify(filter))
    const expenses = await db.queryExpense(filter)

    res.send({ expenses })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getMonths = async (req, res, next, db) => {
  try {
    const result = await db.queryMonths(
      req.query.query ?? {},
      req.query.start,
      req.query.limit
    )
    const count = await db.getTotalMonths({})
    res.send({
      data: result,
      count,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const addMonth = async (req, res, next, db) => {
  try {
    const result = await db.addMonth(req.body)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const updateMonths = async (req, res, next, db) => {
  try {
    const list = req.body
    const promises = []
    list.forEach((l) => {
      promises.push(db.updateMonths({ _id: l._id }, l))
    })
    const result = await Promise.all(promises)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getYears = async (req, res, next, db) => {
  try {
    const result = await db.queryYears(
      req.query.query ?? {},
      req.query.start,
      req.query.limit
    )
    const count = await db.getTotalYears({})
    res.send({
      data: result,
      count,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const addYear = async (req, res, next, db) => {
  try {
    const result = await db.addYear(req.body)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const updateYears = async (req, res, next, db) => {
  try {
    const list = req.body
    const promises = []
    list.forEach((l) => {
      promises.push(db.updateYears({ _id: l._id }, l))
    })
    const result = await Promise.all(promises)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getExpenseCategories = async (req, res, next, db) => {
  try {
    const result = await db.queryExpenseCategories(req.query)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getAccounts = async (req, res, next, db) => {
  try {
    const result = await db.queryAccounts(req.query)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const addAccount = async (req, res, next, db) => {
  try {
    const result = await db.addAccount(req.body)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const addExpenseCategory = async (req, res, next, db) => {
  try {
    const result = await db.addExpenseCategory(req.body)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const updateAccounts = async (req, res, next, db) => {
  try {
    const list = req.body
    const promises = []
    list.forEach((l) => {
      promises.push(db.updateAccounts({ _id: l._id }, l))
    })
    const result = await Promise.all(promises)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const updateExpenseCategory = async (req, res, next, db) => {
  try {
    const list = req.body
    const promises = []
    list.forEach((l) => {
      promises.push(db.updateExpenseCategory({ _id: l._id }, l))
    })
    const result = await Promise.all(promises)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getCategoryCatchwords = async (req, res, next, db) => {
  try {
    const result = await db.queryCategoryCatchwords(
      req.query.query ?? {},
      req.query.start,
      req.query.limit
    )
    // const count = await db.getTotalMonths({})
    res.send({
      data: result,
      // count,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const addCategoryCatchwords = async (req, res, next, db) => {
  try {
    const result = await db.addCategoryCatchwords(req.body)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const updateCategoryCatchwords = async (req, res, next, db) => {
  try {
    const list = req.body
    const promises = []
    list.forEach((l) => {
      promises.push(db.updateCategoryCatchwords({ _id: l._id }, l))
    })
    const result = await Promise.all(promises)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getMiscellaneousCatchwords = async (req, res, next, db) => {
  try {
    const result = await db.queryMiscellaneousCatchwords(
      req.query.query ?? {},
      req.query.start,
      req.query.limit
    )
    // const count = await db.getTotalMonths({})
    res.send({
      data: result,
      // count,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const addMiscellaneousCatchwords = async (req, res, next, db) => {
  try {
    const result = await db.addMiscellaneousCatchwords(req.body)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const updateMiscellaneousCatchwords = async (req, res, next, db) => {
  try {
    const list = req.body
    const promises = []
    list.forEach((l) => {
      promises.push(db.updateMiscellaneousCatchwords({ _id: l._id }, l))
    })
    const result = await Promise.all(promises)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const getMutualFunds = async (req, res, next, db) => {
  try {
    const result = await db.queryMutualFunds(
      req.query,
      req.query.start,
      req.query.limit
    )
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const executeCustomQuery = async (req, res, next, db) => {
  const { limit } = req.query
  const { filter, update } = req.body
  const { Expense } = db.models
  const projection = {
    date: 1,
    details: 1,
    debit_amount: 1,
    credit_amount: 1,
    source: 1,
    exclude: 1,
  }
  try {
    let result
    if (update) {
      await Expense.updateMany(filter, update)
    }
    result = await Promise.all([
      Expense.find(filter, projection).limit(limit ? parseInt(limit) : 0),
      Expense.countDocuments(filter),
    ])

    res.send({
      data: result[0],
      total: result[1],
    })
  } catch (e) {
    console.log(e)
    res.status(500).send({
      error: e.message,
    })
  }
}

const updateMutualFunds = async (req, res, next, db) => {
  const _id = req.query._id
  const update = req.body
  try {
    await db.updateMutualFunds({ _id }, update)
    const result = await db.queryMutualFunds()
    res.send({
      data: result,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send({
      error: e.message,
    })
  }
}

const getIgnoredExpenses = async (req, res, next, db) => {
  try {
    const result = await db.queryIgnoredExpenses(
      {},
      req.query.start,
      req.query.limit
    )
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

const updateIgnoredExpenses = async (req, res, next, db) => {
  try {
    const _id = req.query._id
    const update = req.body
    const result = await db.updateIgnoredExpenses({ _id }, update)
    res.send({
      data: result,
    })
  } catch (e) {
    res.status(500).send({
      error: e.message,
    })
    console.log(e)
  }
}

module.exports = {
  getExpenses,
  graphByMonths,
  updateExpense,
  getFixedExpenses,
  getPeriodBalance,
  searchExpenses,
  getMonthList: getMonths,
  addToMonthList: addMonth,
  updateMonthList: updateMonths,
  getExpenseCategories,
  getAccounts,
  addAccount,
  updateAccounts,
  getCategoryCatchwords,
  addCategoryCatchwords,
  updateCategoryCatchwords,
  getMiscellaneousCatchwords,
  updateMiscellaneousCatchwords,
  addMiscellaneousCatchwords,
  addExpenseCategory,
  updateExpenseCategory,
  getMutualFunds,
  getYearList: getYears,
  addToYearList: addYear,
  updateYearList: updateYears,
  executeCustomQuery,
  updateMutualFunds,
  getIgnoredExpenses,
  updateIgnoredExpenses,
  graphCategoriesByMonths,
}
