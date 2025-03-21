import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

// Storage keys
const STORAGE_KEYS = {
  THEME_MODE: "themeMode",
  IS_AUTOMATIC: "isAutomaticTheme",
};

// Create the context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState(deviceTheme);
  const [isAutomatic, setIsAutomatic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await AsyncStorage.multiGet([
          STORAGE_KEYS.THEME_MODE,
          STORAGE_KEYS.IS_AUTOMATIC,
        ]);

        const savedTheme = settings[0][1];
        const savedIsAutomatic = settings[1][1];

        // Set isAutomatic state
        if (savedIsAutomatic !== null) {
          setIsAutomatic(savedIsAutomatic === "automatic");
        } else {
          // Default to automatic for new users
          setIsAutomatic(true);
          await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTOMATIC, "automatic");
        }

        // Set theme based on automatic or manual setting
        if (savedIsAutomatic === "automatic") {
          setTheme(deviceTheme);
        } else if (savedTheme) {
          setTheme(savedTheme);
        } else {
          // If no theme saved, use device theme
          setTheme(deviceTheme);
          await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, deviceTheme);
        }
      } catch (error) {
        console.error("Error loading theme settings:", error);
        // Fallback to defaults
        setTheme(deviceTheme);
        setIsAutomatic(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [deviceTheme]);

  // Update theme when device theme changes if automatic is enabled
  useEffect(() => {
    if (isAutomatic) {
      setTheme(deviceTheme);
    }
  }, [deviceTheme, isAutomatic]);

  // Switch theme function
  const switchTheme = async (mode) => {
    try {
      if (mode === "automatic") {
        setIsAutomatic(true);
        setTheme(deviceTheme);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.IS_AUTOMATIC, "automatic"],
          [STORAGE_KEYS.THEME_MODE, deviceTheme],
        ]);
      } else {
        setIsAutomatic(false);
        setTheme(mode);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.IS_AUTOMATIC, ""],
          [STORAGE_KEYS.THEME_MODE, mode],
        ]);
      }
    } catch (error) {
      console.error("Error saving theme settings:", error);
    }
  };

  // Context value
  const value = {
    theme,
    isAutomatic,
    isLoading,
    switchTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
