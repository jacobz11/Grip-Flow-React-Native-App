import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../utils/ThemeProvider";
import { StatusBar } from "expo-status-bar";

export default function Settings() {
  const { theme, isAutomatic, switchTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        App Settings
      </Text>

      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <Text
          style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}
        >
          Appearance
        </Text>

        <View style={styles.themeSelector}>
          <TouchableOpacity
            style={[styles.themeButton, isAutomatic && styles.activeTheme]}
            onPress={() => switchTheme("automatic")}
          >
            <Ionicons
              name="contrast"
              size={24}
              color={isAutomatic ? "#fff" : "#000"}
            />
            <Text style={[styles.themeText, isAutomatic && styles.activeText]}>
              Automatic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === "light" && !isAutomatic && styles.activeTheme,
            ]}
            onPress={() => switchTheme("light")}
          >
            <Ionicons
              name="sunny-outline"
              size={24}
              color={theme === "light" && !isAutomatic ? "#fff" : "#000"}
            />
            <Text
              style={[
                styles.themeText,
                theme === "light" && !isAutomatic && styles.activeText,
              ]}
            >
              Light Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === "dark" && !isAutomatic && styles.activeTheme,
            ]}
            onPress={() => switchTheme("dark")}
          >
            <Ionicons
              name="moon-outline"
              size={24}
              color={theme === "dark" && !isAutomatic ? "#fff" : "#000"}
            />
            <Text
              style={[
                styles.themeText,
                theme === "dark" && !isAutomatic && styles.activeText,
              ]}
            >
              Dark Mode
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 35,
  },
  containerDark: {
    backgroundColor: Colors.dark.background,
  },
  title: {
    fontFamily: "outfit-bold",
    fontSize: 30,
    marginBottom: 20,
  },
  titleDark: {
    color: Colors.dark.text,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardDark: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    fontFamily: "outfit-medium",
    fontSize: 20,
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: Colors.dark.text,
  },
  themeSelector: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 10,
  },
  themeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  activeTheme: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  themeText: {
    fontFamily: "outfit",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  activeText: {
    color: "#fff",
    fontFamily: "outfit-medium",
  },
});
