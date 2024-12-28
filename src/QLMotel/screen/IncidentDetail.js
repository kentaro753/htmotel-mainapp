import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Alert,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Icon,
  IconButton,
  Text,
} from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import Modal from "react-native-modal";
import RNFS from "react-native-fs";
import { PermissionsAndroid, Platform } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { uriToBlob } from "../Component/UriToBlob";
import ProcessingOverlay from "../Component/ProcessingOverlay";

export default function IncidentDetail({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [data, setData] = useState({});
  const [title, setTitle] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [datetime, setDatetime] = useState(new Date());
  const [formatDate, setFormatDate] = useState("");
  const [formatTime, setFormatTime] = useState("");
  const [reportBy, setReportBy] = useState("");
  const [reportName, setReportName] = useState("");
  const [mota, setMota] = useState("");
  const [level, setLevel] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [newFile, setNewFile] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { userLogin } = controller;
  const INCIDENTS = firestore()
    .collection("USERS")
    .doc(userLogin?.role == "admin" ? userLogin?.email : userLogin?.admin)
    .collection("INCIDENTS");
  const handleDeleteIncident = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa báo cáo sự cố này không?",
      [
        {
          text: "Không",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Có",
          onPress: () => {
            try {
              // Hàm xóa tệp đính kèm trên Firebase Storage
              const deleteAttachments = async () => {
                if (attachments && attachments.length > 0) {
                  for (const attachment of attachments) {
                    if (attachment.url) {
                      const storageRef = storage().refFromURL(attachment.url);
                      storageRef
                        .delete()
                        .then(() =>
                          console.log(`Deleted file: ${attachment.url}`)
                        )
                        .catch((err) =>
                          console.error("Failed to delete file:", err.message)
                        );
                    }
                  }
                }
              };
              // Xóa tệp đính kèm
              deleteAttachments();
              INCIDENTS.doc(id)
                .delete()
                .then(() => {
                  console.log("Sự cố deleted successfully");
                  navigation.goBack();
                });
            } catch (error) {
              console.error("Delete failed:", error.message);
              Alert.alert("Lỗi", "Xóa báo cáo thất bại: " + error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleFixIncident = async () => {
    if (isProcessing) return; // Chặn bấm nhiều lần
    setIsProcessing(true);
    try {
      const uploadedAttachments = [];
      for (const attachment of newFile) {
        const uploadedFile = await uploadFile(attachment);
        if (uploadedFile) {
          uploadedAttachments.push(uploadedFile);
        }
      }
      console.log(uploadedAttachments);
      if (uploadedAttachments.length === 0 && newFile.length > 0) {
        Alert.alert("Upload tệp đính kèm không thành công");
        return;
      }
      await INCIDENTS.doc(id)
        .update({
          isFixed: true,
          attachments: [...attachments, ...uploadedAttachments],
        })
        .then(() => {
          Alert.alert("Đã cập nhật trạng thái sự cố thành công");
          toggleModal();
        });
    } catch (e) {
      Alert.alert(e.message);
    } finally {
      setIsProcessing(false); // Tắt loading
    }
  };
  useEffect(() => {
    const loadincident = INCIDENTS.doc(id).onSnapshot((response) => {
      const data = response.data();
      if (data) { // Kiểm tra dữ liệu tồn tại
        console.log(data.datetime.toDate());
        setIsFixed(data.isFixed);
        setData(data);
        setDatetime(data.datetime.toDate());
        setFormatDate(
          new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(data.datetime.toDate())
        );
        setFormatTime(
          new Intl.DateTimeFormat("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Dùng định dạng 24 giờ
          }).format(data.datetime.toDate())
        );
        setMota(data.mota);
        setReportBy(data.reportBy);
        if (data.reportBy != "admin") {
          if (userLogin?.role == "admin") {
            const RENTERS = firestore()
              .collection("USERS")
              .doc(userLogin?.email)
              .collection("RENTERS");
            RENTERS.doc(data.reportBy).onSnapshot((renter) => {
              const rdata = renter.data();
              setReportName(rdata?.fullName || "N/A");
            });
          } else {
            if (data.reportBy != userLogin?.renterId) {
              const RENTERS = firestore()
                .collection("USERS")
                .doc(userLogin?.admin)
                .collection("RENTERS");
              RENTERS.doc(data.reportBy).onSnapshot((renter) => {
                const rdata = renter.data();
                setReportName(rdata?.fullName || "N/A");
              });
            } else {
              setReportName(userLogin?.fullName);
            }
          }
        } else {
          setReportName("Chủ trọ");
        }
        setAttachments(data.attachments);
        setLevel(data.level);
        setTitle(data.title);
      } else {
        console.log("Document not found or deleted.");
        setData(null);
      }
    });
  
    return () => {
      loadincident();
    };
  }, []);
  
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const extractFileName = (url) => {
    const decodedUrl = decodeURIComponent(url); // Giải mã URL
    const startIndex = decodedUrl.lastIndexOf("/attachments/") + 13;
    const endIndex = decodedUrl.indexOf("?alt=media");
    return decodedUrl.substring(startIndex, endIndex);
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
  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      if (Platform.Version >= 33) {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ]);
          const allGranted = Object.values(granted).every(
            (result) => result === PermissionsAndroid.RESULTS.GRANTED
          );
          if (!allGranted) {
            alert("Ứng dụng cần quyền đọc dữ liệu phương tiện để tải file.");
          }
          return allGranted;
        } catch (err) {
          console.error("Failed to request permission", err);
          return false;
        }
      } else if (Platform.Version >= 30) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
            {
              title: "Cấp quyền lưu trữ",
              message: "Ứng dụng cần quyền lưu trữ để tải file.",
              buttonNeutral: "Hỏi sau",
              buttonNegative: "Hủy",
              buttonPositive: "Đồng ý",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.error("Failed to request permission", err);
          return false;
        }
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Cấp quyền lưu trữ",
              message: "Ứng dụng cần quyền lưu trữ để tải file.",
              buttonNeutral: "Hỏi sau",
              buttonNegative: "Hủy",
              buttonPositive: "Đồng ý",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.error("Failed to request permission", err);
          return false;
        }
      }
    }
    return true;
  };
  const createDirectoryIfNotExists = async (path) => {
    const exists = await RNFS.exists(path);
    if (!exists) {
      await RNFS.mkdir(path);
      console.log(`Directory created at ${path}`);
    }
  };
  const downloadFile = async (url, fileName) => {
    try {
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await createDirectoryIfNotExists(RNFS.DownloadDirectoryPath); // Kiểm tra thư mục
      await RNFS.downloadFile({
        fromUrl: url,
        toFile: downloadDest,
      })
        .promise.then((result) => {
          console.log(`File downloaded successfully: `, result);
          alert("Tải xuống thành công!");
        })
        .catch((error) => {
          console.error("Download error:", error);
          alert("Có lỗi xảy ra trong quá trình tải xuống.");
        });
    } catch (error) {
      console.error("Download error:", error);
      alert("Có lỗi xảy ra trong quá trình tải xuống.");
    }
  };

  const handleSelectDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images, // Hình ảnh
          DocumentPicker.types.video, // Video
          DocumentPicker.types.pdf, // PDF
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

      setNewFile((prev) => [...prev, newAttachment]); // Cập nhật danh sách file
      console.log(newAttachment);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("Error picking document:", err);
      }
    }
  };
  const handleRemoveAttachment = (index) => {
    setNewFile((prev) => prev.filter((_, i) => i !== index));
  };
  const renderDetailRow = (label, value) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <Text style={styles.detailText}>{label}</Text>
      </View>
      <View style={styles.detailValue}>
        <Text style={styles.detailValueText}>{value}</Text>
      </View>
    </View>
  );

  const renderAttachment = (item, index) => {
    const fileName = extractFileName(item.url); // Hàm extractFileName bạn đã tạo ở trên

    return (
      <TouchableOpacity
        style={styles.attachmentItem}
        key={index}
        onPress={() => downloadFile(item.url, fileName)} // Gọi hàm tải file khi nhấn
      >
        <Text style={styles.attachmentText}>{fileName}</Text>
        <View style={styles.dloadBtn}>
          <Icon source="download" size={20} color="white" />
        </View>
      </TouchableOpacity>
    );
  };
  const renderNewFile = (item, index) => {
    return (
      <View style={styles.attachmentItem} key={index}>
        <Text style={styles.attachmentText}>{item.name}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveAttachment(index)}
        >
          <Text style={styles.removeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      {isProcessing && <ProcessingOverlay />}
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 1,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 5,
            padding: 10,
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 15,
            marginBottom: 5,
            marginHorizontal: 10,
            borderRadius: 8,
          }}
        >
          <View style={{ alignItems: "center", alignItems: "center" }}>
            <View
              style={{
                paddingBottom: 9,
              }}
            >
              <Icon
                source="alert"
                size={100}
                color={level == 1 ? "#00cc00" : level == 2 ? "#ffcc00" : "red"}
              />
            </View>
            {renderDetailRow("Tiêu đề", title)}
            {renderDetailRow("Thời gian", formatTime + " - " + formatDate)}
            {renderDetailRow("Người báo cáo", reportName)}
          </View>
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
            Mô tả chi tiết
          </Text>
        </View>
        <View
          style={{
            borderRadius: 1,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
            marginHorizontal: 14,
            marginVertical: 10,
            padding: 10,
            borderRadius: 1,
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 13.9,
          }}
        >
          <Text style={{ fontSize: 18 }}>{mota}</Text>
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
            Tệp đính kèm
          </Text>
        </View>

        {attachments ? (
          <View style={styles.attachmentList}>
            {attachments.map((item, index) => renderAttachment(item, index))}
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
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
            <Text style={{ textAlign: "center", fontSize: 20, color: "grey" }}>
              Không có tệp đính kèm
            </Text>
          </View>
        )}

        {isFixed ? (
          <Button
            style={{
              backgroundColor: "#999999",
              width: "50%",
              alignSelf: "center",
              marginVertical: 20,
            }}
            disabled
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Đã xử lý</Text>
          </Button>
        ) : (
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            {userLogin?.role == "admin" || userLogin?.renterId == reportBy ? (
              <Button
                style={{
                  backgroundColor: "#ff3300",
                  width: "40%",
                  alignSelf: "center",
                  marginVertical: 20,
                }}
                onPress={handleDeleteIncident}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Xóa báo cáo
                </Text>
              </Button>
            ) : null}
            {userLogin?.role == "admin" ? (
              <Button
                style={{
                  backgroundColor: "royalblue",
                  width: "40%",
                  alignSelf: "center",
                  marginVertical: 20,
                }}
                onPress={toggleModal}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Xử lý sự cố
                </Text>
              </Button>
            ) : null}
          </View>
        )}
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              <View
                style={{
                  height: 50,
                  backgroundColor: "white",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text variant="headlineSmall" style={styles.txt}>
                  Thêm tệp đính kèm
                </Text>
                <IconButton
                  icon="plus-circle"
                  size={40}
                  style={{ top: 5 }}
                  iconColor="#00e600"
                  onPress={handleSelectDocument}
                />
              </View>
              <View style={styles.attachmentList}>
                {newFile.map((item, index) => renderNewFile(item, index))}
              </View>
            </View>
          </ScrollView>
          <View style={{ flexDirection: "row" }}>
            <Button
              onPress={toggleModal}
              style={{
                backgroundColor: "royalblue",
                width: "50%",
                //alignSelf: "center",
                borderRadius: 0,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
              >
                Đóng
              </Text>
            </Button>
            <Button
              onPress={handleFixIncident}
              style={{
                backgroundColor: "#ff7733",
                width: "50%",
                //alignSelf: "center",
                borderRadius: 0,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
              >
                Xác nhận
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  detailRow: {
    flexDirection: "row",
    marginVertical: 8,
  },
  detailLabel: {
    width: "40%",
    alignItems: "flex-start",
  },
  detailValue: {
    width: "60%",
    alignItems: "flex-end",
  },
  detailText: {
    fontWeight: "bold",
    fontSize: 19,
    color: "#000",
  },
  detailValueText: {
    fontSize: 17,
    color: "#000",
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
  dloadBtn: {
    backgroundColor: "royalblue",
    padding: 5,
    borderRadius: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    justifyContent: "center",
  },
});
