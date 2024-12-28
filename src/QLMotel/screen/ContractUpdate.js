import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Icon, Text, Button, TextInput, IconButton } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import DatePicker from "react-native-date-picker";
import {
  formatWithDots,
  dateToString,
  stringToDate,
} from "../Component/SmallComponent";
import { Picker } from "@react-native-picker/picker";
import { now } from "moment";

export default function ContractUpdate({ navigation, route }) {
  const { id } = route.params;
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState({});
  const [startDay, setStartDay] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  const [endDay, setEndDay] = useState(null);
  const [payStart, setPayStart] = useState(new Date());
  const [endOpen, setEndOpen] = useState(false);
  const [chuki, setChuki] = useState(1);
  const [loading, setLoading] = useState(true);

  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("CONTRACTS");
  const handleUpdateContract = () => {
    CONTRACTS.doc(id)
      .update({
        endDay: dateToString(endDay),
        chuki: chuki,
      })
      .then(() => {
        Alert.alert("Cập nhật hợp đồng thành công");
        navigation.goBack();
      })
      .catch((e) => {
        Alert.alert(e.message);
      });
  };
  useEffect(() => {
    const loadContract = CONTRACTS.doc(id).onSnapshot((response) => {
      const cData = response.data();
      if (cData) {
        setData(cData);
        setChuki(cData.chuki);
        setStartDay(stringToDate(cData.startDay));
        setPayStart(stringToDate(cData.payStart));
        if (cData.endDay != "") setEndDay(stringToDate(cData.endDay));
        setLoading(false); // Data has been loaded
      } else {
        setLoading(false); // Data not found, stop loading
      }
    });
    return () => loadContract();
  }, [id]);

  useEffect(() => {
    const stringDayNow = dateToString(new Date());
    const dateOnly = stringToDate(stringDayNow);
    if (endDay && endDay < startDay) {
      Alert.alert("Lỗi", "Ngày kết thúc không thể nhỏ hơn ngày bắt đầu.");
      setEndDay(startDay);
    }
    if (endDay && endDay < payStart) {
      Alert.alert(
        "Lỗi",
        "Ngày kết thúc không thể nhỏ hơn bắt đầu thanh toán hóa đơn."
      );
      setEndDay(payStart);
    }
    if (endDay && endDay < dateOnly) {
      Alert.alert("Lỗi", "Ngày kết thúc không thể nhỏ hơn ngày hiện tại.");
      setEndDay(new Date());
    }
  }, [startDay, endDay]);
  const renderContractInfo = () => (
    <View style={styles.contractInfo}>
      <Text style={styles.boldText}>#{id}</Text>
      <Text style={styles.smtxt}>
        <Icon source="home-account" size={20} color="#666666" />
        {data.room?.name}
      </Text>
      <Text style={styles.smtxt}>
        <Icon source="account" size={20} color="#666666" />
        Người thuê chính: {data.renter?.name}
      </Text>
    </View>
  );
  const renderDetailRow = (label, value) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <Text style={styles.detailText}>{label}</Text>
      </View>
      <View style={styles.detailValue}>
        <Text style={styles.detailValueText}>{value}</Text>
      </View>
    </View>
  );
  if (loading) {
    return <Text>Loading...</Text>; // Or any loading spinner component
  } else if (!data) {
    return <Text>Error: Contract data is not available.</Text>; // Handle case where data is unavailable
  } else {
    return (
      <View style={styles.container}>
        {renderContractInfo()}
        <Text variant="headlineSmall" style={styles.txt}>
          Ngày bắt đầu
        </Text>
        <View style={{ margin: 10, marginHorizontal: 15 }}>
          <TouchableOpacity style={{ flexDirection: "row" }} disabled>
            <Text style={{ fontSize: 19 }}>
              {startDay.toLocaleDateString()}{" "}
            </Text>
            <Icon source="calendar-month" size={25} />
          </TouchableOpacity>
        </View>
        <DatePicker
          title="Ngày bắt đầu"
          confirmText="Chọn"
          cancelText="Hủy"
          mode="date"
          modal
          open={startOpen}
          date={startDay}
          onConfirm={(date) => {
            setStartOpen(false);
            setStartDay(date);
          }}
          onCancel={() => {
            setStartOpen(false);
          }}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Ngày kết thúc
        </Text>
        <View style={{ margin: 10, marginHorizontal: 15 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              paddingBottom: 10,
              borderBottomWidth: 1,
              marginBottom: 10,
            }}
            onPress={() => setEndOpen(true)}
          >
            <Text style={{ fontSize: 19 }}>
              {endDay
                ? endDay.toLocaleDateString() + " "
                : "Chưa chọn ngày kết thúc "}
            </Text>
            <Icon source="calendar-month" size={25} />
            {endDay ? (
              <IconButton
                icon="minus-box"
                size={25}
                style={{ top: -15, marginBottom: 0 }}
                iconColor="red"
                onPress={() => setEndDay(null)}
              />
            ) : null}
          </TouchableOpacity>
        </View>
        <DatePicker
          title="Ngày kết thúc"
          confirmText="Chọn"
          cancelText="Hủy"
          mode="date"
          modal
          open={endOpen}
          date={endDay || new Date()}
          onConfirm={(date) => {
            setEndDay(date);
            setEndOpen(false);
          }}
          onCancel={() => {
            setEndOpen(false);
          }}
        />
        {renderDetailRow(
          "Tiền phòng",
          `${formatWithDots(data.room?.price.toString())} đ`
        )}
        {renderDetailRow(
          "Tiền cọc",
          `${formatWithDots(data.tiencoc.toString())} đ`
        )}
        <Text variant="headlineSmall" style={styles.txt}>
          Chu kì thanh toán tiền phòng
        </Text>
        <Picker
          selectedValue={chuki}
          onValueChange={(itemValue) => {
            setChuki(itemValue);
          }}
        >
          <Picker.Item label="1 tháng" value={1} />
          <Picker.Item label="2 tháng" value={2} />
          <Picker.Item label="3 tháng" value={3} />
          <Picker.Item label="4 tháng" value={4} />
          <Picker.Item label="5 tháng" value={5} />
          <Picker.Item label="6 tháng" value={6} />
          <Picker.Item label="12 tháng" value={12} />
        </Picker>
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "50%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={handleUpdateContract}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Cập nhật hợp đồng
          </Text>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    margin: 10,
  },
  contractInfo: {
    alignItems: "flex-start",
  },
  txt: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "bold",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
    backgroundColor: "#ffaa80",
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  smtxt: {
    fontSize: 17,
    color: "#666666",
    fontWeight: "bold",
    marginVertical: 10,
  },
  txtInput: {
    height: 40,
    width: 100,
    marginTop: 0,
    backgroundColor: "none",
    borderBottomWidth: 1,
  },
  detailRow: {
    flexDirection: "row",
    marginHorizontal: 10,
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
