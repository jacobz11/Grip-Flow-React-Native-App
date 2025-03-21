import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../utils/ThemeProvider";

export default function CategoryItem({ category, onCategoryPress }) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  return (
    <TouchableOpacity onPress={() => onCategoryPress(category)}>
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.iconCont}>
          <Image source={{ uri: category.icon }} style={styles.icon} />
        </View>
        <Text style={[styles.txt, isDarkMode && styles.txtDark]}>
          {category.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginLeft: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  containerDark: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface, // "rgba(255,255,255,0.7)",
  },
  icon: {
    width: 45,
    height: 45,
  },
  iconCont: {
    padding: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 15,
  },
  txt: {
    fontSize: 13,
    fontFamily: "outfit-medium",
    textAlign: "center",
    marginTop: 10,
  },
  txtDark: {
    color: Colors.dark.text,
  },
});
