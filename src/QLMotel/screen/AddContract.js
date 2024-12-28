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
import { Button, Text, TextInput, Icon, IconButton } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useMyContextProvider } from "../store/index";
import Modal from "react-native-modal";
import firestore from "@react-native-firebase/firestore";
import DatePicker from "react-native-date-picker";
import moment from "moment";
import RenterInclude from "../Component/RenterInclude";
import { dateToString } from "../Component/SmallComponent";

export default function AddContract({ navigation, route }) {
  const { roomId, rName, rMaxPeople, rPrice } = route.params || {};
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [selectRenter, setSelectRenter] = useState({
    id: "",
    name: "",
    cccd: "",
  });
  const [selectRoom, setSelectRoom] = useState({
    id: "",
    name: "",
    maxPeople: 0,
    price: 0,
  });
  const [isRenterSelectVisible, setIsRenterSelectVisible] = useState(false);
  const [isRoomSelectVisible, setIsRoomSelectVisible] = useState(false);
  const [startDay, setStartDay] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  const [endDay, setEndDay] = useState(null);
  const [endOpen, setEndOpen] = useState(false);
  const [chuki, setChuki] = useState(1);
  const [tiencoc, setTiencoc] = useState(0);
  const [disabled, setDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const [renterData, setRenterData] = useState([]);
  const [renterList, setRenterList] = useState([]);
  const [excludeRenter, setExcludeRenter] = useState([]);

  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("ROOMS");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("RENTERS");
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("CONTRACTS");

  const handleAddNewContract = async () => {
    const contractSnapshot = await CONTRACTS.get();
    const contractCount = contractSnapshot.size;
    const contractId = "HD" + String(contractCount + 1).padStart(4, "0");

    console.log(contractId);
    if (selectRenter.id === "") {
      Alert.alert("Vui lòng chọn người thuê chính!");
    } else if (selectRoom.id === "") {
      Alert.alert("Vui lòng chọn phòng!");
    } else {
      CONTRACTS.doc(contractId)
        .set({
          id: contractId,
          active: true,
          billMonthYear: "",
          room: selectRoom,
          renter: selectRenter,
          createDay: dateToString(new Date()),
          startDay: dateToString(startDay),
          payStart: dateToString(startDay),
          endDay: dateToString(endDay),
          chuki,
          tiencoc,
        })
        .then(() => {
          const batch = firestore().batch();
          const renterRef = RENTERS.doc(selectRenter.id);
          batch.update(renterRef, {
            contracts: firestore.FieldValue.arrayUnion(contractId),
          });
          const roomRef = ROOMS.doc(selectRoom.id);
          batch.update(roomRef, {
            contract: contractId,
            state: false,
            renters: firestore.FieldValue.arrayUnion(
              //selectRenter.id,
              ...renterList.map((renter) => renter.id)
            ),
          });
          renterList.forEach((renter) => {
            if (renter.room.id !== "") {
              const prevRoomRef = ROOMS.doc(renter.room.id);
              batch.update(prevRoomRef, {
                renters: firestore.FieldValue.arrayRemove(renter.id),
              });
            }
            const rentersRef = RENTERS.doc(renter.id);
            batch.update(rentersRef, {
              room: {
                id: selectRoom.id,
                name: selectRoom.name,
                contract: contractId,
              },
            });
          });
          return batch.commit();
        })
        .then(() => {
          Alert.alert("Tạo hợp đồng mới thành công");
          navigation.goBack();
        })
        .catch((e) => {
          Alert.alert(e.message);
        });
    }
  };

  useEffect(() => {
    console.log(roomId);
    if (roomId != "") {
      setSelectRoom({
        id: roomId,
        name: rName,
        price: rPrice,
        maxPeople: rMaxPeople,
      });
      setDisabled(false);
    }
  }, []);

  useEffect(() => {
    const loadRoom = ROOMS.where("state", "==", true).onSnapshot(
      (response) => {
        const arr = [];
        response.forEach((doc) => {
          const data = doc.data();
          if (data.id != null) {
            arr.push(data);
          }
        });
        setRoomData(arr);
      },
      (error) => {
        console.error(error);
      }
    );
    const loadRenter = RENTERS.where("active", "==", true).onSnapshot(
      (response) => {
        const arr = [];
        response.forEach((doc) => {
          const data = doc.data();
          if (data.id != null) {
            arr.push(data);
          }
        });
        setRenterData(arr);
        setExcludeRenter(arr);
      },
      (error) => {
        console.error(error);
      }
    );
    return () => {
      loadRoom();
      loadRenter();
    };
  }, [userLogin]);
  useEffect(() => {
    if (endDay && endDay < startDay) {
      Alert.alert("Lỗi", "Ngày kết thúc không thể nhỏ hơn ngày bắt đầu.");
      setEndDay(startDay);
    }
  }, [startDay, endDay]);

  const toggleRenterSelect = () => {
    setIsRenterSelectVisible(!isRenterSelectVisible);
    if (!isRenterSelectVisible) {
      navigation.navigate("Renters", {
        onSelectRenter: (renter) => {
          setSelectRenter({
            id: renter.id,
            name: renter.fullName,
            cccd: renter.cccd,
          });
          setIsRenterSelectVisible(false);
          navigation.goBack(); // Quay lại màn hình trước đó sau khi chọn người thuê chính
        },
      });
    }
  };

  const toggleRoomSelect = () => {
    setIsRoomSelectVisible(!isRoomSelectVisible);
    if (!isRoomSelectVisible) {
      navigation.navigate("RoomsEmpty", {
        onSelectRoom: (room) => {
          setSelectRoom({
            id: room.id,
            name: room.roomName,
            price: room.price,
            maxPeople: room.maxPeople,
          });
          setDisabled(false);
          setIsRoomSelectVisible(false);
          navigation.goBack(); // Quay lại màn hình trước đó sau khi chọn phòng
        },
      });
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const handleRenterInclude = (item) => {
    if (renterList.length + 1 > selectRoom.maxPeople) {
      // +1 cho người thuê chính
      Alert.alert(
        `Số lượng người thuê không được vượt quá ${selectRoom.maxPeople}`
      );
    } else {
      setRenterList((prev) =>
        [...prev, item].sort((a, b) => a.index - b.index)
      );
      setExcludeRenter((prev) =>
        prev.filter((renter) => renter.id !== item.id)
      );
      toggleModal();
    }
  };

  const handleRenterExclude = (item) => {
    setExcludeRenter((prev) =>
      [...prev, item].sort((a, b) => a.index - b.index)
    );
    setRenterList((prev) => prev.filter((renter) => renter.id !== item.id));
  };
  const handleRoomSelect = (id, name, contract) => {
    setSelectRoom({ id, name, contract });
  };
  const renderItem = ({ item }) => {
    const { fullName, phone } = item;
    return (
      <View style={{ margin: 10, marginHorizontal: 15 }}>
        <TouchableOpacity activeOpacity={1} style={styles.itemContainer}>
          <View style={{ alignItems: "flex-start", width: "60%" }}>
            <Text
              style={{ fontWeight: "bold", fontSize: 19, color: "#ff9900" }}
            >
              {fullName}
            </Text>
            <Text style={{ fontSize: 17, color: "#b3b3b3" }}>{phone}</Text>
          </View>
          <View style={{ alignItems: "flex-end", width: "40%" }}>
            {item.room.id == "" ? (
              <Text style={{ fontSize: 17, color: "#ff1a1a" }}>
                Chưa cấp phòng
              </Text>
            ) : (
              <Text style={{ fontSize: 17, color: "#ff1a1a" }}>
                {item.room.name}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <IconButton
          icon="minus-box"
          size={40}
          style={{ top: -25, position: "absolute", right: -25 }}
          iconColor="red"
          onPress={() => handleRenterExclude(item)}
        />
      </View>
    );
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <Text variant="headlineSmall" style={styles.txt}>
          Người thuê chính <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TouchableOpacity onPress={toggleRenterSelect}>
          <Text style={styles.selectionText}>
            {selectRenter.name || "Chưa chọn người thuê chính"}
          </Text>
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.txt}>
          Phòng <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TouchableOpacity onPress={toggleRoomSelect}>
          <Text style={styles.selectionText}>
            {selectRoom.name || "Chưa chọn phòng"}
          </Text>
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.txt}>
          Ngày bắt đầu
        </Text>
        <View style={{ margin: 10, marginHorizontal: 15 }}>
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={() => setStartOpen(true)}
            disabled
          >
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
            style={{ flexDirection: "row" }}
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
                style={{ top: -15 }}
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
        <Text variant="headlineSmall" style={styles.txt}>
          Tiền cọc
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Nhập Tiền cọc"
          underlineColor="transparent"
          value={tiencoc}
          onChangeText={(text) => setTiencoc(Number(text))}
          style={styles.txtInput}
          maxLength={12}
        />
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
        <View
          style={{
            height: 50,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text variant="headlineSmall" style={styles.txt}>
            Người thuê
          </Text>
          <IconButton
            icon="plus-circle"
            size={40}
            style={{ top: 5 }}
            iconColor="#00e600"
            onPress={toggleModal}
            disabled={disabled}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <FlatList
            contentContainerStyle={{
              alignSelf: "center",
              marginTop: 10,
              justifyContent: "center",
            }}
            data={renterList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            //showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "50%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={handleAddNewContract}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Tạo hợp đồng
          </Text>
        </Button>
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              {excludeRenter.map((item, index) => (
                <RenterInclude
                  key={index}
                  item={item}
                  tpye="add"
                  onSelect={handleRenterInclude}
                />
              ))}
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
  selectionText: {
    fontSize: 17,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 10,
    borderRadius: 5,
  },
  txtInput: {
    margin: 10,
    marginTop: 0,
    backgroundColor: "none",
    borderBottomWidth: 1,
  },
  btnMore: {},
  footer: {
    height: 50,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
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
    flexDirection: "row",
    borderWidth: 1,
    minHeight: 80,
    borderRadius: 10,
    padding: 10,

    alignItems: "center",
  },
});
