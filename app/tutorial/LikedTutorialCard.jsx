import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { useTheme } from "../../utils/ThemeProvider";

export default function LikedTutorialCard({ likedTutorial }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  return (
    <TouchableOpacity
      style={[styles.container, isDarkMode && styles.containerDark]}
      onPress={() => router.push("/tutorialDetail/" + likedTutorial?.likeID)}
    >
      <Image source={{ uri: likedTutorial?.imageUrl }} style={styles.img} />
      <View style={styles.contTxt}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          {likedTutorial?.name}
        </Text>
        <Text style={[styles.category, isDarkMode && styles.categoryDark]}>
          {likedTutorial?.category}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  containerDark: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  img: {
    // width: "100%",
    // height: 150,
    aspectRatio: 16 / 9,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  contTxt: {
    padding: 10,
  },
  title: {
    fontFamily: "outfit-bold",
    fontSize: 20,
  },
  titleDark: {
    color: Colors.dark.text,
  },
  category: {
    fontFamily: "outfit",
    color: Colors.GRAY,
  },
  categoryDark: {
    color: Colors.dark.textSecondary,
  },
});
