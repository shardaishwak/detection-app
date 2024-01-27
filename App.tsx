import { Dimensions, LogBox, Platform, StyleSheet, Text } from "react-native";
import Canvas from "react-native-canvas";
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import React, { useEffect, useRef, useState } from "react";
import { requestCameraPermissions } from "./utils/CameraUtils";
import { HAND_CONNECTIONS } from "./utils/TfHandPoints";
import { FPS, RESIZE_HEIGHT, RESIZE_WIDTH } from "./utils/Constants";
import { loadModel } from "./utils/TensorFlowLoader";
import { Pose, PoseNet } from "@tensorflow-models/posenet";
import Detector from "./Detector";

const TensorCamera = cameraWithTensors(Camera);
const DetectionThreshold = 0.6;

LogBox.ignoreAllLogs(true);

const { width, height } = Dimensions.get("window");

export default function App() {
	return (<>
		<Detector />
	</>);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	camera: {
		width: "100%",
		height: "100%",
	},
	canvas: {
		position: "absolute",
		zIndex: 1000000,
		width: width, // Use the numeric value directly
		height: height, // Use the numeric value directly
	},
});
