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
import { stringToDate } from "../Component/SmallComponent";

export default function Indices({ navigation, route }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [indicesData, setIndicesData] = useState([]);
  const [monthYear, setMonthYear] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  const [enablePicker, setEnablePicker] = useState(true);
  const INDICES = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("INDICES");

  //fetch
  useEffect(() => {
    INDICES.onSnapshot((response) => {
      var arr = [];
      response.forEach((doc) => {
        const data = doc.data();
        if (data.id != null) {
          arr.push(data);
        }
      });
      arr.sort((a, b) => {
        const dateA = stringToDate(a.createDay);
        const dateB = stringToDate(b.createDay);
        return dateB - dateA; // descending
      });
      setData(arr);
      setIndicesData(arr);
    });
  }, [userLogin]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ flexDirection: "row" }} onPress={showPicker}>
          <Text style={{ fontSize: 19, color: "#fff" }}>
            {formatMonthYear(monthYear)}
          </Text>
          <Icon source="calendar-month" size={25} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [monthYear]);

  useEffect(() => {
    if (route.params?.monthYear) {
      setMonthYear(new Date(route.params.monthYear));
      setEnablePicker(false);
    }
  }, [route.params?.monthYear]);

  useEffect(() => {
    // Lọc dữ liệu dựa trên thuộc tính monthYear
    setIndicesData(
      data.filter((s) => s.monthYear === formatMonthYear(monthYear))
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
        onPress={() => {
          navigation.navigate("IndiceDetail", { item: item });
        }}
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

  const showPicker = () => {
    if (enablePicker) setStartOpen(true);
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
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Danh sách chốt {formatMonthYear(monthYear)}
          </Text>
        </View>
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={indicesData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={<View style={{ height: 90 }}></View>}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddIndice")}
      />
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
  smtxt: { fontSize: 15.5, color: "#666666" },
  txtTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
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
