import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { Button, Icon, IconButton, Text, TextInput } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import DatePicker from "react-native-date-picker";
import moment from "moment";

export default function UpdateBill({ navigation, route }) {
  const { id } = route.params;
  const [controller, dispatch] = useMyContextProvider();
  const [service, setService] = useState([]);
  const [data, setData] = useState({});
  const [indiceData, setIndiceData] = useState({});
  const [includeService, setIncludeService] = useState([]);
  const [startDay, setStartDay] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  const [endDay, setEndDay] = useState(new Date());
  const [endOpen, setEndOpen] = useState(false);
  const [monthYear, setMonthYear] = useState(new Date());
  const [renterCount, setRenterCount] = useState(0);
  const [servicePrice, setServicePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [sum, setSum] = useState(0);
  const [loading, setLoading] = useState(true);
  const { userLogin } = controller;
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("SERVICES");
  const INDICES = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("INDICES");
  const BILLS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("BILLS");
  const [serviceIndices, setServiceIndices] = useState({});

  const handleUpdateBill = () => {
    BILLS.doc(id)
      .update({
        discount: discount || 0,
        startDay: dateToString(startDay),
        endDay: dateToString(endDay),
        totalPaid: sum || 0,
        userId: userLogin.email,
      })
      .then(() => {
        Alert.alert("Cập nhật hóa đơn thành công");
        navigation.goBack();
      })
      .catch((e) => {
        Alert.alert(e.message);
      });
  };
  useEffect(() => {
    const loadBill = BILLS.doc(id).onSnapshot((response) => {
      const billData = response.data();
      console.log(billData);
      setData(billData);
      setDiscount(billData.discount);
      setStartDay(stringToDate(billData.startDay));
      setEndDay(stringToDate(billData.endDay));
      setLoading(false);
    });

    return () => loadBill();
  }, [id]);

  useEffect(() => {
    if (data?.indiceId) {
      const loadIndice = INDICES.doc(data.indiceId).onSnapshot(
        (response) => {
          const data = response.data();
          setIndiceData(data);
          setService(data.services);
          setRenterCount(data.renterCount);
          setServiceIndices(
            data.services.reduce((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {})
          );
        },
        (error) => {
          console.error(error);
        }
      );
      return () => loadIndice();
    }
  }, [data]);

  const stringToDate = (dateString) => {
    return moment(dateString, "DD/MM/YYYY").toDate();
  };
  const handleInputChange = (serviceId, key, value) => {
    setServiceIndices((prevState) => ({
      ...prevState,
      [serviceId]: {
        ...prevState[serviceId],
        [key]: value,
      },
    }));
  };
  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const renderBillInfo = () => (
    <View style={styles.contractInfo}>
      <View style={styles.detailRow}>
        <View style={styles.detailLabel}>
          <Text style={styles.boldText}>#{id}</Text>
        </View>
        <View style={styles.detailValue}>
          <Text style={styles.boldText}>
            {data.monthYear}{" "}
            <Icon source="calendar-month" size={22} color="#000" />
          </Text>
        </View>
      </View>
      <Text style={styles.smtxt}>
        <Icon source="home-account" size={20} color="#666666" />
        {data.room?.name} - Mã hợp đồng: {data.contractId}
      </Text>
      <Text style={styles.smtxt}>
        <Icon source="book-clock" size={20} color="#666666" /> Tiền phòng từ{" "}
        {data.payStart} đến {data.payEnd}
      </Text>
      <Text style={styles.smtxt}>
        <Icon source="book-clock" size={20} color="#666666" /> Tiền dịch vụ từ{" "}
        {data.payStart} đến {data.payEnd} và tiền điện nước (nếu có) đã sử dụng
        trước đó
      </Text>
    </View>
  );
  const renderItem = ({ item }) => {
    const { serviceName, icon, fee, chargeBase, chargeType, roomName } = item;
    const currentServiceIndices = serviceIndices[item.id] || {};

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ fontWeight: "bold", fontSize: 15, marginRight: 10 }}>
              {serviceName}
            </Text>
            <Text>
              {formatWithDots(fee.toString())} đ/{chargeBase}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Icon source={icon} size={65} />
            {chargeType === 1 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "67%",
                }}
              >
                <View>
                  <Text>Chỉ số cũ</Text>
                  <TextInput
                    keyboardType="numeric"
                    underlineColor="transparent"
                    value={currentServiceIndices.oldValue?.toString() || "0"}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "oldValue", text)
                    }
                    style={styles.txtInput}
                    disabled={true}
                  />
                </View>
                <View>
                  <Text>
                    Chỉ số mới <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    underlineColor="transparent"
                    value={currentServiceIndices.newValue?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "newValue", text)
                    }
                    style={styles.txtInput}
                    disabled={true}
                  />
                </View>
              </View>
            ) : chargeType === 2 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <Text style={{ alignSelf: "center", fontSize: 17 }}>
                  Theo phòng
                </Text>
              </View>
            ) : chargeType === 3 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <Text style={{ alignSelf: "center", fontSize: 17 }}>
                  Theo số người thuê
                </Text>
              </View>
            ) : chargeType === 4 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <View>
                  <Text>
                    Số lần sử dụng <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    underlineColor="transparent"
                    value={currentServiceIndices.indexValue?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "indexValue", text)
                    }
                    style={styles.txtInput}
                    disabled={true}
                  />
                </View>
              </View>
            ) : chargeType === 5 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <View>
                  <Text>
                    Số lượng <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    underlineColor="transparent"
                    value={currentServiceIndices.indexValue?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "indexValue", text)
                    }
                    style={styles.txtInput}
                    disabled={true}
                  />
                </View>
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text>Thành tiền </Text>
            <Text>
              {chargeType == 1 &&
              currentServiceIndices.newValue - currentServiceIndices.oldValue >=
                0
                ? formatWithDots(
                    (
                      (currentServiceIndices.newValue -
                        currentServiceIndices.oldValue) *
                      fee
                    ).toString()
                  )
                : chargeType == 2
                ? formatWithDots(fee.toString())
                : chargeType == 3
                ? formatWithDots((fee * renterCount).toString())
                : chargeType == 4 && currentServiceIndices.indexValue >= 0
                ? formatWithDots(
                    (fee * currentServiceIndices.indexValue).toString()
                  )
                : chargeType == 5 && currentServiceIndices.indexValue >= 0
                ? formatWithDots(
                    (fee * currentServiceIndices.indexValue).toString()
                  )
                : 0}{" "}
              đ
            </Text>
          </View>
        </View>
      </View>
    );
  };
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
  const dateToString = (date) => {
    if (!date) {
      return "";
    }
    return moment(date).format("DD/MM/YYYY");
  };
  useEffect(() => {
    console.log("Updated Month/Year:", monthYear);
  }, [monthYear]);
  useEffect(() => {
    if (startDay) {
      const newEndDay = new Date(startDay);
      newEndDay.setDate(newEndDay.getDate() + 10);
      setEndDay(newEndDay);
    }
  }, []);
  useEffect(() => {
    if (endDay && endDay < startDay) {
      Alert.alert("Lỗi", "Hạn thanh toán không thể nhỏ hơn ngày thanh toán.");
      setEndDay(startDay);
    }
  }, [startDay, endDay]);
  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;
      total = data.servicePrice + data.roomCharge - discount;
      setSum(total > 0 ? total : 0);
    };

    calculateTotal();
  }, [data, discount]);
  if (!loading)
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
        {renderBillInfo()}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "50%", alignSelf: "flex-start" }}>
              <Text variant="headlineSmall" style={styles.txt}>
                Ngày thanh toán
              </Text>
              <View style={{ margin: 10, marginHorizontal: 15 }}>
                <TouchableOpacity
                  style={{ flexDirection: "row" }}
                  onPress={() => setStartOpen(true)}
                >
                  <Text style={{ fontSize: 19 }}>
                    {startDay.toLocaleDateString((locale = "vi"))}{" "}
                  </Text>
                  <Icon source="calendar-month" size={25} />
                </TouchableOpacity>
              </View>
              <DatePicker
                title="Ngày thanh toán"
                confirmText="Chọn"
                cancelText="Hủy"
                mode="date"
                locale="vi"
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
            </View>
            <View style={{ width: "50%", alignSelf: "flex-end" }}>
              <Text
                variant="headlineSmall"
                style={{ ...styles.txt, marginLeft: 0 }}
              >
                Hạn thanh toán
              </Text>
              <View style={{ margin: 10, marginHorizontal: 15 }}>
                <TouchableOpacity
                  style={{ flexDirection: "row" }}
                  onPress={() => setEndOpen(true)}
                >
                  <Text style={{ fontSize: 19 }}>
                    {endDay.toLocaleDateString((locale = "vi"))}{" "}
                  </Text>
                  <Icon source="calendar-month" size={25} />
                </TouchableOpacity>
              </View>
              <DatePicker
                title="Hạn thanh toán"
                confirmText="Chọn"
                cancelText="Hủy"
                mode="date"
                locale="vi"
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
            </View>
          </View>
          <View
            style={{
              ...styles.txt,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              variant="headlineSmall"
              style={{
                color: "#fff",
                fontSize: 21,
                fontWeight: "bold",
                textShadowColor: "rgba(0, 0, 0, 0.75)",
                textShadowOffset: { width: -1, height: 1 },
                textShadowRadius: 10,
                top: 2,
              }}
            >
              Dịch vụ
            </Text>

            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 21,
                  fontWeight: "bold",
                  textShadowColor: "rgba(0, 0, 0, 0.75)",
                  textShadowOffset: { width: -1, height: 1 },
                  textShadowRadius: 10,
                  top: 6,
                }}
              >
                {indiceData.createDay + " "}
              </Text>
              <IconButton
                icon="database-clock"
                size={25}
                style={{
                  margin: 0,
                  alignItems: "flex-end",
                }}
              />
            </View>
          </View>
          <FlatList
            data={service}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.flatlst}
            scrollEnabled={false}
          />
          <Text variant="headlineSmall" style={styles.txt}>
            Tổng hợp
          </Text>
          <View
            style={{
              margin: 10,
              marginHorizontal: 15,
              justifyContent: "center",
            }}
          >
            {renderDetailRow(
              "Tiền phòng",
              `${formatWithDots(data?.roomCharge.toString())} đ`
            )}

            {renderDetailRow(
              "Tiền dịch vụ",
              `${formatWithDots(data?.servicePrice.toString())} đ`
            )}
            <View
              style={{ ...styles.detailRow, justifyContent: "space-between" }}
            >
              <View style={styles.detailLabel}>
                <Text style={styles.detailText}>Giảm giá</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0"
                  underlineColor="transparent"
                  value={discount.toString()}
                  onChangeText={(text) => setDiscount(Number(text))}
                  textAlignVertical="right"
                  style={{
                    ...styles.txtInput,
                    backgroundColor: "#fff",
                    height: 30,
                    textAlign: "right",
                  }}
                />
                <Text style={styles.detailValueText}> đ</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Text style={{ ...styles.detailText, color: "red" }}>
                  Tổng tiền
                </Text>
              </View>
              <View style={styles.detailValue}>
                <Text style={{ ...styles.detailValueText, color: "red" }}>
                  {formatWithDots(sum.toString())} đ
                </Text>
              </View>
            </View>
          </View>
          <Button
            style={{
              backgroundColor: "#ff3300",
              width: "50%",
              alignSelf: "center",
              marginVertical: 20,
            }}
            onPress={handleUpdateBill}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Cập nhật hóa đơn
            </Text>
          </Button>
        </View>
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  contractInfo: {
    paddingBottom: 5,
    borderBottomWidth: 1,
    margin: 10,
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
  smtxt: {
    fontSize: 17,
    color: "#666666",
    fontWeight: "bold",
    marginVertical: 10,
  },
  boldText: { fontSize: 18, fontWeight: "bold" },
  txtInput: {
    height: 40,
    width: 100,
    marginTop: 0,
    backgroundColor: "none",
    borderBottomWidth: 1,
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
  itemContainer: {
    backgroundColor: "white",
    marginVertical: 10,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 15,
    shadowOffset: {
      height: 0.5,
      width: 0.5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  itemContent: {
    marginHorizontal: 10,
    padding: 10,
  },
  selectionText: {
    fontSize: 17,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 10,
    borderRadius: 5,
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
