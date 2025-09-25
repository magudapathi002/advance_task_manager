// src/components/UserPopup.tsx
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";
import * as Switch from "@radix-ui/react-switch";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useCreateUser, useUpdateUser } from "../../hooks/useUsers";
import { useEffect, useState } from "react";
import type { User } from "../../types/user";

// ✅ Schema
const userSchema = z
  .object({
    username: z.string().min(2, "Username must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional(),
    is_superuser: z.boolean().default(false).optional(),
    is_staff: z.boolean().default(false).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UserFormData = z.infer<typeof userSchema>;

interface UserPopupProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserPopup = ({ user, open, onOpenChange }: UserPopupProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user) {
      reset(user);
    } else {
      reset({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        is_superuser: false,
        is_staff: false,
      });
    }
  }, [user, reset]);

  const onSubmit = (data: UserFormData) => {
    const payload = { ...data };
    if (user && !showPassword) {
      delete payload.password;
    }

    if (user) {
      updateUser.mutate({ id: user.id, data: payload }, {
        onSuccess: () => {
          toast.success("User updated successfully");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to update user"),
      });
    } else {
      createUser.mutate(data, {
        onSuccess: () => {
          toast.success("User created successfully");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create user"),
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>{user ? "Edit User" : "Add User"}</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3" mt="3">
            <TextField.Root
              placeholder="First name"
              {...register("first_name")}
              autoComplete="off"
            />
            {errors.first_name && (
              <Text color="red">{errors.first_name.message}</Text>
            )}

            <TextField.Root
              placeholder="Last name"
              {...register("last_name")}
              autoComplete="off"
            />
            {errors.last_name && (
              <Text color="red">{errors.last_name.message}</Text>
            )}

            <TextField.Root placeholder="Username" {...register("username")} autoComplete="off" />
            {errors.username && (
              <Text color="red">{errors.username.message}</Text>
            )}

            <TextField.Root
              type="email"
              placeholder="Email"
              {...register("email")}
              autoComplete="off"
            />
            {errors.email && <Text color="red">{errors.email.message}</Text>}

            {user && !showPassword && (
              <Button type="button" onClick={() => setShowPassword(true)}>
                Change Password
              </Button>
            )}

            {(!user || showPassword) && (
              <>
                <TextField.Root
                  type="password"
                  placeholder="Password"
                  {...register("password")}
                  autoComplete="off"
                />
                {errors.password && (
                  <Text color="red">{errors.password.message}</Text>
                )}

                <TextField.Root
                  type="password"
                  placeholder="Confirm Password"
                  {...register("confirmPassword")}
                  autoComplete="off"
                />
                {errors.confirmPassword && (
                  <Text color="red">{errors.confirmPassword.message}</Text>
                )}
              </>
            )}
            {/* ✅ Admin toggle */}
            <Flex gap="3">
              <Flex align="center" gap="2" mt="2">
                <Controller
                  name="is_superuser"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Switch.Root
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-10 h-6 bg-gray-300 rounded-full data-[state=checked]:bg-blue-600 relative"
                      >
                        <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
                      </Switch.Root>
                      <Text size="2">Is Admin</Text>
                    </>
                  )}
                />
              </Flex>

              <Flex align="center" gap="2" mt="2">
                <Controller
                  name="is_staff"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Switch.Root
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-10 h-6 bg-gray-300 rounded-full data-[state=checked]:bg-blue-600 relative"
                      >
                        <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
                      </Switch.Root>
                      <Text size="2">Is Staff</Text>
                    </>
                  )}
                />
              </Flex>
            </Flex>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button" onClick={() => reset()}>
                Cancel
              </Button>
            </Dialog.Close>

            <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
              {createUser.isPending || updateUser.isPending ? "Saving..." : "Save"}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default UserPopup;
