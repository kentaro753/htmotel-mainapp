import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

const IconComponent = ({ source, onSelect }) => (
  <TouchableOpacity style={styles.icon} onPress={() => onSelect(source)}>
    <View style={styles.iconContainer}>
      <Icon source={source} size={50} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  icon: {
    marginBottom: 5,
    alignItems: "center",
    marginRight: 5,
    width: "31%",
    aspectRatio: 1,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
  },
});

export default IconComponent;
