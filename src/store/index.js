import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import projectsReducer from './slices/projectsSlice';
import achievementsReducer from './slices/achievementsSlice';
import dashboardCountsReducer from './slices/dashboardCountsSlice';
import authReducer from './slices/authSlice';
import enquiriesReducer from './slices/enquirySlice';
import contactsReducer from './slices/contactSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    projects: projectsReducer,
    achievements: achievementsReducer,
    dashboardCounts: dashboardCountsReducer,
    auth: authReducer,
    enquiries: enquiriesReducer,
    contacts: contactsReducer,
  },
});
