import React, { useMemo, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { optimizeCSS } from '@hooks/optimizeCSS';

const camelToKebab = (str) =>
	str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const sortSelectors = (selectors) => {
	const getPriority = (sel) => {
		if (sel === 'html' || sel === 'body') return 0;
		if (/^[a-z]+$/.test(sel)) return 1;
		if (sel.startsWith('.')) return 2;
		if (sel.startsWith('#')) return 3;
		return 4;
	};

	return selectors.sort((a, b) => getPriority(a) - getPriority(b));
};

const formatCSSBlock = (selector, rules, indent = '  ') => {
	const optimized = optimizeCSS(rules);
	const filtered = Object.entries(optimized).filter(
		([_, val]) => val !== '-' && val !== ''
	);
	if (!filtered.length) return '';
	const lines = filtered.map(
		([prop, val]) => `${indent}${camelToKebab(prop)}: ${val};`
	);
	return `${selector} {\n${lines.join('\n')}\n}\n`;
};

const CodeOutput = forwardRef((_, ref) => {
	const config = useSelector((state) => state.general.config);
	const [copied, setCopied] = useState(false);

	const code = useMemo(() => {
		if (!config) return '';

		const sortedConfig = [...config].sort((a, b) => a.width - b.width);
		const selectorBaseMap = {};

		sortedConfig.forEach((conf) => {
			if (!conf.styles) return;
			Object.keys(conf.styles).forEach((selector) => {
				if (!(selector in selectorBaseMap)) {
					selectorBaseMap[selector] = conf.width;
				}
			});
		});

		let output = '';

		sortedConfig.forEach((conf) => {
			if (!conf.styles) return;

			let mediaBlock = '';
			const selectors = sortSelectors(Object.keys(conf.styles));

			selectors.forEach((selector) => {
				const rules = conf.styles[selector];
				const block = formatCSSBlock(selector, rules);
				if (!block) return;

				if (selectorBaseMap[selector] === conf.width) {
					output += block;
				} else {
					mediaBlock += block;
				}
			});

			if (mediaBlock) {
				output += `@media screen and (min-width: ${conf.width}px) {\n${mediaBlock}}\n`;
			}
		});

		return output;
	}, [config]);

	useImperativeHandle(ref, () => ({
		getCode: () => code,
	}));

	const handleCopy = useCallback(() => {
		if (!code) return;
		navigator.clipboard.writeText(code).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}, [code]);

	return (
		<>
			<div className="btn-copy" onClick={handleCopy}>
				{copied ? 'copied' : 'copy'}
			</div>
			<SyntaxHighlighter language="css" style={oneDark} wrapLongLines wrapLines showLineNumbers >
				{code || '/* Нічого не вибрано */'}
			</SyntaxHighlighter>
		</>
	);
});

export default CodeOutput;