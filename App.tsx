import { LogBox } from "react-native";
import React from "react";
import Detector from "./app/detector";

LogBox.ignoreAllLogs(true);

export default function App() {
	return (
		<>
			<Detector />
		</>
	);
}
