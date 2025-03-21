import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "./../constants/Colors";
import { useWarmUpBrowser } from "./../hooks/useWarmUpBrowser";
import { useOAuth } from "@clerk/clerk-expo";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Handle other cases
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={require("./../assets/images/login7.jpg")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>
              Your ultimate <Text style={styles.highlightText}>GripFlow</Text>{" "}
              app
            </Text>

            <Text style={styles.subtitleText}>
              Find your favourite calisthenics workout and share it with your
              friends
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Image
              source={require("../assets/images/google.png")}
              style={styles.imgGog}
            />
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    maxWidth: 185,
    maxHeight: 395,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#000",
  },
  bottomContainer: {
    backgroundColor: "#fff",
    padding: 15,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  textContainer: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 22,
    fontFamily: "outfit-bold",
    textAlign: "center",
    marginBottom: 10,
  },
  highlightText: {
    color: Colors.PRIMARY,
  },
  subtitleText: {
    fontSize: 15,
    fontFamily: "outfit",
    textAlign: "center",
    color: Colors.GRAY,
    paddingHorizontal: 20,
  },
  imgGog: {
    width: 30,
    height: 30,
  },
  button: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 99,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    width: "72%",
    borderWidth: 1,
    borderColor: Colors.GRAY,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontFamily: "outfit",
    fontSize: 20,
  },
});
