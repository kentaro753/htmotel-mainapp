import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Icon,
  IconButton,
  Text,
  TextInput,
  FAB,
  Button,
} from "react-native-paper";
import { login, useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import Modal from "react-native-modal";

export default function ActiveContract({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [contractData, setContractData] = useState([]);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [selectItem, setSelectItem] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("ROOMS");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("RENTERS");
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("CONTRACTS");

  //fetch
  useEffect(() => {
    CONTRACTS.where("active", "==", true).onSnapshot((response) => {
      var arr = [];
      response.forEach((doc) => {
        doc.data().id != null && arr.push(doc.data());
      });
      setData(arr);
      setContractData(arr);
    });
  }, []);
  useEffect(() => {
    setContractData(
      data.filter(
        (s) =>
          s.id.includes(name) ||
          s.room.name.includes(name) ||
          s.renter.name.includes(name)
      )
    );
  }, [name]);
  const renderItem = ({ item }) => {
    const { id, endDay, startDay, renter, room } = item;

    return (
      <TouchableOpacity
        style={styles.ctitem}
        onPress={() => {
          navigation.navigate("ContractDetail", { item: item });
        }}
      >
        <View
          style={{
            alignItems: "center",
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>#{id}</Text>
          <Text style={styles.smtxt}>
            <Icon source="home-account" size={20} color="#666666" />
            {room.name}
          </Text>
          <Text style={styles.smtxt}>
            <Icon source="calendar-month" size={20} color="#666666" />
            Từ {startDay} đến {endDay == "" ? "Chưa xác định thời hạn" : endDay}
          </Text>
          <Text style={styles.smtxt}>
            <Icon source="account" size={20} color="#666666" />
            Người thuê chính : {renter.name}
          </Text>
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
          value={name}
          onChangeText={setName}
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
          <Text style={styles.headerText}>Danh sách hợp đồng</Text>
        </View>
      </View>
      <FlatList
        style={{
          flex: 1,
        }}
        data={contractData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddContract")}
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
    //color: '#fff',
  },
  smtxt: { fontSize: 15.5, color: "#666666" },
  txtTitle: {
    fontSize: 18,
    fontWeight: "bold",
    //color: '#fff',
    marginBottom: 10,
  },
  ctitem: {
    flexDirection: "row",
    borderWidth: 1,
    minHeight: 80,
    //borderRadius: 10,
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
  scrollViewContent: {
    flexGrow: 1,
    //justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#cce6ff",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  mbutton: {
    width: "90%",
    margin: 5,
    borderWidth: 0.9,
    borderColor: "#1a75ff",
    fontSize: 18,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
  },
});
