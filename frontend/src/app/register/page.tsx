"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/services/apiAuth";
import { registerSchema } from "@/schemas/authSchema";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0] || "",
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
      });

      return;
    }

    try {
      setLoading(true);
      setServerError("");
      setErrors({ name: "", email: "", password: "" });

      const res = await registerUser(result.data);

      localStorage.setItem("token", res.data.token);

      router.push("/dashboard");
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Register failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-semibold text-center text-gray-700">
          Register
        </h2>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        {/* Name */}
        <div>
          <input
            type="text"
            placeholder="Name"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-700">
          Already have an account?
          <a href="/login" className="text-blue-500">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
