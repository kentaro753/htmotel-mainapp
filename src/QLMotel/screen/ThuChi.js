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
  RadioButton,
} from "react-native-paper";
import { login, useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import Modal from "react-native-modal";
import MonthYearPicker from "react-native-month-year-picker";
import { stringToDate } from "../Component/SmallComponent";

export default function ThuChi({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [thuchiData, setThuChiData] = useState([]);
  const [tienThu, setTienThu] = useState(0);
  const [tienChi, setTienChi] = useState(0);
  const [tongTC, setTongTC] = useState(0);
  const [loadTC, setLoadTC] = useState(false);
  const [monthYear, setMonthYear] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filterTC, setFilterTC] = useState("all");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [modalItems, setModalItems] = useState([]);
  const BILLS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("BILLS");
  const THUCHIS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("THUCHIS");
  //fetch
  useEffect(() => {
    THUCHIS.orderBy("date", "desc").onSnapshot((response) => {
      const tempData = {};
      response.forEach((doc) => {
        const data = doc.data();
        if (filterTC == "all") {
          if (data.id != null) {
            const date = data.date;
            const [sDay, sMonth, sYear] = date.split("/").map(Number);
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
            if (data.type === true) {
              tempData[date].totalThu += data.money; // Tiền thu
            } else {
              tempData[date].totalChi += data.money; // Tiền chi
            }
          }
        } else if (filterTC == "thu") {
          if (data.id != null && data.type == true) {
            const date = data.date;
            const [sDay, sMonth, sYear] = date.split("/").map(Number);
            if (!tempData[date]) {
              tempData[date] = {
                monthYear: sMonth + "/" + sYear,
                items: [],
                totalThu: 0,
                totalChi: 0,
              };
            }
            tempData[date].items.push(data);
            tempData[date].totalThu += data.money; // Tiền chi
          }
        } else if (filterTC == "chi") {
          if (data.id != null && data.type == false) {
            const date = data.date;
            const [sDay, sMonth, sYear] = date.split("/").map(Number);
            if (!tempData[date]) {
              tempData[date] = {
                monthYear: sMonth + "/" + sYear,
                items: [],
                totalThu: 0,
                totalChi: 0,
              };
            }
            tempData[date].items.push(data);
            tempData[date].totalChi += data.money; // Tiền chi
          }
        }
      });
      const groupedData = Object.keys(tempData).map((date) => ({
        date: date,
        monthYear: tempData[date].monthYear,
        items: tempData[date].items,
        totalThu: tempData[date].totalThu,
        totalChi: tempData[date].totalChi,
      }));
      groupedData.sort((a, b) => {
        const dateA = stringToDate(a.date);
        const dateB = stringToDate(b.date);
        return dateB - dateA; // descending
      });
      console.log(JSON.stringify(groupedData, null, 2));
      setData(groupedData);
      setThuChiData(groupedData);
    });
  }, [filterTC]);
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
    setThuChiData(
      data.filter((s) => s.monthYear === formatMonthYear(monthYear))
    );
    setLoadTC(!loadTC);
  }, [monthYear, data]);
  useEffect(() => {
    if (thuchiData) {
      let Thu = 0;
      let Chi = 0;
      thuchiData.forEach((doc) => {
        Thu += doc.totalThu;
        Chi += doc.totalChi;
      });
      setTienThu(Thu);
      setTienChi(Chi);
      setTongTC(Thu - Chi);
    }
  }, [loadTC]);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const toggleFilterModal = () =>
    setIsFilterModalVisible(!isFilterModalVisible);
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
    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day); // Tháng trong Date bắt đầu từ 0
    const weekdays = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
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
        <View
          style={{
            backgroundColor: "#ffa366",
            marginHorizontal: 15,
            marginVertical: 10,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 2,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              Tiền vào
            </Text>
            <Text style={{ color: "#fff", fontSize: 21, fontWeight: "bold" }}>
              {formatWithDots(tienThu.toString())} đ
            </Text>
          </View>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderColor: "#fff",
              marginTop: 2,
              paddingBottom: 7,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              Tiền ra
            </Text>
            <Text
              style={{ color: "#ff3333", fontSize: 21, fontWeight: "bold" }}
            >
              {formatWithDots(tienChi.toString())} đ
            </Text>
          </View>
          <Text
            style={{
              color: tongTC >= 0 ? "#fff" : "#ff3333",
              fontSize: 21,
              fontWeight: "bold",
              alignSelf: "flex-end",
              paddingTop: 7,
            }}
          >
            {formatWithDots(tongTC.toString())} đ
          </Text>
        </View>
        <View style={{ ...styles.header, justifyContent: "space-between" }}>
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={toggleFilterModal}
          >
            <Icon source="menu" size={40} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={() => navigation.navigate("ThongKe")}
          >
            <Icon source="chart-box-outline" size={40} />
          </TouchableOpacity>
        </View>
      </View>

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
      {startOpen && (
        <MonthYearPicker
          onChange={onValueChange}
          value={monthYear}
          minimumDate={new Date(2020, 0)}
          maximumDate={new Date()}
          locale="vi"
        />
      )}
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View>
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
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
              Đóng
            </Text>
          </Button>
        </View>
      </Modal>
      <Modal
        isVisible={isFilterModalVisible}
        onBackdropPress={toggleFilterModal}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            padding: 20,
            alignItems: "center",
            alignSelf: "center",
            width: "50%",
          }}
        >
          <RadioButton.Group
            onValueChange={(value) => setFilterTC(value)}
            value={filterTC}
          >
            <RadioButton.Item label="Thu" value="thu" style={styles.rdbtn} />
            <RadioButton.Item label="Chi" value="chi" style={styles.rdbtn} />
            <RadioButton.Item label="Cả hai" value="all" style={styles.rdbtn} />
          </RadioButton.Group>
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
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  modalContent: {
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
  rdbtn: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#999999",
    marginTop: 5,
  },
});
