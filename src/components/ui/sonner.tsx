"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      theme="dark"
      toastOptions={{
        className: "toast-glass",
        classNames: {
          toast: "toast-glass",
          title: "text-white font-bold",
          description: "text-slate-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };