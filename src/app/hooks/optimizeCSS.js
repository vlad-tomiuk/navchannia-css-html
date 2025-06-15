export const optimizeCSS = (rules) => {
	const clone = { ...rules };

	const mergeFour = (props, shorthand) => {
		const values = props.map(k => clone[k]);
		if (values.every(v => v === undefined)) return;

		const [t, r, b, l] = values.map(v => v || '0');

		const all = [t, r, b, l];

		if (all.every(v => v === all[0])) {
			clone[shorthand] = t;
		} else if (t === b && r === l) {
			clone[shorthand] = `${t} ${r}`;
		} else if (r === l) {
			clone[shorthand] = `${t} ${r} ${b}`;
		} else {
			clone[shorthand] = `${t} ${r} ${b} ${l}`;
		}

		props.forEach(k => delete clone[k]);
	};

	const mergeTriple = (props, shorthand) => {
		const values = props.map(k => clone[k]);
		if (values.every(Boolean)) {
			clone[shorthand] = values.join(' ');
			props.forEach(k => delete clone[k]);
		}
	};

	mergeFour(['marginTop', 'marginRight', 'marginBottom', 'marginLeft'], 'margin');
	mergeFour(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'], 'padding');
	mergeFour(['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'], 'border-radius');
	mergeFour(['top', 'right', 'bottom', 'left'], 'inset');

	const borderProps = ['borderWidth', 'borderStyle', 'borderColor'];
	if (borderProps.every(k => clone[k])) {
		clone.border = `${clone.borderWidth} ${clone.borderStyle} ${clone.borderColor}`;
		borderProps.forEach(k => delete clone[k]);
	}

	const outlineProps = ['outlineWidth', 'outlineStyle', 'outlineColor'];
	if (outlineProps.every(k => clone[k])) {
		clone.outline = `${clone.outlineWidth} ${clone.outlineStyle} ${clone.outlineColor}`;
		outlineProps.forEach(k => delete clone[k]);
	}

	const fontProps = ['fontStyle', 'fontVariant', 'fontWeight', 'fontSize', 'lineHeight', 'fontFamily'];
	if (fontProps.every(k => clone[k])) {
		clone.font = `${clone.fontStyle} ${clone.fontVariant} ${clone.fontWeight} ${clone.fontSize}/${clone.lineHeight} ${clone.fontFamily}`;
		fontProps.forEach(k => delete clone[k]);
	}

	const flexProps = ['flexGrow', 'flexShrink', 'flexBasis'];
	if (flexProps.every(k => clone[k])) {
		clone.flex = `${clone.flexGrow} ${clone.flexShrink} ${clone.flexBasis}`;
		flexProps.forEach(k => delete clone[k]);
	}

	mergeTriple(['gridRowStart', 'gridRowEnd', 'gridRow'], 'grid-row');
	mergeTriple(['gridColumnStart', 'gridColumnEnd', 'gridColumn'], 'grid-column');

	return clone;
};