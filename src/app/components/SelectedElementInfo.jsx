import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSelectedClassUse, setSelectedId, setSelectedTag } from '@store/general/generalSlice';

export default function SelectedElementInfo() {
	const dispatch = useDispatch();
	const selected = useSelector((state) => state.general.selected);

	if (!selected) return null;

	const hasTag = selected.tag?.tagName && selected.tag.tagName !== 'none';
	const hasId = selected.id?.idName && selected.id.idName !== 'none';
	const hasClasses = Array.isArray(selected.class) && selected.class.length > 0 && selected.class.some(c => c.className && c.className !== 'none');

	if (!hasTag && !hasId && !hasClasses) return null;

	const toggleTagUse = () => {
		dispatch(setSelectedTag({
			tagName: selected.tag.tagName,
			use: !selected.tag.use
		}));
	};

	const toggleIdUse = () => {
		dispatch(setSelectedId({
			idName: selected.id.idName,
			use: !selected.id.use
		}));
	};

	const toggleClassUse = (className) => {
		dispatch(updateSelectedClassUse({
			className,
			use: !selected.class.find(c => c.className === className)?.use
		}));
	};

	return (
		<div className="selector-wrap">
			{/* Tag */}
			{hasTag && (
				<div
					className={`selector ${selected.tag.use ? 'active' : ''}`}
					onClick={toggleTagUse}
				>
					{selected.tag.tagName}
				</div>
			)}

			{/* ID */}
			{hasId && (
				<div
					className={`selector ${selected.id.use ? 'active' : ''}`}
					onClick={toggleIdUse}
				>
					#{selected.id.idName}
				</div>
			)}

			{/* Class list */}
			{hasClasses && selected.class.map((cls, idx) => (
				cls.className && cls.className !== 'none' && (
					<div
						key={idx}
						className={`selector ${cls.use ? 'active' : ''}`}
						onClick={() => toggleClassUse(cls.className)}
					>
						.{cls.className}
					</div>
				)
			))}
		</div>
	);
}