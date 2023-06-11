const ignoredExpenses = [/ABHISHEK VERMA-ICIC-XXXXXXXX4593-SELF/, /INFINITY PAYMENT RECEIVED, THANK YOU/, /UPI-ABHISHEK VERMA-ABHINOW.ABHISHEK@ICICI/, /ABHISHEK VERMA-ICIC-XXXXXXXX4593/, /UPI-RUCHIKA  SAINI-9410371779/]
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
    const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1))
    
    try {
        const data = await db.queryExpense({
            date: {
                $gte: startDate,
                $lt: endDate
            },
            details: {
                $nin: ignoredExpenses
            }
        })
        const pipelines = [
            {
                $match: {
                    expense_source: {
                        $ne: 'ora sal',
                    },
                    date: { 
                        $gte: startDate,
                        $lt: endDate
                    },
                    details: {
                        $nin: [/ABHISHEK VERMA-ICIC-XXXXXXXX4593-SELF/, /INFINITY PAYMENT RECEIVED, THANK YOU/, /UPI-ABHISHEK VERMA-ABHINOW.ABHISHEK@ICICI/, /ABHISHEK VERMA-ICIC-XXXXXXXX4593/, /UPI-RUCHIKA  SAINI-9410371779/]
                    }
                },
            },
            { 
                $group: { 
                    _id: '$category',
                    total: totalClause 
                } 
            },
            {   $sort: { 
                    total: -1 
                } 
            },
        ]
        const aggregate = await db.aggregate(pipelines)
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
                    $nin: ignoredExpenses
                },
                date: {
                    $gt: new Date('2022-09-01')
                }
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
                count: { $sum: 1},
                closing_balance: {$last: '$closing_balance'}
            },
        }, {
            $sort: { 
                '_id.year': 1,
                '_id.month': 1
            } 
        }
    ]
    try {
        res.send(await db.aggregate(pipelines))
    }
    catch (e) {
        res.status(500).send({
            error: e.message
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
        const data = await db.updateExpense({
            _id: id
        }, row)

        res.send({
            expenses: data,
        })
    }
    catch (e) {
        res.status(500).send({
            error: e.message
        })
        console.log(e)
    }
}

module.exports = {
    getExpenses,
    graphByMonths,
    updateExpense
}