import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { Button, Text, TextInput, Icon, IconButton } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useMyContextProvider } from "../store/index";
import Modal from "react-native-modal";
import firestore from "@react-native-firebase/firestore";
import RoomSelect from "../Component/RoomSelect";
import ImageCropPicker from "react-native-image-crop-picker";
import storage from "@react-native-firebase/storage";

export default function RenterUpdate({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [fullName, setFullName] = useState("");
  const [cccd, setCccd] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [thuongtru, setThuongtru] = useState("");
  const [imageCount, setImageCount] = useState(0);
  const [images, setImages] = useState([]);
  const [selectRoom, setSelectRoom] = useState({
    id: "",
    name: "",
    contract: "",
  });
  const [previousRoom, setPreviousRoom] = useState("");
  const [sex, setSex] = useState(true);
  const [account, setAccount] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const [renter, setRenter] = useState([]);
  const { userLogin } = controller;
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("ROOMS");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("RENTERS");
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("CONTRACTS");
  const THUCHIS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("THUCHIS");
  const handleUpdateRenter = async () => {
    if (fullName === "") {
      Alert.alert("Họ tên không được bỏ trống!");
    } else if (cccd === "") {
      Alert.alert("Căn cước công dân không được bỏ trống!");
    } else if (phone === "") {
      Alert.alert("Số điện thoại không được bỏ trống!");
    } else if (thuongtru === "") {
      Alert.alert("Địa chỉ thường trú không được bỏ trống!");
    } else {
      console.log(
        fullName,
        sex,
        userLogin.email,
        cccd,
        phone,
        thuongtru,
        selectRoom,
        email
      );
      await RENTERS.doc(id)
        .update({
          fullName,
          sex,
          userId: userLogin.email,
          cccd,
          phone,
          thuongtru,
          room: selectRoom,
          email,
        })
        .then(() => {
          let upImage = [];
          if (imageCount !== 0) {
            let num = 1;

            // Tạo mảng các Promise tải lên ảnh
            const uploadPromises = images.map((image) => {
              if (image.url.startsWith("https://")) {
                // Nếu ảnh đã tồn tại trên Firebase, thêm vào danh sách mà không tải lại
                upImage = [...upImage, { url: image.url }];
                return Promise.resolve(); // Trả về Promise đã hoàn thành
              } else {
                // Nếu ảnh mới, thực hiện tải lên
                const refImage = storage().ref(
                  "/images/" + id + "-image" + num + ".jpg"
                );
                num += 1;

                return refImage
                  .putFile(image.url) // Tải file từ đường dẫn nội bộ
                  .then(() => refImage.getDownloadURL())
                  .then((link) => {
                    upImage = [...upImage, { url: link }]; // Thêm ảnh đã tải lên vào mảng
                  })
                  .catch((e) =>
                    console.error("Lỗi khi tải lên ảnh:", e.message)
                  );
              }
            });

            // Chờ tất cả các ảnh tải lên xong trước khi cập nhật Firestore
            Promise.all(uploadPromises)
              .then(() => {
                console.log("Danh sách ảnh tải lên hoàn chỉnh:", upImage);
                RENTERS.doc(id).update({ images: upImage });
              })
              .catch((e) =>
                console.error("Lỗi khi cập nhật Firestore:", e.message)
              );
          }
          const batch = firestore().batch();
          const currentRoomRef = ROOMS.doc(selectRoom.id);
          const previousRoomRef = ROOMS.doc(previousRoom);

          if (selectRoom.id !== "" && selectRoom.id !== previousRoom) {
            batch.update(currentRoomRef, {
              renters: firestore.FieldValue.arrayUnion(id),
            });

            if (previousRoom !== "") {
              batch.update(previousRoomRef, {
                renters: firestore.FieldValue.arrayRemove(id),
              });
            }
          } else if (selectRoom.id === "" && selectRoom.id !== previousRoom) {
            batch.update(previousRoomRef, {
              renters: firestore.FieldValue.arrayRemove(id),
            });
          }
          const cquery = CONTRACTS.where("renter.id", "==", id).get();
          const tcquery = THUCHIS.where("target.id", "==", id).get();
          if (!cquery.empty) {
            cquery.forEach((doc) => {
              batch.update(doc.ref, {
                "renter.cccd": cccd,
                "renter.name": fullName,
              });
            });
          }
          if (!tcquery.empty) {
            tcquery.forEach((doc) => {
              batch.update(doc.ref, {
                "target.name": fullName,
              });
            });
          }
          return batch.commit();
        })
        .then(() => {
          Alert.alert("Cập nhật thông tin người thuê thành công");
          navigation.goBack();
        })
        .catch((e) => {
          Alert.alert(e.message);
        });
    }
  };
  useEffect(() => {
    const loadroom = ROOMS.where("state", "==", false).onSnapshot(
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
    const loadrenter = RENTERS.doc(id).onSnapshot((response) => {
      const data = response.data();
      console.log(id);
      setRenter(data);
      setAccount(data.account);
      setFullName(data.fullName);
      setCccd(data.cccd);
      setPhone(data.phone);
      setSelectRoom(data.room);
      setThuongtru(data.thuongtru);
      setPhone(data.phone);
      setSex(data.sex);
      setEmail(data.email);
      setPreviousRoom(data.room.id);
      setImages(data.images);
      if (data.images) {
        setImageCount(data.images.length);
      }
    });
    return () => {
      loadroom();
      loadrenter();
    };
  }, [userLogin]);
  const handleUploadImage = () => {
    ImageCropPicker.openPicker({
      mediaType: "photo",
      cropping: true,
    })
      .then((pic) => {
        setImages((images) => [...images, { url: pic.path }]);
        setImageCount(imageCount + 1);
        console.log(images);
      })
      .catch((e) => console.log(e.message));
  };
  const handleImageExclude = (item) => {
    setImages((prev) => prev.filter((image) => image !== item));
    setImageCount(imageCount - 1);
  };
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleRoomSelect = (id, name, contract) => {
    setSelectRoom({ id, name, contract });
    toggleModal();
  };
  const renderImage = ({ item }) => {
    const { url } = item;
    return (
      <View>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            ...styles.itemContainer,
            width: Dimensions.get("window").width / 2.12 - 10,
            justifyContent: "flex-start",
            overflow: "hidden",
            borderWidth: 0,
          }}
        >
          <Image
            source={{
              uri: url,
            }}
            style={{
              height: "100%",
              alignItems: "center",
              width: "100%",
            }}
          />
        </TouchableOpacity>
        <IconButton
          icon="minus-box"
          size={40}
          style={{ top: -19, position: "absolute", right: -16 }}
          iconColor="red"
          onPress={() => handleImageExclude(item)}
        />
      </View>
    );
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <Text variant="headlineSmall" style={styles.txt}>
          Họ và tên <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          placeholder="Nhập họ và tên"
          underlineColor="transparent"
          value={fullName}
          onChangeText={setFullName}
          style={styles.txtInput}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Giới tính
        </Text>
        <Picker
          selectedValue={sex}
          onValueChange={(itemValue) => {
            setSex(itemValue);
          }}
        >
          <Picker.Item label="Nam" value={true} />
          <Picker.Item label="Nữ" value={false} />
        </Picker>
        <Text variant="headlineSmall" style={styles.txt}>
          Căn cước công dân <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Nhập căn cước căn công dân"
          underlineColor="transparent"
          value={cccd}
          onChangeText={setCccd}
          style={styles.txtInput}
          maxLength={12}
        />
        <View
          style={{
            height: 50,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text variant="headlineSmall" style={styles.txt}>
            Ảnh CCCD {imageCount}/2
          </Text>
          <IconButton
            icon="plus-circle"
            size={40}
            style={{ top: 5 }}
            iconColor="#00e600"
            onPress={handleUploadImage}
            disabled={imageCount == 2}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            borderRadius: 1,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
            height: 151,
            marginHorizontal: 8,
            marginVertical: 8,
            padding: 7,
            borderRadius: 1,
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 13.9,
          }}
        >
          <FlatList
            contentContainerStyle={{
              flex: 1,
              alignSelf: "flex-start",
              marginTop: 10,
            }}
            numColumns={3}
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderImage}
            //showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
        <Text variant="headlineSmall" style={styles.txt}>
          Số điện thoại <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Nhập số điện thoại"
          underlineColor="transparent"
          value={phone}
          onChangeText={setPhone}
          style={styles.txtInput}
          maxLength={10}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Email
        </Text>
        <TextInput
          placeholder="Nhập email"
          underlineColor="transparent"
          value={email}
          onChangeText={setEmail}
          style={styles.txtInput}
          disabled={account}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Địa chỉ thường trú <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          placeholder="Nhập địa chỉ thường trú"
          underlineColor="transparent"
          value={thuongtru}
          onChangeText={setThuongtru}
          style={styles.txtInput}
          multiline={true}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Phòng
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
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#ff9900" }}
              >
                {selectRoom.name || "Không cấp phòng"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginBottom: 5,
              alignItems: "center",
              marginRight: 5,
              width: "35%",
              aspectRatio: 1,
              justifyContent: "center",
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
              <Text style={{ fontSize: 18, right: 0 }}>Chọn Phòng</Text>
              <Icon source="chevron-right" size={35} />
            </View>
          </TouchableOpacity>
        </View>
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "62%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={handleUpdateRenter}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Cập nhật thông tin người thuê
          </Text>
        </Button>
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              {roomData.map((item, index) => (
                <RoomSelect
                  key={index}
                  item={item}
                  onSelect={handleRoomSelect}
                />
              ))}
              <TouchableOpacity
                style={{
                  borderBottomWidth: 1,
                  minHeight: 80,
                  padding: 10,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onPress={() => handleRoomSelect("", "", "")}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#ff9900" }}
                >
                  Không cấp phòng
                </Text>
              </TouchableOpacity>
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
  itemContainer: {
    marginBottom: 6,
    alignSelf: "center",
    alignItems: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderRadius: 15,
    justifyContent: "center",
  },
  itemContent: {
    alignItems: "center",
  },
});
