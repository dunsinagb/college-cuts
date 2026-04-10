import { useEffect, useState } from "react";

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    const val = localStorage.getItem("cc_subscribed");
    setIsSubscribed(val === "1");
  }, []);

  return { isSubscribed, setIsSubscribed };
}
