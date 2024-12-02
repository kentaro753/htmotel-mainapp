import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';

const AddAttachmentScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [attachments, setAttachments] = useState([]); // Danh sách file đã chọn

  // Xử lý chọn file document
  const handleSelectDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const newAttachment = {
        uri: res[0]?.uri || res.uri,
        name: res[0]?.name || res.name,
        type: res[0]?.type || res.type,
      };

      setAttachments((prev) => [...prev, newAttachment]); // Cập nhật danh sách file
      setModalVisible(false);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error picking document:', err);
      }
    }
  };

  // Xử lý chọn hình ảnh hoặc video
  const handleSelectMedia = () => {
    const options = {
      mediaType: 'mixed',
    };

    launchImageLibrary(options, (response) => {
      if (!response.didCancel && !response.error && response.assets?.length) {
        const media = response.assets[0];
        const newAttachment = {
          uri: media.uri,
          name: media.fileName || 'Unnamed Media',
          type: media.type,
        };

        setAttachments((prev) => [...prev, newAttachment]); // Cập nhật danh sách file
      }
      setModalVisible(false);
    });
  };

  // Xóa file khỏi danh sách
  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Nút mở Modal */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Thêm Attachment</Text>
      </TouchableOpacity>

      {/* Hiển thị danh sách file đã chọn */}
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

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn loại Attachment</Text>

            {/* Chọn file document */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleSelectDocument}
            >
              <Text style={styles.optionText}>Thêm File Document</Text>
            </TouchableOpacity>

            {/* Chọn video hoặc hình ảnh */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleSelectMedia}
            >
              <Text style={styles.optionText}>Thêm Video và Hình Ảnh</Text>
            </TouchableOpacity>

            {/* Nút đóng */}
            <TouchableOpacity
              style={[styles.optionButton, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.optionText, { color: 'red' }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  attachmentList: {
    marginTop: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  attachmentText: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'red',
  },
});

export default AddAttachmentScreen;
