import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../services/socket";

export default function ChatPage() {
  const { conversationId } = useParams();
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/user/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data.success && data.user) {
          setIsLoggedIn(true);
          setCurrentUserId(Number(data.user.userid));
        } else {
          setIsLoggedIn(false);
          setCurrentUserId(null);
        }
      } catch (err) {
        if (!mounted) return;
        setIsLoggedIn(false);
        setCurrentUserId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/chat/${conversationId}/messages`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          const prepared = data.messages.map((m) => ({
            ...m,
            isMine: currentUserId ? Number(m.senderId) === Number(currentUserId) : Boolean(m.isMine),
          }));
          setMessages(prepared);
        }
      } catch (err) {}
    };
    if (conversationId) fetchMessages();
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit("join_conversation", { conversationId });

    const handleReceive = (payload) => {
      const incoming = payload.message;
      if (!incoming) return;
      const incomingWithIsMine = {
        ...incoming,
        isMine: currentUserId ? Number(incoming.senderId) === Number(currentUserId) : Boolean(incoming.isMine),
      };
      setMessages((prev) => {
        const exists = prev.some((m) => Number(m.id) === Number(incomingWithIsMine.id));
        if (exists) return prev;
        return [...prev, incomingWithIsMine];
      });
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
      socket.emit("leave_conversation", { conversationId });
    };
  }, [socket, conversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!isLoggedIn) {
      alert("You need to log in first to send messages");
      navigate("/login");
      return;
    }
    if (!text.trim()) return;
    try {
      const token = localStorage.getItem("access_token");
      console.log("CHAT sendMessage: localStorage token present:", token ? "(yes)" : "(no)");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:3000/api/chat/${conversationId}/messages`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ text }),
      });

      console.log("CHAT sendMessage: response status", res.status);
      const txt = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(txt);
      } catch (err) {
        parsed = txt;
      }
      console.log("CHAT sendMessage: response body", parsed);

      if (res.status === 401) {
        alert("You need to log in first to send messages");
        navigate("/login");
        return;
      }

      if (parsed?.success && parsed?.message) {
        const msg = parsed.message;
        const msgWithIsMine = {
          ...msg,
          isMine: currentUserId ? Number(msg.senderId) === Number(currentUserId) : true,
        };
        setMessages((m) => {
          const exists = m.some((mm) => Number(mm.id) === Number(msgWithIsMine.id));
          if (exists) return m;
          return [...m, msgWithIsMine];
        });
        setText("");
      }
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-4 flex flex-col" style={{ height: "80vh" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Chat</div>
          <div>
            <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Back</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 p-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 ${msg.isMine ? "text-right" : "text-left"}`}>
              <div className={`inline-block px-4 py-2 rounded-lg ${msg.isMine ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                {msg.text}
              </div>
              <div className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-2 border rounded-lg resize-none"
            rows={2}
            placeholder={isLoggedIn ? "Type a message..." : "Log in to send messages"}
            disabled={!isLoggedIn}
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-purple-600 text-white rounded-lg" disabled={!isLoggedIn}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
