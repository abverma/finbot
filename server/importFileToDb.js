const path = require('path')
const parse = require('./readFile').readFile
const fs = require('fs')
const db = require('./db')

const fileName = 'CCStatement02-12-2022.csv' //'HDFC_Nov_22.csv'
const csvFile = fs.readFileSync(path.join(__dirname, './data/new', fileName), {
    encoding: "utf-8"
})
const printCategory = ''
const fileObj = parse(csvFile)
const expenseDictionary = {
    'groceries': ['rolla', 'lulu', 'ruchika', 'vegandukan', 'big basket'],
    'entertainment': ['xbox', 'netflix', 'zee5', 'hotstar', 'netlfix'],
    'medical': ['prima', 'medical', 'ellan', 'max life ins', 'clinic', 'motherhood', 'hospital', 'dental'],
    'electricity': ['bangalore electricit-bescl', 'electricity', 'bescom'],
    'amazon': ['amazon'],
    'salary': ['ora sal'],
    'phone': ['airtel'], 
    'travel': ['ola', 'uber', 'vistara', 'indigo', 'airlines'],
    'investment': ['indian clearing corp'],
    'car-emi': ['racpc koramangala', 'sbi car loan'],
    'eating-out': ['swiggy', 'crave by leena']
}
const tagCategory = (obj) => {
    Object.keys(expenseDictionary).forEach((idx) => {
        const desc = obj['details'].toLowerCase()
        for (let j = 0; j < expenseDictionary[idx].length; j++) {
            if (!obj['category'] && desc.includes(expenseDictionary[idx][j])) {
                obj['category'] = idx
                obj['expense_source'] = expenseDictionary[idx][j]
            }
        }
    })
    if (!obj['category']) {
        obj['category'] = 'misc'
        obj['expense_source'] = ''
    }
}
const format = (currentDate, source) => {
    const currentYear = source == 'hdfc account' ? '20' + currentDate.split('/')[2] : currentDate.split('/')[2]
    return new Date(currentYear + '/' + currentDate.split('/')[1] + '/' + currentDate.split('/')[0])
}
const formatDates = (data) => {
    data['date'] = format(data['date'], data['source'])
    if (data.hasOwnProperty('value_dat')) {
        data['value_dat'] = format(data['value_dat'], data['source'])
    }
}
const data = fileObj.data
const summary = {}
const process = () => {
    for (let i = 0; i < data.length; i++) {
        let trx_type = 'debit'
        if (data[i].hasOwnProperty('')) {
            delete data[i]['']
        }
        if (fileName.includes('HDFC')) {
            trx_type = parseFloat(data[i]['debit_amount'])  ? 'debit' : 'credit'
            data[i]['source'] = 'hdfc account'
        } else if (fileName.includes('CCStatement') || fileName.includes('CCLastStatement')) {
            data[i]['source'] = 'icici credit card'
            if (data[i]['amount'].includes(' Dr.')) {
                data[i]['debit_amount'] = data[i]['amount'].replace(',', '').split(' Dr.')[0]
            }
            if (data[i]['amount'].includes(' Cr.')) {
                data[i]['credit_amount'] = data[i]['amount'].replace(',', '').split(' Cr.')[0]
                trx_type = 'credit'
            }
            delete data[i]['amount']
        }
        tagCategory(data[i])
        const category = data[i]['category']
        data[i]['trx_type'] = trx_type
        formatDates(data[i])
    }
}
process()
db.connect()
    .then(() => {
        return db.bulkCreateExpense(data)
    })
    .then((result) => {
        // console.log(result)
        console.log('expense added')
    })
    .catch((e) => {
        console.log(e)
    })
    .finally(() => {
        db.disconnect()
        fs.renameSync(path.join(__dirname, './data/new', fileName), path.join(__dirname, './data/archive', fileName))
    })
// Object.keys(summary).forEach((key) => {
//     const amount = summary[key].toLocaleString('en-IN',
//         {style: 'currency', currency: 'INR'}
//     )
//     console.log(`${key}: ${amount}`)
// })
// let expenditure = 0.00
// Object.keys(summary).forEach((key) => {
//     if (key !== 'salary' && key !== 'investment') {
//         expenditure += summary[key]
//     }
// })
// console.log(`\ntotal expenditure: ${expenditure.toLocaleString('en-IN', {
//     style: 'currency', currency: 'INR'
// })}`)