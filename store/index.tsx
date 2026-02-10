import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
import userConfigSlice from './userConfigSlice';


const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    userConfig:userConfigSlice
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
