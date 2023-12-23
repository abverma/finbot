import React from 'react'

export default function CardList(props) {
  return (
    <div>
      {props.expenses.map((row, idx) => {
        return (
          <div className="card m-1" key={idx}>
            <div className="card-header text-bg-secondary">
              {new Date(row.date).toDateString()}
            </div>
            <div className="card-body">
              <div className="row justify-content-between">
                <div className="col col-10 col-sm-8 align-self-start">
                  <h5 className="card-text">
                    {row.category.charAt(0).toUpperCase() +
                      row.category.substr(1)}
                  </h5>
                  <p className="card-text">{row.details}</p>
                </div>
                <div className="col col-2 col-sm-4 align-items-start text-end">
                  <h5 className="card-title">
                    {(
                      row.credit_amount * -1 || row.debit_amount
                    ).toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </h5>
                </div>
              </div>
              <p className="card-text align-self-end">
                <small className="text-body-secondary">
                  {row.source}/&nbsp;{row.expense_source}
                </small>
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
