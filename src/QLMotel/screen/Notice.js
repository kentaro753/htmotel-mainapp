import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput, FAB, Button, Icon } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";

export default function Notice({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const NOTIFICATIONS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("NOTIFICATIONS");
  //fetch
  useEffect(() => {
    NOTIFICATIONS.orderBy("timestamp", "desc").onSnapshot((response) => {
      var arr = [];
      response.forEach((doc) => {
        arr.push(doc.data());
      });
      setData(arr);
    });
  }, []);
  const renderItem = ({ item }, key) => {
    const { icon, timestamp, sender, notification } = item;
    const date =
      timestamp instanceof firestore.Timestamp
        ? timestamp.toDate() // Chuyển Timestamp thành đối tượng Date
        : new Date(timestamp); // Nếu không phải Timestamp thì chuyển sang Date

    const formatDate = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
    const formatTime = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Dùng định dạng 24 giờ
    }).format(date);
    return (
      <TouchableOpacity key={key} style={styles.renderitem}>
        <View style={{ alignItems: "center", width: "12%", marginRight: 5 }}>
          <Icon
            source={icon}
            size={38}
            color={
              icon == "alert" || icon == "close-circle"
                ? "red"
                : icon == "file-document-outline"
                ? "#33cccc"
                : icon == "lightbulb-variant"
                ? "orange"
                : icon == "check-circle"
                ? "#00e600"
                : icon == "home-edit"
                ? "#royalblue"
                : "#595959"
            }
          />
        </View>
        <View style={{ alignItems: "flex-start", width: "87%" }}>
          <Text style={{ fontSize: 16, color: "#b3b3b3", fontStyle: "italic" }}>
            {sender}
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>
            {notification.title}
          </Text>
          <Text style={{ fontSize: 18 }}>{notification.body}</Text>
          <Text style={{ fontSize: 17, color: "#b3b3b3" }}>
            {formatDate} {formatTime}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        style={{
          flex: 1,
        }}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
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
  txtTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  renderitem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    minHeight: 80,
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  fab: {
    backgroundColor: "#00e600",
    position: "absolute",
    margin: 26,
    right: 0,
    bottom: 0,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});
