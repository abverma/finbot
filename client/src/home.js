import React from 'react'

export default class HomePage extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			expenses: [],
			filteredExpenses: [],
			aggregates: [],
			date: new Date().setDate(1),
			total: 0,
			filter: {}
		}
	}
	componentDidMount() {
		this.fetchExpenses()
	}

	fetchExpenses() {
		fetch('/expenses' + '?startDate=' + new Date(this.state.date).toJSON())
			.then((data) => {
				return data.json()
			})
			.then((data) => {
				console.log(data)
				let total = 0
				const totalFixed = data.fixedExpenses.length ? data.fixedExpenses[0].total : 0

				if (data.aggregate && data.aggregate.length) {
					total = data.aggregate.reduce((sum, rec) => {
						return sum + (rec._id == 'investment' ? 0 : parseFloat(rec.total))
					}, 0)
				}
				this.setState((state) => ({
					expenses: data.expenses,
					filteredExpenses: data.expenses,
					aggregate: data.aggregate,
					total,
					totalFixed
				}))
			})
			.catch((e) => {
				console.log(e)
			})
	}

	updateRow(row) {
		const tempRows = this.state.filteredExpenses
		const changedIdx = tempRows.findIndex((x) => x._id == row._id)
		tempRows[changedIdx] = row
		this.setState((state) => ({
			filteredExpenses: tempRows,
		}))
	}

	async saveRow(row) {
		const resp = await fetch(`/expenses?_id=${row._id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
			},
			body: JSON.stringify(row),
		})
	}

	handleSelectCategory(value, filter) {
		if (filter) {
			let filteredExpenses = this.state.expenses
			let filterState = this.state.filter

			if (value) {
				filterState[filter] = value
				console.log('filter table by ' + value)
			} else {
				delete filterState[filter]
			}

			if (Object.keys(filterState).length) {
				Object.keys(filterState).forEach((key) => {
					filteredExpenses = Object.assign([], filteredExpenses).filter((x) => x[key] == filterState[key])
				})
				this.setState((state) => ({
					filteredExpenses: filteredExpenses,
					filter: filterState,
				}))
			} else {
				this.setState((state) => ({
					filteredExpenses: this.state.expenses,
					filter: filterState,
				}))
			}
		}
	}

	async handleSelectMonth(e) {
		if (e.target.value) {
			await this.setState((state) => ({
				date: e.target.value,
			}))
			document.getElementById('selectCategory').value = ''
			document.getElementById('selectSource').value = ''
			this.fetchExpenses()
		}
	}

	render() {
		return (
			<div className='container p-3 m-auto'>
				<div className='row w-50 d-flex flex-row mb-3 justify-content-between mx-auto'>
					<select id='selectMonth' className='form-select form-select-md m-2 col' aria-label='Default select example' onChange={(e) => this.handleSelectMonth(e)}>
						<option defaultValue value=''>
							Select month
						</option>
						<option value='2022/09/01'>September 2022</option>
						<option value='2022/10/01'>October 2022</option>
						<option value='2022/11/01'>November 2022</option>
						<option value='2022/12/01'>December 2022</option>
						<option value='2023/01/01'>January 2023</option>
						<option value='2023/02/01'>Feburary 2023</option>
						<option value='2023/03/01'>March 2023</option>
						<option value='2023/04/01'>April 2023</option>
						<option value='2023/05/01'>May 2023</option>
					</select>
				</div>
				<div id='summary' className='row p-2'>
					<Summary aggregate={this.state.aggregate} dateString={this.state.date} total={this.state.total} totalFixed={this.state.totalFixed}></Summary>
				</div>
				<div id='expenseList' className='row p-2'>
					<Table
						expenses={this.state.filteredExpenses}
						dateString={this.state.date}
						handleSelectCategory={(value, filter) => this.handleSelectCategory(value, filter)}
						updateRow={(row) => this.updateRow(row)}
						saveRow={(row) => this.saveRow(row)}
					></Table>
				</div>
			</div>
		)
	}
}

function TRow(props) {
	function onChange(e) {
		console.log(e.target.value)
		props.row.expense_source = e.target.value
		props.updateRow(props.row)
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

	return (
		<tr>
			<th scope='row' className='text-muted'>
				{props.idx}
			</th>
			<td>{new Date(props.row.date).toDateString()}</td>
			<td>
				{(props.row.credit_amount * -1 || props.row.debit_amount).toLocaleString('en-IN', {
					style: 'currency',
					currency: 'INR',
				})}
			</td>
			<td>{props.row.category}</td>
			<td>
				<input type='text' value={props.row.expense_source} className='form-control' onChange={(e) => onChange(e)} onKeyUp={(e) => onKeyUp(e, 'expense_source')}></input>
			</td>
			<td>{props.row.source}</td>
			<td className='text-wrap' style={{ width: 10 + 'rem' }}>
				{props.row.details}
			</td>
		</tr>
	)
}

function Table(props) {
	let rows = props.expenses
	const trows = rows.map((row, idx) => {
		return <TRow key={idx} row={row} idx={idx + 1}></TRow>
	})
	const titleDateString = new Date(props.dateString).toLocaleString('en-US', { month: 'long' }) + ' ' + new Date(props.dateString).getFullYear()

	return (
		<div className='card border-0 table-responsive shadow'>
			<div className='card-header border-0 row white'>
				<div className='col-md-3 col-12 justify-content-center text-center mb-2'>
					<h6 className='card-header-title h6 p-2 text-muted'>EXPENSES {' - ' + titleDateString}</h6>
				</div>
				<div className='col-md-4 col-12 row align-items-center'>
					<label className='col-4'>Category</label>
					<div className='col-8'>
						<select id='selectCategory' className='form-select form-select-sm' onChange={(e) => props.handleSelectCategory(e.target.value, 'category')}>
							<option defaultValue value=''>
								No filter
							</option>
							<option value='amazon'>Amazon</option>
							<option value='apparel'>Apparel</option>
							<option value='baby'>Baby</option>
							<option value='eating-out'>Eating-out</option>
							<option value='entertainment'>Entertainment</option>
							<option value='groceries'>Groceries</option>
							<option value='investment'>Investment</option>
							<option value='medical'>Medical</option>
							<option value='misc'>Misc</option>
							<option value='phone'>Phone</option>
							<option value='travel'>Travel</option>
						</select>
					</div>
				</div>
				<div className='col-md-4 col-12 row align-items-center'>
					<label className='col-4'>Account</label>
					<div className='col-8'>
						<select id='selectSource' className='form-select form-select-sm' onChange={(e) => props.handleSelectCategory(e.target.value, 'source')}>
							<option defaultValue value=''>
								No filter
							</option>
							<option value='hdfc account'>HDFC</option>
							<option value='icici credit card'>ICICI</option>
						</select>
					</div>
				</div>
			</div>
			<table className='table card-body align-middle mb-0'>
				<thead className='table-light'>
					<tr>
						<th scope='col' className='text-muted'>
							#
						</th>
						<th scope='col' className='text-muted'>
							Date
						</th>
						<th scope='col' className='text-muted'>
							Amount
						</th>
						<th scope='col' className='text-muted'>
							Category
						</th>
						<th scope='col' className='text-muted'>
							Source
						</th>
						<th scope='col' className='text-muted'>
							Account
						</th>
						<th scope='col' className='text-muted'>
							Details
						</th>
					</tr>
				</thead>
				<tbody className='list'>
					{props.expenses.map((row, idx) => {
						return <TRow key={idx} row={row} idx={idx + 1} updateRow={props.updateRow} saveRow={props.saveRow}></TRow>
					})}
				</tbody>
			</table>
		</div>
	)
}

function Summary(props) {
	const titleDateString = new Date(props.dateString).toLocaleString('en-US', { month: 'long' }) + ' ' + new Date(props.dateString).getFullYear()

	return (
		<div className='row card mx-auto border-0 shadow'>
			<div className='card-header border-0 white text-center'>
				<h6 className='card-header-title h6 p-2 text-muted '>SUMMARY {' - ' + titleDateString}</h6>
			</div>
			<div className='card-body'>
				{props.aggregate
					? props.aggregate.map((rec, idx) => {
							return (
								<dl key={idx} className='row mb-1'>
									<dt className='col-md-2 col-6'>{rec._id.replace(rec._id.charAt(0), rec._id.charAt(0).toUpperCase())}</dt>
									<dd className='col-md-10 col-6'>
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
					<dl className='row mt-4 mb-0'>
						<dt className='col-md-2 col-6'>Total Expense</dt>
						<dd className='col-md-10 col-6'>
							{props.total.toLocaleString('en-IN', {
								style: 'currency',
								currency: 'INR',
							})} 
						</dd>
					</dl>
				) : null}

				{props.totalFixed ? (
					<dl className='row'>
						<dt className='col-md-2 col-6'>Fixed Expense</dt>
						<dd className='col-md-10 col-6'>
							{props.totalFixed.toLocaleString('en-IN', {
								style: 'currency',
								currency: 'INR',
							})} (car emi, medical insurance, maid, netflix, phone, electricity)
						</dd>
					</dl>
				) : null}
			</div>
		</div>
	)
}
