import appStore from './store'

let demoMode = appStore.getState().app.demoMode

appStore.subscribe(() => {
  demoMode = appStore.getState().app.demoMode
})

export function formatCurrency(value) {
  if (!value) {
    return ''
  }
  if (demoMode) {
    return '******'
  }
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  })
}

export function formatString(value) {
  if (!value) {
    return ''
  }
  if (demoMode) {
    return '******'
  }
  return value
}
