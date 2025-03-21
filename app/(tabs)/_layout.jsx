import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "./../../constants/Colors";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../utils/ThemeProvider";

export default function TabLayout() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.PRIMARY,
          tabBarStyle: {
            backgroundColor: isDarkMode ? Colors.dark.surface : "#fff",
            borderTopColor: isDarkMode ? Colors.dark.border : "#e0e0e0",
          },
          tabBarInactiveTintColor: isDarkMode ? "#fff" : "#687076",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            tabBarLabel: "Explore",
            tabBarIcon: ({ color }) => (
              <Ionicons name="search" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="people" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: "Settings",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-sharp" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
