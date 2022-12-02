const expenseList = ReactDOM.createRoot(document.getElementById('expenseList'))
const summary = ReactDOM.createRoot(document.getElementById('summary'))
let globalExpenses = []
let filteredExpenses = []
function TRow (props) {
    return  <tr>
              <th scope="row" className="text-muted">{props.idx}</th>
              <td>{new Date(props.row.date).toDateString()}</td>
              <td>
                    {
                        (props.row.credit_amount*-1 || props.row.debit_amount)
                            .toLocaleString('en-IN',{
                                style: 'currency', 
                                currency: 'INR'
                            })}
              </td>
              <td>{props.row.category}</td>
              <td>{props.row.expense_source}</td>
              <td className="text-wrap" style={{width: 10 + 'rem'}}>{props.row.details}</td>
            </tr>
}
function Table (props) {
    let rows = props.expenses
    const trows = rows.map((row, idx) => {
        return <TRow key={idx} row={row} idx={idx+1}></TRow>
    })
    const titleDateString = new Date(props.dateString).toLocaleString("en-US", { month: "long" }) + ' ' + new Date(props.dateString).getFullYear()

    function handleSelectCategory(e) {
        const value = e.target.value
        props.handleSelectCategory(value, props.dateString)
    }
    return  <div className="card border-0 table-responsive shadow">
                <div className="card-header border-0 row white">
                    <div className="col-3">
                        <h6 className="card-header-title h6 p-2 text-muted">EXPENSES - {titleDateString}</h6>
                    </div>
                    <div className="col-2">
                        <select id="selectCategory" className="form-select form-select-sm" onChange={handleSelectCategory}>
                            <option defaultValue value="null">Filter by category</option>
                            <option value="">No filter</option>
                            <option value="groceries">Groceries</option>
                            <option value="investment">Investment</option>
                            <option value="medical">Medical</option>
                            <option value="misc">Misc</option>
                        </select>
                    </div>
                </div>
                <table className="table card-body align-middle mb-0">
                    <thead className="table-light">
                    <tr>
                        <th scope="col" className="text-muted">#</th>
                        <th scope="col" className="text-muted">Date</th>
                        <th scope="col" className="text-muted">Amount</th>
                        <th scope="col" className="text-muted">Category</th>
                        <th scope="col" className="text-muted">Source</th>
                        <th scope="col" className="text-muted">Details</th>
                    </tr>
                    </thead>
                    <tbody className="list">
                        {trows}
                    </tbody>
                </table>
            </div>
}
function populateTable (expenses, dateString) {
    expenseList.render(
        <Table expenses={expenses} 
            dateString={dateString} 
            handleSelectCategory={handleSelectCategory}/>
    )
}
function handleSelectCategory (value, dateString) {
    if (value) {
        console.log('filter table by ' + value)
        filteredExpenses = Object.assign([], globalExpenses).filter(x => x.category == value)
        populateTable(filteredExpenses, dateString)
    } else {
        populateTable(globalExpenses, dateString)
    }
}
function Summary (props) {
    const rows =  props.aggregate.map((rec, idx) => {
        return <dl key={idx} className="row mb-1">
            <dt className="col-2">{rec._id.replace(rec._id.charAt(0), rec._id.charAt(0).toUpperCase())}</dt>
            <dd className="col">{rec.total.toLocaleString('en-IN',{
                                style: 'currency', 
                                currency: 'INR'
                            })}</dd>
        </dl>
    })
    return <div className="row card mx-auto border-0 shadow">
        <div className="card-header border-0 white">
                    <h6 className="card-header-title h6 p-2 text-muted ">SUMMARY - {props.titleDateString}</h6>
        </div>
        <div className="card-body">
            {rows}
            { props.total ? <dl className="row mt-4">
                <dt className="col-2">
                    Total Expense
                </dt>
                <dd className="col">{props.total.toLocaleString('en-IN',{
                                style: 'currency', 
                                currency: 'INR'
                            })}</dd>
            </dl>: null}
        </div>
        
    </div>
}
function populateSummary (aggregate, dateString) {
    const titleDateString = new Date(dateString).toLocaleString("en-US", { month: "long" }) + ' ' + new Date(dateString).getFullYear()
    let total = 0
    if (aggregate && aggregate.length) {
        total = aggregate.reduce((sum, rec) => {
            return sum + parseFloat(rec.total)
        }, 0)
        console.log(total)
    }
    
    summary.render(<Summary aggregate={aggregate} titleDateString={titleDateString} total={total}/>)
}
const selectMonth = document.getElementById('selectMonth')
selectMonth.addEventListener('change', (e) => {
    const selectCategory = document.getElementById('selectCategory')
    if (selectCategory) {
        selectCategory.value = "null"
    }
    fetchExpenses(e.target.value)
})

const fetchExpenses = (date) => {
    fetch('/expenses' + '?startDate=' + new Date(date).toJSON())
    .then((data) => {
        return data.json()
    })
    .then((data) => {
        console.log(data)
        if (data.expenses && data.expenses.length) {
            globalExpenses = data.expenses
            populateTable(data.expenses, date)
        }
        if (data.aggregate && data.aggregate.length) {
            populateSummary(data.aggregate, date)
        }
    })
    .catch((e) => {
        console.log(e)
    })
}
fetchExpenses(new Date(new Date().setDate(1)).toISOString().split('T')[0].replaceAll('-','/'))