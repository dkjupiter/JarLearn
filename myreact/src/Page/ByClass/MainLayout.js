import Sidebar_account from "../Sidebar_account";
import BottomBar from "../../Components/BottomBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <Sidebar_account />
      <Outlet />
      <BottomBar />
    </>
  );
}
