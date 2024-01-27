import {
	Dimensions,
	Image,
	LogBox,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
} from "react-native";
import React from "react";
import { Link } from "expo-router";

LogBox.ignoreAllLogs(true);

const { width, height } = Dimensions.get("window");

export default function App() {
	return <SafeAreaView style={styles.container}></SafeAreaView>;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
	},
	text1: {
		fontSize: 18,
		marginBottom: 12,
	},
	text2: {
		fontSize: 30,
		fontWeight: "600",
	},
	image: {
		marginTop: 96,
		width: 103,
		height: 75,
		marginBottom: 143,
	},
	text3: {
		fontSize: 15,
		fontWeight: "600",
		marginBottom: 43,
	},
	button: {
		width: 314,
		paddingVertical: 9,
		textAlign: "center",
		borderRadius: 10,
		backgroundColor: "#5001F9",
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 13,
	},
});
