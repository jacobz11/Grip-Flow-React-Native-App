import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  txt1: {
    fontSize: 20,
    fontFamily: "outfit-bold",
  },
  txt1Dark: {
    color: Colors.dark.text,
  },
  txt2: {
    color: Colors.PRIMARY,
    fontFamily: "outfit-medium",
  },
  load: {
    marginTop: 20,
    marginLeft: 20,
  },
});
