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
import ImageCropPicker from "react-native-image-crop-picker";

export default function AddIndice({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const [service, setService] = useState([]);
  const [selectRoom, setSelectRoom] = useState({
    id: "",
    name: "",
    price: 0,
  });
  const [selectImage, setSelectImage] = useState("");
  const [selectItem, setSelectItem] = useState("");
  // const [previousIndiceId, setpreviousIndice] = useState("")
  const [imageHeight, setImageHeight] = useState(100);
  const [imageWidth, setImageWidth] = useState(
    Dimensions.get("window").width * 0.9
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRoomSelectVisible, setIsRoomSelectVisible] = useState(false);
  const [room, setRoom] = useState({});
  const [previousIndice, setPreviousIndice] = useState({});
  const [serviceIndices, setServiceIndices] = useState({});
  const [includeService, setIncludeService] = useState([]);
  const [datetime, setDatetime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const { userLogin } = controller;
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("ROOMS");
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("SERVICES");
  const INDICES = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("INDICES");

  const handleAddIndice = () => {
    let tempLoi = 0;

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
        data.newValue = parseInt(currentServiceIndices.newValue, 10) || 0;
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
        createDay: datetime.toLocaleDateString("en-GB"),
        editable: true,
        isLast: true,
        isBill: false,
        previousIndiceId: previousIndice.id || "",
        renterCount: room.renters ? room.renters.length : 0,
        id: INDICES.doc().id,
        monthYear: `${datetime.getMonth() + 1}/${datetime.getFullYear()}`,
        room: {
          id: selectRoom.id,
          name: selectRoom.name,
          price: selectRoom.price,
        },
        services: servicesData,
      };

      INDICES.doc(indiceData.id)
        .set(indiceData)
        .then(() => {
          if (previousIndice) {
            INDICES.doc(previousIndice.id).update({
              editable: false,
              isLast: false,
            });
          }
          Alert.alert("Thành công", "Dữ liệu đã được lưu");
          navigation.goBack();
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
  };
  const handleUploadImage = (id) => {
    ImageCropPicker.openPicker({
      mediaType: "photo",
      cropping: true,
    })
      .then((pic) => {
        handleInputChange(id, "image", pic.path); // Lưu toàn bộ đối tượng ảnh để lấy thông tin khi cần
        console.log(pic);
      })
      .catch((e) => console.log(e.message));
  };
  useEffect(() => {
    if (selectRoom.id) {
      const loadRoom = ROOMS.doc(selectRoom.id).onSnapshot(
        (response) => {
          const data = response.data();
          setRoom(data);
          setService(data.services);
          // Cập nhật danh sách dịch vụ của phòng
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
            }
          },
          (error) => {
            console.error(error);
          }
        );
      return () => loadIndice();
    }
  }, [room]);

  useEffect(() => {
    if (selectImage) {
      let imagePath = selectImage;

      const isLocal = selectImage.startsWith("/");

      if (isLocal) {
        imagePath = `file://${selectImage}`;
      }

      Image.getSize(
        imagePath,
        (width, height) => {
          const aspectRatio = height / width;
          const newHeight = imageWidth * aspectRatio;
          setImageHeight(newHeight);
        },
        (error) => {
          console.error("Lỗi khi lấy kích thước ảnh:", error);
        }
      );
    }
  }, [selectImage, imageWidth]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const toggleModalimage = (id, image) => {
    setSelectItem(id);
    setSelectImage(image);
    setIsModalVisible(!isModalVisible);
  };

  const toggleRoomSelect = () => {
    setIsRoomSelectVisible(!isRoomSelectVisible);
    if (!isRoomSelectVisible) {
      navigation.navigate("RoomsOccupied", {
        onSelectRoom: (room) => {
          setServiceIndices({});
          setIncludeService([]);
          setSelectRoom({
            id: room.id,
            name: room.roomName,
            price: room.price,
          });
          setDisabled(false);
          setIsRoomSelectVisible(false);

          navigation.goBack(); // Quay lại màn hình trước đó sau khi chọn phòng
        },
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
    const { serviceName, icon, fee, chargeBase, chargeType } = item;
    const currentServiceIndices = serviceIndices[item.id] || {};

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={{ flexDirection: "row", width: "100%" }}>
            <View style={{ flexDirection: "row", width: "75%" }}>
              <Text
                style={{ fontWeight: "bold", fontSize: 16, marginRight: 10 }}
              >
                {serviceName}
              </Text>
              <Text style={{ fontSize: 16 }}>
                {fee} đ/{chargeBase}
              </Text>
            </View>
            {/* {chargeType === 1 && !currentServiceIndices.image ? (
              <IconButton
                icon="camera-plus"
                size={30}
                onPress={() => handleUploadImage(item.id)}
                style={{
                  alignItems: "center",
                  width: "25%",
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              />
            ) : currentServiceIndices.image ? (
              <TouchableOpacity
                onPress={() =>
                  toggleModalimage(item.id, currentServiceIndices.image)
                }
                style={{
                  height: 45,
                  alignItems: "center",
                  width: "22%",
                  borderWidth: 1,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: currentServiceIndices.image }} // Sử dụng thuộc tính `path` của đối tượng hình ảnh trả về từ ImageCropPicker
                  style={{
                    height: 45,
                    alignItems: "center",
                    width: "100%",
                  }}
                />
              </TouchableOpacity>
            ) : null} */}
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
                    value={currentServiceIndices.newValue || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "newValue", text)
                    }
                    style={styles.txtInput}
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
                    value={currentServiceIndices.indexValue || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "indexValue", text)
                    }
                    style={styles.txtInput}
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
                    value={currentServiceIndices.indexValue || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "indexValue", text)
                    }
                    style={styles.txtInput}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <Text variant="headlineSmall" style={styles.txt}>
          Ngày chốt
        </Text>
        <View
          style={{ margin: 10, marginHorizontal: 15, justifyContent: "center" }}
        >
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={() => setOpen(true)}
            disabled={true}
          >
            <Text style={{ fontSize: 19, top: 10 }}>
              {datetime.toLocaleDateString("en-GB")}
            </Text>
            <IconButton
              icon="calendar"
              size={22}
              onPress={() => setOpen(true)}
              disabled={true}
            />
          </TouchableOpacity>
          <DatePicker
            modal
            open={open}
            date={datetime}
            mode={"date"}
            locale={"vi"}
            onConfirm={(date) => {
              setOpen(false);
              setDatetime(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
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
          {/* <IconButton
            icon="plus-circle"
            size={30}
            onPress={toggleRoomSelect}
            color="royalblue"
          /> */}
        </View>
        <Text variant="headlineSmall" style={styles.txt}>
          Dịch vụ
        </Text>
        <FlatList
          data={includeService}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.flatlst}
        />
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "50%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          disabled={disabled}
          onPress={handleAddIndice}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Chốt dịch vụ
          </Text>
        </Button>
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={{ flex: 1 }}>
          <View style={styles.modalContent}>
            <Image
              source={{
                uri: selectImage.startsWith("/")
                  ? `file://${selectImage}`
                  : selectImage,
              }}
              style={{
                height: imageHeight,
                width: imageWidth,
                alignItems: "center",
              }}
            />
            <IconButton
              icon="camera-flip"
              size={30}
              onPress={() => {
                toggleModal();
                handleUploadImage(selectItem);
              }}
              style={{
                alignItems: "center",
                width: "25%",
                borderWidth: 1,
                borderRadius: 10,
              }}
            />
          </View>

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
              Đóng
            </Text>
          </Button>
        </View>
      </Modal>
    </View>
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
});
