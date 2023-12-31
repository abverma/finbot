const Papa = require('papaparse')
const fs = require('fs')
const pdf = require('pdf-parse')

const prepareHeader = (header) => {
  header = header.filter((x) => x.trim() !== '').map((x) => x.trim())

  let idx = header.findIndex((x) => x.trim() == 'Date Transaction Description')
  if (idx > -1) {
    header.unshift(header[idx].split(' ')[0])
    header[idx + 1] = header[idx + 1].split(' ').slice(-2).join(' ')
  }

  idx = header.findIndex((x) => x.trim() == 'Feature Reward')
  if (idx > -1) {
    header.unshift('Feature Reward Points')
    header.splice(idx + 1, 1)
    idx = header.findIndex((x) => x.trim() == 'Points')
    if (idx > -1) {
      header.splice(idx, 1)
    }
  }
  return header.map(transformHeader)
}

const transformHeader = (header) => {
  if (header.includes(' (in Rs.)')) {
    header = header.split(' (in Rs.)')[0]
  }
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
}

exports.convert = (file) => {
  const rows = []
  let row = {}
  let dataBuffer = fs.readFileSync(file)
  return new Promise((resolve, reject) => {
    pdf(dataBuffer)
      .then(function (data) {
        const statementPages = data.text
          .split('Domestic Transactions')
          .slice(-2)
        statementPages[0] = statementPages[0].split(
          'Infinia Credit Card Statement'
        )[0]
        statementPages[1] = statementPages[1].split('Reward Points Summary')[0]
        let header = prepareHeader(
          statementPages[0].split('ABHISHEK VERMA')[0].split('\n')
        )
        statementPages[0] = statementPages[0]
          .split('ABHISHEK VERMA')[1]
          .split('\n')
        statementPages[1] = statementPages[1]
          .split('ABHISHEK VERMA')[1]
          .split('\n')
        const timePattern = /\d{2}:\d{2}:\d{2}/
        const datePattern = /\d{2}\/\d{2}\/\d{4}/
        const currencyPattern = /(\d{1,2},)*\d{1,3}\.\d{2}/

        if (statementPages[0][0].trim() == '') {
          statementPages[0].shift()
        }
        if (statementPages[1][0].trim() == '') {
          statementPages[1].shift()
        }
        statementPages.forEach((page) => {
          row = {}
          page.forEach((line) => {
            line = line.trimEnd()
            let timeMatch = timePattern.exec(line)
            let dateMatch = datePattern.exec(line)
            const indexJump = timeMatch ? 8 : 10
            const matchedPattern = timeMatch || dateMatch

            if (matchedPattern) {
              row[header[1]] = line.slice(0, matchedPattern.index + indexJump)
              const tail = line.slice(
                matchedPattern.index + indexJump,
                line.length
              )
              currencyMatch = currencyPattern.exec(tail)
              if (currencyMatch) {
                row[header[2]] = tail.slice(0, currencyMatch.index).trim()
                row[header[2]] = row[header[2]].replaceAll('  ', ' ')
                row[header[3]] = tail.slice(currencyMatch.index, tail.length)
                //todo: handle credit

                rows.push(row)
                row = {}
              }
            } else {
              row[header[0]] = line
            }
          })
        })

        resolve({
          header,
          rows,
        })
      })
      .catch((e) => {
        console.log('Error in parsing pdf', e)
        reject(e)
      })
  })
}

exports.readCsvFile = (csvFile) => {
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
