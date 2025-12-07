import { FaLock, FaUser } from "react-icons/fa6";
import React from "react";
import { authApi, type LoginRequest } from "../../lib/api/auth";
import { isEmail } from "../../lib/utils/email-checker";

function LoginForm() {
  const [identifier, setIdentifier] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isIdentifierEmail: boolean = isEmail(identifier);
    const data: LoginRequest = {
        username: !isIdentifierEmail ? identifier : undefined,
        email: isIdentifierEmail ? identifier : undefined,
        password: password 
    };


    try {
        const user = await authApi.login(data);
        console.log(user);
    } catch (error) {
        console.error(error);
    }
  };

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

      <button className="w-full py-3 bg-linear-to-r from-[#3FC16F] to-[#60A5FA] text-white font-bold rounded-lg hover:from-[#4ADE80] hover:to-[#60A5FA] transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex justify-center items-center">
        <span>Sign In</span>
      </button>
    </form>
  );
}

export default LoginForm;
