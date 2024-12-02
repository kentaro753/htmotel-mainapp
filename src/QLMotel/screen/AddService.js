import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Button, Text, TextInput, Icon } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useMyContextProvider } from "../store/index";
import Modal from "react-native-modal";
import IconComponent from "../Component/IconComponent";
import firestore from "@react-native-firebase/firestore";
import RoomCheckBox from "../Component/RoomCheckBox";

export default function AddService({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const [serviceName, setServiceName] = useState("");
  const [fee, setFee] = useState(0);
  const [note, setNote] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [selectValue, setSelectValue] = useState(1);
  const [selectIcon, setSelectIcon] = useState("help");
  const [disabled, setDisabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const [checkedRooms, setCheckedRooms] = useState([]);
  const { userLogin } = controller;
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("ROOMS");
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("SERVICES");

  const handleAddNewService = () => {
    try {
      if (serviceName === "") {
        Alert.alert("Tên dịch vụ không được bỏ trống!");
      } else if (fee <= 0) {
        Alert.alert("Phí dịch vụ không được nhỏ hơn hoặc bằng 0!");
      } else if (
        (selectValue == 1 && confirmValue == "") ||
        (selectValue == 5 && confirmValue == "")
      ) {
        Alert.alert("Đơn vị thu phí không được bỏ trống!");
      } else {
        SERVICES.add({
          serviceName,
          fee,
          chargeType: selectValue,
          chargeBase: confirmValue,
          icon: selectIcon,
          note,
          rooms: checkedRooms,
        })
          .then((docRef) => {
            SERVICES.doc(docRef.id).update({ id: docRef.id });
            const newServiceId = docRef.id;
            const batch = firestore().batch();

            checkedRooms.forEach((roomId) => {
              const roomRef = ROOMS.doc(roomId);
              batch.update(roomRef, {
                services: firestore.FieldValue.arrayUnion({
                  id: newServiceId,
                  chargeType: selectValue,
                }),
              });
            });

            return batch.commit();
          })
          .then(() => {
            Alert.alert("Thêm dịch vụ mới thành công");
            navigation.goBack();
          })
          .catch((e) => {
            Alert.alert(e.message);
          });
      }
    } catch (e) {
      Alert.alert(e.message);
    }
  };

  useEffect(() => {
    ROOMS.orderBy("roomName", "asc").onSnapshot(
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
  }, [userLogin]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleIconSelect = (icon) => {
    setSelectIcon(icon);
    toggleModal();
  };

  const handleRoomChange = (id, checked) => {
    setCheckedRooms((prev) => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter((roomId) => roomId !== id);
      }
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <Text variant="headlineSmall" style={styles.txt}>
          Tên dịch vụ <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          placeholder="Điện, Nước, ..."
          underlineColor="transparent"
          value={serviceName}
          onChangeText={setServiceName}
          style={styles.txtInput}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Thu phí dựa trên{" "}
          {selectValue == 1 || selectValue == 5 ? (
            <Text style={{ color: "red" }}>*</Text>
          ) : null}
        </Text>
        <TextInput
          value={confirmValue}
          onChangeText={setConfirmValue}
          placeholder="Theo chỉ số, phòng, người, số lần,..."
          underlineColor="transparent"
          style={styles.txtInput}
          disabled={disabled}
        />
        <Picker
          selectedValue={selectValue}
          onValueChange={(itemValue) => {
            setSelectValue(itemValue);
            switch (itemValue) {
              case 2:
                setConfirmValue("Phòng");
                setDisabled(true);
                break;
              case 3:
                setConfirmValue("Người");
                setDisabled(true);
                break;
              case 4:
                setConfirmValue("Lần");
                setDisabled(true);
                break;
              case 1:
              case 5:
                setConfirmValue("");
                setDisabled(false);
                break;
              default:
                break;
            }
          }}
        >
          <Picker.Item label="Theo chỉ số đồng hồ" value={1} />
          <Picker.Item label="Phòng" value={2} />
          <Picker.Item label="Người" value={3} />
          <Picker.Item label="Số lần sử dụng" value={4} />
          <Picker.Item label="Khác" value={5} />
        </Picker>
        <Text variant="headlineSmall" style={styles.txt}>
          Phí dịch vụ <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="0đ"
          underlineColor="transparent"
          value={fee}
          onChangeText={(text) => setFee(Number(text))}
          style={styles.txtInput}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Icon đại diện
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <TouchableOpacity
            style={{
              marginBottom: 5,
              alignItems: "center",
              marginRight: 5,
              width: "31%",
              aspectRatio: 1,
              justifyContent: "center",
            }}
            onPress={toggleModal}
          >
            <View
              style={{
                alignItems: "center",
              }}
            >
              <Icon source={selectIcon} size={50} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginBottom: 5,
              alignItems: "center",
              marginRight: 5,
              width: "31%",
              aspectRatio: 1,
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
              <Text style={{ fontSize: 18, right: 0 }}>Chọn Icon</Text>
              <Icon source="chevron-right" size={35} />
            </View>
          </TouchableOpacity>
        </View>
        <Text variant="headlineSmall" style={styles.txt}>
          Áp dụng dịch vụ cho các phòng
        </Text>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.modalContent}>
            {roomData.map((item,index) => (
              <RoomCheckBox
                key={index}
                item={item}
                onChange={handleRoomChange}
              />
            ))}
          </View>
        </ScrollView>
        <Text variant="headlineSmall" style={styles.txt}>
          Ghi chú
        </Text>
        <TextInput
          placeholder="Ghi chú"
          underlineColor="transparent"
          value={note}
          onChangeText={setNote}
          style={styles.txtInput}
          multiline={true}
        />
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "50%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={handleAddNewService}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Thêm dịch vụ
          </Text>
        </Button>
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              {[
                "lightbulb-on-outline",
                "lightning-bolt-circle",
                "lightning-bolt",
                "lightbulb-cfl",
                "lightbulb-fluorescent-tube-outline",
                "lightbulb",
                "flashlight",
                "home-lightning-bolt",
                "water",
                "water-pump",
                "swim",
                "wifi",
                "car-side",
                "washing-machine",
                "car-wash",
                "fridge-outline",
                "television",
                "deskphone",
                "desktop-tower-monitor",
                "ceiling-fan",
                "fan",
                "air-conditioner",
                "hair-dryer",
                "iron-outline",
                "bed",
                "file-cabinet",
                "bicycle",
                "bicycle-electric",
                "motorbike",
                "motorbike-electric",
              ].map((icon, index) => (
                <IconComponent
                  key={index}
                  source={icon}
                  onSelect={handleIconSelect}
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
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 22 }}>
              Dismiss
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
    justifyContent: "flex-start",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
