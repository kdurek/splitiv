import { Link } from "@tanstack/react-router";
import * as React from "react";

interface MemberLinkProps {
  userId: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function MemberLink({ userId, children, className, onClick }: MemberLinkProps) {
  return (
    <Link to="/profiles/$userId" params={{ userId }} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
