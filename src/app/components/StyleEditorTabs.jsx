import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStyleFor } from '@store/general/generalSlice';

export default function StyleEditorTabs() {
	const dispatch = useDispatch();
	const screenWidth = useSelector((state) => state.general.screenWidth);
	const selected = useSelector((state) => state.general.selected);
	const config = useSelector((state) => state.general.config);
	const [styles, setStyles] = useState({});

	const [openTabs, setOpenTabs] = useState({
		size: false,
		spacing: true,
		display: true,
		typography: true,
		background: false,
		position: false,
		overflow: false,
	});

	const toggleTab = (key) => {
		setOpenTabs((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const buildSelector = () => {
		if (!selected) return null;

		let selector = '';
		if (selected.tag.use && selected.tag.tagName !== 'none') {
			selector += selected.tag.tagName;
		}
		if (selected.id.use && selected.id.idName !== 'none') {
			selector += `#${selected.id.idName}`;
		}
		const activeClasses = selected.class.filter((c) => c.use && c.className !== 'none');
		if (activeClasses.length > 0) {
			selector += activeClasses.map((c) => `.${c.className}`).join('');
		}

		return selector.trim() || null;
	};

	useEffect(() => {
		const selector = buildSelector();
		if (!selector) return;

		const screen = config.find((c) => c.width === screenWidth);
		const data = screen?.styles?.[selector] || {};
		setStyles(data);
	}, [screenWidth, selected, config]);

	const handleStyleChange = (prop, value) => {
		const selector = buildSelector();
		if (!selector) return;

		const updated = {
			...styles,
			[prop]: value,
		};

		setStyles(updated);
		dispatch(updateStyleFor({ width: screenWidth, selector, value: updated }));
	};

	const renderSelect = (label, prop, options) => (
		<div className="style-row">
			{label && <label>{label}</label>}
			<select
				value={getCurrentStyle(prop)}
				onChange={(e) => handleStyleChange(prop, e.target.value)}
			>
				{options.map((opt) => (
					<option key={opt} value={opt}>
						{opt}
					</option>
				))}
			</select>
		</div>
	);

	const renderInput = (label, name) => (
		<div className="style-row">
			{label && <label>{label}</label>}
			<input
				type="text"
				value={getCurrentStyle(name)}
				onChange={(e) => handleStyleChange(name, e.target.value)}
				placeholder="0"
			/>
		</div>
	);

	const getCurrentStyle = (key) => {
		return styles?.[key] || '';
	};

	return (
		<div className="style-tabs">

			{/* SIZE */}
			<div className="style-tab">
				<div className="style-tab-header" onClick={() => toggleTab('size')}>
					Size
				</div>
				{openTabs.size && (
					<div className="style-tab-body">
						{renderInput('width', 'width')}
						{renderInput('height', 'height')}
						{renderInput('max-width', 'maxWidth')}
						{renderInput('max-height', 'maxHeight')}
						{renderSelect('object-fit', 'objectFit', ['-', 'fill', 'contain', 'cover', 'none', 'scale-down'])}
					</div>
				)}
			</div>

			{/* SPACING */}
			<div className="style-tab">
				<div className="style-tab-header" onClick={() => toggleTab('spacing')}>
					Spacing
				</div>
				{openTabs.spacing && (
					<div className="style-tab-body size-wrap">
						<div className="spacing-group">
							<strong>margin</strong>
							<div className="spacing-inputs">
								{renderInput('', 'marginTop')}
								{renderInput('', 'marginRight')}
								{renderInput('', 'marginBottom')}
								{renderInput('', 'marginLeft')}
							</div>
						</div>
						<div className="spacing-group">
							<strong>padding</strong>
							<div className="spacing-inputs">
								{renderInput('', 'paddingTop')}
								{renderInput('', 'paddingRight')}
								{renderInput('', 'paddingBottom')}
								{renderInput('', 'paddingLeft')}
							</div>
						</div>
						<div className="spacing-group">
							<strong>border-radius</strong>
							<div className="spacing-inputs">
								{renderInput('', 'borderTopLeftRadius')}
								{renderInput('', 'borderTopRightRadius')}
								{renderInput('', 'borderBottomRightRadius')}
								{renderInput('', 'borderBottomLeftRadius')}
							</div>
						</div>
					</div>
				)}
			</div>
			
			{/* DISPLAY */}
			<div className="style-tab">
				<div className="style-tab-header" onClick={() => toggleTab('display')}>
					Display
				</div>
				{openTabs.display && (
					<div className="style-tab-body">
						{renderSelect('display', 'display', ['block', 'inline', 'flex', 'grid', 'none'])}

						{getCurrentStyle('display') === 'flex' && (
							<>
								{renderSelect('flex-direction', 'flexDirection', [
									'-',
									'row',
									'column',
									'row-reverse',
									'column-reverse',
								])}
								{renderSelect('justify-content', 'justifyContent', [
									'-',
									'flex-start',
									'center',
									'flex-end',
									'space-between',
									'space-around',
								])}
								{renderSelect('align-items', 'alignItems', [
									'-',
									'stretch',
									'center',
									'flex-start',
									'flex-end',
									'baseline',
								])}
								{renderInput('column-gap', 'columnGap')}
								{renderInput('row-gap', 'rowGap')}
							</>
						)}

						{getCurrentStyle('display') === 'grid' && (
							<>
								{renderInput('grid-template-columns', 'gridTemplateColumns')}
								{renderInput('grid-template-rows', 'gridTemplateRows')}
								{renderInput('gap', 'gap')}
								{renderSelect('justify-items', 'justifyItems', [
									'-',
									'start',
									'center',
									'end',
									'stretch',
								])}
								{renderSelect('align-items', 'alignItemsGrid', [
									'-',
									'start',
									'center',
									'end',
									'stretch',
								])}
							</>
						)}
						{renderInput('border', 'border')}
					</div>
				)}
			</div>
			
			{/* TYPOGRAPHY */}
			<div className="style-tab">
				<div className="style-tab-header" onClick={() => toggleTab('typography')}>
					Typography
				</div>
				{openTabs.typography && (
					<div className="style-tab-body">
						{renderSelect('font-family', 'fontFamily', ['-', 'Arial', 'Roboto', 'Georgia', 'Courier New'])}
						{renderSelect('font-weight', 'fontWeight', ['-', 'normal', 'bold', 'lighter', 'bolder'])}
						{renderInput('font-size', 'fontSize')}
						{renderInput('line-height', 'lineHeight')}
						{renderInput('letter-spacing', 'letterSpacing')}
						{renderSelect('text-decoration', 'textDecoration', ['-', 'none', 'underline', 'overline', 'line-through'])}
						{renderSelect('text-transform', 'textTransform', ['-', 'none', 'capitalize', 'uppercase', 'lowercase'])}
						{renderSelect('text-align', 'textAlign', ['-', 'left', 'center', 'right', 'justify'])}
						{renderSelect('list-style-type', 'listStyleType', [ '-', 'disc', 'circle', 'square', 'decimal', 'decimal-leading-zero', 'lower-roman', 'upper-roman', 'lower-alpha', 'upper-alpha', 'none' ])}
						<div className="style-row">
							<label>color</label>
							<input
								type="color"
								value={getCurrentStyle('color') || '#000000'}
								onChange={(e) => handleStyleChange('color', e.target.value)}
							/>
						</div>
					</div>
				)}
			</div>
			
			{/* BACKGROUND */}
			<div className="style-tab">
				<div className="style-tab-header" onClick={() => toggleTab('background')}>
					Background
				</div>
				{openTabs.background && (
					<div className="style-tab-body">
						{renderInput('background-image', 'backgroundImage')}
						{renderSelect('background-size', 'backgroundSize', ['-', 'auto', 'cover', 'contain'])}
						{renderSelect('background-position', 'backgroundPosition', [
							'-',
							'top left', 'top center', 'top right',
							'center left', 'center center', 'center right',
							'bottom left', 'bottom center', 'bottom right'
						])}
						{renderInput('background-position-x', 'backgroundPositionX')}
						{renderInput('background-position-y', 'backgroundPositionY')}
						{renderSelect('background-repeat', 'backgroundRepeat', ['-', 'repeat', 'no-repeat', 'repeat-x', 'repeat-y'])}

						<div className="style-row">
							<label>background-color</label>
							<input
								type="color"
								name="backgroundColor"
								value={getCurrentStyle('backgroundColor')}
								onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
							/>
						</div>
					</div>
				)}
			</div>

			{/* POSITION */}
			<div className="style-tab">
				<div className="style-tab-header" onClick={() => toggleTab('position')}>
					Position
				</div>
				{openTabs.position && (
					<div className="style-tab-body">
						<div className="wrap-rows">
							{renderSelect('', 'position', ['-', 'static', 'relative', 'absolute', 'fixed', 'sticky'])}
							{renderInput('', 'inset')}
						</div>
						<div className="spacing-group">
							{renderInput('top', 'top')}
							{renderInput('right', 'right')}
							{renderInput('bottom', 'bottom')}
							{renderInput('left', 'left')}
						</div>
					</div>
				)}
			</div>

			{/* OVERFLOW */}
			<div className="style-tab">
				<div className="style-tab-header" onClick={() => toggleTab('overflow')}>
					Overflow
				</div>
				{openTabs.overflow && (
					<div className="style-tab-body">
						{renderSelect('overflow', 'overflow', ['-', 'visible', 'hidden', 'scroll', 'auto', 'clip'])}
						{renderSelect('overflow-x', 'overflowX', ['-', 'visible', 'hidden', 'scroll', 'auto', 'clip'])}
						{renderSelect('overflow-y', 'overflowY', ['-', 'visible', 'hidden', 'scroll', 'auto', 'clip'])}
					</div>
				)}
			</div>
		</div>
	);
}