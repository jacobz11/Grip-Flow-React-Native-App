import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { useTheme } from "../../utils/ThemeProvider";
// import { MaterialIcons } from "@expo/vector-icons"; TODO

export default function CalisTutorialsCard({ tutorial }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  return (
    <TouchableOpacity
      onPress={() => router.push("/tutorialDetail/" + tutorial?.id)}
    >
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <Image
          source={{ uri: tutorial?.imageUrl, cache: "reload" }}
          style={styles.img1}
        />
        <View style={styles.contTxt}>
          <Text
            style={[styles.txtName, isDarkMode && styles.txtNameDark]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {tutorial.name}
          </Text>
          {/* <MaterialIcons name={"favorite"} size={22} color={Colors.PRIMARY} /> */}
        </View>
        <View style={styles.contCatLike}>
          <Text style={[styles.category, isDarkMode && styles.categoryDark]}>
            {tutorial?.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  containerDark: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  img1: {
    // width: "100%",
    // height: 135,
    aspectRatio: 16 / 9,
    borderRadius: 15,
    resizeMode: "stretch",
  },
  category: {
    fontFamily: "outfit",
    color: Colors.GRAY,
  },
  categoryDark: {
    color: Colors.dark.textSecondary,
  },
  contTxt: {
    marginTop: 5,
    gap: 5,
    width: 240,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 5,
  },
  contCatLike: {
    alignItems: "flex-start",
    paddingLeft: 5,
  },
  txtName: {
    fontFamily: "outfit-bold",
    fontSize: 20,
    flex: 1,
  },
  txtNameDark: {
    color: Colors.dark.text,
  },
});
