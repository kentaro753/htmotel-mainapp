import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import { Text } from "react-native-paper";

const PanPinImage = ({ image, isModalVisible, onClose }) => {
  const [imageHeight, setImageHeight] = useState(100);
  const [imageWidth, setImageWidth] = useState(Dimensions.get("window").width);
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [maxTranslateX, setMaxTranslateX] = useState(0);
  const [maxTranslateY, setMaxTranslateY] = useState(0);
  //const [maxTranslate, setMaxTranslate] = useState(0);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  useEffect(() => {
    if (image) {
      let imagePath = image;

      const isLocal = image.startsWith("/");

      if (isLocal) {
        imagePath = `file://${image}`;
      }

      Image.getSize(
        imagePath,
        (width, height) => {
          const aspectRatio = height / width;
          const newHeight = imageWidth * aspectRatio;
          setImageHeight(newHeight);
        },
        (error) => {
          console.error("Lỗi khi lấy kích thước ảnh:", error);
        }
      );
    }
  }, [image, imageWidth]);
  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: true,
  });
  const onPinchStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.current = Math.max(
        1,
        Math.min(lastScale.current * event.nativeEvent.scale, 1.75)
      );
      scale.setValue(lastScale.current);

      if (lastScale.current > 1) {
        setMaxTranslateX((imageWidth * (lastScale.current - 1)) / 3);
        setMaxTranslateY((imageHeight * (lastScale.current - 1)) / 2);
      } else {
        setMaxTranslateX(0);
        setMaxTranslateY(0);
      }
    } else if (event.nativeEvent.state === State.BEGAN) {
      scale.setValue(lastScale.current);
    }
  };

  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onPanStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      lastTranslateX.current += event.nativeEvent.translationX;
      lastTranslateY.current += event.nativeEvent.translationY;

      // Giới hạn vị trí kéo riêng theo X và Y
      lastTranslateX.current = Math.max(
        -maxTranslateX,
        Math.min(lastTranslateX.current, maxTranslateX)
      );
      lastTranslateY.current = Math.max(
        -maxTranslateY,
        Math.min(lastTranslateY.current, maxTranslateY)
      );

      translateX.setOffset(lastTranslateX.current);
      translateY.setOffset(lastTranslateY.current);

      translateX.setValue(0);
      translateY.setValue(0);
    } else if (event.nativeEvent.state === State.BEGAN) {
      translateX.setOffset(lastTranslateX.current);
      translateY.setOffset(lastTranslateY.current);
    }
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      onBackdropPress={onClose}
      animationType="slide"
      animated
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GestureHandlerRootView
          style={{
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Thêm PanGestureHandler để kéo ảnh */}
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanStateChange}
          >
            <Animated.View>
              <PinchGestureHandler
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
              >
                <Animated.Image
                  source={{ uri: image }}
                  style={[
                    {
                      transform: [
                        { scale },
                        {
                          translateX: translateX.interpolate({
                            inputRange: [-maxTranslateX, maxTranslateX],
                            outputRange: [-maxTranslateX, maxTranslateX],
                            extrapolate: "clamp",
                          }),
                        },
                        {
                          translateY: translateY.interpolate({
                            inputRange: [-maxTranslateY, maxTranslateY],
                            outputRange: [-maxTranslateY, maxTranslateY],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                      height: imageHeight,
                      width: imageWidth,
                    },
                  ]}
                  resizeMode="contain"
                />
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </GestureHandlerRootView>
        {/* Nút đóng */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 40,
            right: 20,
            backgroundColor: "white",
            padding: 7,
            borderRadius: 50,
          }}
        >
          <Text style={{ color: "black", fontSize: 20 }}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
export default PanPinImage;
