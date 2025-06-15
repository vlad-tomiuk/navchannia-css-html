import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import generalReducer from './general/generalSlice';
import htmlReducer from './general/htmlSlice';

const generalPersistConfig = {
	key: 'general',
	storage,
};

const htmlPersistConfig = {
	key: 'html',
	storage,
};

export const store = configureStore({
	reducer: {
		general: persistReducer(generalPersistConfig, generalReducer),
		html: persistReducer(htmlPersistConfig, htmlReducer),
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);