import React, { useEffect, useState } from "react";
import { PermissionsAndroid, SafeAreaView } from "react-native";
PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
);
PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
);
import AppMotel from "./src/QLMotel/screen/AppMotel";
import messaging from "@react-native-firebase/messaging";

const App = () => {
  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }
  const getToken = async () => {
    const fcmToken = await messaging().getToken();
    console.log("fcm:",fcmToken);
  };
  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);
  return <AppMotel />;
};
export default App;
