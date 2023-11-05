const expenseDictionary = {
  groceries: [
    'rolla',
    'lulu',
    'ruchika',
    'vegandukan',
    'big basket',
    'innovative retail conc',
    'the body shop',
    'goel story',
  ],
  entertainment: ['xbox', 'netflix', 'zee5', 'hotstar', 'bookmyshow'],
  medical: [
    'prima',
    'medical',
    'ellan',
    'max life ins',
    'clinic',
    'motherhood',
    'hospital',
    'dental',
    'columbia asia',
    'upi-sheetal shrivastava',
    'sheetal shrivastava',
    'practo',
    'diagnostic',
    'shrivastava sheetal',
  ],
  electricity: ['bangalore electricit-bescl', 'electricity', 'bescom'],
  amazon: ['amazon'],
  salary: ['ora sal'],
  phone: ['airtel'],
  travel: [
    'ola',
    'uber',
    'vistara',
    'indigo',
    'airlines',
    'thimmarayaswamy',
    'fuel point',
    'makemytrip',
    'smartbuy flight',
    'parking',
    'irctc',
  ],
  investment: [
    'indian clearing corp',
    'indianclearing',
    'bundl technologies pvt bangalore',
  ],
  'car-emi': ['racpc koramangala', 'sbi car loan'],
  'eating-out': [
    'swiggy',
    'crave by leena',
    'starbucks',
    'carrots',
    'spice klub',
  ],
  apparel: [
    'shoppers stop',
    'shopperstop',
    'pearl fancy store',
    'mataji collection',
    'life style',
    'hennes n mauritz',
    'metro brands',
    'myntra',
  ],
  baby: ['firstcry', 'mother care'],
}

const miscSourceDictionary = {
  maintenance: ['MYGATE'],
  gail: ['UPI-GAIL GAS LIMITED', 'gail'],
  indmoney: ['CTRAZORPAY-INDWEALTH'],
  'urban company': ['URBANCOMPANY', 'URBAN COMPANY', 'URBANCLAP'],
  'car service': ['NEXASERVICE', 'UPI-NEXA SERVICE'],
  'atm withdrawal': ['EAW-512967XXXXXX5130'],
  'office meal': [
    'SODEXO ORACLE SITE',
    'UPI-SODEXO ORACLE',
    'NITHIN',
    'DHEER',
    'DATTA',
    'PRANAVA',
    'NAVEEN',
    'ARCHIKA',
  ],
  ikea: ['IKEA'],
  tailor: ['ISHHQ'],
  donation: ['DONATION'],
}

const tagCategory = (obj) => {
  const desc = obj['details'].toLowerCase()

  Object.keys(expenseDictionary).forEach((idx) => {
    for (let j = 0; j < expenseDictionary[idx].length; j++) {
      if (
        !obj['category'] &&
        desc.toLowerCase().includes(expenseDictionary[idx][j].toLowerCase())
      ) {
        obj['category'] = idx
        obj['expense_source'] = expenseDictionary[idx][j]
      }
    }
  })
  if (!obj['category']) {
    obj['expense_source'] = ''

    Object.keys(miscSourceDictionary).forEach((idx) => {
      for (let j = 0; j < miscSourceDictionary[idx].length; j++) {
        if (
          !obj['expense_source'] &&
          desc.includes(miscSourceDictionary[idx][j].toLowerCase())
        ) {
          obj['expense_source'] = idx
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

const process = (data, fileName, account) => {
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
        row['amount'] = row['amount'].split(' Cr')[0]
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
    tagCategory(row)
    row['trx_type'] = trx_type
    formatDates(row)
  }
  return data
}

exports.process = process
