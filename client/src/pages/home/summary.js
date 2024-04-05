import React from 'react'

export default function Summary(props) {
  let titleDateString = ''
  let iconMap = {
    investment: 'bi-activity',
    'car-emi': 'bi-car-front',
    entertainment: 'bi-tv',
    groceries: 'bi-basket',
    phone: 'bi-telephone',
    electricity: 'bi-lightning-charge',
    travel: 'bi-airplane',
    medical: 'bi-prescription',
    'eating-out': 'bi-cup-hot',
    misc: 'bi-question-lg',
    amazon: 'bi-cart',
    baby: 'bi-heart-fill',
  }

  if (props.dateString) {
    titleDateString =
      ' - ' +
      new Date(props.dateString).toLocaleString('en-US', { month: 'long' }) +
      ' ' +
      new Date(props.dateString).getFullYear()
  }

  function getIconClass(key) {
    const iconClass = iconMap[key]
    return iconClass ? `bi ${iconClass} px-2` : 'px-2'
  }

  return (
    <div className="row card border-0 shadow">
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
                  <dt className="col-7">
                    <i className={getIconClass(rec._id)}></i>
                    {rec._id.replace(
                      rec._id.charAt(0),
                      rec._id.charAt(0).toUpperCase()
                    )}
                  </dt>
                  <dd className="col-5">
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
            <dt className="col-7">
              <i className="bi bi-receipt px-2"></i>Total Expense
            </dt>
            <dd className="col-5">
              {props.total.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalFixed ? (
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-flag-fill px-2 text-primary"></i>Fixed Expense
            </dt>
            <dd className="col-5">
              {props.totalFixed.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalNecessary ? (
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-flag-fill px-2 text-success"></i>Necessary
              Expense
            </dt>
            <dd className="col-5">
              {props.totalNecessary.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalAvoidable ? (
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-flag-fill px-2 text-danger"></i>Avoidable
              Expense
            </dt>
            <dd className="col-5">
              {props.totalAvoidable.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalDoesntHurt ? (
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-flag-fill px-2 text-secondary"></i>One-off
              Expense
            </dt>
            <dd className="col-5">
              {props.totalDoesntHurt.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.credit ? (
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-arrow-up px-2"></i>Credit
            </dt>
            <dd className="col-5">
              {props.credit.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.salary ? (
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-cash-stack px-2"></i>Salary
            </dt>
            <dd className="col-5">
              {props.salary.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.openingBalance ? (
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-wallet2 px-2"></i>Opening Balance
            </dt>
            <dd className="col-5">
              {props.openingBalance.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.closingBalance ? (
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-wallet px-2"></i>Closing Balance
            </dt>
            <dd className="col-5">
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
