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
import auth from "@react-native-firebase/auth";
import messaging from "@react-native-firebase/messaging";
import DatePicker from "react-native-date-picker";
import MonthYearPicker from "react-native-month-year-picker";
import moment from "moment";
import { formatMonthYear, formatWithDots } from "../Component/SmallComponent";
import ProcessingOverlay from "../Component/ProcessingOverlay";

export default function AddBill({ navigation, route }) {
  const { id } = route.params || {};
  const [controller, dispatch] = useMyContextProvider();
  const [service, setService] = useState([]);
  const [selectRoom, setSelectRoom] = useState({
    id: "",
    name: "",
    price: 0,
    contractId: "",
  });
  const [selectIndice, setSelectIndice] = useState({
    id: "",
    createDay: "",
  });
  const [isRoomSelectVisible, setIsRoomSelectVisible] = useState(false);
  const [isIndiceSelectVisible, setIsIndiceSelectVisible] = useState(false);
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
  const [payEnd, setPayEnd] = useState("");
  const [monthYear, setMonthYear] = useState(new Date());
  const [preMonthYear, setPreMonthYear] = useState("");
  const [renterId, setRenterId] = useState("");
  const [renterCount, setRenterCount] = useState(0);
  const [servicePrice, setServicePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [sum, setSum] = useState(0);
  const [chuki, setChuki] = useState(0);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [isChuki, setIsChuki] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { userLogin } = controller;
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("ROOMS");
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
    if (isProcessing) return; // Chặn bấm nhiều lần
    setIsProcessing(true); // Hiển thị processing
    let tempLoi = 0;
    let indiceId = "";
    const billSnapshot = await BILLS.get();
    const billCount = billSnapshot ? billSnapshot.size : 0;
    console.log(billCount);
    const billId = "B" + String(billCount + 1).padStart(5, "0");
    console.log(billId);
    if (selectIndice.id) {
      indiceId = indiceData.id;
      console.log(indiceData);
      INDICES.doc(indiceData.id)
        .update({ isBill: true, editable: false })
        .catch((error) => {
          console.error(error);
          Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật dữ liệu");
        });
    } else {
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
      console.log(tempLoi);

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
            id: selectRoom.id,
            name: selectRoom.name,
            price: selectRoom.price,
          },
          services: servicesData,
        };
        setSelectIndice({
          id: indiceData.id,
          createDay: indiceData.createDay,
        });
        indiceId = indiceData.id;
        INDICES.doc(indiceData.id)
          .set(indiceData)
          .then(() => {
            console.log(selectIndice);
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
    }
    if (tempLoi == 0) {
      BILLS.doc(billId)
        .set({
          contractId: selectRoom.contractId || null, // Kiểm tra giá trị null hoặc undefined
          createDay: datetime.toLocaleDateString("vi"),
          discount: discount || 0, // Đảm bảo discount có giá trị hợp lệ
          startDay: startDay.toLocaleDateString("vi"),
          endDay: endDay.toLocaleDateString("vi"),
          payStart,
          payEnd: getLastDayOfMonth(monthYear),
          id: billId,
          indiceId: indiceId || null,
          renterId,
          monthYear: formatMonthYear(monthYear),
          preMonthYear,
          room: {
            id: selectRoom.id || null,
            name: selectRoom.name || "Chưa đặt tên",
            price: selectRoom.price || 0,
          },
          roomCharge: isChuki
            ? selectRoom.price * chuki
            : calculateRoomCharge(selectRoom.price, payStart),
          servicePrice: servicePrice || 0,
          state: 0,
          totalPaid: sum || 0,
          thanhLy: false,
        })
        .then((docRef) => {
          console.log(docRef);
          // Gửi thông báo tới người thuê
          sendNotification(renterId, monthYear, selectRoom.name);

          CONTRACTS.doc(selectRoom.contractId).update({
            billMonthYear: formatMonthYear(monthYear),
            payStart: formatNextMonth(monthYear),
          });
        })
        .then(() => {
          Alert.alert("Tạo hóa đơn mới thành công");
          navigation.goBack();
        })
        .catch((e) => {
          Alert.alert(e.message);
        });
    }
    setIsProcessing(false); // Tắt processing
  };
  useEffect(() => {
    if (selectIndice.id) {
      const loadIndice = INDICES.doc(selectIndice.id).onSnapshot(
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
          setIsEditing(false);
        },
        (error) => {
          console.error(error);
        }
      );
      return () => loadIndice();
    }
  }, [selectIndice]);

  useEffect(() => {
    if (selectRoom.id) {
      const loadRoom = ROOMS.doc(selectRoom.id).onSnapshot(
        (response) => {
          const data = response.data();
          const renter = data.renters ? data.renters.length : 0;
          CONTRACTS.doc(data.contract).onSnapshot((contract) => {
            const cdata = contract.data();
            setPayStart(cdata.payStart);
            setRenterId(cdata.renter.id);
            if (cdata.billMonthYear != "") {
              setPreMonthYear(cdata.billMonthYear);
              setIsChuki(true);
              setChuki(cdata.chuki);
            }
          });
          setRoom(data);
          setService(data.services);
          setRenterCount(renter);
        },
        (error) => {
          console.error(error);
        }
      );
      return () => loadRoom();
    }
  }, [selectRoom]);

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
    if (selectRoom.id) {
      const loadIndice = INDICES.where("room.id", "==", selectRoom.id)
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
  const checking = async () => {
    try {
      const message = {
        token: "dipHq6L7TR-RWHY_dqeLIo:APA91bFwY__6DICeuwphLg3Qu-XIKRwuwQpKtcExsLcLo94Oho-Ud2npuacQI71YG5d8OD127kiTve5LyStqx0K4aBmKYxygwBer5m-_Oewig3an1SrUvdM",
        notification: {
          title: "Hóa đơn mới test",
          body: `Hóa đơn tháng  của phòng đã được tạo. Vui lòng kiểm tra!`,
        },
        data: {
          loggedIn: Date.now().toString(),
          uid: auth().currentUser.uid,
        },
      };

      await messaging().sendMessage(message);
      console.log("Thông báo đã được gửi thành công");
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
    }
  };

  const sendNotification = async (renterId, monthYear, room) => {
    const USERS = firestore().collection("USERS");

    try {
      // Lấy thông tin người thuê từ Firestore
      const querySnapshot = await USERS.where("renterId", "==", renterId).get();
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const NOTIFICATIONS = firestore()
          .collection("USERS")
          .doc(userData.email)
          .collection("NOTIFICATIONS");
        if (userData && userData.fcmToken) {
          const fcmToken = userData.fcmToken;

          // Dữ liệu thông báo
          const notificationData = {
            to: fcmToken, // Sử dụng FCM Token của người thuê
            notification: {
              title: "Hóa đơn mới",
              body: `Hóa đơn tháng ${formatMonthYear(
                monthYear
              )} của phòng ${room} đã được tạo. Vui lòng kiểm tra!`,
            },
            // data: {
            //   renterId,
            //   billId,
            // },
          };

          // Gửi thông báo qua FCM
          await messaging().sendMessage(notificationData);

          // Nếu muốn lưu thông báo vào Firestore (có thể tùy chọn)
          await NOTIFICATIONS.add({
            icon: "file-document-outline",
            sender: "Chủ trọ",
            notification: notificationData.notification,
            timestamp: firestore.FieldValue.serverTimestamp(),
          });

          console.log("Thông báo đã được gửi");
        } else {
          console.error("Không tìm thấy FCM Token của người thuê");
        }
      } else {
        console.error("Không tìm thấy thông tin người thuê trong Firestore");
      }
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
    }
  };
  const getLastDayOfMonth = (date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const lastDay = new Date(year, month, 0).getDate();
    return `${lastDay}/${month}/${year}`;
  };
  const toggleRoomSelect = () => {
    setIsRoomSelectVisible((prev) => !prev);
    console.log(monthYear);
    if (!isRoomSelectVisible) {
      navigation.navigate("RoomsNeedBill", {
        onSelectRoom: (item) => {
          setSelectRoom({
            id: item.room.id,
            name: item.room.name,
            price: item.room.price,
            contractId: item.id,
          });
          setDisabled(false);
          setIsRoomSelectVisible(false);
          setIncludeService([]);
          navigation.goBack();
        },
        monthYear,
      });
    }
  };

  const toggleIndiceSelect = () => {
    setIsIndiceSelectVisible((prev) => !prev);
    if (!isIndiceSelectVisible && selectRoom.id) {
      navigation.navigate("IndicesNeedBill", {
        onSelectIndice: (indice) => {
          setSelectIndice({
            id: indice.id,
            createDay: indice.createDay,
          });
          setDisabled(false);
          setIsIndiceSelectVisible(false);
          setIncludeService([]);
          navigation.goBack();
        },
        monthYear,
        roomId: room.id,
      });
    }
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

  function formatNextMonth(date) {
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let nextMonth = month === 12 ? 1 : month + 1;
    let nextYear = month === 12 ? year + 1 : year;

    return `1/${nextMonth}/${nextYear}`;
  }

  const onValueChange = (event, newDate) => {
    setOpen(false);
    if (newDate !== undefined) {
      setMonthYear(newDate);
      setSelectRoom({
        id: "",
        name: "",
        price: 0,
        contractId: "",
      });
      setSelectIndice({
        id: "",
        createDay: "",
      });
      setIndiceData({});
      setService([]);
      setRoom({});
      setIncludeService([]);
    }
  };
  // Tính tiền phòng dựa trên tỷ lệ sử dụng
  const calculateRoomCharge = (roomPrice, payStart) => {
    const [startDay, startMonth, startYear] = payStart.split("/").map(Number);
    const lastDayOfMonth = new Date(startYear, startMonth, 0).getDate();
    const daysUsed = lastDayOfMonth - startDay + 1;
    const totalDaysInMonth = lastDayOfMonth;
    const usageRatio = daysUsed / totalDaysInMonth;
    const roomCharge = Math.ceil(roomPrice * usageRatio);

    return roomCharge;
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
            ? renterCount * item.fee
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
      if (isChuki) {
        total = servicePrice + room.price * chuki - discount;
      } else {
        total =
          servicePrice + calculateRoomCharge(room.price, payStart) - discount;
      }
      setSum(total > 0 ? total : 0);
    };

    calculateTotal();
  }, [servicePrice, discount, room.price, payStart]);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      {isProcessing && <ProcessingOverlay />}
      <View style={{ flex: 1 }}>
        <Text variant="headlineSmall" style={styles.txt}>
          Hóa đơn tháng
        </Text>
        <View
          style={{ margin: 10, marginHorizontal: 15, justifyContent: "center" }}
        >
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={() => setOpen(true)}
          >
            <Text style={{ fontSize: 19, top: 10 }}>
              {formatMonthYear(monthYear)}
            </Text>
            <IconButton
              icon="calendar"
              size={22}
              onPress={() => setOpen(true)}
            />
          </TouchableOpacity>
          {open && (
            <MonthYearPicker
              onChange={onValueChange}
              value={monthYear}
              minimumDate={new Date(2020, 0)}
              maximumDate={new Date()}
              locale="vi"
            />
          )}
        </View>
        <Text variant="headlineSmall" style={styles.txt}>
          Chọn phòng
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            margin: 10,
          }}
        >
          <TouchableOpacity onPress={toggleRoomSelect}>
            <Text style={styles.selectionText}>
              {selectRoom.name ? selectRoom.name : "Chọn phòng"}
            </Text>
          </TouchableOpacity>
          <IconButton
            icon="plus-circle"
            size={30}
            onPress={checking}
            color="royalblue"
          />
        </View>
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
              {selectIndice.id
                ? selectIndice.createDay + " "
                : "Chọn chốt dịch vụ "}
            </Text>
            <IconButton
              icon="database-clock"
              size={25}
              onPress={toggleIndiceSelect}
              style={{
                margin: 0,
                alignItems: "flex-end",
              }}
            />
          </View>
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
          {isChuki
            ? renderDetailRow(
                "Tiền phòng",
                `${formatWithDots((selectRoom.price * chuki).toString())} đ`
              )
            : renderDetailRow(
                "Tiền phòng",
                `${
                  formatWithDots(
                    calculateRoomCharge(selectRoom.price, payStart).toString()
                  ) || 0
                } đ`
              )}
          {renderDetailRow(
            "Tiền dịch vụ",
            `${formatWithDots(servicePrice.toString())} đ`
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
