import { createSlice } from '@reduxjs/toolkit'

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    currentExpense: {},
    demoMode: true,
  },
  reducers: {
    setCurrentExpense: (state, action) => {
      state.currentExpense = action.payload
    },
    toggleDemoModeAction: (state) => {
      state.demoMode = !state.demoMode
    },
  },
})

// Action creators are generated for each case reducer function
export const { setCurrentExpense, toggleDemoModeAction } = appSlice.actions

export default appSlice.reducer
