import { View, Text, Image, StyleSheet } from "react-native";
import React, { useCallback, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Colors } from "../../constants/Colors";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../utils/ThemeProvider";

export default function UserIntro() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  useFocusEffect(
    useCallback(() => {
      GetAdminEmailsList();
    }, [])
  );

  const GetAdminEmailsList = async () => {
    const q = query(
      collection(db, "Admins"),
      where("email", "==", user?.primaryEmailAddress.emailAddress)
    );
    const querySnapShot = await getDocs(q);
    const admins = querySnapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (admins.length === 0) {
      setIsAdmin(false);
    } else setIsAdmin(true);
  };
  return (
    <View style={styles.container}>
      <Image source={{ uri: user?.imageUrl }} style={styles.imgProf} />
      {isAdmin ? (
        <View>
          <View style={styles.usrNmeWithAdmin}>
            <Text style={[styles.usrNme, isDarkMode && styles.txtDark]}>
              {user?.fullName + " "}
            </Text>
            <Text style={[styles.usrNmeAdmn, isDarkMode && styles.txtDark]}>
              {"(Admin)"}
            </Text>
          </View>
          <Text style={[styles.usrEmail, isDarkMode && styles.txtDark]}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      ) : (
        <View style={styles.contNoAdmin}>
          <Text style={[styles.usrNme, isDarkMode && styles.txtDark]}>
            {user?.fullName}
          </Text>
          <Text style={[styles.usrEmail, isDarkMode && styles.txtDark]}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imgProf: {
    width: 100,
    height: 100,
    borderRadius: 99,
  },
  container: {
    display: "flex",
    alignItems: "center",
    marginTop: 30,
  },
  usrNme: {
    fontSize: 20,
    fontFamily: "outfit-bold",
  },
  txtDark: {
    color: "#fff",
  },
  usrEmail: {
    fontSize: 16,
    fontFamily: "outfit",
  },
  usrNmeAdmn: {
    fontSize: 20,
    fontFamily: "outfit",
  },
  usrNmeWithAdmin: {
    display: "flex",
    flexDirection: "row",
  },
  contNoAdmin: {
    alignItems: "center",
  },
});
