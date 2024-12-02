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
import firestore from "@react-native-firebase/firestore";
import DocumentPicker from "react-native-document-picker";
import storage from "@react-native-firebase/storage";
import { uriToBlob } from "../Component/UriToBlob";
import ProcessingOverlay from "../Component/ProcessingOverlay";

export default function AddIncident({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const [title, setTitle] = useState("");
  const [mota, setMota] = useState("");
  const [selectLevel, setSelectLevel] = useState(1);
  const [attachments, setAttachments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { userLogin } = controller;

  const handleAddNewIncident = async () => {
    if (isProcessing) return; // Chặn bấm nhiều lần
    setIsProcessing(true); // Hiển thị processing
    const INCIDENTS = firestore()
      .collection("USERS")
      .doc(userLogin.role == "renter" ? userLogin.admin : userLogin.email)
      .collection("INCIDENTS");
    try {
      if (title === "") {
        Alert.alert("Tiêu đề không được bỏ trống!");
      } else if (mota === "") {
        Alert.alert("Vui lòng mô tả chi tiết sự cố!");
      } else {
        const uploadedAttachments = []; // Array to store uploaded file details

        // Upload each file and add details to uploadedAttachments
        for (const attachment of attachments) {
          const uploadedFile = await uploadFile(attachment);
          if (uploadedFile) {
            uploadedAttachments.push(uploadedFile);
          }
        }
        console.log(uploadedAttachments);
        if (uploadedAttachments.length === 0 && attachments.length > 0) {
          Alert.alert("Upload tệp đính kèm không thành công");
          return;
        }

        // Add the incident document with updatedAttachments
        await INCIDENTS.add({
          datetime: new Date(),
          title,
          reportBy: userLogin.role == "renter" ? userLogin.renterId : "admin",
          level: selectLevel,
          isFixed: false,
          mota,
          attachments: uploadedAttachments, // Add uploaded attachments array
        })
          .then((docRef) => {
            INCIDENTS.doc(docRef.id).update({ id: docRef.id });
          })
          .then(() => {
            Alert.alert("Báo cáo sự cố mới thành công");
            navigation.goBack();
          })
          .catch((e) => {
            Alert.alert(e.message);
          });
      }
    } catch (e) {
      Alert.alert(e.message);
    } finally {
      setIsProcessing(false); // Tắt processing
    }
  };
  const uploadFile = async (file) => {
    const blob = await uriToBlob(file.uri);
    const fileRef = storage().ref(`attachments/${file.name}`);

    try {
      await fileRef.put(blob);
      const downloadURL = await fileRef.getDownloadURL();
      return { url: downloadURL, type: file.type };
    } catch (error) {
      console.error("Error uploading file:", error);

      return null;
    }
  };
  const handleSelectDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images, // Hình ảnh
          DocumentPicker.types.video, // Video
          DocumentPicker.types.pdf, // PDF (nếu muốn hỗ trợ thêm)
          "application/msword", // Word (.doc)
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word (.docx)
          "application/vnd.ms-excel", // Excel (.xls)
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (.xlsx)
          "application/vnd.ms-powerpoint", // PowerPoint (.ppt)
          "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PowerPoint (.pptx)
        ],
      });

      const newAttachment = {
        uri: res[0]?.uri || res.uri,
        name: res[0]?.name || res.name,
        type: res[0]?.type || res.type,
      };

      setAttachments((prev) => [...prev, newAttachment]); // Cập nhật danh sách file
      console.log(newAttachment);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("Error picking document:", err);
      }
    }
  };
  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {isProcessing && <ProcessingOverlay />}
      <Text variant="headlineSmall" style={styles.txt}>
        Tiêu đề <Text style={{ color: "red" }}>*</Text>
      </Text>
      <TextInput
        placeholder="Nhập tiêu đề"
        underlineColor="transparent"
        value={title}
        onChangeText={setTitle}
        style={styles.txtInput}
      />
      <Text variant="headlineSmall" style={styles.txt}>
        Đánh giá mức độ
      </Text>
      <View
        style={{ flexDirection: "row", justifyContent: "center", margin: 20 }}
      >
        <View
          style={{
            width: "55%",
            alignItems: "center",
          }}
        >
          <Icon
            source="alert"
            size={50}
            color={
              selectLevel == 1
                ? "#00cc00"
                : selectLevel == 2
                ? "#ffcc00"
                : "red"
            }
          />
        </View>
        <View
          style={{
            width: "45%",
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 50,
            overflow: "hidden", // Đảm bảo borderRadius áp dụng đúng
          }}
        >
          <Picker
            selectedValue={selectLevel}
            onValueChange={(itemValue) => {
              setSelectLevel(itemValue);
              switch (itemValue) {
                case 1:
                  break;
                case 2:
                  break;
                case 3:
                  break;
                default:
                  break;
              }
            }}
          >
            <Picker.Item label="Nhẹ" value={1} />
            <Picker.Item label="Trung bình" value={2} />
            <Picker.Item label="Nghiêm trọng" value={3} />
          </Picker>
        </View>
      </View>
      <Text variant="headlineSmall" style={styles.txt}>
        Mô tả chi tiết <Text style={{ color: "red" }}>*</Text>
      </Text>
      <TextInput
        placeholder="Mô tả chi tiết sự cố"
        underlineColor="transparent"
        value={mota}
        onChangeText={setMota}
        style={styles.txtInput}
        multiline={true}
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
          Tệp đính kèm
        </Text>
        <IconButton
          icon="plus-circle"
          size={40}
          style={{ top: 5 }}
          iconColor="#00e600"
          onPress={handleSelectDocument}
        />
      </View>
      <FlatList
        data={attachments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.attachmentItem}>
            <Text style={styles.attachmentText}>{item.name}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveAttachment(index)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        style={styles.attachmentList}
      />

      <Button
        style={{
          backgroundColor: "#ff3300",
          width: "50%",
          alignSelf: "center",
          marginVertical: 20,
        }}
        onPress={handleAddNewIncident}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Báo cáo sự cố
        </Text>
      </Button>
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
    margin: 10,
    marginTop: 0,
    backgroundColor: "none",
    borderBottomWidth: 1,
  },
  attachmentList: {
    margin: 10,
  },
  attachmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },
  attachmentText: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
