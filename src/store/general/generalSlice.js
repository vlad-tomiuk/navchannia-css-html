import { createSlice } from '@reduxjs/toolkit';

const defaultConfig = [
	{
		width: 360,
		styles: {
			'*': {
				boxSizing: 'border-box',
			},
			'html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video': {
				margin: 0,
				padding: 0,
				border: 0,
				fontSize: '100%',
				font: 'inherit',
				verticalAlign: 'baseline',
			},
			'article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section': {
				display: 'block',
			},
			body: {
				lineHeight: 1,
			},
			'ol, ul': {
				listStyle: 'none',
			},
			'blockquote, q': {
				quotes: 'none',
			},
			'blockquote:before, blockquote:after, q:before, q:after': {
				content: "''",
			},
			table: {
				borderCollapse: 'collapse',
				borderSpacing: 0,
			},
		},
	},
];

const initialState = {
	screenWidth: 360,
	screenHeight: 600,
	screenScale: 1,
	menuActive: 'builder',
	buildCode: {
		css: false,
	},
	selected: {
		tag: {
			tagName: '',
			use: false 
		},
		id: { 
			idName: '',
			use: false 
		},
		class: [
			{ 
				className: '',
				use: false 
			}
		]
	},
	useAdaptive: true,
	config: defaultConfig,
};

const generalSlice = createSlice({
	name: 'general',
	initialState,
	reducers: {
		setScreenWidth: (state, action) => {
			state.screenWidth = action.payload;
		},
		setScreenHeight: (state, action) => {
			state.screenHeight = action.payload;
		},
		setScreenScale: (state, action) => {
			state.screenScale = action.payload;
		},
		setUseAdaptive: (state, action) => {
			state.useAdaptive = action.payload;
		},
		updateStyleFor: (state, action) => {
			const { width, selector, value } = action.payload;
			let screen = state.config.find(c => c.width === width);
		
			if (!screen) {
				screen = { width, styles: {} };
				state.config.push(screen);
			}
		
			if (!screen.styles) screen.styles = {};
			if (!screen.styles[selector]) screen.styles[selector] = {};
		
			screen.styles[selector] = {
				...screen.styles[selector],
				...value
			};
		},
		setSelectedTag: (state, action) => {
			state.selected.tag = action.payload;
		},
		setSelectedId: (state, action) => {
			state.selected.id = action.payload;
		},
		setSelectedClassList: (state, action) => {
			state.selected.class = action.payload;
		},
		addSelectedClass: (state, action) => {
			state.selected.class.push(action.payload);
		},
		updateSelectedClassUse: (state, action) => {
			const { className, use } = action.payload;
			const item = state.selected.class.find(c => c.className === className);
			if (item) item.use = use;
		},
		removeSelectedClass: (state, action) => {
			state.selected.class = state.selected.class.filter(c => c.className !== action.payload);
		},
		setActiveMenuBuilder: (state) => {
			state.menuActive = 'builder';
		},
		setActiveMenuStyle: (state) => {
			state.menuActive = 'style';
		},
		setBuildCode: (state, action) => {
			const type = action.payload;
			state.buildCode = {
				css: false,
				[type]: true,
			};
		},
		resetBuildCode: (state) => {
			state.buildCode = {
				css: false,
			};
		},
		resetSelected: (state) => {
			state.selected = {
				tag: { tagName: '', use: false },
				id: { idName: '', use: false },
				class: []
			};
		},
		resetGeneral: () => initialState,
	},
});

export const {
	setScreenWidth,
	setScreenHeight,
	setScreenScale,
	setUseAdaptive,
	updateStyleFor,
	setSelectedTag,
	setSelectedId,
	setSelectedClassList,
	addSelectedClass,
	updateSelectedClassUse,
	removeSelectedClass,
	setActiveMenuBuilder,
	setActiveMenuStyle,
	setBuildCode,
	resetBuildCode,
	resetSelected,
	resetGeneral,
} = generalSlice.actions;

export default generalSlice.reducer;