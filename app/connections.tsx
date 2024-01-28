import uuid from 'react-native-uuid';


export const skeletonMap = new Map([
    ["nose", ["leftEye", "rightEye"]],
    ["leftEye", ["leftEar"]],
    ["rightEye", ["rightEar"]],
    ["leftShoulder", ["rightShoulder", "leftElbow", "leftHip"]],
    ["rightShoulder", ["rightElbow", "rightHip"]],
    ["leftElbow", ["leftWrist"]],
    ["rightElbow", ["rightWrist"]],
    ["leftHip", ["leftKnee", "rightHip"]],
    ["rightHip", ["rightKnee"]],
    ["leftKnee", ["leftAnkle"]],
    ["rightKnee", ["rightAnkle"]]
]);


const IP = "100.66.74.214";

export interface BackgroundSetup {
    aligned: boolean;
    direction: [number, number];
}

export function genOverlayURI(id: string) {
    console.log("SADASDA")
    console.log(id)
    
    return `http://${IP}/overlay/${id}`;
}
    


export async function apiPost(page: string, data: any) {
    console.log("Posting to " + page);
    console.log(`http://${IP}/${page}`);
    return await fetch(`http://${IP}/${page}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        console.log("OK")
        return response;
    }).catch((error) => {
        console.log("Error");
        console.log(error);
        return null;
    });
}

export async function apiCompareBackgrounds(data: any, id:string): Promise<BackgroundSetup | null>  {
    return await apiPost(`background-difference`, data).then((response) => {
        if (!response) return null;
        return response.json().then((json) => {
            // Map the JSON response to BackgroundSetup interface
            const backgroundSetup: BackgroundSetup = {
                aligned: json.aligned,
                direction: [json.direction[0], json.direction[1]]
            };
            return backgroundSetup;
        }).catch((error) => {
            console.log(error);
            return null;
        });
    });
}

export async function apiSetupBackground(image: string, id:string): Promise<string | null> {
    
    const data = {
        id: id,
        image: image
    }
    return await apiPost(`image-outline`, data).then((response) => {
        if (!response) return null;
        return response.json();
    });
}