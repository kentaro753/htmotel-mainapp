import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ThuGroup from "../screen/ThuGroup";
import ChiGroup from "../screen/ChiGroup";

const Tab = createMaterialTopTabNavigator();

export default function TopTabNavigator({ route }) {
  const { onSelectGroup } = route.params || {};
  const initialRouteName = route.params?.initialRouteName || "ThuGroup";

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
        name="ThuGroup"
        component={ThuGroup}
        initialParams={{ onSelectGroup }}
        options={{
          tabBarLabel: "Khoản thu",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="ChiGroup"
        component={ChiGroup}
        initialParams={{ onSelectGroup }}
        options={{
          tabBarLabel: "Khoản chi",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
    </Tab.Navigator>
  );
}
