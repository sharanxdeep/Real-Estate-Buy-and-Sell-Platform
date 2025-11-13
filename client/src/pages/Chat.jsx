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

  const BACKEND_URL = "http://localhost:3000";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/me`, { credentials: "include" });
        const data = await res.json();
        if (!mounted) return;

        if (res.ok && data.success && data.user) {
          setIsLoggedIn(true);
          setCurrentUserId(Number(data.user.userid));
        } else {
          alert("Please login to access chat");
          navigate("/login");
        }
      } catch {
        alert("Please login to access chat");
        navigate("/login");
      }
    })();

    return () => { mounted = false };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/chat/${conversationId}/messages`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setMessages(
            data.messages.map((m) => ({
              ...m,
              isMine: Number(m.senderId) === Number(currentUserId),
            }))
          );
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    fetchMessages();
  }, [conversationId, currentUserId, isLoggedIn]);

  useEffect(() => {
    if (!socket || !conversationId || !isLoggedIn) return;

    socket.emit("join_conversation", { conversationId });

    const handleReceive = (payload) => {
      const incoming = payload.message;
      if (!incoming) return;
      setMessages((prev) => {
        if (prev.find((m) => m.id === incoming.id)) return prev;
        return [...prev, { ...incoming, isMine: Number(incoming.senderId) === Number(currentUserId) }];
      });
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
      socket.emit("leave_conversation", { conversationId });
    };
  }, [socket, conversationId, currentUserId, isLoggedIn]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!isLoggedIn) return alert("You must login first!");

    if (!text.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/${conversationId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return alert(data.message || "Message failed");
      }

      setMessages((prev) => [
        ...prev,
        { ...data.message, isMine: true }
      ]);
      setText("");

    } catch (err) {
      console.error(err);
      alert("Error sending message");
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
          <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Back</button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 p-2">
          {messages.map((msg, i) => (
            <div key={i} className={msg.isMine ? "text-right mb-3" : "text-left mb-3"}>
              <div className={`inline-block px-4 py-2 rounded-lg ${msg.isMine ? "bg-purple-600 text-white" : "bg-gray-200"}`}>
                {msg.text}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-2 border rounded-lg"
            rows={2}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
