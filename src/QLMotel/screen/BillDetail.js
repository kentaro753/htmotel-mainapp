import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Button, Icon, Text, TextInput } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";

export default function BillDetail({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState({});
  const [service, setService] = useState([]);
  const [lastBillMY, setLastBillMY] = useState("");
  const [serviceIndices, setServiceIndices] = useState({});
  const [indiceData, setIndiceData] = useState({});
  const [loading, setLoading] = useState(true);
  const BILLS = firestore()
    .collection("USERS")
    .doc(userLogin?.role == "admin" ? userLogin?.email : userLogin?.admin)
    .collection("BILLS");
  const INDICES = firestore()
    .collection("USERS")
    .doc(userLogin?.role == "admin" ? userLogin?.email : userLogin?.admin)
    .collection("INDICES");
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin?.role == "admin" ? userLogin?.email : userLogin?.admin)
    .collection("CONTRACTS");
  const THUCHIS = firestore()
    .collection("USERS")
    .doc(userLogin?.role == "admin" ? userLogin?.email : userLogin?.admin)
    .collection("THUCHIS");
  const handleThanhToan = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn thanh toán hóa đơn không?",
      [
        {
          text: "Không",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Có",
          onPress: () => {
            BILLS.doc(id)
              .update({
                state: 2,
                paidDay: new Date().toLocaleDateString("vi"),
              })
              .then(() => {
                console.log("Hóa đơn đã dược thanh toán");
              })
              .catch((e) => {
                console.log("Action failed:", e.message);
                Alert.alert("Lỗi", "Thanh toán thất bại: " + e.message);
              });
            THUCHIS.add({
              date: new Date().toLocaleDateString("vi"),
              money: data.totalPaid,
              type: true,
              note: "",
              group: data.thanhLy ? "Thanh lý phòng" : "Tiền hóa đơn tháng",
              target: {
                id: data.room.id,
                name: data.room.name,
                table: "ROOMS",
              },
            })
              .then((docRef) => {
                let upImage = [];
                THUCHIS.doc(docRef.id).update({
                  id: docRef.id,
                  images: upImage,
                });
              })
              .catch((e) => {
                Alert.alert(e.message);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };
  const handleDeleteBill = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa hóa đơn không?",
      [
        {
          text: "Không",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Có",
          onPress: () => {
            if (data.thanhLy) {
              Alert.alert("Cảnh báo", "Không thể xóa hóa đơn thanh lý!");
            }
            if (data.monthYear != lastBillMY) {
              Alert.alert(
                "Cảnh báo",
                "Chỉ có thể xóa hóa đơn gần nhất của hợp đồng!"
              );
            } else {
              BILLS.doc(id)
                .delete()
                .then(() => {
                  console.log("Bill deleted successfully");
                  CONTRACTS.doc(data.contractId).update({
                    billMonthYear: data.preMonthYear,
                    payStart: data.payStart,
                  });
                  if (indiceData) {
                    INDICES.doc(indiceData.id)
                      .delete()
                      .then(() => {
                        if (indiceData.previousIndiceId != "") {
                          INDICES.doc(indiceData.previousIndiceId).update({
                            isLast: true,
                          });
                        }
                      })
                      .catch((e) => {
                        console.log("Delete failed:", e.message);
                        Alert.alert(
                          "Lỗi",
                          "Xóa chốt dịch vụ thất bại: " + e.message
                        );
                      });
                  }
                  setData(null);
                  navigation.goBack();
                })
                .catch((e) => {
                  console.log("Delete failed:", e.message);
                  Alert.alert("Lỗi", "Xóa hóa đơn thất bại: " + e.message);
                });
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  useEffect(() => {
    const loadBill = BILLS.doc(id).onSnapshot((response) => {
      const billData = response.data();
      if (billData) {
        setData(billData);
        CONTRACTS.doc(billData.contractId).onSnapshot((contract) => {
          const cdata = contract.data();
          setLastBillMY(cdata.billMonthYear);
        });
        setLoading(false); // Data has been loaded
      } else {
        setLoading(false); // Data not found, stop loading
      }
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
        {data.thanhLy ? " - Thanh Lý" : null}
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
      <Text style={styles.smtxt}>
        <Icon source="book-clock" size={20} color="#666666" /> Hạn thanh toán từ{" "}
        {data.startDay} đến {data.endDay}
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

  const renderServiceItem = ({ item }) => {
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
        </View>
      </View>
    );
  };
  if (loading) {
    return <Text>Loading...</Text>; // Or any loading spinner component
  } else if (!data || !data.monthYear) {
    return <Text>Error: Bill data is not available.</Text>; // Handle case where data is unavailable
  } else {
    return (
      <View style={styles.container}>
        {renderBillInfo()}
        {renderDetailRow(
          "Tiền phòng",
          `${formatWithDots(data.roomCharge.toString())} đ`
        )}
        {renderDetailRow(
          "Tiền dịch vụ",
          `${formatWithDots(data.servicePrice.toString())} đ`
        )}
        {renderDetailRow(
          "Giảm giá",
          `${formatWithDots(data.discount.toString())} đ`
        )}
        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Text style={{ ...styles.detailText, color: "red" }}>
              Tổng tiền
            </Text>
          </View>
          <View style={styles.detailValue}>
            <Text style={{ ...styles.detailValueText, color: "red" }}>
              {formatWithDots(data.totalPaid.toString())} đ
            </Text>
          </View>
        </View>
        {data.state == 2 ? (
          <View style={styles.buttonRow}>
            <Button
              style={[styles.actionButton, styles.settleButton]}
              disabled={true}
            >
              <Text style={styles.buttonText}>Đã thanh toán</Text>
            </Button>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            {userLogin?.role == "admin" && (
              <>
                <Button
                  style={[styles.actionButton, styles.updateButton]}
                  onPress={() => {
                    navigation.navigate("UpdateBill", { id: id });
                  }}
                >
                  <Text style={styles.buttonText}>Cập nhật</Text>
                </Button>
                <Button
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteBill()}
                >
                  <Text style={styles.buttonText}>Xóa</Text>
                </Button>
                <Button
                  style={[styles.actionButton, styles.settleButton]}
                  onPress={() => handleThanhToan()}
                >
                  <Text style={styles.buttonText}>Thanh toán</Text>
                </Button>
              </>
            )}
          </View>
        )}
        <Text variant="headlineSmall" style={styles.txt}>
          Dịch vụ
        </Text>
        <FlatList
          data={service}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          style={styles.flatlst}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    margin: 10,
    padding: 5,
  },
  contractInfo: {
    paddingBottom: 5,
    borderBottomWidth: 1,
    marginBottom: 10,
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
    fontWeight: "bold",
    fontSize: 17,
    color: "#000",
  },
  detailValueText: {
    fontWeight: "bold",
    fontSize: 19,
    color: "#000",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#000",
    margin: 10,
    borderRadius: 10,
  },
  updateButton: {
    backgroundColor: "#ff9933",
  },
  deleteButton: {
    backgroundColor: "#e60000",
  },
  settleButton: {
    backgroundColor: "#3366ff",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
