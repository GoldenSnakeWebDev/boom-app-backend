import React from "react";
import type { FC } from "react";
import { Button, DarkThemeToggle, Navbar } from "flowbite-react";
import AppLogo from "./../static/boom_logo.png";
import { UserContext } from "../context/user";

const MainNavbar: FC = function () {
  const context = React.useContext(UserContext);
  return (
    <Navbar fluid>
      <div className="w-full p-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Navbar.Brand href="/">
              <img alt="" src={AppLogo} className="mr-3 h-6 sm:h-8" />
              <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                BoomApp
              </span>
            </Navbar.Brand>
          </div>
          <div className="flex items-center gap-3">
            <Button color="default" href="#" className="dark:text-white">
              {context.user?.first_name
                ? `${context.user.first_name} ${context.user.last_name}`
                : context.user?.username}
            </Button>
            <DarkThemeToggle />
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default MainNavbar;
