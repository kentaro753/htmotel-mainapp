import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Icon, Text, Button, TextInput } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";

export default function ContractDetail({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState({});
  const [service, setService] = useState([]);
  const [serviceIndices, setServiceIndices] = useState({});
  const [indiceData, setIndiceData] = useState({});
  const [previousIndice, setPreviousIndice] = useState({});
  const [includeService, setIncludeService] = useState([]);
  const [loading, setLoading] = useState(true);
  const BILLS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("BILLS");
  const INDICES = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("INDICES");
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("CONTRACTS");
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("ROOMS");
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("SERVICES");
  const handleThanhLy = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn thanh lý hợp đồng không?",
      [
        {
          text: "Không",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Có",
          onPress: () => {
            navigation.navigate("ThanhLyHD", { id: id });
          },
        },
      ],
      { cancelable: false }
    );
  };
  useEffect(() => {
    const loadContract = CONTRACTS.doc(id).onSnapshot((response) => {
      const cData = response.data();
      if (cData) {
        setData(cData);
        setLoading(false); // Data has been loaded
      } else {
        setLoading(false); // Data not found, stop loading
      }
    });
    return () => loadContract();
  }, [id]);

  useEffect(() => {
    if (data?.room) {
      const loadRoom = ROOMS.doc(data.room.id).onSnapshot(
        (response) => {
          const rdata = response.data();
          console.log(rdata);
          setService(rdata.services);
          // INDICES.where("room.id", "==", rdata.id)
          //   .where("isLast", "==", true)
          //   .onSnapshot(
          //     (response) => {
          //       if (!response.empty) {
          //         const idata = response.docs[0].data();
          //         const existingServices = idata.services.filter((curr) =>
          //           rdata.services.some((service) => service.id === curr.id)
          //         );

          //         const existingServiceIndices = existingServices.reduce(
          //           (acc, curr) => {
          //             acc[curr.id] = curr;
          //             return acc;
          //           },
          //           {}
          //         );

          //         setServiceIndices(existingServiceIndices);
          //       }
          //     },
          //     (error) => {
          //       console.error(error);
          //     }
          //   );
        },
        (error) => {
          console.error(error);
        }
      );

      return () => loadRoom();
    }
  }, [data]);

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
    if (data?.room) {
      const loadIndice = INDICES.where("room.id", "==", data.room.id)
        .where("isLast", "==", true)
        .onSnapshot(
          (querySnapshot) => {
            if (!querySnapshot.empty) {
              const idata = querySnapshot.docs[0].data();
              setPreviousIndice(idata);
              setServiceIndices((prevState) => {
                const updatedIndices = { ...prevState };
                idata.services.forEach((prevService) => {
                  if (prevService.chargeType === 1) {
                    updatedIndices[prevService.id] = {
                      ...updatedIndices[prevService.id],
                      oldValue: prevService.newValue,
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
  }, [data]);

  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const renderContractInfo = () => (
    <View style={styles.contractInfo}>
      <Text style={styles.boldText}>#{id}</Text>
      <Text style={styles.smtxt}>
        <Icon source="home-account" size={20} color="#666666" />
        {data.room?.name}
      </Text>
      <Text style={styles.smtxt}>
        <Icon source="calendar-month" size={20} color="#666666" />
        Từ {data.startDay} đến {data.endDay || "Chưa xác định thời hạn"}
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
  const renderServiceItem = ({ item }) => {
    const { serviceName, icon, fee, chargeBase, chargeType } = item;
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
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <View>
                  <Text>Chỉ hiện tại</Text>
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
                <Text style={{ alignSelf: "center", fontSize: 17 }}>
                  Theo số lần
                </Text>
              </View>
            ) : chargeType === 5 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <Text style={{ alignSelf: "center", fontSize: 17 }}>
                  Theo số lượng
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };
  if (loading) {
    return <Text>Loading...</Text>; // Or any loading spinner component
  } else if (!data) {
    return <Text>Error: Contract data is not available.</Text>; // Handle case where data is unavailable
  } else {
    return (
      <View style={styles.container}>
        {renderContractInfo()}
        {renderDetailRow(
          "Tiền phòng",
          `${formatWithDots(data.room?.price.toString())} đ`
        )}
        {renderDetailRow(
          "Tiền cọc",
          `${formatWithDots(data.tiencoc.toString())} đ`
        )}
        {renderDetailRow("Kì thanh toán", `${data.chuki} tháng`)}

        {data.active ? (
          <View style={styles.buttonRow}>
            <Button
              style={[styles.actionButton, styles.updateButton]}
              onPress={() => navigation.navigate("ContractUpdate", { id: id })}
            >
              <Text style={styles.buttonText}>Cập nhật</Text>
            </Button>
            <Button
              style={[styles.actionButton, styles.settleButton]}
              onPress={handleThanhLy}
            >
              <Text style={styles.buttonText}>Thanh lý</Text>
            </Button>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <Button style={[styles.actionButton, styles.settleButton]}>
              <Text style={styles.buttonText}>Đã Thanh lý</Text>
            </Button>
          </View>
        )}

        <Text variant="headlineSmall" style={styles.txt}>
          Dịch vụ
        </Text>
        <FlatList
          data={includeService}
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
