import React, { useEffect, useLayoutEffect, useState } from "react";
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
  Icon,
  IconButton,
  overlay,
  Text,
  TextInput,
} from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import Modal from "react-native-modal";
import firestore from "@react-native-firebase/firestore";
import ServiceIcon from "../Component/ServiceIcon";
import Slideshow from "react-native-image-slider-show";
import RenterInclude from "../Component/RenterInclude";

export default function RoomDetail({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [service, setService] = useState([]);
  const [room, setRoom] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [originName, setOriginName] = useState("");
  const [price, setPrice] = useState("");
  const [mota, setMota] = useState("");
  const [billNote, setBillNote] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [dataSlide, setDataSlide] = useState([
    {
      url: "https://firebasestorage.googleapis.com/v0/b/demopj-5b390.appspot.com/o/LogoWG_nobg.png?alt=media&token=19799886-d3d1-49a9-8bb8-3ae60c7e24ba",
    },
  ]);
  const [state, setState] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [includeService, setIncludeService] = useState([]);
  const [excludeService, setExcludeService] = useState([]);
  const [renterList, setRenterList] = useState([]);
  const [checkedServices, setCheckedServices] = useState([]);
  const { userLogin } = controller;

  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("ROOMS");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("RENTERS");
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("SERVICES");

  const handleDeleteRoom = () => {
    if (room.contract === "") {
      const batch = firestore().batch();
      checkedServices.forEach((service) => {
        const serviceRef = SERVICES.doc(service.id);
        batch.update(serviceRef, {
          rooms: firestore.FieldValue.arrayRemove(room.id),
        });
      });
      batch.commit();
      ROOMS.doc(room.id)
        .delete()
        .then(() => {
          console.log("Room deleted successfully");
          navigation.goBack();
          // setRoomData((prevData) =>
          //   prevData.filter((room) => room.id !== item.id)
          // );
          // setData((prevData) => prevData.filter((room) => room.id !== item.id));
        })
        .catch((e) => {
          console.log("Delete failed:", e.message);
          Alert.alert("Lỗi", "Xóa phòng thất bại: " + e.message);
        });
    } else {
      Alert.alert("Thông báo", "Phòng này vẫn còn trong hợp đồng thuê phòng!");
    }
  };

  useEffect(() => {
    const loadroom = ROOMS.doc(id).onSnapshot((response) => {
      const data = response.data();
      if (data) {
        setRoomName(data.roomName);
        setRoom(data);
        setOriginName(data.roomName);
        setBillNote(data.billNote);
        setPrice(data.price.toString());
        setMaxPeople(data.maxPeople.toString());
        setMota(data.mota);
        setState(data.state);
        setCheckedServices(data.services);
        if (data.images.length >= 1) {
          setDataSlide(data.images);
        }
        console.log(data.images);
        if (data.renters) {
          RENTERS.onSnapshot(
            (response) => {
              const arr = [];
              response.forEach((doc) => {
                const rdata = doc.data();
                if (rdata.id != null) {
                  arr.push(rdata);
                }
              });
              setRenterList(
                arr.filter((renter) =>
                  data.renters.some(
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
      }
    });

    return () => {
      loadroom();
    };
  }, []);
  useLayoutEffect(() => {
    if (roomName != "") {
      navigation.setOptions({
        headerRight: (props) => (
          <View style={{ flexDirection: "row" }}>
            <IconButton
              icon="plus-circle-multiple-outline"
              //{...props}
              onPress={() => navigation.navigate("AddRoom", { id: id })}
              iconColor="white"
            />
            <IconButton
              icon="square-edit-outline"
              //{...props}
              onPress={() => navigation.navigate("RoomUpdate", { item: room })}
              iconColor="white"
            />
          </View>
        ),
        headerTitle: roomName.toString(),
      });
    }
  }, [room]);
  useEffect(() => {
    const loadservice = SERVICES.onSnapshot(
      (response) => {
        const arr = [];
        response.forEach((doc, index) => {
          const data = doc.data();
          if (data.id != null) {
            arr.push({ ...data, index });
          }
        });
        setService(arr);
        setIncludeService(
          arr.filter((service) =>
            checkedServices.some(
              (checkedService) => checkedService.id === service.id
            )
          )
        );
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      loadservice();
    };
  }, [userLogin?.email, checkedServices]);

  const navigateToAddContract = () => {
    navigation.navigate("AddContract", {
      roomId: id,
      rName: room.roomName,
      rMaxPeople: room.maxPeople,
      rPrice: room.price,
    });
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const renderItem = ({ item }) => {
    const { serviceName, icon, fee, chargeBase } = item;
    return (
      <View>
        <TouchableOpacity activeOpacity={1} style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Icon source={icon} size={50} />
            <Text>{serviceName}</Text>
            <Text>
              {formatWithDots(fee.toString())} đ/{chargeBase}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  if (!room) {
    return <Text>Phòng không tồn tại hoặc đã bị xóa.</Text>;
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        {dataSlide ? (
          <Slideshow
            dataSource={dataSlide}
            height={200}
            indicatorSize={9}
            indicatorColor="#bfbfbf"
            indicatorSelectedColor="#ff3300"
            //position={1}
            arrowSize={20}
            containerStyle={{ marginBottom: 10 }}
            titleStyle={{ textAlign: "center", color: "white", fontSize: 16 }}
            scrollEnabled={false}
          />
        ) : null}

        <View
          style={{
            margin: 10,
            marginLeft: 20,
            backgroundColor: "none",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {state ? (
            <Text
              style={{ fontSize: 22, fontWeight: "bold", color: "#ff1a1a" }}
            >
              Trống
            </Text>
          ) : (
            <Text
              style={{ fontSize: 22, fontWeight: "bold", color: "#4da6ff" }}
            >
              Đang thuê
            </Text>
          )}
          {state ? (
            <TouchableOpacity
              style={{
                alignItems: "center",
                marginRight: 5,
                justifyContent: "center",
                left: 0,
              }}
              onPress={navigateToAddContract}
            >
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  borderWidth: 1,
                  paddingLeft: 20,
                  marginRight: 10,
                  borderRadius: 50,
                }}
              >
                <Text style={{ fontSize: 18, right: 0 }}>Thuê phòng</Text>
                <Icon source="chevron-right" size={35} />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                alignItems: "center",
                marginRight: 5,
                justifyContent: "center",
                left: 0,
              }}
              onPress={toggleModal}
            >
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  borderWidth: 1,
                  paddingLeft: 20,
                  marginRight: 10,
                  borderRadius: 50,
                }}
              >
                <Text style={{ fontSize: 18, right: 0 }}>Người thuê</Text>
                <Icon source="chevron-right" size={35} />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            backgroundColor: "#ffa366",
            marginHorizontal: 15,
            marginVertical: 10,
            paddingVertical: 20,
            paddingHorizontal: 10,
            borderRadius: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 15 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              Tiền phòng
            </Text>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
              {formatWithDots(price)} đ/tháng
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              Số người tối đa
            </Text>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
              {maxPeople}
            </Text>
          </View>
        </View>

        <Text variant="headlineSmall" style={styles.txt}>
          Mô tả
        </Text>
        <View
          style={{
            ...styles.viewBox,
            marginHorizontal: 14,
            marginVertical: 10,
            padding: 10,
            borderRadius: 1,
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 13.9,
          }}
        >
          <Text style={{ fontSize: 18 }}>{mota}</Text>
        </View>

        <Text variant="headlineSmall" style={styles.txt}>
          Dịch vụ
        </Text>

        <FlatList
          contentContainerStyle={{
            flex: 1,
            alignSelf: "center",
            marginTop: 10,
            justifyContent: "center",
          }}
          numColumns={3}
          data={includeService}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          //showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "80%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={handleDeleteRoom}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Xóa phòng</Text>
        </Button>
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              {renterList.length != 0 ? (
                renterList.map((item, index) => (
                  <RenterInclude
                    key={index}
                    item={item}
                    type="view"
                    onSelect={() => {
                      toggleModal();
                      navigation.navigate("RenterDetail", { item: item });
                    }}
                  />
                ))
              ) : (
                <Text style={{ color: "#000", fontSize: 20 }}>
                  Chưa thêm người thuê vào
                </Text>
              )}
            </View>
          </ScrollView>
          <Button
            onPress={toggleModal}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  flatlst: {
    flex: 1,
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
  txtInput: {
    margin: 10,
    marginTop: 0,
    backgroundColor: "none",
    borderBottomWidth: 1,
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
  itemContainer: {
    marginBottom: 6,
    alignSelf: "center",
    alignItems: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderRadius: 15,
    width: Dimensions.get("window").width / 3 - 10,
    aspectRatio: 1,
    justifyContent: "center",
  },
  itemContent: {
    alignItems: "center",
  },
  viewBox: {
    borderRadius: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});
