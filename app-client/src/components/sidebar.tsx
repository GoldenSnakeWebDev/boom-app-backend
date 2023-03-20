import { Sidebar, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  HiChartPie,
  HiSearch,
  HiUsers,
  HiLogout,
  HiShoppingBag,
} from "react-icons/hi";
import { logoutUser } from "../apis/request";
import { setToken, setUser } from "../store/local";
import { Navigate } from "react-router";

const MainSidebar: FC = function () {
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const newPage = window.location.pathname;

    setCurrentPage(newPage);
  }, [setCurrentPage]);

  const logOutUser = async () => {
    try {
      await logoutUser();

      //** Set Token to  ="", and use null */
      setToken("");
      setUser(null);
      window.location.reload();
      console.log("Clicked");
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <Sidebar aria-label="Sidebar with multi-level dropdown example">
      <div className="flex h-full flex-col justify-between py-2">
        <div>
          <form className="pb-3 md:hidden">
            <TextInput
              icon={HiSearch}
              type="search"
              placeholder="Search"
              required
              size={32}
            />
          </form>
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              {/* <Sidebar.Item
                href="/"
                icon={HiChartPie}
                className={
                  "/" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""
                }
              >
                Dashboard
              </Sidebar.Item> */}

              <Sidebar.Item
                href="/users/list"
                icon={HiUsers}
                className={
                  "/users/list" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }
              >
                Users Management
              </Sidebar.Item>
              <Sidebar.Item
                href="/products"
                icon={HiShoppingBag}
                className={
                  "/products" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }
              >
                Price Tiers
              </Sidebar.Item>
              <Sidebar.Item
                style={{ cursor: "pointer" }}
                onClick={() => logOutUser()}
                icon={HiLogout}
              >
                Log Out
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </div>
      </div>
    </Sidebar>
  );
};

export default MainSidebar;
