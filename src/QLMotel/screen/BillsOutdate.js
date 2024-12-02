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
import MonthYearPicker from "react-native-month-year-picker";
import ItemBill from "../Component/ItemBill";
import { formatMonthYear } from "../Component/SmallComponent";

export default function BillsOutdate({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [billsData, setBillsData] = useState([]);
  const [name, setName] = useState("");
  const [monthYear, setMonthYear] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  const BILLS = firestore()
  .collection("USERS")
  .doc(userLogin.role == "admin" ? userLogin.email : userLogin.admin)
  .collection("BILLS");

//fetch
useEffect(() => {
  if (userLogin.role == "admin") {
    BILLS.where("state", "==", 1).onSnapshot((response) => {
      var arr = [];
      response.forEach((doc) => {
        const data = doc.data();
        if (data.id != null) {
          arr.push(data);
        }
      });
      setData(arr);
      setBillsData(arr);
    });
  }
  else if (userLogin.role == "renter") {
    BILLS.where("renterId", "==", userLogin.renterId).where("state", "==", 1).onSnapshot((response) => {
      var arr = [];
      response.forEach((doc) => {
        const data = doc.data();
        if (data.id != null) {
          arr.push(data);
        }
      });
      setData(arr);
      setBillsData(arr);
    });
  }
}, [userLogin]);

  useEffect(() => {
    // Lọc dữ liệu dựa trên thuộc tính monthYear
    setBillsData(
      data.filter((s) => s.monthYear === formatMonthYear(monthYear))
    );
  }, [monthYear, data]);

  const showPicker = () => {
    setStartOpen(true);
  };

  const onValueChange = (event, newDate) => {
    setStartOpen(false);
    if (newDate !== undefined) {
      setMonthYear(newDate);
    }
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
          <Text style={styles.headerText}>Danh sách Hóa đơn</Text>
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={showPicker}
          >
            <Text style={styles.headerText}>
              : {formatMonthYear(monthYear)}
            </Text>
            <Icon source="calendar-month" size={25} />
          </TouchableOpacity>
        </View>
      </View>
      {billsData.map((item, index) => (
        <ItemBill item={item} key={index} navigation={navigation} />
      ))}
      {userLogin.role == "admin" && (
        <FAB
          icon="plus"
          style={styles.fab}
          color="#fff"
          onPress={() => navigation.navigate("AddBill")}
        />
      )}
      {startOpen && (
        <MonthYearPicker
          onChange={onValueChange}
          value={monthYear}
          minimumDate={new Date(2020, 0)}
          maximumDate={new Date()}
          locale="vi"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  smtxt: { fontSize: 15.5, color: "#666666" },
  boldText: { fontSize: 18, fontWeight: "bold" },
  fab: {
    backgroundColor: "#00e600",
    position: "absolute",
    margin: 26,
    right: 0,
    bottom: 0,
  },
});
