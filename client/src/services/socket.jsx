import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  const createSocket = async (userId) => {
    const s = io("http://localhost:3000", {
      withCredentials: true,
      auth: { userid: userId || null },
      transports: ["websocket", "polling"],
    });
    s.on("connect_error", () => {});
    return s;
  };

  useEffect(() => {
    let mounted = true;
    let activeSocket = null;

    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json();
        const userId = res.ok && data?.success && data?.user ? data.user.userid : null;
        activeSocket = await createSocket(userId);
        if (!mounted) {
          activeSocket.disconnect();
          return;
        }
        setSocket(activeSocket);
      } catch {
        activeSocket = await createSocket(null);
        if (!mounted) {
          activeSocket.disconnect();
          return;
        }
        setSocket(activeSocket);
      }
    })();

    const handleAuthChange = async (e) => {
      const newUserId = e?.detail ?? null;
      setSocket((old) => {
        if (old) {
          try { old.disconnect(); } catch {}
        }
        return null;
      });
      const s = await createSocket(newUserId);
      setSocket(s);
    };

    window.addEventListener("safeRoofAuthChange", handleAuthChange);

    return () => {
      mounted = false;
      window.removeEventListener("safeRoofAuthChange", handleAuthChange);
      setSocket((s) => {
        if (s) {
          try { s.disconnect(); } catch {}
        }
        return null;
      });
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
