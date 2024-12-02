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
import { Button, Icon, IconButton, Text, TextInput } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import Modal from "react-native-modal";
import firestore, { query } from "@react-native-firebase/firestore";
import ServiceIcon from "../Component/ServiceIcon";
import ImageCropPicker from "react-native-image-crop-picker";
import storage from "@react-native-firebase/storage";
import { sendRenterNotification } from "../Component/SmallComponent";

export default function RoomUpdate({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [renterId, setRenterId] = useState("");
  const [service, setService] = useState([]);
  const [room, setRoom] = useState("");
  const [roomName, setRoomName] = useState("");
  const [originName, setOriginName] = useState("");
  const [price, setPrice] = useState("");
  const [mota, setMota] = useState("");
  const [billNote, setBillNote] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [state, setState] = useState(true);
  const [imageCount, setImageCount] = useState(0);
  const [images, setImages] = useState([]);
  const [imageChange, setImageChange] = useState(0);
  const [requests, setRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [includeService, setIncludeService] = useState([]);
  const [excludeService, setExcludeService] = useState([]);
  const [checkedServices, setCheckedServices] = useState([]);
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
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("CONTRACTS");
  const THUCHIS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("THUCHIS");
  const handleUpdateRoom = async () => {
    try {
      const roomQuery = await ROOMS.where("roomName", "==", roomName).get();
      var notification = {
        title: "Đã thêm dịch vụ yêu cầu",
        body: `Dịch vụ được yêu cầu của phòng ${roomName} đã được thêm. Vui lòng kiểm tra!`,
      };
      var icon = "check-circle";
      if (roomName === "") {
        Alert.alert("Tên phòng không được bỏ trống!");
        return;
      }
      if (Number(price) <= 0) {
        Alert.alert("Phí thuê phòng không được nhỏ hơn hoặc bằng 0!");
        return;
      }
      if (Number(maxPeople) <= 0) {
        Alert.alert("Số người tối đa phòng không được nhỏ hơn hoặc bằng 0!");
        return;
      }
      if (!roomQuery.empty && roomName !== originName) {
        Alert.alert("Phòng đã tồn tại!");
        return;
      }
      // Kiểm tra yêu cầu dịch vụ chưa được thêm
      const missingRequests = requests.filter(
        (requestId) =>
          !includeService.some((service) => service.id === requestId)
      );

      if (missingRequests.length > 0) {
        notification = {
          title: "Từ chối yêu cầu thêm dịch vụ",
          body: `Dịch vụ được yêu cầu của phòng ${roomName} đã được bị từ chối! Vui lòng kiểm tra!`,
        };
        icon = "close-circle";
        Alert.alert(
          "Yêu cầu dịch vụ",
          "Còn yêu cầu dịch vụ chưa được thêm. Bạn có muốn hủy những yêu cầu đó không?",
          [
            {
              text: "Hủy",
              style: "cancel",
              onPress: () => {
                console.log("Người dùng hủy thao tác cập nhật.");
              },
            },
            {
              text: "Tiếp tục",
              onPress: async () => {
                await updateRoomData(); // Gọi hàm cập nhật
                await sendRenterNotification(renterId, notification, icon);
              },
            },
          ]
        );
        return;
      }

      // Nếu không có yêu cầu bị thiếu thì tiếp tục cập nhật
      await updateRoomData();
      if (requests.length > 0) {
        await sendRenterNotification(renterId, notification, icon);
      }
    } catch (e) {
      Alert.alert(e.message);
    }
  };
  const updateRoomData = async () => {
    try {
      // Cập nhật thông tin phòng
      const notification = {
        title: "Thông tin phòng đã cập nhật",
        body: `Thông tin phòng ${roomName} đã được cập nhật. Vui lòng kiểm tra!`,
      };
      const icon = "home-edit";
      await ROOMS.doc(id).update({
        roomName,
        price: Number(price),
        userId: userLogin.email,
        mota,
        maxPeople: Number(maxPeople),
        billNote,
        requests: [],
        services: includeService.map((service) => ({
          id: service?.id,
          chargeType: service?.chargeType,
        })),
      });
      let upImage = [];

      if (imageCount !== 0 && imageChange !== 0) {
        const uploadPromises = images.map(async (image, index) => {
          const position = index + 1; // Vị trí hiện tại của ảnh trong danh sách
          const refImage = storage().ref(`/images/${id}-image${position}.jpg`);

          if (image.url.startsWith("https://")) {
            // Tải dữ liệu từ URL cũ
            try {
              const response = await fetch(image.url);
              const blob = await response.blob();

              // Tải lên vị trí mới trong Firebase
              await refImage.put(blob);
              const link = await refImage.getDownloadURL();

              // Cập nhật URL mới
              upImage.push({ url: link });
            } catch (e) {
              console.error("Lỗi khi sao chép ảnh cũ:", e.message);
            }
          } else {
            // Tải ảnh mới lên Firebase
            try {
              await refImage.putFile(image.url);
              const link = await refImage.getDownloadURL();
              upImage.push({ url: link });
            } catch (e) {
              console.error("Lỗi khi tải lên ảnh mới:", e.message);
            }
          }
        });

        // Chờ tất cả ảnh được xử lý
        await Promise.all(uploadPromises);

        // Cập nhật danh sách ảnh lên Firestore
        await ROOMS.doc(id).update({ images: upImage });
      }
      const batch = firestore().batch();

      // Cập nhật dịch vụ đã chọn
      includeService.forEach((service) => {
        const serviceRef = SERVICES.doc(service.id);
        batch.update(serviceRef, {
          rooms: firestore.FieldValue.arrayUnion(id),
        });
      });

      // Xóa các dịch vụ đã bị bỏ chọn
      const previouslyCheckedServices = room.services || [];
      const uncheckedServices = previouslyCheckedServices.filter(
        (serviceId) => !checkedServices.includes(serviceId)
      );

      uncheckedServices.forEach((serviceId) => {
        const serviceRef = SERVICES.doc(serviceId);
        batch.update(serviceRef, {
          rooms: firestore.FieldValue.arrayRemove(id),
        });
      });
      const cquery = await CONTRACTS.where("room.id", "==", id).get();
      if (!cquery.empty) {
        cquery.forEach((doc) => {
          batch.update(doc.ref, {
            "room.maxPeople": maxPeople,
            "room.price": price,
          });
        });
      }
      // Cập nhật tên phòng cho các bảng khác nếu tên phòng thay đổi
      if (roomName !== originName) {
        console.log(123);
        const rquery = await RENTERS.where("room.id", "==", id).get();
        const iquery = await INDICES.where("room.id", "==", id).get();
        console.log(rquery);
        const bquery = await BILLS.where("room.id", "==", id).get();
        const tcquery = await THUCHIS.where("target.id", "==", id).get();
        if (!rquery.empty) {
          rquery.forEach((doc) => {
            batch.update(doc.ref, {
              "room.name": roomName,
            });
          });
        }
        if (!iquery.empty) {
          iquery.forEach((doc) => {
            batch.update(doc.ref, {
              "room.name": roomName,
            });
          });
        }
        if (!cquery.empty) {
          cquery.forEach((doc) => {
            batch.update(doc.ref, {
              "room.name": roomName,
            });
          });
        }
        if (!bquery.empty) {
          bquery.forEach((doc) => {
            batch.update(doc.ref, {
              "room.name": roomName,
            });
          });
        }
        if (!tcquery.empty) {
          tcquery.forEach((doc) => {
            batch.update(doc.ref, {
              "target.name": roomName,
            });
          });
        }
      }
      await batch.commit();
      if (renterId != "")
        await sendRenterNotification(renterId, notification, icon);
      Alert.alert("Cập nhật thông tin phòng thành công");
      navigation.goBack();
    } catch (e) {
      Alert.alert(e.message);
    }
  };

  useEffect(() => {
    const loadroom = ROOMS.doc(id).onSnapshot((response) => {
      const data = response.data();
      if (data.contract != "") {
        CONTRACTS.doc(data.contract).onSnapshot((contract) => {
          const cData = contract.data();
          setRenterId(cData.renter.id);
        });
      }
      setRoom(data);
      setRoomName(data.roomName);
      setOriginName(data.roomName);
      setBillNote(data.billNote);
      setPrice(data.price.toString());
      setMaxPeople(data.maxPeople.toString());
      setMota(data.mota);
      setState(data.state);
      setImages(data.images);
      setRequests(data.requests);
      setCheckedServices(data.services);
      setImageCount(data.images.length);
      console.log(data.images);
    });

    return () => {
      loadroom();
    };
  }, [id]);

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
        setExcludeService(
          arr.filter(
            (service) =>
              !checkedServices.some(
                (checkedService) => checkedService.id === service.id
              )
          )
        );
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
  }, [userLogin.email, checkedServices]);

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

  const handleUploadImage = () => {
    ImageCropPicker.openPicker({
      mediaType: "photo",
      cropping: true,
      freeStyleCropEnabled: false,
      width: 640,
      height: 360, // Kích thước
    })
      .then((pic) => {
        setImages((images) => [...images, { url: pic.path }]);
        setImageCount(imageCount + 1);
        setImageChange(imageChange + 1);
        console.log(images);
      })
      .catch((e) => console.log(e.message));
  };
  const handleImageExclude = (item) => {
    setImages((prev) => prev.filter((image) => image !== item));
    setImageCount(imageCount - 1);
    setImageChange(imageChange + 1);
  };
  const handleServiceSelect = (item) => {
    setIncludeService((prev) =>
      [...prev, item].sort((a, b) => a.index - b.index)
    );
    setExcludeService((prev) =>
      prev.filter((service) => service.id !== item.id)
    );
    toggleModal();
  };

  const handleServiceExclude = (item) => {
    setExcludeService((prev) =>
      [...prev, item].sort((a, b) => a.index - b.index)
    );
    setIncludeService((prev) =>
      prev.filter((service) => service.id !== item.id)
    );
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
              {fee} đ/{chargeBase}
            </Text>
          </View>
        </TouchableOpacity>
        <IconButton
          icon="minus-box"
          size={40}
          style={{ top: -19, position: "absolute", right: -16 }}
          iconColor="red"
          onPress={() => handleServiceExclude(item)}
        />
      </View>
    );
  };
  const renderImage = ({ item }) => {
    const { url } = item;
    return (
      <View>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            ...styles.itemContainer,
            width: Dimensions.get("window").width / 3.13 - 10,
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
          Trạng thái
        </Text>
        <View
          style={{
            margin: 10,
            backgroundColor: "none",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {state ? (
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#ff1a1a" }}
            >
              Trống
            </Text>
          ) : (
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#4da6ff" }}
            >
              Đang thuê
            </Text>
          )}
          {state && (
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
          )}
        </View>
        <Text variant="headlineSmall" style={styles.txt}>
          Tên phòng
        </Text>
        <TextInput
          placeholder="101,102,A01,B01..."
          underlineColor="transparent"
          value={roomName}
          onChangeText={setRoomName}
          style={styles.txtInput}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Phí thuê phòng theo tháng
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="0đ"
          underlineColor="transparent"
          value={price}
          onChangeText={(text) => setPrice(text)}
          style={styles.txtInput}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Mô tả
        </Text>
        <TextInput
          placeholder="Rộng, có gác, thoáng mát,..."
          underlineColor="transparent"
          value={mota}
          onChangeText={setMota}
          style={styles.txtInput}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Số người tối đa
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="2,4,..."
          underlineColor="transparent"
          value={maxPeople}
          onChangeText={(text) => setMaxPeople(text)}
          style={styles.txtInput}
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
            Ảnh của phòng {imageCount}/3
          </Text>
          <IconButton
            icon="plus-circle"
            size={40}
            style={{ top: 5 }}
            iconColor="#00e600"
            onPress={handleUploadImage}
            disabled={imageCount == 3}
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
        <View
          style={{
            height: 50,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text variant="headlineSmall" style={styles.txt}>
            Áp dụng dịch vụ
          </Text>
          <IconButton
            icon="plus-circle"
            size={40}
            style={{ top: 5, alignItems: "flex-start" }}
            iconColor="#00e600"
            onPress={toggleModal}
          />
          {requests.length > 0 && (
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                borderRadius: 10,
                backgroundColor: "#00e600",
                color: "white",
                padding: 5,
                alignSelf: "flex-end",
              }}
            >
              Có {requests.length} yêu cầu
            </Text>
          )}
        </View>

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

        <Text variant="headlineSmall" style={styles.txt}>
          Ghi chú cho hóa đơn
        </Text>
        <TextInput
          placeholder="Ghi chú"
          underlineColor="transparent"
          value={billNote}
          onChangeText={setBillNote}
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
          onPress={handleUpdateRoom}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Cập nhật phòng
          </Text>
        </Button>
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              {excludeService.length != 0 ? (
                excludeService.map((item) => (
                  <ServiceIcon
                    key={item.id}
                    item={item}
                    checked={requests.includes(item.id)}
                    type="add"
                    onPress={() => handleServiceSelect(item)}
                  />
                ))
              ) : (
                <Text style={{ color: "#000", fontSize: 20 }}>
                  Không còn dịch vụ
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
              paddingVertical: 5,
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
});
