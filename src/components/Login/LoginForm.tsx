import { FaLock, FaSpinner, FaUser } from "react-icons/fa6";
import React, { useEffect, type JSX } from "react";
import { authApi } from "../../lib/api/auth";
import { isEmail } from "../../lib/utils/email-checker";
import toast from "react-hot-toast";
import type { LoginRequest } from "../../lib/types/user";
import { useStore } from "@nanostores/react";
import { $authLoading, $user, login } from "../../lib/stores/auth";

function LoginForm(): JSX.Element {

  const user = useStore($user);
  const authLoading = useStore($authLoading);

  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = "/dashboard"
    }
  }, [authLoading, user]);

  const [identifier, setIdentifier] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isIdentifierEmail: boolean = isEmail(identifier);
    const data: LoginRequest = {
        username: !isIdentifierEmail ? identifier : undefined,
        email: isIdentifierEmail ? identifier : undefined,
        password: password 
    };


    try {
        setLoading(true);
        const user = await login(data);
        console.log(user);
    } catch (error: any) {
        toast.error(error?.message);
        setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] animate-pulse">
        <FaSpinner className="text-[#4ADE80] text-4xl animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Checking authentication...</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="hidden p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center"></div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Username or Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-500" />
          </div>
          <input
            type="text"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80] text-white placeholder-gray-600 transition duration-300"
            placeholder="Enter your username or email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-500" />
          </div>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80] text-white placeholder-gray-600 transition duration-300"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 font-bold rounded-lg text-white shadow-lg flex justify-center items-center transition-all duration-300 
          ${loading 
            ? "bg-gray-600 cursor-not-allowed opacity-70"
            : "bg-linear-to-r from-[#3FC16F] to-[#60A5FA] hover:from-[#4ADE80] hover:to-[#60A5FA] hover:scale-[1.02] transform"
          }`
        }
      >
        {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> 
              <span>Signing In...</span>
            </>
        ) : (
            <span>Sign In</span>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
