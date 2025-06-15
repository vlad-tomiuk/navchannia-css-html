import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { emmetHTML } from 'emmet-monaco-es';
import { useDispatch, useSelector } from 'react-redux';
import { setHtmlCode } from '@store/general/htmlSlice';

export default function HtmlEditor() {
	const editorRef = useRef(null);
	const dispatch = useDispatch();
	const htmlCode = useSelector((state) => state.html.htmlCode);

	const handleEditorDidMount = (editor, monaco) => {
		editorRef.current = editor;
		emmetHTML(monaco);
	};

	const handleChange = (val) => {
		dispatch(setHtmlCode(val || ''));
	};

	return (
		<div className="code-editor">
			<Editor
				height="100%"
				defaultLanguage="html"
				defaultValue={htmlCode}
				value={htmlCode}
				onMount={handleEditorDidMount}
				onChange={handleChange}
				theme="vs-dark"
				options={{
					fontSize: 14,
					wordWrap: 'on',
					minimap: { enabled: false },
					formatOnType: true,
					formatOnPaste: true,
					snippetSuggestions: 'top',
					acceptSuggestionOnEnter: 'on',
					tabCompletion: 'on',
				}}
			/>
		</div>
	);
}