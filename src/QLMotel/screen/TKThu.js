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

export default function TKThu({ navigation, route }) {
  const monthYear = route?.params.monthYear || new Date();
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [thuchiData, setThuChiData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalItems, setModalItems] = useState([]);
  const THUCHIS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("THUCHIS");
  //fetch
  useEffect(() => {
    THUCHIS.where("type", "==", true)
      .orderBy("date", "desc")
      .onSnapshot((response) => {
        if (!response || response.empty) {
          console.log("No data found");
          return;
        }
        const tempData = {};

        // Gom nhóm các mục theo date và tính tổng thu chi
        response.forEach((doc) => {
          const data = doc.data();
          if (data.id != null) {
            const date = data.date;
            const [sDay, sMonth, sYear] = date.split("/").map(Number);
            // Nếu date chưa có trong tempData, tạo một mảng và các biến tổng thu chi
            if (!tempData[date]) {
              tempData[date] = {
                monthYear: sMonth + "/" + sYear,
                items: [],
                totalThu: 0,
                totalChi: 0,
              };
            }

            // Thêm dữ liệu vào nhóm tương ứng
            tempData[date].items.push(data);

            // Tính tổng thu chi
            if (data.type === true) {
              tempData[date].totalThu += data.money; // Tiền thu
            } else {
              tempData[date].totalChi += data.money; // Tiền chi
            }
          }
        });

        // Chuyển đổi tempData thành mảng
        const groupedData = Object.keys(tempData).map((date) => ({
          date: date,
          monthYear: tempData[date].monthYear,
          items: tempData[date].items,
          totalThu: tempData[date].totalThu,
          totalChi: tempData[date].totalChi,
        }));

        console.log(monthYear);
        setData(groupedData);
        setThuChiData(groupedData);
      });
  }, []);

  useEffect(() => {
    // Lọc dữ liệu dựa trên thuộc tính monthYear
    setThuChiData(
      data.filter((s) => s.monthYear === formatMonthYear(monthYear))
    );
  }, [monthYear, data]);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const openModal = (items) => {
    setModalItems(items);
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setModalItems([]);
    setIsModalVisible(false);
  };
  const formatMonthYear = (date) => {
    const month = date.getMonth() + 1; // months are zero-indexed
    const year = date.getFullYear();
    return `${month}/${year}`;
  };
  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const getWeekday = (dateString) => {
    // Chuyển đổi chuỗi ngày thành đối tượng Date
    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day); // Tháng trong Date bắt đầu từ 0

    // Mảng các ngày trong tuần
    const weekdays = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];

    // Lấy chỉ số ngày trong tuần và ánh xạ đến tên ngày
    return weekdays[date.getDay()];
  };
  const renderItem = ({ item }) => {
    const { date, monthYear, items, totalChi, totalThu } = item;
    const [sDay, sMonth, sYear] = date.split("/").map(Number);
    const sum = totalThu - totalChi;
    const itemCount = items.length;
    return (
      <TouchableOpacity
        style={styles.ctitem}
        onPress={() => {
          itemCount == 1
            ? navigation.navigate("ThuChiDetail", { item: items[0] })
            : openModal(items);
        }}
      >
        <View style={{ alignItems: "center", alignItems: "flex-start" }}>
          <View
            style={{
              ...styles.detailRow,
              borderBottomWidth: 1,
              paddingBottom: 9,
            }}
          >
            <View style={{ ...styles.detailLabel, flexDirection: "row" }}>
              <Text
                style={{
                  ...styles.boldText,
                  color: "orange",
                  fontSize: 34,
                  width: 40,
                  textAlign: "center",
                }}
              >
                {sDay}
              </Text>
              <View>
                <Text
                  style={{
                    fontSize: 17,
                  }}
                >
                  {getWeekday(date)}
                </Text>
                <Text
                  style={{
                    fontSize: 17,
                  }}
                >
                  tháng {monthYear}
                </Text>
              </View>
            </View>
            <View style={styles.detailValue}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 19,
                  color: sum >= 0 ? "black" : "red",
                  top: 10,
                }}
              >
                {sum >= 0 ? "" : "-"}
                {formatWithDots(sum.toString())} đ
              </Text>
            </View>
          </View>
          {items.map((item, index) => {
            return renderMiniItem(item, index);
          })}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMiniItem = (item, index) => {
    const { group, target, money, type } = item;

    return (
      <View style={{ ...styles.detailRow, paddingTop: 9 }} key={index}>
        <View
          style={{
            width: "60%",
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontSize: 18, color: "#000", fontWeight: "bold" }}>
            {group}
          </Text>
          <Text style={{ fontSize: 16, color: "#b3b3b3" }}>{target.name}</Text>
        </View>

        <View
          style={{
            width: "40%",
            alignItems: "flex-end",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              top: 10,
              color: type ? "#000" : "red",
            }}
          >
            {type ? "" : "-"}
            {formatWithDots(money.toString())} đ
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        style={{ flex: 1 }}
        data={thuchiData}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddThuChi")}
      />
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              {modalItems.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      paddingVertical: 13,
                      borderBottomWidth: 1,
                    }}
                    onPress={() => {
                      navigation.navigate("ThuChiDetail", { item: item });
                      closeModal();
                    }}
                  >
                    {renderMiniItem(item, index)}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          <Button
            onPress={closeModal}
            style={{
              backgroundColor: "royalblue",
              width: "100%",
              alignSelf: "center",
              borderRadius: 0,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 22 }}>
              Dismiss
            </Text>
          </Button>
        </View>
      </Modal>
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
  boldText: { fontSize: 18, fontWeight: "bold" },
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
    flex: 1,
    backgroundColor: "white",
    padding: 20,
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
  detailRow: {
    flexDirection: "row",
  },
  detailLabel: {
    width: "40%",
    alignItems: "flex-start",
  },
  detailValue: {
    width: "60%",
    alignItems: "flex-end",
  },
  detailText: {
    fontSize: 17,
    color: "#000",
  },
  detailValueText: {
    fontWeight: "bold",
    fontSize: 19,
    color: "#000",
  },
});
