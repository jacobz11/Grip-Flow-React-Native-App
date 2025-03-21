import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import TutorialListCard from "../../components/Explore/TutorialListCard";
import { db } from "../../configs/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../utils/ThemeProvider";

export default function TutorialsListByCategory() {
  const { category } = useLocalSearchParams();
  const [tutorialsList, setTutorialsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  useFocusEffect(
    useCallback(() => {
      getTutorialsList();
    }, [])
  );
  // Get tutorial list by category
  const getTutorialsList = async () => {
    setTutorialsList([]);
    setLoading(true);
    const q = query(
      collection(db, "CalisTutorials"),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      setTutorialsList((prev) => [...prev, { id: doc?.id, ...doc.data() }]);
    });
    setLoading(false);
  };
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back-circle" size={40} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          {category}
        </Text>
      </View>
      <View style={styles.tutorials}>
        {tutorialsList?.length > 0 && loading == false ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            onRefresh={getTutorialsList}
            refreshing={loading}
            data={tutorialsList}
            renderItem={({ item, index }) => (
              <TutorialListCard tutorial={item} key={index} />
            )}
          />
        ) : loading ? (
          <ActivityIndicator
            size={"large"}
            color={Colors.PRIMARY}
            style={styles.loading}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text
              style={
                isDarkMode
                  ? [styles.emptyText, styles.emptyTextDark]
                  : styles.emptyText
              }
            >
              {"No Tutorials Found :("}
            </Text>
          </View>
        )}
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
