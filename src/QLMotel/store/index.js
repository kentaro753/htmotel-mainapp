import { createContext, useContext, useMemo, useReducer } from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import storage from "@react-native-firebase/storage";
import axios from "axios";

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
const resendVerify = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    if (user.emailVerified) {
      Alert.alert("Email đã được xác thực trước đó.");
      return;
    }
    // Gửi lại email xác nhận
    await user.sendEmailVerification();
    Alert.alert(
      "Email xác nhận đã được gửi lại!",
      "Vui lòng kiểm tra hộp thư đến của bạn tại " + email
    );
  } catch (error) {
    console.error("Error resending verification email:", error.message);
    Alert.alert("Gửi email xác nhận thất bại: " + error.message);
  }
};
const createAccount = async (email, password, fullName, phone, role) => {
  try {
    // Kiểm tra email tồn tại trong Firestore
    const userDoc = await USERS.doc(email).get();
    if (userDoc.exists) {
      Alert.alert(
        "Thông báo",
        "Tài khoản của email này đã tồn tại vui lòng sử dụng email khác!"
      );
      return;
    }
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    const uid = userCredential.user.uid;
    await user.updateProfile({
      displayName: fullName, // Sử dụng tên đầy đủ làm displayName
    });
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
      uid,
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
    const userDoc = await USERS.doc(email).get();
    if (userDoc.exists) {
      Alert.alert(
        "Thông báo",
        "Tài khoản của email này đã tồn tại vui lòng sử dụng email khác!"
      );
      return;
    }
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    const uid = userCredential.user.uid;
    await user.updateProfile({
      displayName: fullName,
    });
    await user.sendEmailVerification();
    Alert.alert(
      "Tạo tài khoản người thuê thành công!",
      "Email xác nhận tài khoản đã được gửi đến " +
        email +
        ". Vui lòng xác thực để kích hoạt tài khoản."
    );
    // Lưu thông tin người dùng vào Firestore
    await USERS.doc(email).set({
      email,
      admin,
      uid,
      password,
      fullName,
      phone,
      role,
      renterId,
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/demopj-5b390.appspot.com/o/LogoWG_nobg.png?alt=media&token=19799886-d3d1-49a9-8bb8-3ae60c7e24ba",
      isFirst: true,
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
const checkResetPassword = async (dispatch, email, password) => {
  try {
    // Thử đăng nhập lại
    await auth().signInWithEmailAndPassword(email, password);
    console.log("Người dùng vẫn đăng nhập hợp lệ.");
  } catch (error) {
    if (error.code === "auth/wrong-password") {
      console.log("Mật khẩu đã được thay đổi. Đăng xuất người dùng...");
      logout(dispatch, email);
      Alert.alert("Mật khẩu đã được thay đổi. Đăng xuất người dùng...");
    } else {
      console.error("Lỗi khác khi đăng nhập:", error.message);
    }
  }
};
const fixResetPassword = async (email, password) => {
  try {
    const userDoc = await USERS.doc(email).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.password !== password) {
        await USERS.doc(email).update({ password: password });
        console.log("Reset Mật khẩu thành công.");
      }
    }
  } catch (error) {
    console.error("Error resetting password:", error.message);
  }
};
const login = async (dispatch, email, password) => {
  const TCGROUPS = firestore()
    .collection("USERS")
    .doc(email)
    .collection("TCGROUPS");
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    const userDoc = await USERS.doc(email).get(); // Thêm await
    if (!userDoc.exists) {
      Alert.alert("Lỗi dữ liệu", "Không tìm thấy dữ liệu người dùng.");
      return;
    }
    const userData = userDoc.data();

    if (!user.emailVerified) {
      if (userData.role === "renter" && userData.isFirst) {
        resendVerify(email, password);
      } else {
        Alert.alert(
          "Email chưa được xác thực",
          "Vui lòng xác thực email trước khi đăng nhập."
        );
      }
      await auth().signOut(); // Đăng xuất người dùng nếu email chưa xác minh
      return;
    }

    // Yêu cầu quyền và đăng ký sự kiện FCM
    await requestUserPermission(email);
    await fixResetPassword(email, password);

    if (userData.isFirst) {
      if (userData.role === "admin") {
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

        const promises = defaultGroups.map(async (group) => {
          const docRef = await TCGROUPS.add(group);
          await TCGROUPS.doc(docRef.id).update({ id: docRef.id });
        });
        await Promise.all(promises);
        console.log("Default groups added successfully.");
      }
      await USERS.doc(email).update({ isFirst: false });
    }

    await AsyncStorage.setItem("user", JSON.stringify(userData));
    dispatch({ type: "USER_LOGIN", value: userData });
  } catch (error) {
    console.error("Login error:", error.message);
    Alert.alert("Sai Email hoặc Mật khẩu");
  }
};

const loginAuto = async (dispatch, email, password) => {
  auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      requestUserPermission(email);
    })
    .catch(() => {
      logout(dispatch, email);
      Alert.alert("Tài khoản đã đổi mật khẩu!");
    });
};
const logout = async (dispatch, email) => {
  try {
    const currentToken = await messaging().getToken();
    await USERS.doc(email).update({
      fcmTokens: firestore.FieldValue.arrayRemove(currentToken),
    });
    console.log("Logging out...");
    console.log("Token đã được xóa khi logout.");
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
const deleteAccountRenter = async (email, admin, renterId) => {
  try {
    const RENTERS = firestore()
      .collection("USERS")
      .doc(admin)
      .collection("RENTERS");

    // Lấy thông tin uid của người dùng từ Firestore
    const userDoc = await USERS.doc(email).get();
    if (!userDoc.exists) {
      Alert.alert("No account found with this email!");
      return;
    }

    const userData = userDoc.data();
    const userUid = userData?.uid; // Đảm bảo bạn lưu `uid` khi tạo tài khoản.

    // Nếu không có uid, hiển thị lỗi
    if (!userUid) {
      Alert.alert("Cannot find user UID for this email.");
      return;
    } else {
      await MESSAGES.doc(admin + "_" + email).delete();
      await axios.post("https://htmotel3-9k4gffi5.b4a.run/delete-user", {
        uid: userUid,
      });
    }

    // Xóa ảnh trên Firebase Storage
    const deleteAvatar = async () => {
      const refImage = storage().ref("/images/" + email + ".jpg");
      refImage.delete().catch((error) => {
        // Bỏ qua lỗi nếu ảnh không tồn tại
        if (error.code !== "storage/object-not-found") {
          console.error("Lỗi khi xóa ảnh:", error);
        }
      });
    };
    await deleteAvatar();
    await USERS.doc(email).delete();

    Alert.alert("Xóa tài khoản người thuê thành công!");
  } catch (error) {
    console.error("Error deleting account:", error.message);
    Alert.alert("Account deletion failed: " + error.message);
  }
};
const resetPassword = async (email) => {
  try {
    if (!email) {
      throw new Error("Vui lòng nhập email.");
    }
    const userDoc = await USERS.doc(email).get();
    if (!userDoc.exists) {
      Alert.alert("Thông báo", "Không tìm thấy tài khoản!");
      return;
    }
    await auth().sendPasswordResetEmail(email);
    Alert.alert("Thành công", "Email đặt lại mật khẩu đã được gửi.");
    console.log("Email đặt lại mật khẩu đã được gửi.");
  } catch (error) {
    console.error("Lỗi khi gửi email đặt lại mật khẩu:", error.message);
  }
};
async function requestUserPermission(email) {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Authorization status:", authStatus);

    // Lấy và lưu FCM Token
    await saveTokenToFirestore(email);

    // Đăng ký sự kiện onTokenRefresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log("FCM Token mới:", newToken);

      if (email) {
        try {
          await USERS.doc(email).update({
            fcmTokens: firestore.FieldValue.arrayUnion(newToken),
          });
          console.log("FCM Token mới đã được thêm vào Firestore.");
        } catch (error) {
          console.error("Lỗi khi thêm FCM Token mới:", error);
        }
      }
    });
  }
}

const saveTokenToFirestore = async (email) => {
  try {
    const fcmToken = await messaging().getToken(); // Lấy token hiện tại
    if (fcmToken) {
      // Thêm token vào mảng fcmTokens
      await USERS.doc(email).update({
        fcmTokens: firestore.FieldValue.arrayUnion(fcmToken),
      });
      console.log("FCM Token đã được thêm/cập nhật vào Firestore.");
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
  deleteAccountRenter,
  resetPassword,
  resendVerify,
  checkResetPassword,
};
