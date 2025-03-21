import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Category from "../../components/Home/Category";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import TutorialListCard from "../../components/Explore/TutorialListCard";
import ExploreTutorialList from "../../components/Explore/ExploreTutorialList";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../utils/ThemeProvider";

export default function Explore() {
  const [tutorialList, setTutorialList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const GetTutorialByCategory = async (category) => {
    setTutorialList([]);
    setLoading(true);
    try {
      const q = query(
        collection(db, "CalisTutorials"),
        where("category", "==", category)
      );
      const querySnapshot = await getDocs(q);
      const tutorials = [];
      querySnapshot.forEach((doc) => {
        tutorials.push({ id: doc.id, ...doc.data() });
      });
      setTutorialList(tutorials);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
    } finally {
      setLoading(false);
    }
  };

  const HandleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length === 0) {
      setTutorialList([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, "CalisTutorials"));
      const lowerCaseText = text.toLowerCase();

      // Filter results on the client side
      const tutorials = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc) => doc.name.toLowerCase().includes(lowerCaseText));
      setTutorialList(tutorials);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      Alert.alert("Error", "Failed to search tutorials. Please try again.");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Text style={[styles.text, isDarkMode && styles.textDark]}>
        Explore More
      </Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color={Colors.PRIMARY} />
        <TextInput
          placeholder="Search..."
          style={styles.searchPlaceholder}
          value={searchQuery}
          onChangeText={(text) => HandleSearch(text)}
        />
      </View>

      {isSearching ? (
        loading ? (
          <ActivityIndicator
            size={"large"}
            color={isDarkMode ? "#fff" : Colors.PRIMARY}
            style={styles.load}
          />
        ) : (
          <FlatList
            data={tutorialList}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TutorialListCard tutorial={item} />}
            ListEmptyComponent={
              !loading && (
                <View style={styles.contNotFnd}>
                  <Text
                    style={
                      isDarkMode
                        ? [styles.txtNotFound, styles.txtNotFoundDark]
                        : styles.txtNotFound
                    }
                  >
                    {"No Tutorials Found :("}
                  </Text>
                  <Text
                    style={
                      isDarkMode
                        ? [styles.txtNotFound, styles.txtNotFoundDark]
                        : styles.txtNotFound
                    }
                  >
                    {"Search tutorial or pick a category."}
                  </Text>
                </View>
              )
            }
            contentContainerStyle={{
              flexGrow: 1,
            }}
          />
        )
      ) : (
        <>
          <Category
            explore={true}
            onCategorySelect={(category) => GetTutorialByCategory(category)}
          />
          {loading ? (
            <ActivityIndicator
              size={"large"}
              color={isDarkMode ? "#fff" : Colors.PRIMARY}
              style={styles.load}
            />
          ) : (
            <View style={styles.listContainer}>
              <ExploreTutorialList tutorialList={tutorialList} />
            </View>
          )}
        </>
      )}
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
  listContainer: {
    flex: 1,
  },
  load: {
    marginTop: "50%",
  },
  text: {
    fontSize: 30,
    fontFamily: "outfit-bold",
  },
  textDark: {
    color: Colors.dark.text,
  },
  searchContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 3,
    paddingLeft: 10,
    marginVertical: 10,
    marginTop: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  searchPlaceholder: {
    fontFamily: "outfit",
    fontSize: 16,
    flex: 1,
  },
  contNotFnd: {
    alignItems: "center",
    marginTop: 40,
  },
  txtNotFound: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    color: Colors.GRAY,
  },
  txtNotFoundDark: {
    color: Colors.dark.textSecondary,
  },
});
