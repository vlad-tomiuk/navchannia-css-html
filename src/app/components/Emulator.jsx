import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setScreenWidth, setScreenHeight, setScreenScale, setSelectedTag, setSelectedId, setSelectedClassList } from '@store/general/generalSlice';

export default function Emulator({ childrenHTML, siteURL }) {
	// Redux
	const dispatch = useDispatch();
	const { screenWidth: initWidth, screenHeight: initHeight, screenScale: initScale, config } = useSelector(s => s.general);
	const htmlContent = useSelector(s => s.html.htmlCode);

	// React state
	const [viewportSize, setViewportSize] = useState({ width: initWidth, height: initHeight });
	const [viewportScale, setViewportScale] = useState(initScale);

	// DOM refs
	const wrapperRef = useRef(null);
	const iframeRef = useRef(null);
	const isDraggingRef = useRef(false);
	const dragTypeRef = useRef(null);

	// Memoized injected CSS for iframe
	const noScrollCSS = useMemo(() => `
		* { box-sizing: border-box }
		html { height: 100% }
		body {
			width: 100%;
			margin: 0;
			min-height: 100vh;
			overflow: auto;
			display: inline-block;
		}
		@media screen and (max-width: 1279px) {
			html, body {
				scrollbar-width: none;
				-ms-overflow-style: none;
			}
			html::-webkit-scrollbar,
			body::-webkit-scrollbar {
				width: 0;
				background: #fff0;
			}
		}
	`, []);

	// === USE EFFECTS: SIZE & SCALE ===
	useEffect(() => {
		setViewportSize({ width: initWidth, height: initHeight });
	}, [initWidth, initHeight]);

	useEffect(() => {
		setViewportScale(initScale);
	}, [initScale]);

	const updateViewportScale = useCallback((w = viewportSize.width) => {
		if (!wrapperRef.current) return;
		const parentWidth = wrapperRef.current.parentElement.offsetWidth;
		const newScale = parentWidth < w ? parentWidth / w : 1;
		setViewportScale(newScale);
		dispatch(setScreenScale(newScale));
	}, [dispatch, viewportSize.width]);

	useEffect(() => {
		updateViewportScale();
	}, [viewportSize.width, viewportSize.height, updateViewportScale]);

	useEffect(() => {
		window.addEventListener('resize', updateViewportScale);
		return () => window.removeEventListener('resize', updateViewportScale);
	}, [updateViewportScale]);

	// === RESIZE EVENTS ===
	const startResize = (e, type) => {
		isDraggingRef.current = true;
		dragTypeRef.current = type;
		e.preventDefault();
	};

	const stopResize = useCallback(() => {
		if (!isDraggingRef.current) return;
		if (dragTypeRef.current === 'width') dispatch(setScreenWidth(viewportSize.width));
		if (dragTypeRef.current === 'height') dispatch(setScreenHeight(viewportSize.height));
		isDraggingRef.current = false;
		dragTypeRef.current = null;
	}, [dispatch, viewportSize.width, viewportSize.height]);

	const onMouseMove = useCallback((e) => {
		if (!isDraggingRef.current || !wrapperRef.current) return;
		const rect = wrapperRef.current.getBoundingClientRect();
		const newSize = { ...viewportSize };
		if (dragTypeRef.current === 'width') newSize.width = Math.max(280, e.clientX - rect.left);
		if (dragTypeRef.current === 'height') newSize.height = Math.max(200, e.clientY - rect.top);
		setViewportSize(newSize);
	}, [viewportSize]);

	useEffect(() => {
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', stopResize);
		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', stopResize);
		};
	}, [onMouseMove, stopResize]);

	// === IFRAME INTERACTION ===
	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe || siteURL) return;

		let cleanupFns = [];

		const setup = () => {
			const doc = iframe.contentDocument || iframe.contentWindow.document;
			if (!doc || !doc.body) return;

			let selectedElement = null;

			const saveSelected = (el) => {
				if (!el) return;

				dispatch(setSelectedTag({ tagName: el.tagName.toLowerCase(), use: false }));
				dispatch(el.id
					? setSelectedId({ idName: el.id, use: false })
					: setSelectedId({})
				);

				if (el.classList.length) {
					const classList = Array.from(el.classList).map(cls => ({
						className: cls,
						use: false
					}));
					dispatch(setSelectedClassList(classList));
				} else {
					dispatch(setSelectedClassList([]));
				}
			};

			const handleClick = (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (selectedElement) selectedElement.style.outline = '';
				selectedElement = e.target;
				selectedElement.style.outline = '2px dashed red';
				saveSelected(selectedElement);
			};

			const handleContextMenu = (e) => {
				e.preventDefault();
				if (selectedElement) {
					selectedElement.style.outline = '';
					selectedElement = null;
				}
			};

			doc.body.addEventListener('click', handleClick);
			doc.body.addEventListener('contextmenu', handleContextMenu);

			const observer = new MutationObserver(() => {
				doc.body.removeEventListener('click', handleClick);
				doc.body.removeEventListener('contextmenu', handleContextMenu);
				doc.body.addEventListener('click', handleClick);
				doc.body.addEventListener('contextmenu', handleContextMenu);
			});
			observer.observe(doc.body, { childList: true, subtree: true });

			cleanupFns.push(() => {
				doc.body.removeEventListener('click', handleClick);
				doc.body.removeEventListener('contextmenu', handleContextMenu);
				observer.disconnect();
			});
		};

		const timeoutId = setTimeout(() => {
			try {
				setup();
			} catch (e) {
				// Silent fail
			}
		}, 50);

		return () => {
			clearTimeout(timeoutId);
			cleanupFns.forEach(fn => fn());
			cleanupFns = [];
		};
	}, [iframeRef, siteURL, childrenHTML, dispatch]);

	// === STYLE INJECTION ===
	const applyEmulatedStyles = (iframe, config, disableScrollCSS = '') => {
		if (!iframe) return;

		const doc = iframe.contentDocument || iframe.contentWindow.document;
		if (!doc?.head) return;

		doc.head.querySelector('style[data-emulator]')?.remove();

		const sortedConfig = [...config].sort((a, b) => a.width - b.width);
		const selectorBaseMap = {};

		for (const conf of sortedConfig) {
			if (!conf.styles) continue;
			for (const selector of Object.keys(conf.styles)) {
				if (!(selector in selectorBaseMap)) {
					selectorBaseMap[selector] = conf.width;
				}
			}
		}

		let css = disableScrollCSS;

		for (const conf of sortedConfig) {
			if (!conf.styles) continue;

			let block = '';
			for (const [selector, rules] of Object.entries(conf.styles)) {
				const filtered = Object.entries(rules).filter(([_, val]) => val !== '-' && val !== '');
				if (!filtered.length) continue;

				const props = filtered
					.map(([prop, val]) => `${prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${val};`)
					.join('');

				if (selectorBaseMap[selector] === conf.width) {
					css += `${selector}{${props}}`;
				} else {
					block += `${selector}{${props}}`;
				}
			}

			if (block) {
				css += `@media screen and (min-width: ${conf.width}px){${block}}`;
			}
		}

		const styleEl = doc.createElement('style');
		styleEl.setAttribute('data-emulator', 'true');
		styleEl.innerHTML = css;
		doc.head.appendChild(styleEl);
	};

	useEffect(() => {
		if (siteURL) return;
		const iframe = iframeRef.current;
		applyEmulatedStyles(iframe, config, noScrollCSS);
	}, [config, siteURL, htmlContent, noScrollCSS]);

	const handleIframeLoad = () => {
		if (siteURL) return;
		applyEmulatedStyles(iframeRef.current, config, noScrollCSS);
	};

	return (
		<div className="emulator">
			<div
				className="emulator-wrapper"
				style={{
					transform: `scale(${viewportScale})`,
					width: `${viewportSize.width}px`,
					height: `${viewportSize.height}px`,
				}}
			>
				<iframe
					title="preview"
					ref={iframeRef}
					srcDoc={htmlContent}
					onLoad={handleIframeLoad}
				/>
				<div className="resize-width" onMouseDown={(e) => startResize(e, 'width')} />
				<div className="resize-height" onMouseDown={(e) => startResize(e, 'height')} />
			</div>
		</div>
	);
}