import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Send, FileDown, User, Bot } from "lucide-react";
import { chatApi } from "../services/api";
import { useApi } from "../hooks/useApi";
import { useWebSocket } from "../hooks/useWebSocket";

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] rounded-lg p-4 ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
        <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>
        <div>
          <div className="font-medium">{isUser ? "You" : "AI Assistant"}</div>
          <div className="mt-1">{message.content}</div>
        </div>
      </div>
    </div>
  );
};

export function ChatPage() {
  const [input, setInput] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);

  // Get all chats API hook
  const {
    data: chats,
    loading: chatsLoading,
    error: chatsError,
    execute: fetchChats
  } = useApi(chatApi.getAll);

  // Create chat API hook
  const {
    loading: creatingChat,
    error: createChatError,
    execute: createChat
  } = useApi(chatApi.create);

  // Get messages API hook
  const {
    loading: messagesLoading,
    error: messagesError,
    execute: fetchMessages
  } = useApi(chatApi.getMessages);

  // WebSocket for real-time messaging
  const {
    messages: wsMessages,
    sendMessage,
    connectionStatus
  } = useWebSocket(
    () => currentChatId ? chatApi.createWebSocketConnection(currentChatId) : null,
    [currentChatId]
  );

  // When component mounts, fetch all chats
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // When WebSocket receives new messages, update the chat
  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessageHistory((prev) => [...prev, ...wsMessages]);
    }
  }, [wsMessages]);

  // When a chat is selected, load its messages
  const handleChatSelect = async (chatId) => {
    setCurrentChatId(chatId);
    const messages = await fetchMessages(chatId);
    if (messages) {
      setMessageHistory(messages);
    }
  };

  // Create a new chat and select it
  const handleNewChat = async () => {
    const newChat = await createChat({
      title: "New Chat",
    });

    if (newChat) {
      await fetchChats();
      handleChatSelect(newChat.id);
    }
  };

  // Send a message
  const handleSendMessage = () => {
    if (!input.trim() || !currentChatId) return;

    // Clear input immediately for a responsive feel
    const messageContent = input;
    setInput("");

    // If no chat is selected, create one first
    if (!currentChatId) {
      createChat({ title: "New Chat" }).then((newChat) => {
        if (newChat) {
          setCurrentChatId(newChat.id);
          setTimeout(() => {
            sendMessage(messageContent);
          }, 500); // Small delay to ensure WebSocket is connected
        }
      });
      return;
    }

    // Send via WebSocket if available, otherwise fallback to HTTP
    if (connectionStatus === 'connected') {
      sendMessage(messageContent);
    } else {
      // Optimistically add message to UI
      const userMessage = {
        id: Date.now(),
        content: messageContent,
        is_from_user: true,
        chat_id: currentChatId,
        created_at: new Date().toISOString()
      };

      setMessageHistory((prev) => [...prev, userMessage]);

      // Send via HTTP API
      chatApi.sendMessage(currentChatId, {
        content: messageContent,
        is_from_user: true,
        chat_id: currentChatId
      }).then((response) => {
        if (response) {
          // Simulate AI response since we're not using WebSocket
          setTimeout(() => {
            const aiResponse = {
              id: Date.now() + 1,
              content: "This is a simulated HTTP response. WebSocket connection isn't available.",
              is_from_user: false,
              chat_id: currentChatId,
              created_at: new Date().toISOString()
            };
            setMessageHistory((prev) => [...prev, aiResponse]);
          }, 1000);
        }
      });
    }
  };

  // Handle export as report
  const handleExportReport = () => {
    // Functionality to be implemented
    alert("Export as report feature will be implemented soon!");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chat</h1>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleExportReport}
        >
          <FileDown className="h-4 w-4" />
          Export as Report
        </Button>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Chat history sidebar */}
        <div className="w-64 overflow-y-auto rounded-md border bg-card p-4">
          <h2 className="mb-3 font-semibold">Recent Chats</h2>

          <Button
            variant="default"
            size="sm"
            className="mb-3 w-full"
            onClick={handleNewChat}
            disabled={creatingChat}
          >
            New Chat
          </Button>

          <div className="space-y-2">
            {chatsLoading ? (
              <div className="text-center text-sm text-muted-foreground">Loading chats...</div>
            ) : chatsError ? (
              <div className="text-center text-sm text-destructive">Error loading chats</div>
            ) : chats && chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`cursor-pointer rounded-md p-2 text-sm transition-colors ${currentChatId === chat.id
                      ? "bg-secondary"
                      : "hover:bg-secondary/50"
                    }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  {chat.title}
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                No chats yet. Start a new conversation!
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex flex-1 flex-col rounded-md border bg-card">
          <div className="flex-1 overflow-y-auto p-4">
            {currentChatId ? (
              messageHistory.length > 0 ? (
                messageHistory.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isUser={message.is_from_user}
                  />
                ))
              ) : messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                    Loading messages...
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                </div>
              )
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Please select a chat or create a new one to start.
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={!currentChatId || connectionStatus === 'connecting'}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!currentChatId || connectionStatus === 'connecting' || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {connectionStatus === 'connecting' && (
              <div className="mt-2 text-xs text-muted-foreground">
                Connecting to chat...
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="mt-2 text-xs text-destructive">
                WebSocket connection error. Using HTTP fallback.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 