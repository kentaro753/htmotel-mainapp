import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Rooms from "../screen/Rooms";
import RoomsEmpty from "../screen/RoomsEmpty";
import RoomsOccupied from "../screen/RoomsOccupied";

const Tab = createMaterialTopTabNavigator();

export default function TopTabNavigator({ route }) {
  const initialRouteName = route.params?.initialRouteName || "Rooms";

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff",
        },
        tabBarActiveTintColor: "#ff3300",
        tabBarInactiveTintColor: "#000",
        tabBarIndicatorStyle: {
          backgroundColor: "#ff3300",
        },
      }}
    >
      <Tab.Screen
        name="Rooms"
        component={Rooms}
        options={{
          tabBarLabel: "Tất cả phòng",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="RoomsEmpty"
        component={RoomsEmpty}
        options={{
          tabBarLabel: "Trống",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="RoomsOccupied"
        component={RoomsOccupied}
        options={{
          tabBarLabel: "Đang thuê",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
    </Tab.Navigator>
  );
}
