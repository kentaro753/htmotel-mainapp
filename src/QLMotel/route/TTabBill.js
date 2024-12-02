import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Bills from "../screen/Bills";
import BillsOutdate from "../screen/BillsOutdate";
import BillsPaid from "../screen/BillsPaid";

const Tab = createMaterialTopTabNavigator();

export default function TopTabNavigator({ route }) {
  const initialRouteName = route.params?.initialRouteName || "Bills";

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff",
        },
        tabBarActiveTintColor: "#ff3300",
        tabBarInactiveTintColor: "black",
        tabBarIndicatorStyle: {
          backgroundColor: "#ff3300",
        },
      }}
    >
      <Tab.Screen
        name="Bills"
        component={Bills}
        options={{
          tabBarLabel: "Chưa quá hạn",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="BillsOutdate"
        component={BillsOutdate}
        options={{
          tabBarLabel: "Đã quá hạn",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="BillsPaid"
        component={BillsPaid}
        options={{
          tabBarLabel: "Đã thanh toán",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
    </Tab.Navigator>
  );
}
