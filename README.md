# MemoryMatch

## Inspiration 💡

We all have that one cherished childhood photo that holds a special place in our hearts. It's a snapshot that we long to recreate, a moment frozen in time. With MemoryMatch, we aim to turn this dream into reality. Our app not only helps you reminisce about your favorite childhood memories but also guides you through the process of reliving those precious moments.

## What it does ❓


By leveraging real-time pose estimation technology, MemoryMatch compares your current position and the original photo.
1. **Real-Time Pose Comparison**: Upload a photo from your childhood or any meaningful moment: MemoryMatch understands the unique poses by weighing the position of each individual body part in the live image against the position of a corresponding still image body part.
2. **Guided Recreation**: Receive step-by-step guidelines to adjust your pose, ensuring a close match to the original photo.
3. **Share or save the photo**: Once you've successfully matched the pose, share the recreated memories and have them join the challenge! You can also create individual albums to revisit your moments at any time.



## How we built it 🏗️
For the frontend development, we opted for React Native, specifically leveraging the Expo version, due to its cross-platform compatibility. This choice provided the development team with the advantage of testing the application on their individual devices without the need for intricate setups. Within React Native, we seamlessly incorporated several libraries, including TensorFlow JS, facilitating the integration of the pose detection model and collaboration with the skeleton in React Native.

Memory Match, is composed of three discrete modules, each designed to operate independently, thereby lowering the risk of failure and enhancing overall reliability. With this structure we followed a phased, but concurrent, implementation approach We initiated the development by defining our Expo App structure, followed by integration with the design, and incorporation of the Detector.

- **Expo App:** Serving as the central hub, this module manages and rapidly deploys during development, utilizing base React Native and higher-level libraries for mapping, information retrieval, and image manipulation. This results in a dedicated user pipeline that guides users through the app's functionality.
- **Detector:** The primary pose detection and estimation mechanism, based on Pose Net and run using TensorFlow JS, provides relative position scoring between two images. This scoring, adapted from a common method used in text analysis for measuring document similarity, ensures a highly accurate measure for the similarity of two poses.
- **SIFT:** To detect background similarities in two images, we employ the extraction of "key points" common between them. Calculating the error between the original and the live image based on the difference in position between each pair of important key points allows us to determine the similarity between the images. We also optimized the filtering of keypoints to remove any points on people in the image.

This comprehensive approach ensures the robustness and accuracy of Memory Match across its various modules. This ensured user accessibility, images, and albums were efficiently stored using local storage within the application, allowing users to retrieve their content at any time. This approach aligns with industry best practices and guarantees a robust, user-friendly experience.



## Challenges we ran into 🧩

**OpenCV:**

One of the primary hurdles encountered during the app development process pertained to integrating the openCV library with the mobile application. Given that the majority of the openCV library is structured for native platforms through Objective-C and Java, implementing it natively for each platform proved impractical due to time constraints. Consequently, we made the strategic decision to leverage React Native.

**React Native:**

However, adopting React Native presented its own set of challenges, notably the absence of crucial openCV libraries, leading to the omission of essential functions. This posed a potential hindrance to the overall functionality of the app. To address this limitation, we established a server component using Python to encapsulate the openCV app, enabling image processing by generating an outlined version. Despite these efforts, the resultant files exhibited corruption issues, rendering them unreadable by the React Native Image component.

**Solutions:**

In response to these challenges, we devised a streamlined solution involving a generalized skeleton, accompanied by a separate system for outline mapping implemented through Python and computer vision (CV). It is imperative to note that we explored TensorFlow as a substitute for openCV to load the pose detection model. Additionally, we transitioned from using GLView to Canvas for enhanced compatibility within the React Native framework.



## Accomplishments that we’re proud of 🏆

Despite encountering numerous challenges arising from platform compatibilities, we successfully developed two distinct applications tailored for mobile and desktop platforms.

**Native Machine Learning**

In the mobile application, we implemented a skeleton-based pose detection feature based on TensorFlow JS models, designed to signal when the user's posture aligns with the correct position. On the desktop version, a more robust and intricate system was crafted. This version dynamically generated a layout for the background, prompting users to fit within the designated space. The layout's colour dynamically changed when the user achieved the correct position, serving as a visual indicator of successful alignment.

**Versatility**

One significant accomplishment lies in the versatility of our model. Unlike many systems dependent on specific individuals, our pose detection model adapts seamlessly to the postures of any person, showcasing its broad applicability.

**Experimentation**

Additionally, our team excelled in experimentation within the realms of modelling and computer vision. Despite these fields being largely uncharted territory for our team, we embraced the challenge and successfully created a substantial and innovative solution. This adaptability and pioneering spirit underscore our commitment to pushing boundaries and achieving remarkable outcomes.



## What we learned 🧠

**Technical**

We acquired a profound understanding of computer vision, delving specifically into the intricacies of pose detection. This provided the opportunity to seamlessly integrate our extensive knowledge of linear algebra and advanced mathematical concepts into a sophisticated software framework. The application of such theoretical foundations allowed for the development of a nuanced and highly functional system.

Furthermore, confronted with a team largely unfamiliar with React Native, we embraced the challenge of mastering this technology promptly and applied it directly to our project. This initiative not only broadened our skill set but also enhanced our adaptability, reinforcing our ability to swiftly assimilate new technologies.

**Non-technical**

In addition to technical expertise, our collaborative efforts sharpened our skills in teamwork and efficient task delegation. Through adeptly distributing the workload among team members, we optimized the entire workflow, resulting in accelerated development timelines and streamlined debugging processes. This multifaceted learning experience not only enriched our individual capabilities but also contributed significantly to the overall sophistication and efficiency of our project development.

This experience informed how many of us view Hackathons and our own ability to successfully create something that is brand new to us, if not the world. It has been a massively positive experience, surrounded by excellent people that foster an environment to continue to actively engage in future experiences like this one.



## What’s next for Memory Match 🚀

**MORE POWER!**

We are currently exploring the integration of our Python-developed computer vision system, bolstered by enhanced computational capabilities, into the mobile application. This strategic move is intended to address unresolved issues present in the current app version. Additionally, we are considering the implementation of a cloud service to afford users the convenience of storing their images securely in the cloud, ensuring accessibility from any device.

**Geo Location**

Furthermore, we are contemplating the inclusion of a geolocation feature that notifies users when they are in a specific position where they previously attempted to replicate an image. This functionality aims to streamline the image capture process, automatically organizing the photos into the corresponding folders.

**Shared album**

In addition to these developments, we are exploring the option to add a shared album feature. For instance, people in the same high school can recreate the photo and share it with their classmates after a couple of years.

**Overall**

The roadmap for our application includes a range of possibilities for enhancement, fostering increased intelligence and overall improvement. We are committed to delivering a sophisticated and advanced user experience through strategic feature implementations.


## Running Memory Match 🔩

### Frontend

To run the frontend, please follow the steps below:

1. <code>cd</code> into the root directory of the application <code>/detection-app</code>
2. Download dependencies by running <code>yarn</code>
3. Start frontend by running <code>yarn start</code>

### Backend

There are three files associated with the backend server:
1. <code>main.py</code> which contains the code for the FastAPI server initialization and endpoints
2. <code>MatchBackground.py</code> which contains the helper functions to match the backgrounds used by the server endpoints
3. <code>SiftDemo.py</code> which contains code to run the SIFT demo using the terminal and your computers webcam to show that the algorithm works

To run the server you need to:
1. <code>cd</code> into the <code>/background-alignment</code> folder
2. Download <code>uvicorn</code> by running <code>yarn add uvicorn</code>
3. Run the backend server by running <code>uvicorn main:app --host 0.0.0.0 --port 80</code>

To run the SiftDemo through terminal you need to:
1. <code>cd</code> into the <code>/background-alignment</code> folder
2. Run <code>python3 SiftDemo.py</code>




