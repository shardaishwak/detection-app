import {
	Animated,
	Dimensions,
	Image,
	LogBox,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { Link, router, useRouter } from "expo-router";

import { Camera, CameraType } from "expo-camera";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
const TensorCamera = cameraWithTensors(Camera);

const dimensions = Dimensions.get("window");
import * as ImagePicker from "expo-image-picker";

LogBox.ignoreAllLogs(true);

const { width, height } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PolaroidEffect = ({ imageUri }) => {
	const marginTop = useRef(new Animated.Value(-150 * 1.2)).current;
	const width = useRef(new Animated.Value(100 * 1.2)).current;
	const height = useRef(new Animated.Value(150 * 1.2)).current;
	const fadeOut = useRef(new Animated.Value(1)).current;
	const fadeIn = useRef(new Animated.Value(0)).current;

	const widthImage = useRef(new Animated.Value(80 * 1.2)).current;
	const heightImage = useRef(new Animated.Value(100 * 1.2)).current;
	const animateMarginTop = () => {
		Animated.timing(marginTop, {
			toValue: -50, // Final value of margin top
			duration: 1000, // Duration of the animation
			useNativeDriver: false, // Set to true if possible for better performance
		}).start();
	};
	const animateMarginTopBack = () => {
		Animated.timing(marginTop, {
			toValue: -150 * 1.2, // Final value of margin top
			duration: 1000, // Duration of the animation
			useNativeDriver: false, // Set to true if possible for better performance
		}).start();
	};
	const animateScale = () => {
		Animated.timing(width, {
			toValue: 100 * 2.4, // Final value of margin top
			duration: 1000, // Duration of the animation
			useNativeDriver: false, // Set to true if possible for better performance
		}).start();
		Animated.timing(height, {
			toValue: 150 * 2.4, // Final value of margin top
			duration: 1000, // Duration of the animation
			useNativeDriver: false, // Set to true if possible for better performance
		}).start();

		Animated.timing(widthImage, {
			toValue: 82.5 * 2.4, // Final value of margin top
			duration: 1000, // Duration of the animation
			useNativeDriver: false, // Set to true if possible for better performance
		}).start();
		Animated.timing(heightImage, {
			toValue: 110 * 2.4, // Final value of margin top
			duration: 1000, // Duration of the animation
			useNativeDriver: false, // Set to true if possible for better performance
		}).start();
	};

	const animateFadeOut = () => {
		Animated.timing(fadeOut, {
			toValue: 0, // Final value of margin top
			duration: 200, // Duration of the animation
			useNativeDriver: false, // Set to true if possible for better performance
		}).start();
	};

	const animateFadeIn = () => {
		Animated.timing(fadeIn, {
			toValue: 1, // Final value of margin top
			duration: 200, // Duration of the animation
			useNativeDriver: false, // Set to true if possible for better performance
		}).start();
	};

	useEffect(() => {
		animateMarginTop();
		setTimeout(() => {
			animateMarginTopBack();
		}, 2000);
		setTimeout(() => {
			animateFadeIn();
			animateFadeOut();
			animateScale();
		}, 3000);
	}, []);
	return (
		<>
			<Animated.Text
				style={{ fontSize: 30, fontWeight: "600", opacity: fadeIn }}
			>
				Memory Matched!
			</Animated.Text>
			<Animated.Image
				source={require("../assets/polaroid.png")}
				style={[styles.polaroid, { opacity: fadeOut }]}
			/>
			<Animated.View
				style={{
					padding: 20,
					backgroundColor: "white",
					width,
					height,
					marginTop,
					alignItems: "center",
					shadowRadius: 10,
					shadowColor: "black",
					shadowOffset: { height: 10 },
					shadowOpacity: 0.2,
				}}
			>
				<Animated.Image
					style={{ width: widthImage, height: heightImage }}
					source={{ uri: imageUri }}
				/>
			</Animated.View>

			<Animated.Text
				style={{
					width: 250,
					marginBottom: 46,
					textAlign: "center",
					opacity: fadeIn,
					marginTop: 28,
					fontSize: 15,
					fontWeight: "600",
				}}
			>
				Congratulation on successfully recreating the photo!
			</Animated.Text>
			<AnimatedPressable style={[styles.button, { opacity: fadeIn }]}>
				<Text style={styles.buttonText}>Save in album</Text>
			</AnimatedPressable>
			<AnimatedPressable
				style={[styles.button, { marginTop: 22, opacity: fadeIn }]}
			>
				<Text style={styles.buttonText}>Share with friends</Text>
			</AnimatedPressable>
		</>
	);
};

export default function App() {
	const camera = useRef();
	const [imageUri, setImageUri] = useState(null);
	const [chosenImage, setChosenImage] = useState(null);

	const router = useRouter();

	const [cameraPermission, setCameraPermission] = useState(false);
	const [galleryPermission, setGalleryPermission] = useState(false);

	const [type, setType] = useState(CameraType.front);

	const permisionFunction = async () => {
		// here is how you can get the camera permission
		const cameraPermission = await Camera.requestCameraPermissionsAsync();

		setCameraPermission(cameraPermission.status === "granted");

		const imagePermission = await ImagePicker.getMediaLibraryPermissionsAsync();
		console.log(imagePermission.status);

		setGalleryPermission(imagePermission.status === "granted");

		if (
			imagePermission.status !== "granted" &&
			cameraPermission.status !== "granted"
		) {
			alert("Permission for media access needed.");
		}
	};

	useEffect(() => {
		permisionFunction();
	}, []);

	const takePicture = async () => {
		if (camera.current) {
			const data = await camera.current.takePictureAsync(null);
			console.log(data.uri);
			setImageUri(data.uri);
		}
	};

	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		console.log(result);

		if (!result.canceled) {
			setChosenImage(result.assets[0].uri);
		}
	};

	useEffect(() => {
		if (!chosenImage) {
			pickImage();
		}
	}, [chosenImage]);

	const Component = Camera;

	return (
		<View style={styles.container}>
			{!imageUri && (
				<>
					<Component
						ref={camera}
						autorender
						cameraTextureHeight={dimensions.height}
						cameraTextureWidth={dimensions.width}
						onReady={() => {}}
						resizeDepth={3}
						resizeHeight={50}
						resizeWidth={50}
						useCustomShadersToResize
						style={styles.camera}
						type={type}
					></Component>
					<View style={styles.topContainer}>
						<Pressable
							onPress={!chosenImage ? pickImage : takePicture}
							style={{
								width: 78,
								height: 78,
								position: "absolute",
								left: (dimensions.width - 78) / 2,
								bottom: 36,
							}}
						>
							<Image
								source={require("../assets/camera-button.png")}
								style={styles.camera_button}
							/>
						</Pressable>
						{(chosenImage && (
							<Image
								source={{ uri: chosenImage }}
								style={styles.imageContainer}
							></Image>
						)) || (
							<View style={styles.imageContainer}>
								<Text style={{ color: "white", textAlign: "center" }}>
									No image selected
								</Text>
							</View>
						)}
						<Pressable onPress={pickImage}>
							<Image
								style={{
									position: "absolute",
									width: 24,
									height: 24,
									left: 20,
									top: 20,
								}}
								source={require("../assets/arrow-left.png")}
							/>
						</Pressable>
						{imageUri && <Link href={"/picture"}>Continue</Link>}
					</View>
				</>
			)}
			{imageUri && <PolaroidEffect imageUri={imageUri} />}
		</View>
	);
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
	imageContainer: {
		width: 100 * 1.2,
		height: 150 * 1.2,
		borderRadius: 8,
		position: "absolute",
		backgroundColor: "#ffffff30",
		top: 68,
		left: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	polaroid: {
		width: 261,
		height: 218,
		zIndex: 20,
		position: "relative",

		shadowRadius: 10,
	},
	button: {
		width: 314,
		paddingVertical: 9,
		textAlign: "center",
		borderRadius: 10,
		backgroundColor: "#5001F9",
		alignItems: "center",
		justifyContent: "center",
		color: "white",
	},
});
