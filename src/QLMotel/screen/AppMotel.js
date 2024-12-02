import React, { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MyContextControllerProvider,
  useMyContextProvider,
} from "../store/index";
import MyStack from "../route/MyStack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const MainApp = () => {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        // Lấy dữ liệu người dùng từ AsyncStorage
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);

          dispatch({ type: "USER_LOGIN", value: user });
        } else {
        }
      } catch (error) {
        console.error("Error loading user data from AsyncStorage:", error);
      } finally {
        setInitializing(false);
      }
    };

    checkUserLogin();
  }, []);

  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
};

const AppMotel = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1, marginTop: 32 }}>
      <StatusBar style="dark" />
      <MyContextControllerProvider>
        <MainApp />
      </MyContextControllerProvider>
    </GestureHandlerRootView>
  );
};

export default AppMotel;
