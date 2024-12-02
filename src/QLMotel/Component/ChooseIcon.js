import React, { useState } from "react";
import { View, Button, StyleSheet,Dimensions } from "react-native";
import Modal from "react-native-modal";
import { Text } from "react-native-paper";


const ChooseIcon = ({ isVisible, onClose }) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
    >
      <View style={styles.modalContent}>
        <Text style={{ fontSize: 30 }}>This is a modal!</Text>
        <Button onPress={onClose} title="Dismiss" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",

    height: Dimensions.get("window").height * 0.5,
    
  },
});

export default ChooseIcon;
