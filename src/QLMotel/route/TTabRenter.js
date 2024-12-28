import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Renters from "../screen/Renters";
import RentersDeactivate from "../screen/RentersDeactivate";

const Tab = createMaterialTopTabNavigator();

export default function TopTabNavigator({ route }) {
  const initialRouteName = route.params?.initialRouteName || "Renters";

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
        name="Renters"
        component={Renters}
        options={{
          tabBarLabel: "Đang hoạt động",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="RentersDeactivate"
        component={RentersDeactivate}
        options={{
          tabBarLabel: "Đã thanh lý",
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
