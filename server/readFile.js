const Papa = require('papaparse')

exports.readFile = (csvFile) => {
  return Papa.parse(csvFile, {
    delimiter: ',',
    encoding: 'utf-8',
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      if (header.includes('(INR)')) {
        header = header.split('(INR)')[0]
      }
      if (header.includes('Transaction Date')) {
        header = 'Date'
      }

      if (header.includes('Narration') || header.includes('Description')) {
        header = 'Details'
      }

      if (header.includes('Ref Number')) {
        header = 'Reference Number'
      }
      return header.toLowerCase().trim().replace(' ', '_')
    },
    transform: (value) => {
      return value.trim()
    },
  })
}
