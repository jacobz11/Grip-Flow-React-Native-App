import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../utils/ThemeProvider";

export default function Slider() {
  const [sliderList, setSliderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const GetSliderList = async () => {
    setLoading(true);
    setSliderList([]);
    const q = query(collection(db, "Sliders"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setSliderList((prev) => [...prev, doc.data()]);
    });
    setLoading(false);
  };

  useEffect(() => {
    GetSliderList();
  }, []);

  return (
    <View>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        #Special for you
      </Text>
      {loading ? (
        <ActivityIndicator
          size={"large"}
          color={isDarkMode ? "#fff" : Colors.PRIMARY}
          style={styles.load}
        />
      ) : (
        <FlatList
          showsHorizontalScrollIndicator={false}
          style={styles.flatList}
          data={sliderList}
          horizontal={true}
          renderItem={({ item, index }) => (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.img}
              key={index}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "outfit-bold",
    fontSize: 20,
    paddingLeft: 15,
    paddingTop: 20,
    marginBottom: 5,
  },
  titleDark: {
    color: Colors.dark.text,
  },
  img: {
    width: 240,
    height: 180,
    borderRadius: 15,
    marginRight: 15,
    resizeMode: "stretch",
  },
  flatList: {
    paddingLeft: 15,
  },
  load: {
    marginTop: 20,
    marginLeft: 10,
  },
});
