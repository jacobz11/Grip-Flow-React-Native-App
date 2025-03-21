import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import Intro from "../../components/TutorialDetails/Intro";
import Reviews from "../../components/TutorialDetails/Reviews";
import About from "../../components/TutorialDetails/About";
import { useTheme } from "../../utils/ThemeProvider";

export default function TutorialId() {
  const { tutorial_id } = useLocalSearchParams();
  const [tutorialDetail, setTutorialDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const getTutorialDetailById = async () => {
    try {
      const docRef = doc(db, "CalisTutorials", tutorial_id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching tutorial:", error);
      return null;
    }
  };

  const refreshTutorialDetails = async () => {
    try {
      setLoading(true);
      const currentDetails = await getTutorialDetailById();
      if (!currentDetails) {
        setLoading(false);
        return;
      }
      setTutorialDetail(currentDetails);
    } catch (error) {
      console.error("Error refreshing tutorial details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTutorialDetails();
  }, [tutorial_id]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={isDarkMode ? "#fff" : Colors.PRIMARY}
        style={{ marginTop: "50%" }}
      />
    );
  }

  if (!tutorialDetail) {
    return null;
  }

  return (
    <ScrollView
      style={isDarkMode && styles.containerDark}
      showsVerticalScrollIndicator={false}
    >
      <Intro tutorialDetail={tutorialDetail} />
      <About tutorialDetail={tutorialDetail} />
      <Reviews tutorialDetail={tutorialDetail} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerDark: {
    backgroundColor: Colors.dark.background,
  },
});
