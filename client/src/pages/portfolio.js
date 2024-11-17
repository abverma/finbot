import React, { useState, useEffect } from 'react'

export default function PortfolioPage() {
  const [mutualFunds, setMutualFunds] = useState([])
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalCurrent, setTotalCurrent] = useState(0)
  const [returns, setReturns] = useState(0)
  const [show, setShow] = useState(false)
  useEffect(() => {
    fetch('/mutualfunds')
      .then((result) => result.json())
      .then((result) => {
        setTotalInvested(result.data.reduce((p, c) => p + c.invested_value, 0))
        setTotalCurrent(result.data.reduce((p, c) => p + c.current_value, 0))
        setReturns((totalCurrent / totalInvested) * 100)
        setMutualFunds(result.data)
        setShow(true)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])

  const ret = ((totalCurrent / totalInvested - 1) * 100).toFixed(2)
  const totalColor = ret > 1 ? 'text-success' : 'text-danger'
  return (
    <div className="container p-2">
      <div className="card border-0 shadow my-2 p-2">
        <div className="card-body">
          <h4 className="card-title">
            Mutual Funds{' '}
            {show
              ? ` - ${totalCurrent.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                })}`
              : ''}
            {show ? <span className={totalColor}>{` (${ret} %)`}</span> : ''}
          </h4>
          <table className="table table-hover card-body align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-muted">
                  Name
                </th>
                <th scope="col" className="text-muted">
                  Type
                </th>
                <th scope="col" className="text-muted">
                  Investment Date
                </th>
                <th scope="col" className="text-muted">
                  Invested Value
                </th>
                <th scope="col" className="text-muted">
                  Current Value
                </th>
              </tr>
            </thead>
            <tbody className="list">
              {mutualFunds &&
                mutualFunds.map((data) => {
                  return (
                    <tr key={data._id}>
                      <td>{data.name}</td>
                      <td>{data.type}</td>
                      <td>{new Date(data.date).toDateString()}</td>
                      <td>
                        {data.invested_value.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={data.current_value.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                          })}
                        />
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card border-0 shadow my-2 p-2">
        <div className="card-body">
          <h4 className="card-title">
            PPF{' - '}
            <span>
              {(1900000).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </span>
          </h4>
        </div>
      </div>
    </div>
  )
}
