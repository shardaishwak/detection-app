import {
	Dimensions,
	Image,
	LogBox,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Link, router, useRouter } from "expo-router";

import { Camera, CameraType } from "expo-camera";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
const TensorCamera = cameraWithTensors(Camera);

const dimensions = Dimensions.get("window");

LogBox.ignoreAllLogs(true);

const { width, height } = Dimensions.get("window");

export default function App() {
	const router = useRouter();

	const Component = Camera;

	return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
	},
	camera: {
		flex: 1,
		width: "100%",
		height: "100%",
	},
	buttonText: {
		color: "#fff",
		fontSize: 13,
	},

	topContainer: {
		position: "absolute",
		width: "100%",
		height: "100%",
		zIndex: 10000,
	},
	camera_button: {
		width: 78,
		height: 78,
	},
});
