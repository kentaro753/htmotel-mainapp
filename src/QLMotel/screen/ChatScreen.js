import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useMyContextProvider } from "../store/index";
import { IconButton } from "react-native-paper";

export default function ChatScreen({ navigation, route }) {
  const { id, phone } = route.params;
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const MESSAGES = firestore()
    .collection("MESSAGES")
    .doc(id)
    .collection("MESSAGES");
  useEffect(() => {
    MESSAGES.orderBy("datetime", "asc").onSnapshot((querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    });
  }, [id]);
  useLayoutEffect(() => {
    if (phone != "") {
      navigation.setOptions({
        headerRight: (props) => (
          <IconButton
            icon="phone"
            //{...props}
            onPress={() =>
              Linking.openURL("tel:" + phone).catch((err) =>
                console.error("Không thể mở ứng dụng gọi điện", err)
              )
            }
            iconColor="white"
          />
        ),
      });
    }
  }, []);
  const sendMessage = () => {
    if (input.trim() !== "") {
      MESSAGES.add({
        datetime: new Date(),
        text: input,
        senderId: userLogin.email,
      })
        .then((docRef) => {
          setMessages([
            ...messages,
            {
              id: docRef.id,
              datetime: new Date(),
              text: input,
              senderId: userLogin.email,
            },
          ]);
          setInput("");
        })
        .catch((e) => {
          Alert.alert(e.message);
        });
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.senderId === userLogin.email;
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Danh sách tin nhắn */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />

      {/* Khung nhập tin nhắn */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: "80%",
    borderRadius: 10,
    padding: 10,
  },
  userMessage: {
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#999999",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 17,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ff944d",
    backgroundColor: "#ffccb3",
  },
  textInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ff944d",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 17,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 19,
  },
});
