import type { ButtonHTMLAttributes } from "react";

type ActButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function ActButton({ variant = "primary", className, ...rest }: ActButtonProps) {
  const variantClass = variant === "secondary" ? "act act-2" : "act";
  return <button className={`${variantClass} ${className ?? ""}`} {...rest} />;
}
