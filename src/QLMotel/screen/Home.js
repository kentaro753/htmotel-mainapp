import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, FAB, Icon, IconButton, Text } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import { Dimensions } from "react-native";
import BieuDo from "../Component/BieuDo";
import firestore from "@react-native-firebase/firestore";

export default function Home({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [renterData, setRenterData] = useState([]);
  const [renters, setRenters] = useState(0);
  const [roomData, setRoomData] = useState([]);
  const [rooms, setRooms] = useState(0);
  const [emptyRoomData, setEmptyRoomData] = useState([]);
  const [emptyRooms, setEmptyRooms] = useState(0);
  const [isRequest, setIsRequest] = useState(false);
  const [requestRoom, setRequestRoom] = useState([]);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (userLogin == null) navigation.navigate("Login");
  }, [userLogin]);

  useEffect(() => {
    if (userLogin != null) {
      const RENTERS = firestore()
        .collection("USERS")
        .doc(userLogin?.email)
        .collection("RENTERS");
      const ROOMS = firestore()
        .collection("USERS")
        .doc(userLogin?.email)
        .collection("ROOMS");
      const SERVICES = firestore()
        .collection("USERS")
        .doc(userLogin?.email)
        .collection("SERVICES");
      const loadrenter = RENTERS.onSnapshot((response) => {
        var arr = [];
        response.forEach((doc) => {
          doc.data().id != null && arr.push(doc.data());
        });
        setRenterData(arr);
      });
      const loadroom = ROOMS.onSnapshot((response) => {
        var arr = [];
        var request = [];
        response.forEach((doc) => {
          if (doc.data().id != null) {
            const data = doc.data();
            arr.push(doc.data());
            if (data.requests.length > 0) request.push(data);
          }
        });
        setRequestRoom(request);
        setRoomData(arr);
      });
      const loademptyroom = ROOMS.where("state", "==", true).onSnapshot(
        (response) => {
          var arr = [];
          response.forEach((doc) => {
            doc.data().id != null && arr.push(doc.data());
          });
          setEmptyRoomData(arr);
        }
      );
      return () => {
        loadroom();
        loadrenter();
        loademptyroom();
      };
    }
  }, []);

  useEffect(() => {
    const roomCount = roomData ? roomData.length : 0;
    const emptyroomCount = emptyRoomData ? emptyRoomData.length : 0;
    const renterCount = renterData ? renterData.length : 0;
    setEmptyRooms(emptyroomCount);
    setRooms(roomCount);
    setRenters(renterCount);
  }, [renterData, roomData, emptyRoomData]);

  const renderRoom = (item, index) => {
    const { roomName, requests } = item;
    return (
      <TouchableOpacity
        key={index}
        style={{ ...styles.roomitem, borderTopWidth: index != 0 ? 1 : 0 }}
        onPress={() => navigation.navigate("RoomUpdate", { item: item })}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{roomName}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#ff7733", fontSize: 17 }}>
            Yêu cầu thêm {requests.length} dịch vụ
          </Text>
          <Icon source="chevron-right" size={35} />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          backgroundColor: "#ff3300",
          height: 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          variant="displaySmall"
          style={{ marginLeft: 10, color: "white", fontSize: 20 }}
        >
          {userLogin?.fullName?.toUpperCase() || ""}
        </Text>
        <View style={{ flexDirection: "row" }}>
          {/* <IconButton
          icon="account-circle"
          size={35}
          style={{ marginEnd: 0, width: 40 }}
          iconColor="white"
          onPress={() => navigation.navigate("Profile")}
        /> */}
          <IconButton
            icon="bell-outline"
            size={35}
            iconColor="white"
            style={{ marginStart: 0, width: 40 }}
            onPress={() => navigation.navigate("Notice")}
            // onPress={() => Alert.alert("Chưa được thực hiện!")}
          />
        </View>
      </View>
      <View
        style={{
          ...styles.viewBox,
          marginHorizontal: 20,
          marginTop: 10,
          marginBottom: 5,
          borderRadius: 1,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          overflow: "hidden",
        }}
      >
        <BieuDo navigation={navigation} />
      </View>
      <View
        style={{
          ...styles.viewBox,
          flexDirection: "row",
          marginHorizontal: 20,
          marginVertical: 10,
          paddingVertical: 20,
          borderRadius: 1,
          borderTopRightRadius: 14,
          borderTopLeftRadius: 14,
          borderBottomRightRadius: 14,
          borderBottomLeftRadius: 13.9,
          flexWrap: "wrap",
        }}
      >
        <View style={{ width: "40%", alignItems: "center" }}>
          <Text style={{ color: "#000", fontSize: 20 }}>Số phòng</Text>
          <Text style={{ color: "#000", fontSize: 20 }}>{rooms}</Text>
        </View>

        <View style={{ width: "40%", alignItems: "center" }}>
          <Text style={{ color: "#000", fontSize: 20 }}>Số người thuê</Text>
          <Text style={{ color: "#000", fontSize: 20 }}>{renters}</Text>
        </View>
        <View style={{ width: "40%", alignItems: "center" }}>
          <Text style={{ color: "#000", fontSize: 20 }}>Số phòng trống</Text>
          <Text style={{ color: "#000", fontSize: 20 }}>{emptyRooms}</Text>
        </View>
      </View>
      {requestRoom.length > 0 && (
        <View
          style={{
            ...styles.viewBox,
            marginHorizontal: 20,
            marginVertical: 10,
            paddingTop: 10,
            borderRadius: 1,
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 13.9,
          }}
        >
          {requestRoom.map((item, index) => {
            return renderRoom(item, index);
          })}
        </View>
      )}
      <View
        style={{
          ...styles.viewBox,
          flexDirection: "row",
          marginHorizontal: 20,
          marginVertical: 10,
          borderRadius: 1,
          borderTopRightRadius: 14,
          borderTopLeftRadius: 14,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
          paddingVertical: 20,
          flexWrap: "wrap",
        }}
      >
        <TouchableOpacity
          style={{ width: "30%", alignItems: "center", margin: 5 }}
          onPress={() => navigation.navigate("Services")}
        >
          <Icon
            source="lightbulb-variant"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="orange"
          />
          <Text style={{ color: "#000", fontSize: 20 }}>Dịch vụ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: "30%", alignItems: "center", margin: 5 }}
          onPress={() => navigation.navigate("TTabRenter")}
        >
          <Icon
            source="account-multiple"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="green"
          />
          <Text style={{ color: "#000", fontSize: 20 }}>Người thuê</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: "30%", alignItems: "center", margin: 5 }}
          onPress={() => navigation.navigate("TTabContract")}
        >
          <Icon
            source="handshake"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="royalblue"
          />
          <Text style={{ color: "#000", fontSize: 20 }}>Hợp đồng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: "30%", alignItems: "center", margin: 5 }}
          onPress={() => navigation.navigate("Indices")}
        >
          <Icon
            source="database-clock"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="#ff3300"
          />
          <Text style={{ color: "#000", fontSize: 18 }}>Chốt Dịch vụ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: "30%", alignItems: "center", margin: 5 }}
          onPress={() => navigation.navigate("TTabIncident")}
        >
          <Icon
            source="alert"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="#cc0000"
          />
          <Text style={{ color: "#000", fontSize: 18 }}>Sự cố</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: "30%", alignItems: "center", margin: 5 }}
          onPress={() => navigation.navigate("ThuChi")}
        >
          <Icon
            source="hand-coin"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="#9900ff"
          />
          <Text style={{ color: "#000", fontSize: 18 }}>Thu chi</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 35 }}></View>
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
  poster: {
    resizeMode: "center",
    height: 150,
    width: 150,
    borderRadius: 10,
  },
  txt: {
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 15,
  },
  txtTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  viewBox: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "space-around",
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
  roomitem: {
    flexDirection: "row",
    height: 50,
    borderRadius: 10,
    padding: 10,
    margin: 5,
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
  },
  fab: {
    backgroundColor: "#00e600",
    position: "absolute",
    margin: 26,
    right: 0,
    bottom: 0,
  },
});
