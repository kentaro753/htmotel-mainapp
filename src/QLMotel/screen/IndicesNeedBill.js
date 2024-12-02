import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text, FAB } from "react-native-paper";
import { login, useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";

export default function IndicesNeedBill({ navigation, route }) {
  const { onSelectIndice } = route.params || {};
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [indicesData, setIndicesData] = useState([]);
  const [monthYear, setMonthYear] = useState(new Date());
  const INDICES = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("INDICES");

  //fetch
  useEffect(() => {
    INDICES.where("room.id", "==", route.params.roomId)
      // .where("isBill", "==", false)
      .onSnapshot((response) => {
        var arr = [];
        response.forEach((doc) => {
          const data = doc.data();
          if (data.id != null) {
            arr.push(data);
          }
        });
        setData(arr);
        setIndicesData(arr);
      });
  }, [userLogin]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ flexDirection: "row" }} disabled={true}>
          <Text style={{ fontSize: 19, color: "#fff" }}>
            {formatMonthYear(route.params.monthYear)}
          </Text>
          <Icon source="calendar-month" size={25} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [monthYear]);

  useEffect(() => {
    // Lọc dữ liệu dựa trên thuộc tính monthYear
    setIndicesData(
      data.filter(
        (s) => s.monthYear === formatMonthYear(route.params.monthYear)
      )
    );
  }, [monthYear, data]);

  const formatMonthYear = (date) => {
    const month = date.getMonth() + 1; // months are zero-indexed
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const renderItem = ({ item }) => {
    const { createDay, services, room } = item;

    return (
      <TouchableOpacity
        style={styles.ctitem}
        onPress={() =>
          onSelectIndice ? onSelectIndice(item) && navigation.goBack() : null
        }
      >
        <View style={{ alignItems: "center", alignItems: "flex-start" }}>
          <Text style={styles.smtxt}>
            <Icon source="home-account" size={20} color="#666666" />
            {room?.name}
          </Text>
          <Text style={styles.smtxt}>
            <Icon source="calendar-month" size={20} color="#666666" />
            Ngày tạo: {createDay}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ backgroundColor: "white" }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Danh sách chốt {formatMonthYear(route.params.monthYear)}
          </Text>
        </View>
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={indicesData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddIndice")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flatlst: {
    flex: 1,
  },
  header: {
    height: 50,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
    paddingRight: 0,
  },
  headerText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 20,
  },
  txt: {
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 15,
  },
  smtxt: { fontSize: 15.5, color: "#666666" },

  ctitem: {
    flexDirection: "row",
    borderWidth: 1,
    minHeight: 80,
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  fab: {
    backgroundColor: "#00e600",
    position: "absolute",
    margin: 26,
    right: 0,
    bottom: 0,
  },
});
