/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Card, Checkbox, Label, TextInput } from "flowbite-react";
import React from "react";
import { loginUser } from "../../apis/request";
import { UserContext } from "../../context/user";
import { setToken, setUser } from "../../store/local";
import Logo from "./../../static/boom_logo.png";

const SignInPage: React.FC = function () {
  const [password, setPassword] = React.useState("admin@123");
  const [email, setEmail] = React.useState("admin@admin.com");
  const context = React.useContext(UserContext);
  const login = async () => {
    try {
      const data = await loginUser(email, password);
      console.log("Data", data);

      if (data.user && data.token) {
        setToken(data.token!);
        setUser(data.user!);
        // redirect to dashboard
        console.log("Ctx: ", context);
      }
    } catch (error) {
      console.log("Error ");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center px-6 lg:h-screen lg:gap-y-12">
      <div className="my-6 flex items-center gap-x-1 lg:my-0">
        <img alt="Flowbite logo" src={Logo} className="mr-3 h-12" />
        <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
          Boom App
        </span>
      </div>
      <Card
        horizontal
        imgSrc=""
        imgAlt=""
        className="w-full md:max-w-screen-sm [&>img]:hidden md:[&>img]:w-96 md:[&>img]:p-0 md:[&>*]:w-full md:[&>*]:p-16 lg:[&>img]:block"
      >
        <h1 className="mb-3 text-2xl font-bold dark:text-white md:text-3xl">
          Sign In
        </h1>
        <div className="mb-4 flex flex-col gap-y-3">
          <Label htmlFor="email">Your email</Label>
          <TextInput
            id="email"
            name="email"
            value={email}
            placeholder="your@email.com"
            type="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </div>
        <div className="mb-6 flex flex-col gap-y-3">
          <Label htmlFor="password">Your password</Label>
          <TextInput
            id="password"
            name="password"
            placeholder="Your Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
        </div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <Checkbox id="rememberMe" name="rememberMe" />
            <Label htmlFor="rememberMe">Remember me</Label>
          </div>
          <a
            href="#"
            className="w-1/2 text-right text-sm text-primary-600 dark:text-primary-300"
          >
            Lost Password?
          </a>
        </div>
        <div className="mb-6">
          <Button
            type="submit"
            onClick={() => login()}
            className="w-full lg:w-auto"
          >
            Login to your account
          </Button>
        </div>
        {/* <p className="text-sm text-gray-500 dark:text-gray-300">
            Not registered?&nbsp;
            <a href="#" className="text-primary-600 dark:text-primary-300">
              Create account
            </a>
          </p> */}
      </Card>
    </div>
  );
};

export default SignInPage;
