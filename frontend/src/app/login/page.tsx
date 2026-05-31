"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { loginUser } from "@/services/apiAuth";
import { loginSchema } from "@/schemas/authSchema";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: loginUser,

    onSuccess: (res) => {
      login(res.data.token, res.data.user);

      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const data = Object.fromEntries(formData.entries()) as {
      email: string;
      password: string;
    };

    const result = loginSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
      });

      return;
    }

    mutate(result.data);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-semibold text-center text-gray-700">
          Login
        </h2>

        {isError && (
          <p className="text-red-500 text-sm">
            {(error as AxiosError<{ message: string }>)?.response?.data
              ?.message || "Login failed"}
          </p>
        )}

        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          {isPending ? "Loading..." : "Login"}
        </button>

        <p className="text-sm text-center text-gray-700">
          Don’t have an account?
          <a href="/register" className="text-blue-500 ml-1">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
