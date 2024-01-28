import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
	Dimensions,
	FlatList,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Album = () => {
	const [albums, setAlbums] = useState([]);
	const { title } = useLocalSearchParams();
	useEffect(() => {
		(async () => {
			const albums = await AsyncStorage.getItem("albums");
			if (albums) {
				setAlbums(JSON.parse(albums).albums);
			}
		})();
	}, []);

	const album = albums.find((album) => album.title === title);

	const _renderItem = ({ item, index }) => {
		console.log(item.modificationTime);
		return (
			<View
				style={{
					alignItems: "center",
					marginRight: Dimensions.get("screen").width - 350,

					marginTop: 24,
				}}
			>
				<View style={{ flexDirection: "row", gap: 28 }}>
					<View style={{ alignItems: "center" }}>
						<Image
							source={{ uri: item.previousImageUri }}
							style={{ width: 120, height: 172 }}
						/>
						<Text style={{ marginTop: 12, fontSize: 15, fontWeight: "600" }}>
							{/* {new Date(item.modificationTime * 1000).getFullYear()} */}
							Before
						</Text>
					</View>
					<View style={{ alignItems: "center" }}>
						<Image
							source={{ uri: item.imageUri }}
							style={{ width: 120, height: 172 }}
						/>
						<Text style={{ marginTop: 12, fontSize: 15, fontWeight: "600" }}>
							{/* {new Date(item.createdAt).getFullYear()} */}
							After
						</Text>
					</View>
				</View>
			</View>
		);
	};
	return (
		<SafeAreaView style={styles.container}>
			<Image
				source={require("../../assets/chain.png")}
				style={{
					position: "absolute",
					top: 0,
					width: 20,
					height: Dimensions.get("screen").height,
				}}
			/>
			<Pressable style={styles.row} onPress={router.back}>
				<Image
					source={require("../../assets/arrow-left-purple.png")}
					style={{ width: 24, height: 24 }}
				/>
				<Text style={{ fontSize: 18, fontWeight: "600", color: "#5001F9" }}>
					{title}
				</Text>
			</Pressable>
			<FlatList
				contentContainerStyle={{
					justifyContent: "center",
					marginTop: 24,
				}}
				data={album?.images || []}
				renderItem={_renderItem}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		paddingLeft: 50,
		marginTop: 40,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginTop: 12,
		marginLeft: -28,
	},
});

export default Album;
