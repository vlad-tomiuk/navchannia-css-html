import React from 'react'
import MainMenu from '@components/MainMenu';
import Emulator from '@components/Emulator';
import SelectedElementInfo from '@components/SelectedElementInfo';
import StyleEditorTabs from '@components/StyleEditorTabs';
import { useSelector } from 'react-redux';
import CodeOutput from '@components/CodeOutput';
import HtmlEditor from '@components/HtmlEditor';

export default function Home() {
	const menuActive = useSelector(state => state.general.menuActive);
	const buildCode = useSelector(state => state.general.buildCode);
	const activeEditor = useSelector(state => state.html.activeEditor);
	const activeBuildCodeType = Object.keys(buildCode).find(key => buildCode[key]);
	
	return (
		<div className="wrap-code">
			<div className="item view">
				<MainMenu />
				<Emulator />
				{activeEditor && <HtmlEditor />}
			</div>
			<div className="item code">
				{menuActive === 'builder' && (
					<div className="builder">
						<SelectedElementInfo />
						<StyleEditorTabs />
					</div>
				)}
				{menuActive === 'style' && (
					<div className="style">
						<div className="style-head">
							<div className="type">{activeBuildCodeType.toUpperCase()}</div>
						</div>
						<div className="style-content">
							<CodeOutput />
						</div>
					</div>
				)}
			</div>
		</div>
	)
}