import * as tf from "@tensorflow/tfjs";
import * as pose from "@tensorflow-models/posenet";
import { MODEL_CONFIG } from "./ModelConfig";

type LoadModelType = (
	setModel: (model: pose.PoseNet) => void,
	setIsModelReady: (isModelReady: boolean) => void
) => Promise<void>;

export const loadModel: LoadModelType = async (setModel, setIsModelReady) => {
	await tf.ready();
	// const loadedModel = await handpose.load(MODEL_CONFIG);
	const loadedModel = await pose.load();
	setModel(loadedModel);
	setIsModelReady(true);
};
