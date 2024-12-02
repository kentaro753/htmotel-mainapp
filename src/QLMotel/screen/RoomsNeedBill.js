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
import moment from "moment/moment";

export default function RoomsNeedBill({ navigation, route }) {
  const { onSelectRoom } = route.params || {};
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [contractData, setContractData] = useState([]);
  const [name, setName] = useState([]);
  // const [monthYear, setMonthYear] = useState(new Date());
  // const [selectItem, setSelectItem] = useState({});
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("ROOMS");
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
    setContractData(data.filter((s) => s.room.name.includes(name)));
  }, [name]);
  useEffect(() => {
    // Lọc dữ liệu dựa trên thuộc tính monthYear
    setContractData(
      data.filter((s) =>
        checkMonthYear(
          route.params.monthYear,
          s.chuki,
          s.billMonthYear,
          s.payStart
        )
      )
    );
  }, [route.params.monthYear, data]);
  const renderItem = ({ item }) => {
    const { room, id } = item;
    return (
      <TouchableOpacity
        style={styles.roomitem}
        onPress={() =>
          onSelectRoom ? onSelectRoom(item) && navigation.goBack() : null
        }
      >
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{room?.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, color: "#4da6ff" }}>Đang thuê</Text>
          <Icon source="chevron-right" size={35} />
        </View>
      </TouchableOpacity>
    );
  };
  const dateToString = (date) => {
    return moment(date).format("DD/MM/YYYY");
  };

  const stringToDate = (dateString) => {
    return moment(dateString, "DD/MM/YYYY").toDate();
  };
  const stringToMonthYear = (dateString) => {
    return moment(dateString, "M/YYYY").startOf("month").toDate();
  };
  const formatMonthYear = (date) => {
    const month = date.getMonth() + 1; // months are zero-indexed
    const year = date.getFullYear();
    return `${month}/${year}`;
  };
  const checkMonthYear = (date, chuki, billMonthYear, payStart) => {
    if (billMonthYear == "") {
      const monthdate = date.getMonth();
      const monthPayStart = stringToDate(payStart).getMonth();
      if (monthdate >= monthPayStart) {
        return true;
      } else return false;
    }
    const billDate = stringToMonthYear(billMonthYear);
    console.log(date, billDate);
    const nextBillDate = moment(billDate).add(chuki, "months").toDate();
    console.log(nextBillDate);
    return date >= nextBillDate;
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ backgroundColor: "white" }}>
        <TextInput
          left={<TextInput.Icon icon="magnify" />}
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
        <View
          style={{
            height: 50,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 10,
          }}
        >
          <Text
            variant="headlineSmall"
            style={{ color: "#000", fontWeight: "bold", fontSize: 20 }}
          >
            Tên phòng
          </Text>
          <Text
            variant="headlineSmall"
            style={{ color: "#000", fontWeight: "bold", fontSize: 20 }}
          >
            Trạng thái
          </Text>
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
        onPress={() => navigation.navigate("AddRoom")}
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
  poster: {
    resizeMode: "center",
    height: 150,
    width: 150,
    borderRadius: 10,
  },
  txt: {
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 15,
    //color: '#fff',
  },
  txtTitle: {
    fontSize: 18,
    fontWeight: "bold",
    //color: '#fff',
    marginBottom: 10,
  },
  roomitem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    height: 50,
    borderRadius: 10,
    padding: 10,
    margin: 5,
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
