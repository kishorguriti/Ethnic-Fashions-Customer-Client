import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const CustomerLayout = () => {
  return (
    <div className="customer-layout-container">
      <Header />
      <Outlet />
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default CustomerLayout;
