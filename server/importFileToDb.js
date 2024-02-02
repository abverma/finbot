const tagCategory = async (obj, db) => {
  const desc = obj['details'].toLowerCase()
  const expenseDictionary = await db.queryCategoryCatchwords({})
  const miscSourceDictionary = await db.queryMiscellaneousCatchwords({})

  expenseDictionary.forEach((item) => {
    for (let j = 0; j < item.catchwords.length; j++) {
      if (
        !obj['category'] &&
        desc.toLowerCase().includes(item.catchwords[j].toLowerCase())
      ) {
        obj['category'] = item.category
        obj['expense_source'] = item.catchwords[j]
      }
    }
  })
  if (!obj['category']) {
    obj['expense_source'] = ''

    miscSourceDictionary.forEach((item) => {
      for (let j = 0; j < item.catchwords.length; j++) {
        if (
          !obj['expense_source'] &&
          desc.includes(item.catchwords[j].toLowerCase())
        ) {
          obj['expense_source'] = item.expense_source
        }
      }
    })
    obj['category'] = 'misc'
  }
}

const format = (currentDate, source) => {
  const currentYear =
    source === 'hdfc account'
      ? `20${currentDate.split('/')[2]}`
      : currentDate.split('/')[2]
  return new Date(
    `${currentYear}/${currentDate.split('/')[1]}/${currentDate.split('/')[0]}`
  )
}

const formatDates = (data) => {
  data['date'] = format(data['date'], data['source'])
  if (data.hasOwnProperty('value_dat')) {
    data['value_dat'] = format(data['value_dat'], data['source'])
  }
}

const process = async (data, account, db) => {
  for (let i = 0; i < data.length; i++) {
    let trx_type = 'debit'
    const row = data[i]
    if (row.hasOwnProperty('')) {
      delete row['']
    }
    row['source'] = account
    if (account === 'hdfc credit card') {
      if (row['transaction_type']) {
        trx_type = row['transaction_type'] === 'Cr' ? 'credit' : 'debit'
      } else {
        trx_type = row['amount'].includes('Cr') ? 'credit' : 'debit'
        row['amount'] = row['amount'].split('Cr')[0]
      }
      row['debit_amount'] = parseFloat(0)
      row['credit_amount'] = parseFloat(0)

      if (trx_type == 'debit') {
        row['debit_amount'] = parseFloat(row['amount'].replace(',', ''))
      } else {
        row['credit_amount'] = parseFloat(row['amount'].replace(',', ''))
      }
      row['date'] = row['date'].split(' ')[0]
    } else if (account === 'hdfc account') {
      trx_type = parseFloat(row['debit_amount']) ? 'debit' : 'credit'
    } else if (account === 'icici credit card') {
      if (row['amount'].includes(' Dr.')) {
        row['debit_amount'] = row['amount'].replace(',', '').split(' Dr.')[0]
      }
      if (row['amount'].includes(' Cr.')) {
        row['credit_amount'] = row['amount'].replace(',', '').split(' Cr.')[0]
        trx_type = 'credit'
      }
      delete row['amount']
    }
    await tagCategory(row, db)
    row['trx_type'] = trx_type
    formatDates(row)
  }
  return data
}

exports.processFile = process
