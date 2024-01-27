import { LogBox } from "react-native";
import React from "react";
import Detector from "./Detector";

LogBox.ignoreAllLogs(true);

export default function App() {


	return (<>
		<Detector />
	</>);
}

