import Papa from 'papaparse'
import React from 'react'

export default class ImportPage extends React.Component {
    constructor (props) {
        super(props)
    }
    componentDidMount () {
        const uploadBtn = document.getElementById('uploadBtn')
        const fileUpload = document.getElementById('fileUpload')
        const me = this
        uploadBtn.addEventListener('click', (e) => {
            const file = fileUpload.files[0]
            const reader = new FileReader()
            console.log(file)
            reader.readAsText(file, 'utf-8')
            reader.onload = (e) => {
                me.readHandler(e, file.name, me)
            }
        })
    }
    readHandler (e, fileName, ctx) {
        const file = e.target.result;
        let csvString = ''
        // This is a regular expression to identify carriage
        // Returns and line breaks
        const lines = file.split(/\r\n|\n/)
        csvString += lines.join('\n')
        const csvJson = Papa.parse(csvString, {
            delimiter: ",",
            encoding: "utf-8",
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                if (header.includes('(INR)')) {
                    header = header.split('(INR)')[0]
                }
                if (header.includes('Transaction Date')) {
                    header = 'Date'
                }
    
                if (header.includes('Narration')) {
                    header = 'Details'
                }
    
                if (header.includes('Ref Number')) {
                    header = 'Reference Number'
                }
                return header.toLowerCase().trim().replace(' ', '_')
            }, 
            transform: (value) => {
                return value.trim()
            }
        })
        ctx.upload(Object.assign({fileName}, {data: csvJson.data}))
    }
    upload (data) {
        fetch('/importFile', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(async (result) => {
            console.log(await result.json())
        })
        .catch((e) => {
            console.log(new Error('Error uploading file', {
                cause: e
            }))
        })
    }
    render () {
        return <div className="container p-3 m-auto">
            <input type="file" id="fileUpload" name="upload"></input>
            <button type="button" className="btn btn-primary" id="uploadBtn">Upload</button>
        </div>
    }
}