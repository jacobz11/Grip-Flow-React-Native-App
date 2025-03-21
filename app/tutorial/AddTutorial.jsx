import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import RadioGroup from "react-native-radio-buttons-group";
import { collection, doc, getDocs, query, setDoc } from "firebase/firestore";
import { db, storage } from "../../configs/FirebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import { useTheme } from "../../utils/ThemeProvider";

const { width, height } = Dimensions.get("window");

export default function AddTutorial() {
  const navigation = useNavigation();
  const [video, setVideo] = useState(null);
  const [videoName, setVideoName] = useState(null);
  const [image, setImage] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Add New Tutorial",
      headerShown: true,
    });
    GetCategoryList();
  }, []);

  const onVideoPick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      aspect: null,
      quality: 1,
    });
    if (!result.canceled) {
      setVideo(result?.assets[0].uri);
      setVideoName(result?.assets[0].fileName);
    }
  };

  const onImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result?.assets[0].uri);
    }
  };

  const GetCategoryList = async () => {
    setCategoryList([]);
    try {
      setLoading(true);
      const q = query(collection(db, "Category"));
      const snapShot = await getDocs(q);
      snapShot.forEach((doc) => {
        setCategoryList((prev) => [
          ...prev,
          {
            id: doc.data().name,
            label: doc.data().name,
            value: doc.data().name,
          },
        ]);
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to fetch categories. Please try again.");
    }
  };

  const uploadMedia = async () => {
    if (!video || !image || !name || !about || !category) {
      Alert.alert("Error", "Please fill all the fields!", [{ text: "OK" }]);
      return null;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      // First upload the video
      const fileNameVideo = Date.now().toString() + ".mp4";
      const videoRef = ref(storage, "videos/" + fileNameVideo);

      // Upload video using FileSystem
      await FileSystem.uploadAsync(
        `https://firebasestorage.googleapis.com/v0/b/${
          storage.app.options.storageBucket
        }/o?name=${encodeURIComponent(videoRef.fullPath)}`,
        video,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            "Content-Type": "video/mp4",
          },
          sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
        }
      );

      // Get video URL from Firebase
      const videoUrl = await getDownloadURL(videoRef);

      // Then upload the image
      const fileNameImage = Date.now().toString() + ".jpeg";
      const imageRef = ref(storage, "images/" + fileNameImage);
      const imageBlob = await (await fetch(image)).blob();
      await uploadBytes(imageRef, imageBlob);
      const imageUrl = await getDownloadURL(imageRef);

      return { imageUrl, videoUrl };
    } catch (error) {
      console.error("Error in uploadMedia:", error);
      Alert.alert(
        "Upload Error",
        "Failed to upload the video. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
      throw error;
    }
  };

  const saveTutorialDetail = async (imageUrl, videoUrl) => {
    try {
      const tutorialData = {
        name: name,
        about: about,
        category: category,
        videoUrl: videoUrl,
        imageUrl: imageUrl,
        username: user?.fullName,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userImage: user?.imageUrl,
        createdAt: new Date(),
      };

      await setDoc(
        doc(db, "CalisTutorials", Date.now().toString()),
        tutorialData
      );

      return true;
    } catch (error) {
      console.error("Error in saveTutorialDetail:", error);
      throw error;
    }
  };

  const AddNewTutorial = async () => {
    try {
      const urls = await uploadMedia();
      if (!urls) return;

      const { imageUrl, videoUrl } = urls;
      await saveTutorialDetail(imageUrl, videoUrl);

      Toast.show({
        type: "success",
        text1: "New tutorial added successfully!",
      });

      setTimeout(() => {
        setLoading(false);
        router.push("/(tabs)/profile");
      }, 500);
    } catch (error) {
      setLoading(false);
      console.error("Error in AddNewTutorial:", error);
      Alert.alert("Error", "Failed to upload tutorial. Please try again.");
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          Add New Tutorial
        </Text>
        <Text style={[styles.subTitle, isDarkMode && styles.subTitleDark]}>
          Please fill all the details
        </Text>

        <TouchableOpacity onPress={onImagePick} style={styles.contBtnImage}>
          {!image ? (
            <View style={{ alignItems: "center" }}>
              <MaterialCommunityIcons
                name="image-plus"
                size={60}
                color={Colors.PRIMARY}
              />
              <Text style={styles.btnTxt}>Add Cover Image</Text>
              <Text style={styles.secondBtn}>
                {"(Tip: You can use a screenshot from your video as the cover)"}
              </Text>
            </View>
          ) : (
            <Image style={styles.BtnImage} source={{ uri: image }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.contBtnVideo} onPress={onVideoPick}>
          {!video ? (
            <View style={styles.contBtnTxt}>
              <MaterialIcons
                name="video-call"
                size={50}
                color={Colors.PRIMARY}
              />
              <Text style={styles.btnTxt}>Upload a video tutorial...</Text>
            </View>
          ) : (
            <View style={styles.contBtnTxt}>
              <MaterialCommunityIcons
                name="video-check"
                size={50}
                color="green"
              />
              <Text style={styles.btnTxt}>{videoName}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View>
          <TextInput
            placeholder="Name"
            style={styles.inputs}
            onChangeText={setName}
          />
          <TextInput
            placeholder="About"
            style={[styles.inputs, styles.aboutInput]}
            numberOfLines={5}
            multiline={true}
            onChangeText={setAbout}
          />
          <View style={styles.contSelect}>
            <Text style={styles.categoryLabel}>Select Category</Text>
            <RadioGroup
              radioButtons={categoryList}
              onPress={setCategory}
              selectedId={category}
              layout="column"
              containerStyle={styles.radioGroup}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnLoading]}
          onPress={AddNewTutorial}
          disabled={loading}
        >
          <Text style={styles.txtBtn}>Add New Tutorial</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={styles.overlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    padding: 20,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: width * 0.4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    color: "#fff",
    fontFamily: "outfit-medium",
    fontSize: 16,
    marginTop: 12,
  },
  title: {
    fontFamily: "outfit-bold",
    fontSize: 25,
  },
  titleDark: {
    color: Colors.dark.text,
  },
  subTitle: {
    fontFamily: "outfit",
    fontSize: 15,
    color: Colors.GRAY,
  },
  subTitleDark: {
    color: Colors.dark.textSecondary,
  },
  contBtnVideo: {
    marginTop: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  contBtnImage: {
    backgroundColor: "#fff",
    width: "100%",
    height: 202.5,
    borderColor: Colors.light.border,
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  btnTxt: {
    fontSize: 15,
    marginLeft: 10,
  },
  secondBtn: {
    fontSize: 10,
    color: Colors.GRAY,
    marginTop: 5,
  },
  contBtnTxt: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  inputs: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 17,
    backgroundColor: "#fff",
    marginTop: 10,
    borderColor: Colors.light.border,
    fontFamily: "outfit",
  },
  aboutInput: {
    textAlignVertical: "top",
    height: 110,
  },
  contSelect: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginTop: 10,
    borderColor: Colors.light.border,
    padding: 10,
  },
  categoryLabel: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    marginBottom: 10,
    color: Colors.PRIMARY,
  },
  radioGroup: {
    alignItems: "flex-start",
  },
  btn: {
    borderRadius: 5,
    marginTop: 30,
    backgroundColor: Colors.PRIMARY,
    marginBottom: 30,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLoading: {
    opacity: 0.7,
  },
  txtBtn: {
    textAlign: "center",
    fontFamily: "outfit",
    color: "#fff",
    fontSize: 19,
  },
  BtnImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    resizeMode: "cover",
  },
});
