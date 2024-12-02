import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import Setting from "../screen/Setting";
import { Icon } from "react-native-paper";
import TTabBill from "./TTabBill";
import { useMyContextProvider } from "../store/index";
import RoomsForRenter from "../screen/RoomsForRenter";
import HomeForRenter from "../screen/HomeForRenter";
const Tab = createBottomTabNavigator();

export default function () {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  return (
    <Tab.Navigator
      initialRouteName="HomeForRenter"
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
        name="HomeForRenter"
        component={HomeForRenter}
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
        name="RoomsForRenter"
        component={RoomsForRenter}
        options={{
          headerTitle:"Phòng đã thuê",
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
          headerShown: false,
          tabBarLabel: "Cài đặt",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? "cog" : "cog-outline"}
              color={color}
              size={size}
            />
          ),
          tabBarLabelStyle: { fontSize: 13 },
        }}
      />
    </Tab.Navigator>
  );
}
