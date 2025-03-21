import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../utils/ThemeProvider";

export default function About({ tutorialDetail }) {
  const [expanded, setExpanded] = useState(false); // State to toggle "See More"
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.txtTitle, isDarkMode && styles.txtDark]}>About</Text>
      <Text
        style={[styles.txtAbout, isDarkMode && styles.txtDark]}
        numberOfLines={expanded ? undefined : 4} // Dynamically control lines
        ellipsizeMode="tail" // Add ellipsis when text is truncated
      >
        {tutorialDetail?.about}
      </Text>
      {tutorialDetail?.about &&
        tutorialDetail?.about.split("\n").length > 4 && (
          <TouchableOpacity onPress={toggleExpanded} style={styles.btn}>
            <Text style={styles.btnText}>
              {expanded ? "See Less" : "See More"}
            </Text>
          </TouchableOpacity>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  containerDark: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  txtTitle: {
    fontFamily: "outfit-bold",
    fontSize: 20,
    marginBottom: 10,
  },
  txtAbout: {
    fontFamily: "outfit",
    fontSize: 16,
    lineHeight: 22,
  },
  txtDark: {
    color: Colors.dark.text,
  },
  btn: {
    marginTop: 10,
  },
  btnText: {
    fontFamily: "outfit-bold",
    color: Colors.PRIMARY,
    fontSize: 16,
  },
});
