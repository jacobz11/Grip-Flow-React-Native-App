import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import React from "react";
import UserIntro from "../../components/Profile/UserIntro";
import MenuList from "../../components/Profile/MenuList";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../utils/ThemeProvider";
import { StatusBar } from "expo-status-bar";

export default function Profile() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={styles.container}>
        <View style={styles.headerTextCont}>
          <Text
            style={[styles.headerText, isDarkMode && styles.headerTextDark]}
          >
            Profile
          </Text>
        </View>
        <UserIntro isDarkMode={isDarkMode} />
        <MenuList isDarkMode={isDarkMode} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
    paddingTop: 35,
  },
  safeAreaDark: {
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
  },
  headerText: {
    fontFamily: "outfit-bold",
    fontSize: 30,
  },
  headerTextDark: {
    color: "#fff",
  },
  headerTextCont: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
