import { View, ScrollView, StyleSheet } from "react-native";
import React from "react";
import Header from "../../components/Home/Header";
import Slider from "../../components/Home/Slider";
import Category from "../../components/Home/Category";
import CalisTutorials from "../../components/Home/CalisTutorials";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../utils/ThemeProvider";
import { StatusBar } from "expo-status-bar";

export default function home() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Category />
        <CalisTutorials />
        <Slider />
        <View style={{ height: 20 }} />
      </ScrollView>
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
});
