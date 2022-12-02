const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
	date: Date,
	details: String,
	value_dat: Date,
	debit_amount: Number,
	credit_amount: Number,
	reference_number: String,
	closing_balance: Number,
	source: String,
	category: String,
	expense_source: String,
	trx_type: String,
	creation_date: {
		type: Date,
		default: Date.now,
	},
})
const currentDate = '31/10/22'
const currentYear = '20' + currentDate.split('/')[2]
const currentMonth = currentDate.split('/')[1]
const currentDay = currentDate.split('/')[0]
const mockExpense = {
	date: new Date('20' + currentDate.split('/')[2] + '/' + currentDate.split('/')[1] + '/' + currentDate.split('/')[0]),
	details: 'UPI-ROLLA HYPER MARKET-ROLLAHYPERMARKET.42392290@HDFCBANK-HDFC0000001-230403568836-PAYMENT FROM PHONE',
	value_dat: new Date('20' + currentDate.split('/')[2] + '/' + currentDate.split('/')[1] + '/' + currentDate.split('/')[0]),
	debit_amount: '3220.00',
	credit_amount: '0.00',
	reference_number: '0000230403568836',
	closing_balance: '591340.00',
	source: 'hdfc account',
	category: 'groceries',
	expense_source: 'rolla',
	trx_type: 'debit',
}
new Date(2022)
const Expense = mongoose.model('expenses', expenseSchema)

const connect = async function () {
	await mongoose.connect('mongodb://localhost:27017/finbot')
	// use `await mongoose.connect('mongodb://user:password@localhost:27017/test')` if your database has auth enabled
}

const bulkCreateExpense = async (expenses) => {
	return Expense.insertMany(expenses)
}

const createExpense = async (expense) => {
	return Expense.create(expense)
}

const queryExpense = async (query, limit) => {
	return Expense.find(query).sort({ date: 1 })
}
const deleteAllExpenses = async () => {
	return Expense.deleteMany()
}
const disconnect = async () => {
	return mongoose.disconnect()
}

const aggregate = async (startDate, endDate) => {
	return Expense.aggregate([
		{
			$match: {
				expense_source: {
					$ne: 'ora sal',
				},
				date: { $lt: new Date(endDate), $gt: new Date(startDate) },
			},
		},
		{ 
            $group: { 
                _id: '$category', 
                total: { 
                    $sum: {
                        $cond: [{
                            $gt: ["$debit_amount", 0]
                          }, "$debit_amount",
                                {$multiply: [
                            "$credit_amount",
                            -1
                          ]}
                        ]
                    }
                } 
            } 
        },
		{ $sort: { total: -1 } },
	])
}

// connect()
// .then(() => {
//     return deleteAllExpenses()
// })
// .then(() => {
//     return createExpense(mockExpense)
// })
// .then(() => {
//     return queryExpense()
// })
// .then((result) => {
//     console.log(new Date(result[0].date).toDateString())
//     mongoose.disconnect()
// })
// .catch((e) => {
//     console.log(e)
//     mongoose.disconnect()
// })

exports.connect = connect
exports.bulkCreateExpense = bulkCreateExpense
exports.disconnect = disconnect
exports.queryExpense = queryExpense
exports.aggregate = aggregate
