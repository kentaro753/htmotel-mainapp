import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Icon, Text, Button, TextInput } from "react-native-paper";
import Modal from "react-native-modal";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import Slideshow from "react-native-image-slider-show";
import RenterInclude from "../Component/RenterInclude";
import ServiceIcon from "../Component/ServiceIcon";
import { sendAdminNotification } from "../Component/SmallComponent";

export default function RDForRenter({ navigation, route }) {
  const { id } = route.params;
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState({});
  const [room, setRoom] = useState({});
  const [service, setService] = useState([]);
  const [renterList, setRenterList] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [serviceIndices, setServiceIndices] = useState({});
  const [isRenterModalVisible, setIsRenterModalVisible] = useState(false);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [sendable, setSendable] = useState(false);
  const [previousIndice, setPreviousIndice] = useState({});
  const [includeService, setIncludeService] = useState([]);
  const [excludeService, setExcludeService] = useState([]);
  const [requestService, setRequestService] = useState([]);
  const screenWidth = Dimensions.get("window").width;
  const [dataSlide, setDataSlide] = useState([
    {
      url: "https://firebasestorage.googleapis.com/v0/b/demopj-5b390.appspot.com/o/LogoWG_nobg.png?alt=media&token=19799886-d3d1-49a9-8bb8-3ae60c7e24ba",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const BILLS = firestore()
    .collection("USERS")
    .doc(userLogin?.admin)
    .collection("BILLS");
  const INDICES = firestore()
    .collection("USERS")
    .doc(userLogin?.admin)
    .collection("INDICES");
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin?.admin)
    .collection("CONTRACTS");
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.admin)
    .collection("ROOMS");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin?.admin)
    .collection("RENTERS");
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin?.admin)
    .collection("SERVICES");
  const handleSendRequest = () => {
    var notification = {
      title: "Yêu cầu dịch vụ",
      body: `Người thuê của phòng ${roomName} đã gửi yêu cầu dịch vụ. Vui lòng kiểm tra!`,
    };
    var icon = "lightbulb-variant";
    ROOMS.doc(room.id)
      .update({
        requests: requestService,
      })
      .then(() => {
        setSendable(false);
        sendAdminNotification(
          userLogin?.renterId,
          notification,
          icon,
          userLogin?.admin
        );
        toggleServiceModal();
        Alert.alert("Thông báo", "Gửi yêu cầu thành công!");
      })
      .catch((e) => console.error("Lỗi khi cập nhật Firestore:", e.message));
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
          //console.log(rdata);
          setRequestService(rdata.requests);
          setRoomName(rdata.roomName);
          setRoom(rdata);
          if (rdata.images.length >= 1) {
            setDataSlide(rdata.images);
          }
          setService(rdata.services);
          if (rdata.renters) {
            RENTERS.onSnapshot(
              (response) => {
                const arr = [];
                response.forEach((doc) => {
                  const redata = doc.data();
                  if (redata.id != null) {
                    arr.push(redata);
                  }
                });
                setRenterList(
                  arr.filter((renter) =>
                    rdata.renters.some(
                      (checkedRenter) => checkedRenter === renter.id
                    )
                  )
                );
              },
              (error) => {
                console.error(error);
              }
            );
          }
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
      SERVICES.onSnapshot((response) => {
        const arr = [];
        response.forEach((doc, index) => {
          const data = doc.data();
          if (data.id != null) {
            arr.push({ ...data, index });
          }
        });
        setExcludeService(
          arr.filter(
            (exServices) =>
              !service.some((inService) => inService.id === exServices.id)
          )
        );
        setIncludeService(
          arr.filter((exServices) =>
            service.some((inService) => inService.id === exServices.id)
          )
        );
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
  useLayoutEffect(() => {
    if (room) {
      navigation.setOptions({
        headerTitle: roomName.toString(),
      });
    }
  }, [room]);

  const handleRequestChange = (id, checked) => {
    setRequestService((prev) => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter((serviceId) => serviceId !== id);
      }
    });
    setSendable(true);
  };
  const toggleRenterModal = () => {
    setIsRenterModalVisible(!isRenterModalVisible);
  };
  const toggleServiceModal = () => {
    setIsServiceModalVisible(!isServiceModalVisible);

    console.log(requestService);
  };

  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const renderContractInfo = () => (
    <View style={styles.contractInfo}>
      <Text style={styles.smtxt}>
        <Icon source="calendar-month" size={20} color="#666666" />
        Từ {data.startDay} đến {data.endDay || "Chưa xác định thời hạn"}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Text style={styles.smtxt}>
          <Icon source="account" size={20} color="#666666" />
          Số người thuê:{" "}
          <Text
            style={{
              color: room.renters?.length == room.maxPeople ? "red" : "#666666",
            }}
          >
            {room.renters?.length} / {room.maxPeople}
          </Text>
        </Text>
        <TouchableOpacity
          style={{
            alignItems: "center",
            marginRight: 5,
            justifyContent: "center",
            left: 0,
          }}
          onPress={toggleRenterModal}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              borderWidth: 1,
              paddingLeft: 20,
              borderRadius: 50,
            }}
          >
            <Text style={{ fontSize: 18, right: 0 }}>Người thuê</Text>
            <Icon source="chevron-right" size={35} />
          </View>
        </TouchableOpacity>
      </View>
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
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <View>
                  <Text>Chỉ số hiện tại</Text>
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
    return <Text>Error: Room data is not available.</Text>; // Handle case where data is unavailable
  } else {
    return (
      <React.Fragment>
        <Slideshow
          dataSource={dataSlide}
          width={screenWidth}
          height={screenWidth * (9 / 19)}
          indicatorSize={9}
          indicatorColor="#bfbfbf"
          indicatorSelectedColor="#ff3300"
          //position={1}
          arrowSize={20}
          titleStyle={{ textAlign: "center", color: "white", fontSize: 16 }}
          scrollEnabled={false}
        />
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

          <Text variant="headlineSmall" style={styles.txt}>
            Dịch vụ
          </Text>
          <FlatList
            data={includeService}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            style={styles.flatlst}
            ListFooterComponent={
              <TouchableOpacity
                style={{
                  backgroundColor: "#ff3300",
                  padding: 15,
                  borderRadius: 10,
                  alignItems: "center",
                  marginTop: 10,
                  marginHorizontal: 10,
                }}
                onPress={toggleServiceModal}
              >
                <Text
                  style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}
                >
                  Yêu cầu dịch vụ
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
        <Modal
          isVisible={isRenterModalVisible}
          onBackdropPress={toggleRenterModal}
        >
          <View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.modalContent}>
                {renterList.length != 0 ? (
                  renterList.map((item, index) => (
                    <RenterInclude key={index} item={item} type="view" />
                  ))
                ) : (
                  <Text style={{ color: "#000", fontSize: 20 }}>
                    Chưa thêm người thuê vào
                  </Text>
                )}
              </View>
              <Button
                onPress={toggleRenterModal}
                style={{
                  backgroundColor: "royalblue",
                  width: "100%",
                  alignSelf: "center",
                  borderRadius: 0,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                >
                  Đóng
                </Text>
              </Button>
            </ScrollView>
          </View>
        </Modal>
        <Modal
          isVisible={isServiceModalVisible}
          onBackdropPress={toggleServiceModal}
        >
          <View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.modalContent}>
                {excludeService.length != 0 ? (
                  excludeService.map((item) => (
                    <ServiceIcon
                      key={item.id}
                      item={item}
                      checked={requestService.includes(item.id)}
                      onPress={handleRequestChange}
                      type="check"
                    />
                  ))
                ) : (
                  <Text style={{ color: "#000", fontSize: 20 }}>
                    Không còn dịch vụ
                  </Text>
                )}
              </View>
            </ScrollView>
            <View style={{ flexDirection: "row" }}>
              <Button
                onPress={toggleServiceModal}
                style={{
                  backgroundColor: "royalblue",
                  width: "50%",
                  //alignSelf: "center",
                  borderRadius: 0,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                >
                  Đóng
                </Text>
              </Button>
              <Button
                onPress={handleSendRequest}
                style={{
                  backgroundColor: sendable ? "#ff7733" : "#999999",
                  width: "50%",
                  //alignSelf: "center",
                  borderRadius: 0,
                  paddingVertical: 5,
                }}
                disabled={!sendable}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                >
                  Gửi yêu cầu
                </Text>
              </Button>
            </View>
          </View>
        </Modal>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    margin: 8,
    paddingHorizontal: 5,
    scrollEnabled: true,
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
});
