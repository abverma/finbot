import React from 'react'

function TRow(props) {
  function onChange(e, rowKey) {
    if (e.target) props.row[rowKey] = e.target.value
    props.updateRow(props.row)
    if (rowKey === 'category') {
      const updateObj = {}
      updateObj[rowKey] = e.target.value
      updateObj['_id'] = props.row._id
      props.saveRow(updateObj)
    }
  }

  function onKeyUp(e, rowKey) {
    if (e.code == 'Enter' && e.key == 'Enter') {
      const updateObj = {}
      updateObj[rowKey] = e.target.value
      updateObj['_id'] = props.row._id
      props.saveRow(updateObj)
      e.target.blur()
    }
  }

  function getRowColor() {
    let color = ''
    switch (props.row.priority) {
      case 'fixed':
        color = 'primary'
        break
      case 'necessary':
        color = 'success'
        break
      case 'avoidable':
        color = 'danger'
        break
      case 'one-off':
        color = 'light'
        break
    }
    return color
  }

  return (
    <tr className={`table-${getRowColor()}`}>
      <th scope="row" className="text-muted">
        {props.idx}
      </th>
      <td>{new Date(props.row.date).toDateString()}</td>
      <td>
        {(
          props.row.credit_amount * -1 || props.row.debit_amount
        ).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        })}
      </td>
      <td>
        <select
          className="form-control form-select"
          value={props.row.category}
          onChange={(e) => onChange(e, 'category')}
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
      </td>
      <td>
        <input
          type="text"
          value={props.row.expense_source}
          className="form-control"
          onChange={(e) => onChange(e, 'expense_source')}
          onKeyUp={(e) => onKeyUp(e, 'expense_source')}
        ></input>
      </td>
      <td>{props.row.source}</td>
      <td className="text-wrap" style={{ width: 10 + 'rem' }}>
        {props.row.details}
      </td>
    </tr>
  )
}

export default function Table(props) {
  return (
    <table className="table card-body align-middle mb-0">
      <thead className="table">
        <tr>
          <th scope="col" className="text-muted">
            #
          </th>
          <th scope="col" className="text-muted">
            Date
          </th>
          <th scope="col" className="text-muted">
            Amount
          </th>
          <th scope="col" className="text-muted">
            Category
          </th>
          <th scope="col" className="text-muted">
            Source
          </th>
          <th scope="col" className="text-muted">
            Account
          </th>
          <th scope="col" className="text-muted">
            Details
          </th>
        </tr>
      </thead>
      <tbody className="list">
        {props.expenses.map((row, idx) => {
          return (
            <TRow
              key={idx}
              row={row}
              idx={idx + 1}
              updateRow={props.updateRow}
              saveRow={props.saveRow}
              expenseCategories={props.expenseCategories}
            ></TRow>
          )
        })}
      </tbody>
    </table>
  )
}
