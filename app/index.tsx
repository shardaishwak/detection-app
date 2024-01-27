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
	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.text1}>Welcome to</Text>
			<Text style={styles.text2}>Memory Match</Text>
			<Image
				source={require("../assets/camera-image.png")}
				style={styles.image}
			/>
			<Text style={styles.text3}>Want to recreate your photos?</Text>
			<Link href={"/camera"}>
				<Pressable style={styles.button}>
					<Text style={styles.buttonText}>Let's recreate!</Text>
				</Pressable>
			</Link>
		</SafeAreaView>
	);
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
