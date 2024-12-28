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
  const { id, phone, fullName } = route.params;
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const MESSAGES = firestore()
    .collection("MESSAGES")
    .doc(id)
    .collection("MESSAGES");
  useEffect(() => {
    MESSAGES.orderBy("datetime", "desc")
      .limit(15)
      .onSnapshot((querySnapshot) => {
        const loadedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(loadedMessages);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
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
        headerTitle: fullName.toString(),
      });
    }
  }, []);
  // Tải thêm tin nhắn cũ
  const loadMoreMessages = async () => {
    if (loadingMore || !lastVisible) return;
    setLoadingMore(true);
    const querySnapshot = await MESSAGES.orderBy("datetime", "desc")
      .startAfter(lastVisible)
      .limit(15)
      .get();
    const loadedMessages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (loadedMessages.length > 0) {
      setMessages((prevMessages) => [...prevMessages, ...loadedMessages]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } else {
      setLastVisible(null);
    }
    setLoadingMore(false);
  };

  const sendMessage = () => {
    if (input.trim() !== "") {
      MESSAGES.add({
        datetime: new Date(),
        text: input,
        senderId: userLogin?.email,
      })
        .then((docRef) => {
          // setMessages((prevMessages) => [
          //   {
          //     id: docRef.id,
          //     datetime: new Date(),
          //     text: input,
          //     senderId: userLogin?.email,
          //   },
          //   ...prevMessages,
          // ]);
          setInput("");
        })
        .catch((e) => {
          Alert.alert(e.message);
        });
    }
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.senderId === userLogin?.email;
    const { datetime } = item;

    const date =
      datetime instanceof firestore.Timestamp
        ? datetime.toDate()
        : new Date(datetime);

    const formatDate = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    const formatTime = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    const previousMessage = messages[index + 1];
    const previousDate =
      previousMessage && previousMessage.datetime instanceof firestore.Timestamp
        ? previousMessage.datetime.toDate()
        : previousMessage
        ? new Date(previousMessage.datetime)
        : null;

    const shouldShowDate =
      !previousDate ||
      formatDate !==
        new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(previousDate);

    return (
      <View>
        {shouldShowDate && (
          <Text style={{ alignSelf: "center", marginVertical: 5 }}>
            {formatDate}
          </Text>
        )}
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.otherText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timeText,
              isUser ? styles.userText : styles.otherText,
            ]}
          >
            {formatTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted // Đảo ngược danh sách để cuộn tự nhiên
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && (
            <Text style={{ textAlign: "center", marginVertical: 10 }}>
              Đang tải thêm tin nhắn...
            </Text>
          )
        }
      />

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
  timeText: {
    color: "#fff",
    fontSize: 14,
  },
  userText: {
    alignSelf: "flex-end",
  },
  otherText: {
    alignSelf: "flex-start",
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
