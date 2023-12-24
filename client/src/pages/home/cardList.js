import React from 'react'

export default function CardList(props) {
  function onChange(e, row, rowKey) {
    if (e.target) {
      row[rowKey] = e.target.value
    }
    props.updateRow(row)
    if (rowKey === 'category') {
      const updateObj = {}
      updateObj[rowKey] = e.target.value
      updateObj['_id'] = row._id
      props.saveRow(updateObj)
    }
  }

  function onKeyUp(e, row, rowKey) {
    if (e.code == 'Enter' && e.key == 'Enter') {
      const updateObj = {}
      updateObj[rowKey] = e.target.value
      updateObj['_id'] = row._id
      props.saveRow(updateObj)
      e.target.blur()
    }
  }
  return (
    <div className="p-0">
      {props.expenses.map((row, idx) => {
        return (
          <div className="card m-1" key={idx}>
            <div className="card-header">
              {new Date(row.date).toDateString()}
            </div>
            <div className="card-body">
              <div className="row justify-content-between">
                <div className="col-6 col-md-6 align-self-start">
                  <select
                    className="form-control form-select card-text mb-1"
                    value={row.category}
                    onChange={(e) => onChange(e, row, 'category')}
                  >
                    {props.expenseCategories.map((x) => (
                      <option value={x.category} key={x._id}>
                        {x.category.replace(
                          x.category.charAt(0),
                          x.category.charAt(0).toUpperCase()
                        )}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={row.expense_source}
                    className="form-control mb-1 card-text"
                    onChange={(e) => onChange(e, row, 'expense_source')}
                    onKeyUp={(e) => onKeyUp(e, row, 'expense_source')}
                  ></input>
                </div>
                <div className="col-6 col-md-2 align-items-start text-end">
                  <h6 className="card-title">
                    {(
                      row.credit_amount * -1 || row.debit_amount
                    ).toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </h6>
                </div>
              </div>
              <p className="ps-1 card-text align-self-end">
                <small className="text-body-secondary">
                  {row.source}/&nbsp;{row.details.substring(0, 20)}
                </small>
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
