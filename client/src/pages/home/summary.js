import React from 'react'

export default function Summary(props) {
  let titleDateString = ''

  if (props.dateString) {
    titleDateString =
      ' - ' +
      new Date(props.dateString).toLocaleString('en-US', { month: 'long' }) +
      ' ' +
      new Date(props.dateString).getFullYear()
  }

  return (
    <div className="row card mx-auto border-0 shadow">
      <div className="card-header border-0 white text-center">
        <h6 className="card-header-title h6 p-2 text-muted ">
          SUMMARY {titleDateString}
        </h6>
      </div>
      <div className="card-body">
        {props.aggregate
          ? props.aggregate.map((rec, idx) => {
              return (
                <dl key={idx} className="row mb-1">
                  <dt className="col-md-2 col-6">
                    {rec._id.replace(
                      rec._id.charAt(0),
                      rec._id.charAt(0).toUpperCase()
                    )}
                  </dt>
                  <dd className="col-md-10 col-6">
                    {rec.total.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </dd>
                </dl>
              )
            })
          : ''}
        {props.total ? (
          <dl className="row mt-4 mb-0">
            <dt className="col-md-2 col-6">Total Expense</dt>
            <dd className="col-md-10 col-6">
              {props.total.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalFixed ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6 text-primary">Fixed Expense</dt>
            <dd className="col-md-10 col-6">
              {props.totalFixed.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalNecessary ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6 text-success">Necessary Expense</dt>
            <dd className="col-md-10 col-6">
              {props.totalNecessary.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalAvoidable ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6 text-danger">Avoidable Expense</dt>
            <dd className="col-md-10 col-6">
              {props.totalAvoidable.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalDoesntHurt ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6 text-secondary">One-off Expense</dt>
            <dd className="col-md-10 col-6">
              {props.totalDoesntHurt.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.credit ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6">Credit</dt>
            <dd className="col-md-10 col-6">
              {props.credit.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.salary ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6">Salary</dt>
            <dd className="col-md-10 col-6">
              {props.salary.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.openingBalance ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6">Opening Balance</dt>
            <dd className="col-md-10 col-6">
              {props.openingBalance.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.closingBalance ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6">Closing Balance</dt>
            <dd className="col-md-10 col-6">
              {props.closingBalance.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}
      </div>
    </div>
  )
}
