import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	activeEditor: false,
	htmlCode: '<div>Hello world!</div>',
};

const htmlSlice = createSlice({
	name: 'html',
	initialState,
	reducers: {
		setHtmlCode: (state, action) => {
			state.htmlCode = action.payload;
		},
		resetHtmlCode: (state) => {
			state.htmlCode = '';
		},
		setActiveEditor: (state, action) => {
			state.activeEditor = action.payload; 
		},
		toggleActiveEditor: (state) => {
			state.activeEditor = !state.activeEditor;
		}
	},
});

export const {
	setHtmlCode,
	resetHtmlCode,
	setActiveEditor,
	toggleActiveEditor
} = htmlSlice.actions;

export default htmlSlice.reducer;