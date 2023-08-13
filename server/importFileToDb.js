
const expenseDictionary = {
    'groceries': ['rolla', 'lulu', 'ruchika', 'vegandukan', 'big basket'],
    'entertainment': ['xbox', 'netflix', 'zee5', 'hotstar', 'bookmyshow'],
    'medical': ['prima', 'medical', 'ellan', 'max life ins', 'clinic', 'motherhood', 'hospital', 'dental', 'columbia asia', 'upi-sheetal shrivastava', 'practo'],
    'electricity': ['bangalore electricit-bescl', 'electricity', 'bescom'],
    'amazon': ['amazon'],
    'salary': ['ora sal'],
    'phone': ['airtel'], 
    'travel': ['ola', 'uber', 'vistara', 'indigo', 'airlines', 'thimmarayaswamy', 'fuel point', 'makemytrip'],
    'investment': ['indian clearing corp', 'indianclearing'],
    'car-emi': ['racpc koramangala', 'sbi car loan'],
    'eating-out': ['swiggy', 'crave by leena', 'starbucks', 'carrots', 'spice klub'],
    'apparel': ['shoppers stop', 'shopperstop', 'pearl fancy store', 'mataji collection', 'life style' , 'hennes n mauritz'],
    'baby': ['firstcry']
}

const miscSourceDictionary = {
    'maintenance': ['MYGATE DUES SETTLE'],
    'gail': ['UPI-GAIL GAS LIMITED'],
    'indmoney': ['CTRAZORPAY-INDWEALTH'],
    'urban company': ['URBANCOMPANY', 'URBAN COMPANY', 'URBANCLAP'],
    'car service': ['NEXASERVICE', 'UPI-NEXA SERVICE'],
    'atm withdrawal': ['EAW-512967XXXXXX5130'],
    'office meal': ['SODEXO ORACLE SITE', 'UPI-SODEXO ORACLE', 'NITHIN', 'DHEER', 'DATTA', 'PRANAVA', 'NAVEEN'],
    'ikea': ['IKEA'],
    'tailor': ['ISHHQ']
}

const tagCategory = (obj) => {
    const desc = obj['details'].toLowerCase()

    Object.keys(expenseDictionary).forEach((idx) => {
        for (let j = 0; j < expenseDictionary[idx].length; j++) {
            if (!obj['category'] && desc.toLowerCase().includes(expenseDictionary[idx][j].toLowerCase())) {
                obj['category'] = idx
                obj['expense_source'] = expenseDictionary[idx][j]
            }
        }
    })
    if (!obj['category']) {
        obj['expense_source'] = ''

        Object.keys(miscSourceDictionary).forEach((idx) => {
            for (let j = 0; j < miscSourceDictionary[idx].length; j++) {
                if (!obj['expense_source'] && desc.includes(miscSourceDictionary[idx][j].toLowerCase())) {
                    obj['expense_source'] = idx
                }
            }
        })
        obj['category'] = 'misc'
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

const process = (data, fileName) => {
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
        data[i]['trx_type'] = trx_type
        formatDates(data[i])
    }
    return data
}

exports.process = process