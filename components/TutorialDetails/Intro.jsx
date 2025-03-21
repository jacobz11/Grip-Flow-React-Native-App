import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Share,
  SafeAreaView,
  Pressable,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Colors } from "../../constants/Colors";
import { useFocusEffect, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../../configs/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import { useTheme } from "../../utils/ThemeProvider";
//Video related imports
import { useVideoPlayer, VideoView } from "expo-video";
import { deleteObject, ref } from "firebase/storage";

export default function Intro({ tutorialDetail }) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [like, setLike] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const animation = useRef(null);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const player = useVideoPlayer(tutorialDetail?.videoUrl, (player) => {
    player.loop = true;
  });

  useEffect(() => {
    onLike();
    onAnimationFinish();
  }, []);

  useFocusEffect(
    useCallback(() => {
      onNumLikesCheck();
      GetAdminEmailsList();
    }, [])
  );

  const GetAdminEmailsList = async () => {
    try {
      const q = query(
        collection(db, "Admins"),
        where("email", "==", user?.primaryEmailAddress.emailAddress)
      );
      const querySnapShot = await getDocs(q);
      const admins = querySnapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIsAdmin(admins.length > 0);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const onDelete = () => {
    Alert.alert("Delete Tutorial?", "This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: DeleteTutorial,
      },
    ]);
  };

  const onNumLikesCheck = async () => {
    try {
      const likesRef = collection(db, "Likes");
      const q = query(likesRef, where("likeID", "==", tutorialDetail?.id));
      const querySnapshot = await getDocs(q);
      const numLikes = querySnapshot.size;
      setLikesCount(numLikes);
      return numLikes;
    } catch (error) {
      console.error("Error counting likes:", error);
      return 0;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };
  //******************** Like related events ********************* */
  const [isAnimating, setIsAnimating] = useState(false);
  const LIKE_FRAMES = {
    start: 17,
    end: 67,
  };
  const UNLIKE_FRAMES = {
    start: 109,
    end: 160,
  };

  // Handle animation completion
  const onAnimationFinish = () => {
    setIsAnimating(false);
  };
  const playLikeAnimation = () => {
    setIsAnimating(true);
    if (!like) {
      // Playing like animation
      animation.current?.play(LIKE_FRAMES.start, LIKE_FRAMES.end);
    } else {
      // Playing unlike animation
      animation.current?.play(UNLIKE_FRAMES.start, UNLIKE_FRAMES.end);
    }
  };
  const onPressedLike = async () => {
    if (loading || isAnimating) return;
    setLoading(true);
    playLikeAnimation();

    try {
      if (!like) {
        await setDoc(doc(db, "Likes", Date.now().toString()), {
          name: tutorialDetail?.name,
          category: tutorialDetail?.category,
          videoUrl: tutorialDetail?.videoUrl,
          imageUrl: tutorialDetail?.imageUrl,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          likeID: tutorialDetail?.id,
          createdAt: new Date(),
        });
        Toast.show({
          type: "success",
          text1: "Saved to Liked Tutorials",
        });
      } else {
        const q = query(
          collection(db, "Likes"),
          where("userEmail", "==", user?.primaryEmailAddress?.emailAddress),
          where("likeID", "==", tutorialDetail?.id)
        );
        const querySnapShot = await getDocs(q);
        const deletePromises = querySnapShot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
      }
      await onLike();
    } catch (error) {
      console.error("Error toggling like:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update like status",
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const onLike = async () => {
    try {
      const q = query(
        collection(db, "Likes"),
        where("userEmail", "==", user?.primaryEmailAddress?.emailAddress),
        where("likeID", "==", tutorialDetail?.id)
      );
      const querySnapShot = await getDocs(q);
      setLike(querySnapShot.docs.length > 0);
      querySnapShot.docs.length > 0
        ? animation.current?.play(LIKE_FRAMES.end, LIKE_FRAMES.end)
        : animation.current?.play(UNLIKE_FRAMES.end, UNLIKE_FRAMES.end);
      onAnimationFinish();
      await onNumLikesCheck();
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  /* ************************ End likes events *********** */
  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this tutorial on GripFlow: ${tutorialDetail?.name}\n\nDownload the app now!`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const DeleteTutorial = async () => {
    try {
      await deleteDoc(doc(db, "CalisTutorials", tutorialDetail?.id));
      // image delete
      const imageRef = ref(storage, tutorialDetail?.imageUrl);
      deleteObject(imageRef).catch((error) => {
        console.log("Failed to delete image: ", error);
      });
      // image delete end
      // video delete
      const videoRef = ref(storage, tutorialDetail?.videoUrl);
      deleteObject(videoRef).catch((error) => {
        console.log("Failed to delete video: ", error);
      });
      // video delete end

      const q = query(
        collection(db, "Likes"),
        where("likeID", "==", tutorialDetail?.id)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      Toast.show({
        type: "success",
        text1: "Tutorial deleted successfully",
      });
      router.back();
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      Toast.show({
        type: "error",
        text1: "Failed to delete tutorial",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        <View
          style={{
            width: "100%",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            position: "absolute",
            zIndex: 1,
            padding: 5,
            opacity: 0.75,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="closecircle" size={30} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>
        <VideoView
          style={styles.video}
          nativeControls
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />
      </View>

      <View
        style={[
          styles.contentContainer,
          isDarkMode && styles.contentContainerDark,
        ]}
      >
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>
              {tutorialDetail?.name}
            </Text>
            {isAdmin && (
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color="#FF3B30"
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.categoryRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>
                {tutorialDetail?.category}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <Pressable
                onPress={onPressedLike}
                disabled={loading || isAnimating}
                style={[styles.actionButton, like && styles.actionButtonActive]}
              >
                <LottieView
                  autoPlay={false}
                  ref={animation}
                  style={styles.lottieView}
                  loop={false}
                  source={require("./../../assets/animations/like.json")}
                />
              </Pressable>

              <TouchableOpacity onPress={onShare} style={styles.actionButton}>
                <MaterialIcons name="share" size={24} color={Colors.PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <MaterialIcons
              name="favorite"
              size={20}
              color={isDarkMode ? Colors.dark.textSecondary : Colors.GRAY}
            />
            <Text style={[styles.statText, isDarkMode && styles.statTextDark]}>
              {formatNumber(likesCount)} {likesCount === 1 ? "like" : "likes"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialIcons
              name="access-time"
              size={20}
              color={isDarkMode ? Colors.dark.textSecondary : Colors.GRAY}
            />
            <Text style={[styles.statText, isDarkMode && styles.statTextDark]}>
              {new Date(
                tutorialDetail?.createdAt?.toDate()
              ).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.creatorSection}>
          <View style={styles.creatorInfo}>
            <Text
              style={[
                styles.creatorLabel,
                isDarkMode && styles.creatorLabelDark,
              ]}
            >
              Created by <Text style={{ color: "#eee" }}>|</Text>
            </Text>
            <Text
              style={[styles.creatorName, isDarkMode && styles.creatorNameDark]}
            >
              {tutorialDetail?.username}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 29,
  },
  video: {
    width: "100%",
    height: 202.5,
  },
  videoContainer: {
    width: "100%",
  },
  contentContainer: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    padding: 15,
    flex: 1,
    borderWidth: 1,
    borderLeftColor: Colors.light.border,
    borderRightColor: Colors.light.border,
    borderBottomColor: Colors.light.border,
  },
  contentContainerDark: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderLeftColor: Colors.dark.border,
    borderRightColor: Colors.dark.border,
    borderBottomColor: Colors.dark.border,
  },
  titleSection: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    color: "#000",
    flex: 1,
    marginRight: 10,
  },
  titleDark: {
    color: Colors.dark.text,
  },
  deleteButton: {
    paddingRight: 4,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryChip: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: "#fff",
    fontFamily: "outfit-medium",
    fontSize: 15,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: "#f0f0f0",
  },
  actionButtonActive: {
    backgroundColor: "#FFE5E5",
  },
  statsSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    color: Colors.GRAY,
    fontFamily: "outfit",
    fontSize: 14,
  },
  statTextDark: {
    color: Colors.dark.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#eee",
    marginHorizontal: 16,
  },
  statDividerDark: {
    backgroundColor: Colors.dark.border,
  },
  creatorSection: {
    marginTop: 16,
  },
  creatorInfo: {
    flexDirection: "row",
    gap: 5,
  },
  creatorLabel: {
    fontSize: 16,
    fontFamily: "outfit",
    color: Colors.GRAY,
  },
  creatorLabelDark: {
    color: Colors.dark.textSecondary,
  },
  creatorName: {
    fontSize: 16,
    fontFamily: "outfit-bold",
  },
  creatorNameDark: {
    color: Colors.dark.text,
  },
  lottieView: {
    width: 65,
    height: 65,
    margin: -20,
  },
});
