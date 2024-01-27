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
import { Keypoint, Pose, PoseNet } from "@tensorflow-models/posenet";
import { GLView } from "expo-gl";
import Expo2DContext from "expo-2d-context";

const TensorCamera = cameraWithTensors(Camera);
const DetectionThreshold = 0.4;

LogBox.ignoreAllLogs(true);

const { width, height } = Dimensions.get("window");

export default function Detector() {
	const [model, setModel] = useState<PoseNet | null>(null);
	const [isModelReady, setIsModelReady] = useState(false);
	const [permissionsGranted, setPermissionsGranted] = useState(false);
	let firstPrediction = useRef<Pose>();
	let cleanPrediction = useRef<Pose>();
	let context = useRef<Expo2DContext>();

	useEffect(() => {
		// Separating camera permission request
		(async () => {
			await requestCameraPermissions(setPermissionsGranted);
			
		})();
	}, []);

	useEffect(() => {
		// Separating model loading
		if (permissionsGranted) {
			(async () => {
				await loadModel(setModel, setIsModelReady);
			})();
		}
	}, [permissionsGranted]);

	function cosineSimilarity(a: Pose, b: Pose) {
        // Filter out low confidence keypoints
        const aKeypoints = a.keypoints.filter((k: Keypoint) => k.score > DetectionThreshold);
        const bKeypoints = b.keypoints.filter((k: Keypoint) => k.score > DetectionThreshold);

        // Take the intersection of the poses
        const aLabels = aKeypoints.map((k: Keypoint) => k.part);
        const bLabels = bKeypoints.map((k: Keypoint) => k.part);
        const labels = aLabels.filter((label: string) => bLabels.includes(label));
		const clean = bKeypoints.filter((k: Keypoint) => labels.includes(k.part));
		cleanPrediction.current = {score: b.score, keypoints: clean}
        
        // Calculate the cosine similarity for each keypoint
        const similarities = labels.map((label: string) => {
            const aVector = aKeypoints.find((k: Keypoint) => k.part === label)!.position;
            const bVector = bKeypoints.find((k: Keypoint) => k.part === label)!.position;
            const dotProduct = aVector.x * bVector.x + aVector.y * bVector.y;
            const aMagnitude = Math.sqrt(aVector.x * aVector.x + aVector.y * aVector.y);
            const bMagnitude = Math.sqrt(bVector.x * bVector.x + bVector.y * bVector.y);
            const cosineSimilarity = dotProduct / (aMagnitude * bMagnitude);
            return cosineSimilarity;
        });

        // Average the similarities
        const similarity = similarities.reduce((a: number, b: number) => a + b, 0) / similarities.length;
        // console.log(similarity);
        // console.log(labels);
		// console.log("------");	

		return similarity;
	}

	function handleCameraStream(images: any) {
		const loop = async () => {
			const nextImageTensor = images.next().value;

			if (!model || !nextImageTensor) throw new Error("no model");

			model
				.estimateMultiplePoses(nextImageTensor)
				.then((predictions) => {
					if (predictions.length == 0) return;

					if (!firstPrediction.current) {
						console.log("first prediction set");
						firstPrediction.current = predictions[0];
					}
 
					cosineSimilarity(firstPrediction.current, predictions[0]!)
					mapPoints(predictions, nextImageTensor);
					tf.dispose(nextImageTensor);
				})
				.catch((err) => {
					console.log(err);
				});

			setTimeout(loop, 1000 / FPS);
		};
		loop();
	}

	// function drawKeypoints(keypoints: any[][], ctx: CanvasRenderingContext2D) {
	// 	keypoints.forEach((keypoint: any[]) => {
	// 		ctx.beginPath();
	// 		ctx.arc(keypoint[0], keypoint[1], 5, 0, 2 * Math.PI);
	// 		ctx.fillStyle = "red";
	// 		ctx.fill();
	// 	});
	// }

	// function drawConnections(
	// 	pairs: number[][][] | [any, any][],
	// 	ctx: CanvasRenderingContext2D
	// ) {
	// 	ctx.beginPath();
	// 	ctx.strokeStyle = "blue";
	// 	ctx.lineWidth = 2;
	// 	pairs.forEach(([start, end]) => {
	// 		ctx.moveTo(start[0], start[1]);
	// 		ctx.lineTo(end[0], end[1]);
	// 	});
	// 	ctx.stroke();
	// }

	function mapPoints(
		predictions: Pose[],
		nextImageTensor: any
	) {
		if (!context.current) {
			console.log("no context or canvas");
			return;
		}
		// console.log(cleanPrediction.current)

	
		const circle = (x: number, y: number, r: number) => {
			context.current?.beginPath();
			context.current?.arc(x, y, r, 0, 2 * Math.PI);
			context.current?.fill();
			context.current?.closePath();
		}
		context.current.clearRect(0, 0, 2000, 4000)


		context.current.fillStyle = "red";
		cleanPrediction.current?.keypoints.forEach((keypoint: Keypoint) => {
			const { x, y } = keypoint.position;
			circle(x, y, 5);
		});

		// circle(100, 100, 100);
	
		context.current.stroke();
		context.current.flush();

		// // Draw the keypoints and connections for each hand prediction
		// for (const prediction of predictions) {
		// 	const keypoints = prediction.landmarks.map((landmark) => {
		// 		const x = flipHorizontal
		// 			? canvas.current.width - landmark[0] * scaleWidth
		// 			: landmark[0] * scaleWidth;
		// 		const y = landmark[1] * scaleHeight;
		// 		return [x, y];
		// 	});

		// 	drawKeypoints(keypoints, context.current);
		// 	drawConnections(
		// 		HAND_CONNECTIONS.map(([startIdx, endIdx]) => [
		// 			keypoints[startIdx],
		// 			keypoints[endIdx],
		// 		]),
		// 		context.current
		// 	);
		// }
	}


	let textureDims: { height: any; width: any };
	Platform.OS === "ios"
		? (textureDims = { height: 1920, width: 1080 })
		: (textureDims = { height: 1200, width: 1600 });

	return isModelReady ? (
		<>
			<TensorCamera
				style={styles.camera}
				// Tensor related props
				type={Camera.Constants.Type.front}
				cameraTextureHeight={textureDims.height}
				cameraTextureWidth={textureDims.width}
				resizeHeight={RESIZE_HEIGHT}
				resizeWidth={RESIZE_WIDTH}
				resizeDepth={3}
				onReady={handleCameraStream}
				autorender={true}
				useCustomShadersToResize={false}
			/>

			<GLView
                style={styles.canvas}
                onContextCreate={(gl) => {
                    context.current = new Expo2DContext(gl, { scale: 1 });
					const w = context.current.width / textureDims.width;
					const h = context.current.height / textureDims.height;

					console.log(w, h)
					

					context.current.scale(4 + w, 4 + h - 1);
                }}
            />
		</>
	) : (
		<Text>Loading...</Text>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	camera: {
		width: width,
		height: width * (16/9),
	},
	canvas: {
		position: "absolute",
		zIndex: 1000000,
		width: width, // Use the numeric value directly
		height: height, // Use the numeric value directly
	},
});
