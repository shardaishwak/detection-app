import { atom } from "recoil";

// Create a recoil state for imageURI
export const imageURIState = atom({
	key: "imageURIState",
	default: "",
});

export const previousImageURIState = atom({
	key: "previousImageURI",
	default: "",
});

export const modificationTimeState = atom({
	key: "modificationTimeState",
	default: "",
});

// Path: recoilState.ts
