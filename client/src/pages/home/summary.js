import React from 'react'
import { useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { CategoryScale, Colors } from 'chart.js'
import Chart from 'chart.js/auto'

export default function Summary(props) {
  Chart.register(CategoryScale)
  Chart.register(Colors)

  const dataSet = props.aggregate?.filter((x) => x._id !== 'investment')
  const titleDateString = props.dateString
    ? ' - ' +
      new Date(props.dateString).toLocaleString('en-US', { month: 'long' }) +
      ' ' +
      new Date(props.dateString).getFullYear()
    : props.year
  const chartData = {
    labels: dataSet.map((x) => x._id),
    datasets: [
      {
        label: 'Expenses',
        data: dataSet.map((x) => x.total),
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  let iconMap = {
    investment: 'bi-activity',
    'car-emi': 'bi-car-front',
    car: 'bi-car-front',
    entertainment: 'bi-play-btn',
    groceries: 'bi-basket',
    phone: 'bi-phone',
    electricity: 'bi-plug',
    travel: 'bi-airplane',
    medical: 'bi-prescription',
    'eating-out': 'bi-cup-hot',
    misc: 'bi-question-lg',
    amazon: 'bi-cart',
    baby: 'bi-balloon',
    cat: 'bi-c-circle',
    education: 'bi-pencil',
    'home-essentials': 'bi-house-gear',
    apparel: 'bi-tags',
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
        <div className="container p-3 m-auto">
          {props.aggregate.length ? (
            <div id="summaryChart">
              <Doughnut data={chartData} options={options}></Doughnut>
            </div>
          ) : (
            ''
          )}
        </div>
        {props.aggregate.length
          ? props.aggregate
              .filter((x) => x._id !== 'investment')
              .map((rec, idx) => {
                return (
                  <dl key={idx} className="row mb-1">
                    <dt
                      className="col-7"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) =>
                        props.clearAndApplyFilter(rec._id, 'category')
                      }
                    >
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
          <dl className="row mb-0">
            <dt className="col-7">
              <i className="bi bi-calculator px-2"></i>Total Expense
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
          <dl className="row mt-4 mb-0">
            <dt
              className="col-7"
              style={{ cursor: 'pointer' }}
              onClick={(e) => props.clearAndApplyFilter('fixed', 'priority')}
            >
              <i className="bi bi-cash-stack px-2 text-primary"></i>Fixed
              Expense
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
            <dt
              className="col-7"
              style={{ cursor: 'pointer' }}
              onClick={(e) =>
                props.clearAndApplyFilter('necessary', 'priority')
              }
            >
              <i className="bi bi-cash-stack px-2 text-success"></i>
              Necessary Expense
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
            <dt
              className="col-7"
              style={{ cursor: 'pointer' }}
              onClick={(e) =>
                props.clearAndApplyFilter('avoidable', 'priority')
              }
            >
              <i className="bi bi-cash-stack px-2 text-danger"></i>Avoidable
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
            <dt
              className="col-7"
              style={{ cursor: 'pointer' }}
              onClick={(e) => props.clearAndApplyFilter('one-off', 'priority')}
            >
              <i className="bi bi-cash-stack px-2 text-secondary"></i>One-off
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
              <i className="bi bi-box-arrow-in-down px-2"></i>Credit
            </dt>
            <dd className="col-5">
              {props.credit.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.aggregate.length &&
        props.aggregate.find((x) => x._id === 'investment') ? (
          <dl className="row mt-4 mb-0">
            <dt className="col-7">
              <i className="bi bi-activity px-2"></i>Investment
            </dt>
            <dd className="col-5">
              {props.aggregate
                .find((x) => x._id === 'investment')
                .total.toLocaleString('en-IN', {
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
