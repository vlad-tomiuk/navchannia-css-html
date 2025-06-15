import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@pages/Home';

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" index element={<Home />} />
			</Routes>
		</Router>
	);
}