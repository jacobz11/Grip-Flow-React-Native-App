import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { styles } from "./Styles";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import CalisTutorialsCard from "./CalisTutorialsCard";
import { useFocusEffect, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../utils/ThemeProvider";

export default function CalisTutorials() {
  const [calisTutorialsList, setCalisTutorialList] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  useFocusEffect(
    useCallback(() => {
      GetCalisTutorials();
    }, [])
  );

  const onPressed = () => {
    router.push("../tutorial/AllTutorials?param=all");
  };

  const GetCalisTutorials = async () => {
    setLoading(true);
    setCalisTutorialList([]);
    try {
      const q = query(
        collection(db, "CalisTutorials"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);

      // First, get all tutorials
      const tutorials = [];
      querySnapshot.forEach((doc) => {
        tutorials.push({ id: doc.id, ...doc.data() });
      });

      // Update state with initial data
      setCalisTutorialList(tutorials);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <Text style={[styles.txt1, isDarkMode && styles.txt1Dark]}>
          Tutorials
        </Text>
        <TouchableOpacity onPress={() => onPressed()}>
          <Text style={styles.txt2}>View All</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator
          size={"large"}
          color={isDarkMode ? "#fff" : Colors.PRIMARY}
          style={styles.load}
        />
      ) : (
        <FlatList
          data={calisTutorialsList}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <CalisTutorialsCard tutorial={item} key={index} />
          )}
        />
      )}
    </View>
  );
}
