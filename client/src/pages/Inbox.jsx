// src/pages/Inbox.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000";

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [userRes, convRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/user/me`, { credentials: "include" }),
          fetch(`${BACKEND_URL}/api/chat/conversations`, { credentials: "include" }),
        ]);

        const userData = await userRes.json();
        if (userRes.ok && userData.success && mounted) {
          setCurrentUserId(userData.user.userid || null);
        }

        const data = await convRes.json();
        if (convRes.ok && data.success && mounted) {
          const mapped = data.conversations.map((c) => {
            const lm = c.lastMessage;
            const other =
              Number(c.ownerId) === Number(userData?.user?.userid) ? c.buyerUser : c.ownerUser;
            const otherName = other ? `${other.firstName} ${other.lastName}` : "Unknown";
            const unreadCount = Number(c.unreadCount || 0);
            return {
              ...c,
              otherName,
              unreadCount,
              hasUnread: unreadCount > 0,
              lastMessageText: lm ? lm.text : null,
              lastMessageTime: lm ? lm.createdAt : null,
            };
          });
          setConversations(mapped);
        } else if (mounted) {
          setConversations([]);
        }
      } catch (err) {
        if (mounted) setConversations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    localStorage.setItem("lastInboxOpenedAt", new Date().toISOString());

    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteConversation = async (conversationId) => {
    const confirmed = window.confirm("Delete this conversation? This cannot be undone.");
    if (!confirmed) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/conversations/${conversationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data?.message || "Failed to delete conversation");
        return;
      }
      setConversations((prev) => prev.filter((c) => String(c.id) !== String(conversationId)));
    } catch (err) {
      console.error("Error deleting conversation:", err);
      alert("Unable to delete conversation");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!conversations || conversations.length === 0)
    return <div className="p-6 text-center text-gray-600">No conversations</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Inbox</h2>
      <div className="flex flex-col gap-3">
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(`/chat/${c.id}`)}
            className="cursor-pointer p-4 bg-white rounded shadow flex items-start justify-between hover:shadow-md"
          >
            <div className="flex-1 pr-4">
              <div className="text-sm text-gray-500 mb-1">Chat with: {c.otherName}</div>
              <div className={`mt-1 ${c.hasUnread ? "font-bold text-black" : "text-gray-600"}`}>
                {c.lastMessageText || "No messages yet"}
              </div>
              {c.hasUnread && (
                <div className="text-xs text-red-600 mt-1 font-semibold">
                  {c.unreadCount} new message{c.unreadCount > 1 ? "s" : ""}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleString() : ""}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {c.hasUnread && (
                <div className="bg-red-600 text-white text-xs rounded-full px-2 py-1">
                  {c.unreadCount}
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(c.id);
                }}
                className="text-sm text-red-600 hover:text-red-800 px-2 py-1 border border-transparent hover:border-red-100 rounded"
                aria-label={`Delete conversation with ${c.otherName}`}
                title="Delete conversation"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
