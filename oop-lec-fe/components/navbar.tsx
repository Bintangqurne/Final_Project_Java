"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import LOGO from "@/public/Logo.svg";
const Navbar = () => {
  const menuItems = [
    { label: "HOME", href: "/" },
    { label: "PRODUCTS", href: "/" },
    { label: "ORDERS", href: "/orders" },
    { label: "PROFILE", href: "/profile" },
    { label: "CHECKOUT", href: "/checkout" },
    { label: "CART", href: "/cart" },
  ];

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        layout
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200"
        >

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src={LOGO}
              alt="Logo"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
              >
                {item.label}
              </Link>
            ))}
          </div>

        </div>
      </motion.nav>

      {/* FULLSCREEN MENU */}
    </>
  );
};

export default Navbar;