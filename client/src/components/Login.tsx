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
import { useEffect, useState } from "react";
import { LiaEyeSolid } from "react-icons/lia";
import type { user } from "../types/User";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoginUser } from "@/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [show, setshow] = useState<boolean>(false);
  const [pending, setpending] = useState<boolean>(false);
  const [value, setValue] = useState<user>({
    email: "user001@gmail.com",
    password: "asdf",
  });
  const { user, errmsg } = useSelector((state: RootState) => state.auth);
  const token = user?.token;
  const dispatch = useDispatch<AppDispatch>();
  const showPassword = () => {
    setshow(!show);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue({ ...value, [e.target.name]: e.target.value });
  };
  const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setpending(true);

    dispatch(LoginUser(value));
    if (errmsg) {
      toast.error(errmsg);
    }

    setpending(false);
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

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
                onChange={handleChange}
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
                  onChange={handleChange}
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
            {!pending ? "Login" : "Logging In..."}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Login;
