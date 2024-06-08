import { configureStore } from '@reduxjs/toolkit'
import reducer from './slice'

export default configureStore({
  reducer: {
    counter: reducer,
  },
})
