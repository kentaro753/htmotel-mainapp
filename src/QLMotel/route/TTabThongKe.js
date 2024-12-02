import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import RoomsEmpty from "../screen/RoomsEmpty";
import TKThu from "../screen/TKThu";
import TKChi from "../screen/TKChi";

const Tab = createMaterialTopTabNavigator();

export default function TopTabNavigator( route ) {

  const monthYear = route.monthYear || new Date();
  const initialRouteName = route.initialRouteName || "income";
  useEffect(() => {
    console.log("Month Year:", monthYear);
    console.log("route:", route);
  }, [monthYear]);
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
        name="income"
        component={TKThu}
        initialParams={{ monthYear }} // Truyền monthYear vào component TKThu
        options={{
          tabBarLabel: "Khoảng thu",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name="expense"
        component={TKChi}
        initialParams={{ monthYear }}
        options={{
          tabBarLabel: "Khoảng chi",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
        }}
      />
    </Tab.Navigator>
  );
}
