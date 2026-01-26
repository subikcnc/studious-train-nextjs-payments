"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  useEffect(() => {
    const localStorageToken = localStorage.getItem("accountToken");
    if (localStorageToken) setToken(localStorageToken);
  }, []);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage("All fields are required");
      return;
    }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error);
        throw new Error(data.error);
      }
      console.log("Registration successful", data);

      localStorage.setItem("accountToken", data.token);
      setToken(data.token);
      setName("");
      setEmail("");
      setPassword("");
      setErrorMessage("");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoginErrorMessage(data.error);
        throw new Error(data.error);
      }
      console.log("Login successful", data);

      localStorage.setItem("accountToken", data.token);
      setToken(data.token);
      setLoginEmail("");
      setLoginPassword("");
      setLoginErrorMessage("");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      localStorage.removeItem("accountToken");
      setToken("");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return token && token.length > 0 ? (
    <div className="flex w-full h-screen items-center justify-center flex-col">
      <Button onClick={handleLogout}>Log out</Button>
      <Button asChild>
        <Link href="/chat">Chat</Link>
      </Button>
    </div>
  ) : (
    <div className="flex w-full h-screen items-center justify-center">
      {/* Register form */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full h-screen items-center justify-center flex-col"
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          className="border border-amber-50"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </form>
      <form
        onSubmit={handleLogin}
        className="flex w-full h-screen items-center justify-center flex-col"
      >
        {/* Login form */}
        <input
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {loginErrorMessage && (
          <p className="text-red-500">{loginErrorMessage}</p>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;

// Validations are not working right now
