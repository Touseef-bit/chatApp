import { Button } from "@/components/ui/button";
import {
  Card,
  //   CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { LiaEyeSolid } from "react-icons/lia";
import type { user } from "../types/User";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API = "/api/login";

const Login = () => {
  const navigate = useNavigate();
  const [show, setshow] = useState<boolean>(false);
  const [errmsg, seterrmsg] = useState<string>("");
  const [value, setValue] = useState<user>({
    email: "",
    password: "",
  });
  const showPassword = () => {
    setshow(!show);
    seterrmsg("");
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue({ ...value, [e.target.name]: e.target.value });
  };
  const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(API, value);
      const data = await res.data;
      if (data.success) {
        navigate("/");
        toast.success(data.message);
        localStorage.setItem('token',data.token)
      } else {
        seterrmsg(data.message || "Something went wrong.");
        toast.error(errmsg);
      }
    } catch (error: unknown) {
      const err = await error as AxiosError;
      const errorMessage =
        err.response?.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? (err.response.data as { message: string }).message
          : "Something went wrong.";

      seterrmsg(errorMessage);
      toast.error(errmsg);
      console.log(error);
    }
  };
  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSumbit(e)}>
        <CardHeader>
          <CardTitle className="text-xl text-center text-blue-600">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2 ">
              <Label htmlFor="email" className="text-blue-600">
                Email
              </Label>
              <Input
                id="email"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e)
                }
                value={value.email}
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-blue-600">
                  Password
                </Label>
                <a
                  href="#"
                  className="ml-auto text-blue-600 inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  value={value.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e)
                  }
                  name="password"
                  type={`${show ? "text" : "password"}`}
                  required
                />
                {!show ? (
                  <FaRegEyeSlash
                    onClick={() => showPassword()}
                    className="absolute top-2 right-2 w-5 h-5 hover:text-blue-600 cursor-pointer duration-100 curor-pointer "
                  />
                ) : (
                  <LiaEyeSolid
                    onClick={() => showPassword()}
                    className="absolute top-2 right-2 w-5 h-5 hover:text-blue-600 cursor-pointer duration-100 curor-pointer "
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col mt-4 gap-4">
          <CardDescription className="w-full pl-2">
            Already have an Account?{" "}
            <Link
              className="text-blue-600 ml-1 underline underline-offset-2"
              to={"/signup"}
            >
              Signup
            </Link>
          </CardDescription>
          <Button
            type="submit"
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-800  text-white duration-200"
          >
            Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Login;
