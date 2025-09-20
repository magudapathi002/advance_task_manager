import {
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

type Inputs = {
  username: string;
  password: string;
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const tokens = await login(data);    
      if (tokens?.access) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error", error);
      // Optionally show toast or form error here
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <Container width="400px">
        <Card className="p-8 shadow-2xl backdrop-blur-sm bg-white/90 border-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="5">
              <div className="text-center mb-2">
                <Heading size="7" className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Task Management
                </Heading>
                <Text size="3" className="text-gray-500 mt-2">
                  Please sign in to continue
                </Text>
              </div>
              
              <div className="space-y-1">
                <TextField.Root
                  size="3"
                  placeholder="Username"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  {...register("username", { required: "Username is required" })}
                />
                {errors.username && (
                  <Text size="1" color="red" className="mt-1">
                    {errors.username.message}
                  </Text>
                )}
              </div>
              
              <div className="space-y-1">
                <TextField.Root
                  size="3"
                  type="password"
                  placeholder="Password"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <Text size="1" color="red" className="mt-1">
                    {errors.password.message}
                  </Text>
                )}
              </div>
              
              <Button 
                size="3" 
                type="submit"
                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Text className="font-semibold text-white">Sign In</Text>
              </Button>
            </Flex>
          </form>
        </Card>
      </Container>
    </div>
  );
};

export default Login;