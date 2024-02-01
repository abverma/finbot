const ignoredExpenses = [
  /ABHISHEK VERMA-ICIC-XXXXXXXX4593-SELF/,
  /INFINITY PAYMENT RECEIVED, THANK YOU/,
  /UPI-ABHISHEK VERMA-ABHINOW.ABHISHEK@ICICI/,
  /ABHISHEK VERMA-ICIC-XXXXXXXX4593/,
  /UPI-RUCHIKA {2}SAINI-9410371779/,
  /ABHISHEK VERMA-NETBANK/,
  /AUTOPAY THANK YOU/,
  /AUTOPAY/,
]
const totalClause = {
  $sum: {
    $cond: [
      {
        $gt: ['$debit_amount', 0],
      },
      '$debit_amount',
      { $multiply: ['$credit_amount', -1] },
    ],
  },
}

const getExpenses = async (req, res, next, db) => {
  const startDate = new Date(req.query.startDate)
  const endDate = new Date(
    new Date(startDate).setMonth(startDate.getMonth() + 1)
  )
  const dateClause = {
    $gte: startDate,
    $lt: endDate,
  }
  try {
    const expenses = await db.queryExpense({
      date: dateClause,
      details: {
        $nin: ignoredExpenses,
      },
    })
    const pipelines = [
      {
        $match: {
          expense_source: {
            $ne: 'ora sal',
          },
          date: dateClause,
          details: {
            $nin: ignoredExpenses,
          },
        },
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

const getMonthBalance = async (req, res, next, db) => {
  const startDate = new Date(req.query.startDate)
  const endDate = new Date(startDate)
  startDate.setDate(1)
  endDate.setMonth(startDate.getMonth() + 1)
  endDate.setDate(0)
  const query = {
    date: { $gte: startDate },
    source: 'hdfc account',
  }
  try {
    const firstexpense = await db.queryExpense(query, 1)
    query.date = {
      $lte: endDate,
    }
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
  const pipelines = [
    {
      $match: {
        expense_source: {
          $ne: 'ora sal',
        },
        category: {
          $ne: 'investment',
        },
        details: {
          $nin: ignoredExpenses,
        },
        date: {
          $gt: new Date('2022-09-01'),
        },
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
      expenses: data,
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
            $nin: ignoredExpenses,
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
      req.query,
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

module.exports = {
  getExpenses,
  graphByMonths,
  updateExpense,
  getFixedExpenses,
  getMonthBalance,
  searchExpenses,
  getMonthList: getMonths,
  addToMonthList: addMonth,
  updateMonthList: updateMonths,
  getExpenseCategories,
  getAccounts,
  addAccount,
  updateAccounts,
}
