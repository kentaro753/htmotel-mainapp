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
import ImageCropPicker from "react-native-image-crop-picker";
import storage from "@react-native-firebase/storage";
import { formatWithDots } from "../Component/SmallComponent";

export default function AddRoom({ navigation, route }) {
  const { id } = route.params || {};
  const [controller, dispatch] = useMyContextProvider();
  const [roomName, setRoomName] = useState("");
  const [price, setPrice] = useState(0);
  const [mota, setMota] = useState("");
  const [billNote, setBillNote] = useState("");
  const [maxPeople, setMaxPeople] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [images, setImages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [includeService, setIncludeService] = useState([]);
  const [excludeService, setExcludeService] = useState([]);
  const { userLogin } = controller;
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("ROOMS");
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("SERVICES");

  const handleAddNewRoom = async () => {
    try {
      const roomQuery = await ROOMS.where("roomName", "==", roomName).get();

      if (roomName === "") {
        Alert.alert("Tên phòng không được bỏ trống!");
      } else if (price <= 0) {
        Alert.alert("Phí thuê phòng không được nhỏ hơn hoặc bằng 0!");
      } else if (maxPeople <= 0) {
        Alert.alert("Số người tối đa phòng không được nhỏ hơn hoặc bằng 0!");
      } else if (!roomQuery.empty) {
        Alert.alert("Phòng đã tồn tại!");
      } else {
        ROOMS.add({
          roomName,
          price,
          contract: "",
          mota,
          maxPeople,
          billNote,
          state: true,
          requests: [],
          services: includeService.map((service) => ({
            id: service.id,
            chargeType: service.chargeType,
          })),
        })
          .then(async (docRef) => {
            let upImage = [];
            ROOMS.doc(docRef.id).update({
              id: docRef.id,
              images: upImage,
            });
            if (imageCount !== 0) {
              const uploadPromises = images.map(async (image, index) => {
                const position = index + 1; // Vị trí hiện tại của ảnh trong danh sách
                const refImage = storage().ref(
                  `/images/${id}-image${position}.jpg`
                );

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
              await ROOMS.doc(docRef.id).update({ images: upImage });
            }
            const newRoomId = docRef.id;
            const batch = firestore().batch();

            includeService.forEach((service) => {
              const serviceRef = SERVICES.doc(service.id);
              batch.update(serviceRef, {
                rooms: firestore.FieldValue.arrayUnion(newRoomId),
              });
            });

            return batch.commit();
          })
          .then(() => {
            Alert.alert("Thêm phòng mới thành công");
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
    if (id) {
      ROOMS.doc(id).onSnapshot((response) => {
        const data = response.data();
        setBillNote(data.billNote);
        setPrice(data.price.toString());
        setMaxPeople(data.maxPeople.toString());
        setMota(data.mota);
        setImages(data.images);
        setImageCount(data.images.length);
        SERVICES.onSnapshot((response) => {
          const arr = [];
          response.forEach((doc, index) => {
            const sdata = doc.data();
            if (sdata.id != null) {
              arr.push({ ...sdata, index });
            }
          });
          setExcludeService(
            arr.filter(
              (inServices) =>
                !data.services.some((service) => service.id === inServices.id)
            )
          );
          setIncludeService(
            arr.filter((inServices) =>
              data.services.some((service) => service.id === inServices.id)
            )
          );
        });
      });
    } else {
      SERVICES.onSnapshot(
        (response) => {
          const arr = [];
          response.forEach((doc, index) => {
            const data = doc.data();
            if (data.id != null) {
              arr.push({ ...data, index });
            }
          });
          setExcludeService(arr);
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }, [userLogin]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
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
        console.log(images);
      })
      .catch((e) => console.log(e.message));
  };
  const handleImageExclude = (item) => {
    setImages((prev) => prev.filter((image) => image !== item));
    setImageCount(imageCount - 1);
  };
  const handleServiceExclude = (item) => {
    setExcludeService((prev) =>
      [...prev, item].sort((a, b) => a.index - b.index)
    );
    setIncludeService((prev) =>
      prev.filter((service) => service.id !== item.id)
    );
  };
  const renderService = ({ item }) => {
    const { serviceName, icon, fee, chargeBase } = item;
    return (
      <View>
        <TouchableOpacity activeOpacity={1} style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Icon source={icon} size={50} />
            <Text>{serviceName}</Text>
            <Text>
              {formatWithDots(fee.toString())}đ/{chargeBase}
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
          Tên phòng <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          placeholder="101,102,A01,B01..."
          underlineColor="transparent"
          value={roomName}
          onChangeText={setRoomName}
          style={styles.txtInput}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Phí thuê phòng theo tháng <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="0đ"
          underlineColor="transparent"
          value={price}
          onChangeText={(text) => setPrice(Number(text))}
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
          Số người tối đa <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="2,4,..."
          underlineColor="transparent"
          value={maxPeople}
          onChangeText={(text) => setMaxPeople(Number(text))}
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
            style={{ top: 5 }}
            iconColor="#00e600"
            onPress={toggleModal}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <FlatList
            contentContainerStyle={{
              flex: 1,
              alignSelf: "center",
              marginTop: 10,
            }}
            numColumns={3}
            data={includeService}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderService}
            //showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
        {/* <Text variant="headlineSmall" style={styles.txt}>
          Ghi chú cho hóa đơn
        </Text>
        <TextInput
          placeholder="Ghi chú"
          underlineColor="transparent"
          value={billNote}
          onChangeText={setBillNote}
          style={styles.txtInput}
          multiline={true}
        /> */}
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "50%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={handleAddNewRoom}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Thêm phòng</Text>
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
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }}>
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
    width: Dimensions.get("window").width / 3 - 10, // Điều chỉnh kích thước cho phù hợp
    aspectRatio: 1,
    justifyContent: "center",
  },
  itemContent: {
    alignItems: "center",
  },
});
