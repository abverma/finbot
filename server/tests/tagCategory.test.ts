import { describe, test, vi, expect } from 'vitest'
const db = require('../db')
const { processFile } = require('../importFileToDb')

const CategoryCatchwordsData = require('./testData/categoryCatchwords.json')
const MiscellaneousCatchwordsData = require('./testData/miscellaneousCatchwords.json')
const UploadFile = require('./testData/uploadFile.json')

describe('test tag category on expense', () => {
  test('tagCategory', async () => {
    db.queryCategoryCatchwords = vi.fn().mockReturnValue(CategoryCatchwordsData)
    db.queryMiscellaneousCatchwords = vi
      .fn()
      .mockReturnValue(MiscellaneousCatchwordsData)
    const expenses = await processFile(UploadFile.data, UploadFile.account, db)
    expect(expenses[0].expense_source).toEqual('')
    expect(expenses[0].trx_type).toEqual('credit')
    expect(expenses[0].credit_amount).toEqual('1951.20')

    expect(expenses[1].category).toEqual('amazon')
    expect(expenses[1].trx_type).toEqual('debit')
    expect(expenses[1].debit_amount).toEqual('1618.20')
  })
})
