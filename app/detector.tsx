import {
	Dimensions,
	LogBox,
	Platform,
	StyleSheet,
	Image,
	Text,
	View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors, decodeJpeg } from "@tensorflow/tfjs-react-native";
import React, {
	Ref,
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { requestCameraPermissions } from "../utils/CameraUtils";
import { FPS, RESIZE_HEIGHT, RESIZE_WIDTH } from "../utils/Constants";
import { loadModel } from "../utils/TensorFlowLoader";
import { Keypoint, Pose, PoseNet } from "@tensorflow-models/posenet";
import { GLView } from "expo-gl";
import Expo2DContext from "expo-2d-context";
import { apiSetupBackground, genOverlayURI, skeletonMap } from "./connections";
import { PosenetInput } from "@tensorflow-models/posenet/dist/types";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";

const TensorCamera = cameraWithTensors(Camera);
const DetectionThreshold = 0.32;

LogBox.ignoreAllLogs(true);

const { width, height } = Dimensions.get("window");

interface DetectorProps {
	imageUri: string | null;
	similarityScoreRef: Ref<number | null>;
	id: string;
}

const Detector = forwardRef((props: DetectorProps, ref) => {
	const [model, setModel] = useState<PoseNet | null>(null);
	const [isModelReady, setIsModelReady] = useState(false);
	const [permissionsGranted, setPermissionsGranted] = useState(false);
	let firstPrediction = useRef<Pose>();
	let counter = useRef<number>(0);
	let context = useRef<Expo2DContext>();

	const [score, setScore] = useState<number>(0);

	let textureDims: { height: any; width: any };
	Platform.OS === "ios"
		? (textureDims = { height: 1920, width: 1080 })
		: (textureDims = { height: 1200, width: 1600 });

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

	useEffect(() => {
		// Separating camera stream
		if (isModelReady) {
			(async () => {
				console.log("STARTING");
				const imageUri = props.imageUri;

				if (!imageUri) return;

				try {
					/**
					 * This file contains the implementation of the detector component.
					 * The detector component is responsible for detecting objects in an image.
					 */
					const image = await manipulateAsync(
						imageUri,
						[{ resize: { height: 500 } }],
						{ base64: true, compress: 0.4, format: SaveFormat.JPEG }
					);
					if (!image.base64) return;
					const b = Buffer.from(image.base64!, "base64");
					const imgBuffer = new Uint8Array(b);
					const imageTensor = decodeJpeg(imgBuffer);
					const data = await model?.estimateSinglePose(imageTensor);
					firstPrediction.current = data!;
					tf.dispose(imageTensor);
				} catch (error) {
					console.log(error);
				}
			})();
		}
	}, [props.imageUri]);

	const onCanvasCreate = useCallback(
		(gl) => {
			context.current = new Expo2DContext(gl, { scale: 1 });
			const w = context.current.width / textureDims.width;
			const h = context.current.height / textureDims.height;
			context.current.fillStyle = "red";
			context.current.strokeStyle = "blue";
			context.current.scale(4 + w, 4 + h - 1);
		},
		[textureDims.width, textureDims.height]
	); // dependencies

	function cosineSimilarity(a: Pose, b: Pose) {
		// Filter out low confidence keypoints
		const aKeypoints = a.keypoints.filter(
			(k: Keypoint) => k.score > DetectionThreshold
		);
		const bKeypoints = b.keypoints.filter(
			(k: Keypoint) => k.score > DetectionThreshold
		);

		// Take the intersection of the poses
		const aLabels = aKeypoints.map((k: Keypoint) => k.part);
		const bLabels = bKeypoints.map((k: Keypoint) => k.part);

		// Calculate the cosine similarity for each keypoint
		// Take the intersection of the poses and calculate the cosine similarity for each keypoint
		const similarities = aKeypoints
			.filter((k: Keypoint) =>
				bKeypoints.some((bk: Keypoint) => bk.part === k.part)
			)
			.map((k: Keypoint) => {
				const aVector = k.position;
				const bVector = bKeypoints.find(
					(bk: Keypoint) => bk.part === k.part
				)!.position;
				const dotProduct = aVector.x * bVector.x + aVector.y * bVector.y;
				const aMagnitude = Math.sqrt(
					aVector.x * aVector.x + aVector.y * aVector.y
				);
				const bMagnitude = Math.sqrt(
					bVector.x * bVector.x + bVector.y * bVector.y
				);
				const cosineSimilarity = dotProduct / (aMagnitude * bMagnitude);
				return cosineSimilarity;
			});

		// Average the similarities
		const similarity =
			similarities.reduce((a: number, b: number) => a + b, 0) /
			aKeypoints.length;

		// console.log(similarity)

		return {
			score: similarity,
			cleaned: { score: b.score, keypoints: bKeypoints },
		};
	}

	async function passBackData() {}

	function handleCameraStream(images: any) {
		const loop = async () => {
			const nextImageTensor = images.next().value;

			if (!model || !nextImageTensor) throw new Error("no model");

			model
				.estimateMultiplePoses(nextImageTensor)
				.then((predictions) => {
					counter.current += 1;
					if (predictions.length == 0 || !firstPrediction.current) return;

					const { score, cleaned } = cosineSimilarity(
						firstPrediction.current,
						predictions[0]!
					);
					console.log(score);
					setScore(score);
					// console.log(firstPrediction.current.keypoints);
					mapPoints(cleaned, nextImageTensor);
					tf.dispose(nextImageTensor);
				})
				.catch((err) => {
					console.log(err);
				});

			setTimeout(loop, 1000 / FPS);
		};
		loop();
	}

	function mapPoints(cleaned: Pose, nextImageTensor: tf.Tensor3D) {
		if (!context.current) {
			console.log("no context or canvas");
			return;
		}

		const circle = (x: number, y: number, r: number) => {
			context.current?.beginPath();
			context.current?.arc(x, y, r, 0, 2 * Math.PI);
			context.current?.fill();
			context.current?.closePath();
		};
		context.current.clearRect(0, 0, 2000, 4000);

		cleaned.keypoints.forEach((keypoint: Keypoint) => {
			const { x, y } = keypoint.position;
			circle(x, y, 5);
		});

		cleaned.keypoints.forEach((keypoint: Keypoint) => {
			try {
				if (!skeletonMap.has(keypoint.part)) return;
				const { x: x1, y: y1 } = keypoint["position"];
				skeletonMap.get(keypoint.part)?.forEach((part: string) => {
					const matchingKeypoint = cleaned.keypoints.find(
						(k: Keypoint) => k.part === part
					);
					if (!matchingKeypoint) return;
					const { x: x2, y: y2 } = matchingKeypoint.position;
					if (context.current && x2 && y2) {
						context.current.beginPath();
						context.current.moveTo(x1, y1);
						context.current.lineTo(x2, y2);
						context.current.stroke();
					}
				});
			} catch (error) {
				console.log(error);
			}
		});
		context.current.stroke();
		context.current.flush();
	}

	return isModelReady ? (
		<View style={styles.container}>
			<TensorCamera
				ref={ref}
				style={[styles.camera]}
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
				style={[
					styles.canvas,
					{
						borderWidth: 10,
						borderColor:
							score < 0.7 ? "red" : score < 0.95 ? "yellow" : "green",
						borderStyle: "solid",
						borderRadius: 40,
					},
				]}
				onContextCreate={onCanvasCreate}
			/>
			<Text
				style={{
					position: "absolute",
					top: 100,
					right: 20,
					zIndex: 999,
				}}
			>
				{score}
			</Text>
		</View>
	) : (
		<Text>Loading...</Text>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		height: "100%",
		width: "100%",
		backgroundColor: "black",
	},
	camera: {
		width: width,
		height: width * (16 / 9),
	},
	overlay: {
		position: "absolute",
		width: width,
		height: width * (16 / 9),
		zIndex: 900,
	},
	canvas: {
		position: "absolute",
		zIndex: 1000,
		width: width, // Use the numeric value directly
		height: height, // Use the numeric value directly
	},
});

export default Detector;
