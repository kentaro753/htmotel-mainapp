import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import {
  Button,
  Checkbox,
  Icon,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import Modal from "react-native-modal";
import firestore from "@react-native-firebase/firestore";
import ServiceIcon from "../Component/ServiceIcon";
import DatePicker from "react-native-date-picker";

import moment from "moment";
import { dateToString, formatMonthYear, stringToDate } from "../Component/SmallComponent";

export default function ThanLyHD({ navigation, route }) {
  const { id } = route.params || {};
  const [controller, dispatch] = useMyContextProvider();
  const [service, setService] = useState([]);
  const [selectIndice, setSelectIndice] = useState({
    id: "",
    createDay: "",
  });
  const [data, setData] = useState({});
  const [room, setRoom] = useState({});
  const [indiceData, setIndiceData] = useState({});
  const [previousIndice, setPreviousIndice] = useState({});
  const [includeService, setIncludeService] = useState([]);
  const [datetime, setDatetime] = useState(new Date());
  const [startDay, setStartDay] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  const [endDay, setEndDay] = useState(new Date());
  const [endOpen, setEndOpen] = useState(false);
  const [payStart, setPayStart] = useState("");
  const [monthYear, setMonthYear] = useState(new Date());
  const [preMonthYear, setPreMonthYear] = useState("");
  const [renterCount, setRenterCount] = useState(0);
  const [servicePrice, setServicePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [sum, setSum] = useState(0);
  const [isEditing, setIsEditing] = useState(true);
  const { userLogin } = controller;
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("ROOMS");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("RENTERS");
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
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("CONTRACTS");
  const [serviceIndices, setServiceIndices] = useState({});

  const handleAddBill = async () => {
    let tempLoi = 0;
    let indiceId = "";
    const billSnapshot = await BILLS.get();
    const billCount = billSnapshot ? billSnapshot.size : 0;
    console.log(billCount);
    const billId = "B" + String(billCount + 1).padStart(5, "0");
    console.log(billId);

    tempLoi = 0;
    const servicesData = includeService.map((service) => {
      const currentServiceIndices = serviceIndices[service.id] || {};
      const renterCount = room.renters ? room.renters.length : 0;
      const data = {
        id: service.id,
        serviceName: service.serviceName,
        chargeBase: service.chargeBase,
        chargeType: service.chargeType,
        icon: service.icon,
        fee: service.fee,
      };

      if (service.chargeType === 1) {
        data.newValue = parseInt(currentServiceIndices.newValue, 10);
        data.oldValue = parseInt(currentServiceIndices.oldValue, 10) || 0;
        if (data.newValue < data.oldValue) {
          tempLoi = 1;
        }
      } else if (service.chargeType === 4 || service.chargeType === 5) {
        data.indexValue = parseInt(currentServiceIndices.indexValue, 10) || 0;
        if (data.indexValue < 0) {
          tempLoi = 2;
        }
      } else if (service.chargeType === 2) {
        data.indexValue = 1;
      } else if (service.chargeType === 3) {
        data.indexValue = renterCount;
      }

      return data;
    });

    if (tempLoi == 0) {
      const indiceData = {
        createDay: datetime.toLocaleDateString("vi"),
        editable: false,
        isLast: true,
        isBill: true,
        id: INDICES.doc().id,
        renterCount,
        monthYear: formatMonthYear(monthYear),
        room: {
          id: room.id,
          name: room.roomName,
          price: room.price,
        },
        services: servicesData,
      };
      setSelectIndice({
        id: indiceData.id,
        createDay: indiceData.createDay,
      });
      console.log(tempLoi);
      indiceId = indiceData.id;
      INDICES.doc(indiceData.id)
        .set(indiceData)
        .then(() => {
          if (previousIndice) {
            INDICES.doc(previousIndice.id).update({
              editable: false,
              isLast: false,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Lỗi", "Đã xảy ra lỗi khi lưu dữ liệu");
        });
    } else if (tempLoi == 1) {
      Alert.alert("Lỗi", "Chỉ số mới không được nhỏ hơn chỉ số cũ");
    } else if (tempLoi == 2) {
      Alert.alert("Lỗi", "Giá trị chỉ số không được nhỏ hơn 0");
    }
    if (tempLoi == 0) {
      const bData = {
        contractId: room.contract || null, // Kiểm tra giá trị null hoặc undefined
        createDay: datetime.toLocaleDateString("vi"),
        discount: discount || 0, // Đảm bảo discount có giá trị hợp lệ
        startDay: dateToString(startDay),
        endDay: dateToString(endDay),
        payStart,
        payEnd: dateToString(new Date()),
        id: billId,
        indiceId: indiceId || null,
        monthYear: formatMonthYear(monthYear),
        preMonthYear,
        room: {
          id: room.id || null,
          name: room.roomName || "Chưa đặt tên",
          price: room.price || 0,
        },
        roomCharge: calculateRoomCharge(room.price, payStart),
        servicePrice: servicePrice || 0,
        state: 0,
        totalPaid: sum || 0,
      };
      console.log(bData);
      BILLS.doc(billId)
        .set({
          contractId: room.contract || null, // Kiểm tra giá trị null hoặc undefined
          createDay: datetime.toLocaleDateString("vi"),
          discount: discount || 0, // Đảm bảo discount có giá trị hợp lệ
          startDay: dateToString(startDay),
          endDay: dateToString(endDay),
          payStart,
          payEnd: dateToString(new Date()),
          id: billId,
          indiceId: indiceId || null,
          monthYear: formatMonthYear(monthYear),
          preMonthYear,
          room: {
            id: room.id || null,
            name: room.roomName || "Chưa đặt tên",
            price: room.price || 0,
          },
          roomCharge: calculateRoomCharge(room.price, payStart),
          servicePrice: servicePrice || 0,
          state: 0,
          totalPaid: sum || 0,
          thanhLy: true,
        })
        .then((docRef) => {
          console.log(docRef);
          CONTRACTS.doc(id).update({
            billMonthYear: formatMonthYear(monthYear),
            payStart: formatNextMonth(monthYear),
            active: false,
            endDay: dateToString(new Date()),
          });
          const batch = firestore().batch();
          const renterRef = RENTERS.doc(data.renter.id);
          const roomRef = ROOMS.doc(room.id);
          room.renters.forEach((renterId) => {
            const rRef = RENTERS.doc(renterId);
            batch.update(rRef, {
              room: {
                contract: "",
                id: "",
                name: "",
              },
            });
          });
          batch.update(renterRef, {
            contracts: firestore.FieldValue.arrayRemove(id),
          });
          batch.update(roomRef, {
            contract: "",
            renters: [],
            requests: [],
            state: true,
          });

          return batch.commit();
        })
        .then(() => {
          Alert.alert("Tạo hóa đơn mới thành công");
          navigation.goBack();
        })
        .catch((e) => {
          Alert.alert(e.message);
        });
    }
  };
  useEffect(() => {
    const loadContract = CONTRACTS.doc(id).onSnapshot((response) => {
      const cData = response.data();
      console.log(cData);
      setData(cData);
      setPayStart(cData.payStart);
      ROOMS.doc(cData.room.id).onSnapshot(
        (response) => {
          const data = response.data();

          const renter = data.renters ? data.renters.length : 0;
          setRoom(data);
          setService(data.services);
          setRenterCount(renter);
        },
        (error) => {
          console.error(error);
        }
      );
    });

    return () => loadContract();
  }, [id]);
  useEffect(() => {
    if (service && service.length > 0) {
      const arr = [];
      service.forEach(({ id }, index) => {
        SERVICES.doc(id).onSnapshot((response) => {
          const temp = response.data();
          arr.push({ ...temp, index });
          if (index === service.length - 1) {
            setIncludeService(arr);
          }
        });
      });
    }
  }, [service]);

  useEffect(() => {
    if (room?.id) {
      const loadIndice = INDICES.where("room.id", "==", room.id)
        .where("isLast", "==", true)
        .onSnapshot(
          (querySnapshot) => {
            if (!querySnapshot.empty) {
              const data = querySnapshot.docs[0].data();
              setPreviousIndice(data);
              setServiceIndices((prevState) => {
                const updatedIndices = { ...prevState };
                data.services.forEach((prevService) => {
                  if (prevService.chargeType === 1) {
                    updatedIndices[prevService.id] = {
                      ...updatedIndices[prevService.id],
                      oldValue: prevService.newValue,
                      newValue: prevService.newValue,
                    };
                  }
                });
                return updatedIndices;
              });
            } else {
              setServiceIndices((prevState) => {
                const updatedIndices = { ...prevState };
                room.services.forEach((prevService) => {
                  if (prevService.chargeType === 1) {
                    updatedIndices[prevService.id] = {
                      ...updatedIndices[prevService.id],
                      oldValue: 0,
                      newValue: 0,
                    };
                  }
                });
                return updatedIndices;
              });
            }
          },
          (error) => {
            console.error(error);
          }
        );
      return () => loadIndice();
    }
  }, [room]);
  const checking = () => {
    console.log(serviceIndices);
  };
  const getLastDayOfMonth = (date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const lastDay = new Date(year, month, 0).getDate();
    return `${lastDay}/${month}/${year}`;
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
              {fee} đ/{chargeBase}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                ? (currentServiceIndices.newValue -
                    currentServiceIndices.oldValue) *
                  fee
                : chargeType == 2
                ? fee
                : chargeType == 3
                ? fee * renterCount
                : chargeType == 4 && currentServiceIndices.indexValue >= 0
                ? fee * currentServiceIndices.indexValue
                : chargeType == 5 && currentServiceIndices.indexValue >= 0
                ? fee * currentServiceIndices.indexValue
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

  function formatNextMonth(date) {
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let nextMonth = month === 12 ? 1 : month + 1;
    let nextYear = month === 12 ? year + 1 : year;

    return `1/${nextMonth}/${nextYear}`;
  }
  const renderBillInfo = () => (
    <View style={styles.contractInfo}>
      <View style={styles.detailRow}>
        <View style={styles.detailLabel}>
          <Text style={styles.boldText}>Hóa đơn thanh lý</Text>
        </View>
        <View style={styles.detailValue}>
          <Text style={styles.boldText}>
            {formatMonthYear(monthYear)}{" "}
            <Icon source="calendar-month" size={22} color="#000" />
          </Text>
        </View>
      </View>
      <Text style={styles.smtxt}>
        <Icon source="home-account" size={20} color="#666666" />
        {data.room?.name} - Mã hợp đồng: {id}
      </Text>
      {stringToDate(payStart) > datetime ? (
        <Text style={styles.smtxt}>
          <Icon source="book-clock" size={20} color="#666666" /> Tiền phòng từ{" "}
          {data.payStart} đến {data.payStart}
        </Text>
      ) : (
        <Text style={styles.smtxt}>
          <Icon source="book-clock" size={20} color="#666666" /> Tiền phòng từ{" "}
          {data.payStart} đến {dateToString(new Date())}
        </Text>
      )}
      {stringToDate(payStart) > datetime ? (
        <Text style={styles.smtxt}>
        <Icon source="book-clock" size={20} color="#666666" /> Tiền dịch vụ từ{" "}
        {data.payStart} đến {data.payStart} và tiền điện nước (nếu
        có) đã sử dụng trước đó
      </Text>
      ) : (
        <Text style={styles.smtxt}>
        <Icon source="book-clock" size={20} color="#666666" /> Tiền dịch vụ từ{" "}
        {data.payStart} đến {dateToString(new Date())} và tiền điện nước (nếu
        có) đã sử dụng trước đó
      </Text>
      )}
      
    </View>
  );
  // Tính tiền phòng dựa trên tỷ lệ sử dụng
  const calculateRoomCharge = (roomPrice, payStart, payEnd = new Date()) => {

    const [startDay, startMonth, startYear] = payStart.split("/").map(Number);

    // Ngày bắt đầu
    const startDate = new Date(startYear, startMonth - 1, startDay);

    // Ngày kết thúc (mặc định là ngày hiện tại)
    const endDate = new Date(payEnd);

    // Tính số ngày giữa startDate và endDate
    const timeDifference = endDate - startDate;
    const daysUsed = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Đổi từ milliseconds sang ngày

    // Tính tiền phòng
    const totalDaysInMonth = new Date(startYear, startMonth, 0).getDate();
    const usageRatio = daysUsed / totalDaysInMonth;
    const roomCharge = Math.ceil(roomPrice * usageRatio);
    if(stringToDate(payStart) > payEnd) {
      return 0;
    }
    else return roomCharge;
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
      const total = includeService.reduce((total, item) => {
        const currentServiceIndices = serviceIndices[item.id] || {};

        const itemTotal =
          item.chargeType === 1
            ? (currentServiceIndices.newValue -
                currentServiceIndices.oldValue) *
              item.fee
            : item.chargeType === 2
            ? item.fee
            : item.chargeType === 3
            ? currentServiceIndices.indexValue * item.fee
            : item.chargeType === 4
            ? currentServiceIndices.indexValue * item.fee
            : item.chargeType === 5
            ? currentServiceIndices.indexValue * item.fee
            : 0;

        return total + (itemTotal > 0 ? itemTotal : 0);
      }, 0);

      setServicePrice(total);
    };
    calculateTotal();
  }, [serviceIndices, includeService]);
  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;

      total =
        servicePrice + calculateRoomCharge(room.price, payStart) - discount;

      setSum(total > 0 ? total : 0);
    };

    calculateTotal();
  }, [servicePrice, discount, room.price]);
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
        <View style={styles.txt}>
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
        </View>
        <FlatList
          data={includeService}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.flatlst}
          scrollEnabled={false}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Tổng hợp
        </Text>
        <View
          style={{ margin: 10, marginHorizontal: 15, justifyContent: "center" }}
        >
          {renderDetailRow(
            "Tiền phòng",
            `${calculateRoomCharge(room.price, payStart) || 0} đ`
          )}
          {renderDetailRow("Tiền dịch vụ", `${servicePrice} đ`)}
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
                value={discount}
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
                {sum} đ
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
          onPress={handleAddBill}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Tạo hóa đơn
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
