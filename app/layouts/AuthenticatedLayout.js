"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import ChatDrawer from "../components/chatdrawer";
import Header from "../components/header";
import ChatInterface from "../components/chatinterface";
import KnowledgeBase from "../components/knowledgeBase";
import { Box } from "@mui/material";
import Chatinterface from "../components/chatinterface";

export default function AuthenticatedLayout() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [activeComponent, setActiveComponent] = useState("chat");
	const [messages, setMessages] = useState([]);
	const [currentConversationId, setCurrentConversationId] = useState(null);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/");
		}
	}, [user, loading, router]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!user) {
		return null;
	}

	const handleComponentChange = (component) => {
    setActiveComponent(component);
    if (component === 'knowledgeBase') {
      setCurrentConversationId(null);
      setMessages([]);
    }
	};

	const handleConversationChange = (conversationId, messages) => {
		if (!conversationId) {
			// To handle new conversation click
			setCurrentConversationId("");
			setMessages([]);
			setActiveComponent("chat");
		} else {
			console.log("Setting conversation ID:", conversationId);
			console.log("Setting messages:", messages);
			setCurrentConversationId(conversationId);
			setMessages(messages);
			setActiveComponent("chat");
		}
	};

  // useEffect(() => {


	// }, [messages, currentConversationId]);

	return (
		<Box sx={{ display: "flex", height: "100vh" }}>
			<ChatDrawer
				onComponentChange={handleComponentChange}
				onConversationChange={handleConversationChange}
			/>
			<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
				<Header />
				{activeComponent === "chat" && (
					<ChatInterface
						conversationId={currentConversationId}
						initialMessages={messages}
					/>
				)}
				{activeComponent === "knowledgeBase" && <KnowledgeBase />}
			</Box>
		</Box>
	);
}
