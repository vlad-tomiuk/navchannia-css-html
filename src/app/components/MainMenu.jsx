import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setScreenWidth, setScreenHeight, setScreenScale, setActiveMenuBuilder, setActiveMenuStyle, resetBuildCode, setBuildCode} from '@store/general/generalSlice';
import { setActiveEditor, toggleActiveEditor } from '@store/general/htmlSlice';

const sizes = [
	{ width: 360, height: 720 },
	{ width: 768, height: 1024 },
	{ width: 1280, height: 800 },
	{ width: 1920, height: 1080 },
	{ width: 2560, height: 1440 },
	{ width: 3840, height: 2160 }
];

const getAvailableScales = (containerWidth, targetWidth) => {
	const baseScale = containerWidth < targetWidth ? containerWidth / targetWidth : 1;
	const canUpscale = targetWidth <= 768;

	const percentSteps = canUpscale
		? [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
		: [0.25, 0.5, 0.75, 1];

	return percentSteps
		.map(p => ({ label: `${Math.round(p * 100)}%`, scale: +(baseScale * p).toFixed(3) }))
		.filter(s => canUpscale || s.scale <= 1);
};

export default function MainMenu() {
	const dispatch = useDispatch();
	const currentWidth = useSelector((state) => state.general.screenWidth);
	const currentHeight = useSelector((state) => state.general.screenHeight);
	const buildCode = useSelector(state => state.general.buildCode);
	const activeEditor = useSelector(state => state.html.activeEditor);
	const [customWidth, setCustomWidth] = useState(currentWidth);
	const [customHeight, setCustomHeight] = useState(currentHeight);
	const [availableScales, setAvailableScales] = useState([]);
	const [selectedScale, setSelectedScale] = useState(1);

	// Автоматичне оновлення скейлів і ресету до 100% при зміні ширини/висоти з будь-якого місця
	useEffect(() => {
		setCustomWidth(currentWidth);
		setCustomHeight(currentHeight);

		const parent = document.querySelector('.emulator-wrapper')?.parentElement;
		if (parent) {
			const containerWidth = parent.offsetWidth;
			const newScales = getAvailableScales(containerWidth, currentWidth);
			const defaultScale = newScales.find(s => s.label === '100%')?.scale || 1;
			setAvailableScales(newScales);
			setSelectedScale(defaultScale);
			dispatch(setScreenScale(defaultScale));
		}
	}, [currentWidth, currentHeight, dispatch]);

	const handleWidthChange = (e) => {
		const val = parseInt(e.target.value, 10);
		setCustomWidth(e.target.value);
		if (!isNaN(val)) {
			dispatch(setScreenWidth(val));
		}
	};

	const handleHeightChange = (e) => {
		const val = parseInt(e.target.value, 10);
		setCustomHeight(e.target.value);
		if (!isNaN(val)) {
			dispatch(setScreenHeight(val));
		}
	};

	const handleClick = ({ width, height }) => {
		dispatch(setScreenWidth(width));
		dispatch(setScreenHeight(height));
	};

	const handleScaleChange = (e) => {
		const val = parseFloat(e.target.value);
		if (!isNaN(val)) {
			dispatch(setScreenScale(val));
			setSelectedScale(val);
		}
	};

	const isCustom = !sizes.some(s => s.width === currentWidth && s.height === currentHeight);

	return (
		<div className="btn-main-menu">
			<div className="wrap-btn">
				<div className={`btn-size ${isCustom ? 'active' : ''}`}>
					<input
						type="number"
						min="280"
						step="10"
						value={customWidth}
						onChange={handleWidthChange}
						name="custom-width"
						placeholder="Width"
					/>
				</div>
				<span>x</span>
				<div className="btn-size">
					<input
						type="number"
						min="200"
						step="10"
						value={customHeight}
						onChange={handleHeightChange}
						name="custom-height"
						placeholder="Height"
					/>
				</div>

				<select className="selector-size" value={selectedScale} onChange={handleScaleChange}>
					{availableScales.map(({ label, scale }) => (
						<option key={scale} value={scale}>{label}</option>
					))}
				</select>
				<span>-</span>

				{sizes.map((size) => (
					<div
						key={`${size.width}x${size.height}`}
						onClick={() => handleClick(size)}
						className={`btn-size ${
							currentWidth === size.width && currentHeight === size.height ? 'active' : ''
						}`}
					>
						{size.width}
					</div>
				))}

				<span>-</span>
				<div className={`btn-size ${activeEditor ? 'active' : ''}`} onClick={() => dispatch(toggleActiveEditor())} >HTML</div>
				{Object.keys(buildCode).map((type) => (
					<div
						key={type}
						className={`btn-size ${buildCode[type] ? 'active' : ''}`}
						onClick={() => {
							if (buildCode[type]) {
								dispatch(setActiveMenuBuilder());
								dispatch(resetBuildCode());
							} else {
								dispatch(setBuildCode(type));
								dispatch(setActiveMenuStyle());
							}
						}}
					>
						{type.toUpperCase()}
					</div>
				))}
			</div>
		</div>
	);
}