import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Subscribe() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/cuts";

  useEffect(() => {
    navigate(`/auth/signup?redirect=${encodeURIComponent(redirect)}`, { replace: true });
  }, []);

  return null;
}
