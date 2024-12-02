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
import Modal from "react-native-modal";

export default function FixedIncidents({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [incidentData, setIncidentData] = useState([]);
  const [title, setTitle] = useState("");
  const INCIDENTS = firestore()
    .collection("USERS")
    .doc(userLogin.role == "admin" ? userLogin.email : userLogin.admin)
    .collection("INCIDENTS");
  //fetch
  useEffect(() => {
    INCIDENTS.where("isFixed", "==", true).onSnapshot((response) => {
      var arr = [];
      response.forEach((doc) => {
        doc.data().id != null && arr.push(doc.data());
      });
      // Sau đó sắp xếp theo datetime từ mới nhất đến cũ nhất
      arr.sort((a, b) => b.datetime.seconds - a.datetime.seconds);
      setData(arr);
      setIncidentData(arr);
    });
  }, []);
  useEffect(() => {
    setIncidentData(data.filter((s) => s.title.includes(title)));
  }, [title]);
  const renderItem = ({ item }) => {
    const { title, datetime, level } = item;
    const date =
      datetime instanceof firestore.Timestamp
        ? datetime.toDate() // Chuyển Timestamp thành đối tượng Date
        : new Date(datetime); // Nếu không phải Timestamp thì chuyển sang Date

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
      <TouchableOpacity
        style={styles.renderitem}
        onPress={() => navigation.navigate("IncidentDetail", { item: item })}
      >
        <View style={{ alignItems: "flex-start", width: "60%" }}>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>{title}</Text>
          <Text style={{ fontSize: 17, color: "#b3b3b3" }}>
            {formatDate} {formatTime}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", width: "40%" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              source="alert"
              size={38}
              color={level == 1 ? "#00cc00" : level == 2 ? "#ffcc00" : "red"}
            />
            <Icon source="chevron-right" size={35} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ backgroundColor: "white" }}>
        <TextInput
          label={"Tìm kiếm theo tên"}
          underlineColor="transparent"
          value={title}
          onChangeText={setTitle}
          underlineStyle={0}
          style={{
            margin: 10,
            backgroundColor: "none",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderWidth: 1,
            borderColor: "grey",
          }}
        />
        <View style={styles.header}>
          <Text style={styles.headerText}>Danh sách sự cố</Text>
        </View>
      </View>
      <FlatList
        style={{
          flex: 1,
        }}
        data={incidentData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddIncident")}
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
