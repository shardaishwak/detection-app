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

LogBox.ignoreAllLogs(true);

const Success = ({}) => {
	return (
		<View style={styles.container}>
			<Text style={{ fontSize: 30, fontWeight: "600" }}>Memory Matched!</Text>
			<Image
				source={require("../assets/success.png")}
				style={{ width: 164, height: 164, marginTop: 50, marginBottom: 77 }}
			/>
			<Text style={{ width: 216, marginBottom: 46, textAlign: "center" }}>
				Congratulation on successfully recreating the photo!
			</Text>
			<Pressable style={[styles.button]}>
				<Text style={styles.buttonText}>Save in album</Text>
			</Pressable>
			<Pressable style={[styles.button, { marginTop: 22 }]}>
				<Text style={styles.buttonText}>Share with friends</Text>
			</Pressable>
		</View>
	);
};

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
		fontWeight: "600",
		textAlign: "center",
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
		backgroundColor: "white",
		top: 20,
		left: 20,
	},
	polaroid: {
		width: 261,
		height: 218,
		zIndex: 20,
		position: "relative",
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

export default Success;
