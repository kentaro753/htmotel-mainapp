import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect } from "react";
import Home from "../screen/Home";
import Setting from "../screen/Setting";
import { Icon } from "react-native-paper";
import TTabRoom from "./TTabRoom";
import TTabBill from "./TTabBill";
import { logout, useMyContextProvider } from "../store/index";
import { Alert, View } from "react-native";
import Messages from "../screen/Messages";
const Tab = createBottomTabNavigator();

export default function () {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: "#ff3300" },
        headerTitleStyle: { alignSelf: "center", color: "#fff" },
        headerTitleAlign: "center",
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarActiveTintColor: "#ff3300",
        tabBarInactiveTintColor: "#000",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarLabel: "Trang chủ",

          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
          tabBarLabelStyle: { fontSize: 13 },
        }}
      />

      <Tab.Screen
        name="TTabRoom"
        component={TTabRoom}
        options={{
          headerTitle: "Phòng",
          tabBarLabel: "Phòng",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? "office-building" : "office-building-outline"}
              color={color}
              size={size}
            />
          ),
          tabBarLabelStyle: { fontSize: 13 },
        }}
      />
      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          headerTitle: "Danh sách liên hệ",
          tabBarLabel: "Nhắn tin",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                elevation: 5,
                position: "absolute",
                bottom: 5, // space from bottombar
                height: focused ? 65 : 58,
                width: focused ? 65 : 58,
                borderRadius: 65,
                backgroundColor: focused ? "#ff3300" : "#999999",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon
                source={
                  focused ? "message-processing" : "message-processing-outline"
                }
                color="white"
                size={size}
              />
            </View>
          ),
          tabBarLabelStyle: { fontSize: 13 },
        }}
      />
      <Tab.Screen
        name="TTabBill"
        component={TTabBill}
        options={{
          headerTitle: "Hóa đơn",
          tabBarLabel: "Hóa đơn",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={
                focused
                  ? "file-document-multiple"
                  : "file-document-multiple-outline"
              }
              color={color}
              size={size}
            />
          ),
          tabBarLabelStyle: { fontSize: 13 },
        }}
      />
      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{
          //headerShown: false,
          headerTitle: "Cài đặt",
          tabBarLabel: "Cài đặt",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? "cog" : "cog-outline"}
              color={color}
              size={size}
            />
          ),
          tabBarLabelStyle: { fontSize: 13 },
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { alignSelf: "center", color: "#ff3300" },
        }}
      />
    </Tab.Navigator>
  );
}
