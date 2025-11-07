import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/user/me", {
          credentials: "include",
        });
        const data = await res.json();
        console.log("DEBUG /api/user/me response:", res.status, data);
        const userId = res.ok && data?.success && data?.user ? data.user.userid : null;
        const s = io("http://localhost:3000", {
          withCredentials: true,
          auth: { userid: userId },
          transports: ["websocket", "polling"],
        });
        s.on("connect", () => console.log("DEBUG socket connected id=", s.id, " auth.userid sent:", userId));
        s.on("connect_error", (err) => console.log("DEBUG socket connect_error", err && err.message));
        if (!mounted) {
          s.disconnect();
          return;
        }
        setSocket(s);
      } catch (err) {
        console.log("DEBUG /api/user/me fetch failed:", err);
        const s = io("http://localhost:3000", {
          withCredentials: true,
          auth: { userid: null },
          transports: ["websocket", "polling"],
        });
        s.on("connect", () => console.log("DEBUG socket connected (no user) id=", s.id));
        s.on("connect_error", (err) => console.log("DEBUG socket connect_error", err && err.message));
        if (!mounted) {
          s.disconnect();
          return;
        }
        setSocket(s);
      }
    })();

    return () => {
      mounted = false;
      setSocket((s) => {
        if (s) s.disconnect();
        return null;
      });
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
