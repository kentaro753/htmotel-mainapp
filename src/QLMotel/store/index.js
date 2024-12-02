import { createContext, useContext, useMemo, useReducer } from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";

const MyContext = createContext();
const reducer = (state, action) => {
  switch (action.type) {
    case "USER_LOGIN": {
      return { ...state, userLogin: action.value };
    }
    case "USER_LOGOUT": {
      return { ...state, userLogin: null };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

const MyContextControllerProvider = ({ children }) => {
  const initialState = {
    userLogin: null,
  };
  const [controller, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => [controller, dispatch]);
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

const useMyContextProvider = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error(
      "useMyContextController must be used within a MyContextControllerProvider"
    );
  }
  return context;
};

const USERS = firestore().collection("USERS");
const MESSAGES = firestore().collection("MESSAGES");
const createAccount = async (email, password, fullName, phone, role) => {
  try {
    // Kiểm tra email tồn tại trong Firestore
    const userDoc = await USERS.doc(email).get();
    if (userDoc.exists) {
      Alert.alert("Account already exists with this email!");
      return;
    }

    // Tạo tài khoản mới với Firebase Authentication
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    // Cập nhật displayName cho người dùng
    await user.updateProfile({
      displayName: fullName, // Sử dụng tên đầy đủ làm displayName
    });

    // Gửi email xác nhận
    await user.sendEmailVerification();

    Alert.alert(
      "Tạo tài khoản thành công!",
      "Email xác nhận tài khoản đã được gửi đến " +
        email +
        ". Vui lòng xác thực để kích hoạt tài khoản."
    );

    // Lưu thông tin người dùng vào Firestore
    await USERS.doc(email).set({
      email,
      password,
      fullName,
      phone,
      role,
      avatar: "",
      isFirst: true,
    });
  } catch (error) {
    console.error("Error creating account:", error.message);
    Alert.alert("Account creation failed: " + error.message);
  }
};

const createAccountRenter = async (
  email,
  admin,
  password,
  fullName,
  phone,
  role,
  renterId
) => {
  try {
    const RENTERS = firestore()
      .collection("USERS")
      .doc(admin)
      .collection("RENTERS");
    // Kiểm tra email tồn tại trong Firestore
    const userDoc = await USERS.doc(email).get();
    if (userDoc.exists) {
      Alert.alert("Account already exists with this email!");
      return;
    }

    // Tạo tài khoản mới với Firebase Authentication
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    // Cập nhật displayName cho người dùng
    await user.updateProfile({
      displayName: fullName, // Sử dụng tên đầy đủ làm displayName
    });

    // Gửi email xác nhận
    await user.sendEmailVerification();

    Alert.alert(
      "Tạo tài khoản người thuê thành công!",
      "Email xác nhận tài khoản đã được gửi đến " +
        email +
        ". Vui lòng xác thực để kích hoạt tài khoản trong vòng 24h."
    );

    // Lưu thông tin người dùng vào Firestore
    await USERS.doc(email).set({
      email,
      admin,
      password,
      fullName,
      phone,
      role,
      renterId,
      avatar: "",
      isFirst: false,
    });
    await RENTERS.doc(renterId).update({ account: true });
    await MESSAGES.doc(admin + "_" + email).set({
      id: admin + "_" + email,
      participants: [admin, email],
    });
  } catch (error) {
    console.error("Error creating account:", error.message);
    Alert.alert("Account creation failed: " + error.message);
  }
};
const login = (dispatch, email, password) => {
  const TCGROUPS = firestore()
    .collection("USERS")
    .doc(email)
    .collection("TCGROUPS");
  auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          "Email not verified",
          "Please verify your email address before logging in."
        );
        auth().signOut(); // Đăng xuất người dùng nếu email chưa xác minh
        return;
      }
      // Yêu cầu quyền và đăng ký sự kiện FCM
      requestUserPermission(email);
      USERS.doc(email).onSnapshot(async (u) => {
        if (u.exists) {
          const userData = u.data();
          if (userData.isFirst) {
            // Thêm các document cần thiết vào TCGROUPS
            const defaultGroups = [
              {
                type: true,
                name: "Tiền hóa đơn tháng",
                icon: "home",
                target: "ROOMS",
                note: "",
                canDelete: false,
                createdAt: new Date(),
              },
              {
                type: true,
                name: "Thanh lý phòng",
                icon: "home",
                target: "ROOMS",
                note: "",
                canDelete: false,
                createdAt: new Date(),
              },
              {
                type: false,
                name: "Khắc phục sự cố",
                icon: "alert",
                target: "Không",
                note: "",
                canDelete: false,
                createdAt: new Date(),
              },
            ];

            try {
              const promises = defaultGroups.map(async (group) => {
                const docRef = await TCGROUPS.add(group);
                await TCGROUPS.doc(docRef.id).update({ id: docRef.id });
              });

              await Promise.all(promises);

              // Cập nhật lại `isFirst` sau khi thêm thành công
              await USERS.doc(email).update({ isFirst: false });
              console.log("Default groups added successfully.");
            } catch (error) {
              console.error("Error adding default groups:", error.message);
              Alert.alert("Failed to add default groups: " + error.message);
            }
          }
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          dispatch({ type: "USER_LOGIN", value: userData });
        }
      });
    })
    .catch(() => Alert.alert("Wrong email or password"));
};
const loginAuto = (email, password) => {
  auth()
    .signInWithEmailAndPassword(email, password)
    .catch(() => Alert.alert("Wrong email or password"));
};
const logout = async (dispatch) => {
  try {
    console.log("Logging out...");
    await auth().signOut();
    await AsyncStorage.removeItem("user");
    dispatch({ type: "USER_LOGOUT" });
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Error", "No user is currently logged in.");
      return;
    }

    // Reauthenticate user to ensure they have the right to change password
    const credentials = auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await user.reauthenticateWithCredential(credentials);

    // Update password
    await user.updatePassword(newPassword);
    Alert.alert("Success", "Password has been updated successfully.");
  } catch (error) {
    console.error("Error changing password:", error.message);
    Alert.alert("Error", error.message);
  }
};
const deleteUser = async (email) => {
  try {
    // Xóa người dùng khỏi Firebase Authentication
    const currentUser = auth().currentUser;
    if (currentUser && currentUser.email === email) {
      await currentUser.delete();
      console.log(`User ${email} deleted from Firebase Authentication.`);
    } else {
      throw new Error("No matching user is currently authenticated.");
    }

    // Xóa document người dùng trong Firestore
    await USERS.doc(email).delete();
    console.log(`User document ${email} deleted from Firestore.`);

    Alert.alert("User deleted successfully.");
  } catch (error) {
    console.error("Error deleting user:", error);
    Alert.alert("Failed to delete user: " + error.message);
  }
};

async function requestUserPermission(email) {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Authorization status:", authStatus);

    // Lấy và lưu FCM Token ban đầu
    await saveTokenToFirestore(email);

    // Đăng ký sự kiện onTokenRefresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log("FCM Token mới:", newToken);

      if (email) {
        try {
          await USERS.doc(email).update({
            fcmToken: newToken,
          });
          console.log("FCM Token mới đã được cập nhật trong Firestore.");
        } catch (error) {
          console.error("Lỗi khi cập nhật FCM Token:", error);
        }
      }
    });
  }
}

const saveTokenToFirestore = async (email) => {
  try {
    const fcmToken = await messaging().getToken(); // Lấy token hiện tại
    if (fcmToken) {
      // Lưu token vào Firestore nếu chưa có
      const userDoc = await USERS.doc(email).get();
      const userData = userDoc.data();

      if (!userData?.fcmToken || userData.fcmToken !== fcmToken) {
        await USERS.doc(email).update({
          fcmToken,
        });
        console.log("FCM Token đã được lưu/cập nhật");
      } else {
        console.log("FCM Token đã tồn tại, không cần cập nhật");
      }
    }
  } catch (error) {
    console.error("Lỗi khi lưu FCM Token:", error);
  }
};
export {
  MyContextControllerProvider,
  useMyContextProvider,
  login,
  logout,
  createAccount,
  createAccountRenter,
  deleteUser,
  requestUserPermission,
  changePassword,
  loginAuto,
};
