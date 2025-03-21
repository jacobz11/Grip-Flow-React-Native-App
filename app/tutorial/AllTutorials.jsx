import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import TutorialListCard from "../../components/Explore/TutorialListCard";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../utils/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useUser } from "@clerk/clerk-expo";
import LikedTutorialCard from "./LikedTutorialCard";

export default function AllTutorials() {
  const [tutorialList, setTutorialList] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const params = useLocalSearchParams();
  const { param } = params;
  const { user } = useUser();

  useFocusEffect(
    useCallback(() => {
      GetUserTutorial();
    }, [])
  );

  // Fetch Tutorials Created by the User
  const GetUserTutorial = async () => {
    setLoading(true);
    setTutorialList([]); // Reset list before fetching new data
    try {
      let q = "";
      if (param === "all") {
        q = query(
          collection(db, "CalisTutorials"),
          orderBy("createdAt", "desc") // Order by creation date, newest first
        );
      } else if (param === "my") {
        q = query(
          collection(db, "CalisTutorials"),
          where("userEmail", "==", user?.primaryEmailAddress?.emailAddress),
          orderBy("createdAt", "desc") // Order by creation date, newest first
        );
      } else if (param === "like") {
        q = query(
          collection(db, "Likes"),
          orderBy("createdAt", "desc"),
          where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
        );
      }
      if (q !== "") {
        const querySnapShot = await getDocs(q);
        const tutorials = querySnapShot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Set initial data
        setTutorialList(tutorials);
      }
    } catch (error) {
      console.error("Error fetching tutorials:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back-circle" size={40} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          {param === "all" ? "Tutorials Archive" : ""}
          {param === "my" ? "My Tutorials" : ""}
          {param === "like" ? "Liked Tutorials" : ""}
        </Text>
      </View>
      <View style={styles.tutorials}>
        <FlatList
          data={tutorialList}
          keyExtractor={(item) => item.id}
          onRefresh={GetUserTutorial}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            // Display message if no tutorials found
            !loading && (
              <View style={styles.emptyContainer}>
                <Text
                  style={
                    isDarkMode
                      ? [styles.emptyText, styles.emptyTextDark]
                      : styles.emptyText
                  }
                >
                  {param === "like"
                    ? "You haven't liked any tutorials yet."
                    : "No Tutorials Found :("}
                </Text>
              </View>
            )
          }
          renderItem={({ item }) =>
            param === "like" ? (
              <LikedTutorialCard likedTutorial={item} />
            ) : (
              <TutorialListCard tutorial={item} />
            )
          }
          contentContainerStyle={{
            flexGrow: 1, // Ensures list takes full available space
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  containerDark: {
    backgroundColor: Colors.dark.background,
  },
  backBtn: {
    position: "absolute",
    left: 10,
  },
  title: {
    fontSize: 25,
    fontFamily: "outfit-bold",
    textAlign: "center",
  },
  tutorials: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
  },
  titleDark: {
    color: Colors.dark.text,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    color: Colors.GRAY,
  },
  emptyTextDark: {
    color: Colors.dark.textSecondary,
  },
});
