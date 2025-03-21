import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { Colors } from "./../../constants/Colors";

export default function Header() {
  const { user } = useUser();
  return (
    <View style={styles.container}>
      <View style={styles.logoCont}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
      </View>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.welcome}>Welcome, </Text>
          <Text style={styles.nameStyle}>{user?.fullName}</Text>
        </View>
        <Image source={{ uri: user?.imageUrl }} style={styles.img1}></Image>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 34,
    backgroundColor: Colors.PRIMARY,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 99,
    resizeMode: "stretch",
    backgroundColor: "#fff",
  },
  logoCont: {
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 99,
  },
  img1: {
    width: 35,
    height: 35,
    borderRadius: 99,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameStyle: {
    fontSize: 16,
    fontFamily: "outfit-medium",
    color: "#fff",
  },
  welcome: {
    color: "#fff",
    fontFamily: "outfit",
    fontSize: 12,
  },
});
