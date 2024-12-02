import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import RoomsOccupied from "../screen/RoomsOccupied";
import ActiveContract from "../screen/ActiveContracts";
import DeactivateContract from "../screen/DeactivateContract";
import Incidents from "../screen/Incidents";
import FixedIncidents from "../screen/FixedIncidents";

const Tab = createMaterialTopTabNavigator();

export default function TopTabNavigator({ route }) {
  const initialRouteName = route.params?.initialRouteName || "ActiveContract";

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
        name="Incidents"
        component={Incidents}
        options={{
          tabBarLabel: "Chưa xử lý",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="FixedIncidents"
        component={FixedIncidents}
        options={{
          tabBarLabel: "Đã xử lý",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      {/* <Tab.Screen
        name="RoomsOccupied"
        component={RoomsOccupied}
        options={{
          tabBarLabel: "Đang thuê",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      /> */}
    </Tab.Navigator>
  );
}
