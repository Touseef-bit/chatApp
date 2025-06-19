import { Button } from "@/components/ui/button";
import {
  Card,
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

const API = "/api/signup";

const SignUp = () => {
  const navigate = useNavigate();
  const [show, setshow] = useState<boolean>(false);
  const [errmsg, seterrmsg] = useState<string>("");
  const [pending, setpending] = useState<boolean>(false);
  const [value, setValue] = useState<user>({
    username: "",
    email: "",
    password: "",
  });
  const showPassword = () => {
    setshow(!show);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue({ ...value, [e.target.name]: e.target.value });
    seterrmsg("");
  };
  const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setpending(true);
      const res = await axios.post(API, value);
      const data = await res.data;
      setpending(false);
      if (data.success) {
        navigate("/");
        toast.success(data.message);
        localStorage.setItem('token',data.token)
      } else {
        seterrmsg(data.message || "Something went wrong.");
        toast.error(errmsg);
      }
    } catch (error: unknown) {
      setpending(true);
      const err = (await error) as AxiosError<{ message: string }>;
      const errorMessage = err.response?.data?.message || "Server error";
      toast.error(errorMessage);
      setpending(false);
    }
  };
  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSumbit(e)}>
        <CardContent>
          <CardHeader>
            <CardTitle className="text-xl text-center text-blue-600">
              SignUp
            </CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2 ">
              <Label htmlFor="username" className="text-blue-600">
                Username
              </Label>
              <Input
                id="username"
                value={value.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e)
                }
                name="username"
                type="text"
                placeholder="abc"
                required
              />
            </div>
            <div className="grid gap-2 ">
              <Label htmlFor="email" className="text-blue-600">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e)
                }
                value={value.email}
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
                  className="ml-auto inline-block  text-blue-600 text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <div className="relative">
                {!show ? (
                  <FaRegEyeSlash
                    onClick={() => showPassword()}
                    className="absolute top-2 right-2  w-5 h-5 hover:text-blue-600 cursor-pointer duration-100 curor-pointer "
                  />
                ) : (
                  <LiaEyeSolid
                    onClick={() => showPassword()}
                    className="absolute top-2 right-2  w-5 h-5 hover:text-blue-600 cursor-pointer duration-100 curor-pointer "
                  />
                )}
                <Input
                  id="password"
                  name="password"
                  value={value.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e)
                  }
                  type={`${show ? "text" : "password"}`}
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col mt-4 gap-4">
          <CardDescription className="w-full">
            Already have an Account?{" "}
            <Link
              className="text-blue-600 ml-1 underline underline-offset-2"
              to={"/login"}
            >
              {!pending ? "Login" : "Loggin In..."}
            </Link>
          </CardDescription>
          <Button
            type="submit"
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-800 duration-200"
          >
            Signup
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignUp;
