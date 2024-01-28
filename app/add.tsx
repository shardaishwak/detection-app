import {
	Alert,
	Dimensions,
	FlatList,
	Image,
	LogBox,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
LogBox.ignoreAllLogs(true);
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilState } from "recoil";
import { imageURIState } from "../recoilState";

const { width, height } = Dimensions.get("window");

const Album = () => {
	const [location, setLocation] = useState<Location.LocationObject>(null);
	const [errorMsg, setErrorMsg] = useState("");

	const router = useRouter();

	const [albums, setAlbums] = useState([]);

	const [selected, setSelected] = useState("");

	// get imageURI from recoil
	const [imageURI, _] = useRecoilState(imageURIState);

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			setLocation(location);
		})();
	}, []);

	useEffect(() => {
		(async () => {
			const albums = await AsyncStorage.getItem("albums");
			if (albums) {
				setAlbums(JSON.parse(albums).albums);
			}
		})();
	}, []);
	const callbackCreate = async () => {
		await Alert.prompt("Title", "Give a name to the album", async (value) => {
			await AsyncStorage.clear();
			await callbackCreateAlbum(value);
		});
	};

	const callbackCreateAlbum = async (value: string) => {
		// get an album, if it doesn't exist, create one

		const p = await AsyncStorage.getItem("albums");
		if (!p) {
			// create an album
			const albobject = {
				title: value,
				createdAt: new Date(),
				id: value,
				image: "",
				images: [],
				count: 0,
			};

			await AsyncStorage.setItem(
				"albums",
				JSON.stringify({
					albums: [albobject],
				})
			);
			setAlbums([albobject]);
		} else {
			const albums = JSON.parse(p);
			const albobject = {
				title: value,
				createdAt: new Date(),
				id: value,
				image: "",
				images: [],
				count: albums.count++,
			};
			let temp = [...albums.albums, albobject];
			await AsyncStorage.setItem("albums", JSON.stringify({ albums: temp }));

			setAlbums(temp);
		}
	};

	const callbackAddImageToAlbum = async (title: string) => {
		const a = JSON.parse(await AsyncStorage.getItem("albums"));
		const albums = a.albums;
		const albumIndex = albums.findIndex((a) => a.title === title);

		const imgObj = {
			id: Math.floor(Math.random() * 10000000),
			imageUri: imageURI,
			location: location,
			createdAt: new Date(),
		};

		albums[albumIndex].images.push(imgObj);
		albums[albumIndex].count++;

		await AsyncStorage.setItem("albums", JSON.stringify({ albums: albums }));
		setAlbums(albums);
		router.push("/map");
	};

	const data = [{ title: "one" }, ...albums];

	const renderItem = ({ item, index }) => (
		<Pressable
			onPress={
				index === 0
					? callbackCreate
					: () =>
							selected === item.title
								? setSelected("")
								: setSelected(item.title)
			}
			style={{ alignItems: "center" }}
		>
			<View
				style={[
					styles.cardContainer,
					index === 0 ? styles.plusContainer : {},
					index !== 0 ? { flexDirection: "row" } : {},
					selected === item.title ? { backgroundColor: "#5001F9" } : {},
				]}
			>
				{index !== 0 && (
					<Image
						source={require("../assets/wire.png")}
						style={{ width: 6, height: "100%" }}
					/>
				)}
				{index === 0 && <Text>+</Text>}
				{index !== 0 && (
					<View style={styles.cover}>
						{item.images.length > 0 && (
							<Image
								source={{ uri: item.images[0].imageUri }}
								style={{ width: "80%", height: "80%" }}
							/>
						)}
					</View>
				)}
			</View>

			<Text style={styles.cardText}>
				{index === 0 ? "" : item.title + (item.count ? `(${item.count})` : "")}
			</Text>
		</Pressable>
	);

	console.log(JSON.stringify(albums, null, 2));

	return (
		<View
			style={{
				flex: 1,

				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Text>Select an album to add photo!</Text>
			<View
				style={{
					width: "100%",
					height: "40%",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<FlatList
					contentContainerStyle={{
						width: "100%",
						flex: 1,
						alignItems: "center",
					}}
					style={{ width: "100%", flex: 1 }}
					data={data}
					renderItem={renderItem}
					numColumns={4}
					keyExtractor={(item) => item.key}
				/>
			</View>
			<Pressable
				disabled={!selected || !location}
				onPress={() => {
					callbackAddImageToAlbum(selected);
				}}
				style={[styles.button, { marginTop: 32, opacity: !selected ? 0.5 : 1 }]}
			>
				<Text style={styles.buttonText}>
					{!location ? "Loading location..." : "Add"}
				</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		marginTop: 24,
	},
	row: {
		width: "100%",
		marginVertical: 40,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 44,
	},
	text1: {
		fontSize: 15,
		fontWeight: "bold",
	},
	plusContainer: {
		borderStyle: "dashed",
		borderWidth: 1,
		borderColor: "#5001F9",
	},
	cards: {
		flex: 1,
	},
	cardContainer: {
		width: 60,
		height: 74,
		alignItems: "center",
		justifyContent: "center",
		margin: 12.5,
	},
	cardText: {
		fontSize: 10,
		marginTop: 3,
	},
	cover: {
		width: "100%",
		height: "100%",
		backgroundColor: "red",
		alignItems: "center",
		justifyContent: "center",
	},
	photoText: {
		fontSize: 15,
		fontWeight: "bold",
	},
	polaroid: {
		width: 261,
		height: 218,
		alignSelf: "center",
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
		alignSelf: "center",
		marginTop: 53,
	},
	buttonText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "600",
		textAlign: "center",
	},
});

export default Album;
