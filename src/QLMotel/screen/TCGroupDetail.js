import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Button, Text, TextInput, Icon, RadioButton } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useMyContextProvider } from "../store/index";
import Modal from "react-native-modal";
import IconComponent from "../Component/IconComponent";
import firestore from "@react-native-firebase/firestore";
import RoomCheckBox from "../Component/RoomCheckBox";

export default function TCGroupDetail({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [name, setName] = useState("");
  const [originName, setOriginName] = useState("");
  const [note, setNote] = useState("");
  const [target, setTarget] = useState(1);
  const [selectIcon, setSelectIcon] = useState("help");
  const [type, setType] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userLogin } = controller;
  const TCGROUPS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("TCGROUPS");
  const handleUpdateGroup = async () => {
    try {
      const groupQuery = await TCGROUPS.where("name", "==", name).get();
      if (name === "") {
        Alert.alert("Tên nhóm giao dịch không được bỏ trống!");
      } else if (!groupQuery.empty && name != originName) {
        Alert.alert("Nhóm giao dịch này đã tồn tại!");
      } else {
        TCGROUPS.doc(id)
          .update({
            type,
            name,
            icon: selectIcon,
            target,
            note,
            canDelete: true,
          })
          .then(() => {
            Alert.alert("Cập nhật nhóm giao dịch thành công");
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
    const loadgroup = TCGROUPS.doc(id).onSnapshot((response) => {
      const data = response.data();
      setName(data.name);
      setOriginName(data.name);
      setType(data.type);
      setTarget(data.target);
      setSelectIcon(data.icon);
      setNote(data.note);
    });
    return () => {
      loadgroup();
    };
  }, [userLogin, id]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleIconSelect = (icon) => {
    setSelectIcon(icon);
    toggleModal();
  };

  // const handleRoomChange = (id, checked) => {
  //   setCheckedRooms((prev) => {
  //     if (checked) {
  //       return [...prev, id];
  //     } else {
  //       return prev.filter((roomId) => roomId !== id);
  //     }
  //   });
  // };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            margin: 20,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <RadioButton
              color="#ff5c33"
              status={type ? "checked" : "unchecked"}
              onPress={() => setType(true)}
            />
            <Text
              style={{
                fontSize: 20,
                alignSelf: "center",
                color: type ? "#ff5c33" : "#000",
              }}
            >
              Khoản thu
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <RadioButton
              color="#ff5c33"
              status={type ? "unchecked" : "checked"}
              onPress={() => setType(false)}
            />
            <Text
              style={{
                fontSize: 20,
                alignSelf: "center",
                color: type ? "#000" : "#ff5c33",
              }}
            >
              Khoản chi
            </Text>
          </View>
        </View>
        <Text variant="headlineSmall" style={styles.txt}>
          Tên nhóm giao dịch <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          placeholder="Nhập tên nhóm giao dịch"
          underlineColor="transparent"
          value={name}
          onChangeText={setName}
          style={styles.txtInput}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Đối tượng
        </Text>
        <Picker
          selectedValue={target}
          onValueChange={(itemValue) => {
            setTarget(itemValue);
            switch (itemValue) {
              case "ROOMS":
                break;
              case "RENTERS":
                break;
              case "SERVICES":
                break;
              case "Không":
                break;
              default:
                break;
            }
          }}
        >
          <Picker.Item label="Không" value="Không" />
          <Picker.Item label="Phòng" value="ROOMS" />
          <Picker.Item label="Người thuê" value="RENTERS" />
          <Picker.Item label="Dịch vụ" value="SERVICES" />
        </Picker>
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
          onPress={handleUpdateGroup}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Cập nhật</Text>
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
                "account-cash",
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
});
