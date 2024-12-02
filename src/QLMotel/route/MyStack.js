import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import BottomTabAdmin from "./BottomTabAdmin";
import Register from "../screen/Register";
import Login from "../screen/Login";
import ChangePass from "../screen/ChangePass";
import Services from "../screen/Services";
import AddService from "../screen/AddService";
import ChooseIcon from "../Component/ChooseIcon";
import AddRoom from "../screen/AddRoom";
import ServiceDetail from "../screen/ServiceDetail";
import RoomDetail from "../screen/RoomDetail";
import Renters from "../screen/Renters";
import AddRenter from "../screen/AddRenter";
import RenterDetail from "../screen/RenterDetail";
import TTabContract from "./TTabContract";
import TTabTCGroup from "./TTabTCGroup";
import TTabIncident from "./TTabIncident";
import AddContract from "../screen/AddContract";
import Rooms from "../screen/Rooms";
import RoomsEmpty from "../screen/RoomsEmpty";
import ContractDetail from "../screen/ContractDetail";
import Indices from "../screen/Indices";
import { Text } from "react-native-paper";
import AddIndice from "../screen/AddIndice";
import RoomsOccupied from "../screen/RoomsOccupied";
import IndiceDetail from "../screen/IndiceDetail";
import ChangeInfo from "../screen/ChangeInfo";
import AddBill from "../screen/AddBill";
import RoomsNeedBill from "../screen/RoomsNeedBill";
import BottomTabRenter from "./BottomTabRenter";
import IndicesNeedBill from "../screen/IndicesNeedBill";
import BillDetail from "../screen/BillDetail";
import UpdateBill from "../screen/UpdateBill";
import Notice from "../screen/Notice";
import ThongKe from "../screen/ThongKe";
import ThanLyHD from "../screen/ThanhLyHD";
import RoomUpdate from "../screen/RoomUpdate";
import ThuChi from "../screen/ThuChi";
import AddThuChi from "../screen/AddThuChi";
import AddTCGroup from "../screen/AddTCGroup";
import TCGroupDetail from "../screen/TCGroupDetail";
import ThuChiDetail from "../screen/ThuChiDetail";
import ThuChiUpdate from "../screen/ThuChiUpdate";
import AddIncident from "../screen/AddIncident";
import RenterUpdate from "../screen/RenterUpdate";
import RDForRenter from "../screen/RDForRenter";
import IncidentDetail from "../screen/IncidentDetail";
import ChatScreen from "../screen/ChatScreen";
import Messages from "../screen/Messages";

const Stack = createStackNavigator();
const MyStack = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ff3300",
        },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      <Stack.Group>
        <Stack.Screen
          name="Notice"
          component={Notice}
          options={{
            headerTitle: "Thông báo",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="ThongKe"
          component={ThongKe}
          options={{
            headerTitle: "Thống kê doanh thu",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="BottomTabAdmin"
          component={BottomTabAdmin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BottomTabRenter"
          component={BottomTabRenter}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TTabContract"
          component={TTabContract}
          options={{ headerTitle: "Hợp đồng", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="TTabTCGroup"
          component={TTabTCGroup}
          options={{ headerTitle: "Nhóm giao dịch", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="TTabIncident"
          component={TTabIncident}
          options={{ headerTitle: "Sự cố", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="AddIncident"
          component={AddIncident}
          options={{ headerTitle: "Báo cáo sự cố", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="IncidentDetail"
          component={IncidentDetail}
          options={{ headerTitle: "Chi tiết sự cố", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="AddTCGroup"
          component={AddTCGroup}
          options={{ headerTitle: "Thêm nhóm giao dịch", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="TCGroupDetail"
          component={TCGroupDetail}
          options={{ headerTitle: "Cập nhật nhóm giao dịch", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="Indices"
          component={Indices}
          options={{
            headerTitle: "Chốt Dịch vụ",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="IndicesNeedBill"
          component={IndicesNeedBill}
          options={{
            headerTitle: "Chốt Dịch vụ",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="AddBill"
          component={AddBill}
          options={{ headerTitle: "Tạo hóa đơn", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="BillDetail"
          component={BillDetail}
          options={{ headerTitle: "Chi tiết hóa đơn", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="ThuChi"
          component={ThuChi}
          options={{ headerTitle: "Thu Chi", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="AddThuChi"
          component={AddThuChi}
          options={{ headerTitle: "Thêm giao dịch", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="ThuChiDetail"
          component={ThuChiDetail}
          options={{ headerTitle: "Chi tiết giao dịch", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="ThuChiUpdate"
          component={ThuChiUpdate}
          options={{ headerTitle: "Cập nhật giao dịch", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="UpdateBill"
          component={UpdateBill}
          options={{ headerTitle: "Cập nhật hóa đơn", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="AddIndice"
          component={AddIndice}
          options={{ headerTitle: "Chốt dịch vụ", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="IndiceDetail"
          component={IndiceDetail}
          options={{ headerTitle: "Chốt dịch vụ", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="Services"
          component={Services}
          options={{ headerTitle: "Dịch vụ", headerTintColor: "#fff" }}
        />

        <Stack.Screen
          name="AddService"
          component={AddService}
          options={{ headerTitle: "Thêm dịch vụ", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="ServiceDetail"
          component={ServiceDetail}
          options={{ headerTitle: "Chi tiết Dịch vụ", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="AddRoom"
          component={AddRoom}
          options={{ headerTitle: "Thêm phòng", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="RoomDetail"
          component={RoomDetail}
          options={{ headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="RDForRenter"
          component={RDForRenter}
          options={{ headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="RoomUpdate"
          component={RoomUpdate}
          options={{ headerTitle: "Chỉnh sửa thông tin phòng",headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="Rooms"
          component={Rooms}
          options={{
            headerTitle: "Phòng",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="RoomsEmpty"
          component={RoomsEmpty}
          options={{
            headerTitle: "Danh sách Phòng trống",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="RoomsOccupied"
          component={RoomsOccupied}
          options={{
            headerTitle: "Danh sách Phòng đang thuê",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="RoomsNeedBill"
          component={RoomsNeedBill}
          options={{
            headerTitle: "Danh sách Phòng chưa có hóa đơn",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Renters"
          component={Renters}
          options={{ headerTitle: "Người thuê", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="AddRenter"
          component={AddRenter}
          options={{ headerTitle: "Thêm người thuê", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="RenterDetail"
          component={RenterDetail}
          options={{
            headerTitle: "Thông tin Người thuê",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="RenterUpdate"
          component={RenterUpdate}
          options={{
            headerTitle: "Cập nhật Người thuê",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="AddContract"
          component={AddContract}
          options={{ headerTitle: "Tạo hợp đồng", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="ContractDetail"
          component={ContractDetail}
          options={{
            headerTitle: "Thông tin Hợp đồng",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="ThanhLyHD"
          component={ThanLyHD}
          options={{ headerTitle: "Tạo hóa đơn", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerTitle: "Đăng kí", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerMode: "none" }}
        />
        <Stack.Screen
          name="ChangePass"
          component={ChangePass}
          options={{ headerTitle: "Đổi mật khẩu", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="ChangeInfo"
          component={ChangeInfo}
          options={{
            headerTitle: "Cập nhật thông tin",
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerTitle: "Nhắn tin", headerTintColor: "#fff" }}
        />
        <Stack.Screen
          name="Messages"
          component={Messages}
          options={{ headerTitle: "Nhắn tin", headerTintColor: "#fff" }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen
          name="ChooseIcon"
          component={ChooseIcon}
          options={{
            headerTitle: "Chọn ảnh đại diện",
            headerTintColor: "#fff",
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default MyStack;
