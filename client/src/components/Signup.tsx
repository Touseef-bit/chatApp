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
import { useEffect, useState } from "react";
import { LiaEyeSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import { SignUpUser } from "@/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { useForm } from "@tanstack/react-form";

const SignUp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
    await dispatch(SignUpUser(value));
    // console.log("hey")
    },
  });
  const navigate = useNavigate();
  const [show, setshow] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const token = user?.token;
  const showPassword = () => {
    setshow(!show);
  };
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setValue({ ...value, [e.target.name]: e.target.value });
  // };
  // const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   dispatch(SignUpUser(value));
  // };
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <Card className="w-full max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent>
          <CardHeader>
            <CardTitle className="text-xl text-center text-blue-600">
              SignUp
            </CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2 ">
              <form.Field
                name="username"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "username is required"
                      : value.length < 3
                      ? "username must be at least 3 characters"
                      : undefined,
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({ value }) => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    return (
                      value.includes("error") &&
                      'No "error" allowed in first name'
                    );
                  },
                }}
                children={(field) => {
                  return (
                    <>
                      <Label htmlFor={field.name} className="text-blue-600">
                        Username
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        //   handleChange(e)
                        // }
                        onChange={(e) => field.handleChange(e.target.value)}
                        name={field.name}
                        type="text"
                        placeholder="abc"
                        required
                      />
                      {
                        !field.state.meta.isValid && (
                          <span className="text-red-600">{field.state.meta.errors.join(', ')}</span>
                        )
                      }
                    </>
                  );
                }}
              />
            </div>

            <div className="grid gap-2 ">
              <form.Field
                name="email"
                children={(field) => {
                  return (
                    <>
                      <Label htmlFor={field.name} className="text-blue-600">
                        email
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        //   handleChange(e)
                        // }
                        onChange={(e) => field.handleChange(e.target.value)}
                        name={field.name}
                        type="text"
                        placeholder="abc"
                        required
                      />
                    </>
                  );
                }}
              />
            </div>
            <div className="grid gap-2">
              <div className="relative grid gap-2">
                <form.Field
                  name="password"
                  children={(field) => {
                    return (
                      <>
                        <Label htmlFor={field.name} className="text-blue-600">
                          Password
                        </Label>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          //   handleChange(e)
                          // }
                          onChange={(e) => field.handleChange(e.target.value)}
                          name={field.name}
                          type="text"
                          placeholder="abc"
                          required
                        />
                      </>
                    );
                  }}
                />
                <div className="absolute top-1/2 right-2">
                  {!show ? (
                    <FaRegEyeSlash
                      onClick={() => showPassword()}
                      className="  w-5 h-5 hover:text-blue-600 cursor-pointer duration-100 curor-pointer "
                    />
                  ) : (
                    <LiaEyeSolid
                      onClick={() => showPassword()}
                      className="  w-5 h-5 hover:text-blue-600 cursor-pointer duration-100 curor-pointer "
                    />
                  )}
                </div>
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
              Login
            </Link>
          </CardDescription>
          <form.Subscribe
            children={() => (
              <Button
                type="submit"
                className="w-full cursor-pointer bg-blue-600 hover:bg-blue-800 duration-200"
              >
                Signup
              </Button>
            )}
          />
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignUp;
