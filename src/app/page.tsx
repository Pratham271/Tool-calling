'use client';
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "ai/react";
import { suggestQuestions } from "./actions";
import { toast } from 'sonner';
import { Flame, Sparkles, Sun, Terminal } from "lucide-react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState(-1);

  const { isLoading, input, messages, setInput, append, handleSubmit, setMessages } = useChat({
    api: '/api/chat',
    maxToolRoundtrips: 1,
    onFinish: async (message, { finishReason }) => {
      console.log("[finish reason]:", finishReason);
      if (message.content && finishReason === 'stop' || finishReason === 'length') {
        const newHistory = [...messages, { role: "user", content: lastSubmittedQuery }, { role: "assistant", content: message.content }];
        const { questions } = await suggestQuestions(newHistory);
        setSuggestedQuestions(questions);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("An error occurred.", {
        description: "We must have ran out of credits. Sponsor us on GitHub to keep this service running.",
        action: {
          label: "Sponsor",
          onClick: () => window.open("https://git.new/mplx", "_blank"),
        },
      });
    },
  });

  const lastUserMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return i;
      }
    }
    return -1;
  }, [messages]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, suggestedQuestions]);

  const handleExampleClick = useCallback(async (query: string) => {
    setLastSubmittedQuery(query.trim());
    setHasSubmitted(true);
    setSuggestedQuestions([]);
    await append({
      content: query.trim(),
      role: 'user'
    });
  }, [append]);

  const handleSuggestedQuestionClick = useCallback((question: string) => {
    setHasSubmitted(true);
    setSuggestedQuestions([]);
    setInput(question.trim());
    handleSubmit(new Event('submit') as any);
  }, [setInput, handleSubmit]);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setHasSubmitted(true);
      setSuggestedQuestions([]);
      handleSubmit(e);
    } else {
      toast.error("Please enter a search query.");
    }
  }, [input, handleSubmit]);

  const handleMessageEdit = useCallback((index: number) => {
    setIsEditingMessage(true);
    setEditingMessageIndex(index);
    setInput(messages[index].content);
  }, [messages, setInput]);

  const handleMessageUpdate = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      const updatedMessages = [...messages];
      updatedMessages[editingMessageIndex] = { ...updatedMessages[editingMessageIndex], content: input.trim() };
      setMessages(updatedMessages);
      setIsEditingMessage(false);
      setEditingMessageIndex(-1);
      handleSubmit(e);
    } else {
      toast.error("Please enter a valid message.");
    }
  }, [input, messages, editingMessageIndex, setMessages, handleSubmit]);

  const suggestionCards = [
    { icon: <Flame className="w-5 h-5 text-gray-400" />, text: "What's new with XAI's Grok?" },
    { icon: <Sparkles className="w-5 h-5 text-gray-400" />, text: "Latest updates on OpenAI" },
    { icon: <Sun className="w-5 h-5 text-gray-400" />, text: "Weather in Doha" },
    { icon: <Terminal className="w-5 h-5 text-gray-400" />, text: "Count the no. of r's in strawberry" },
  ];

  return (
    <div className="flex justify-center mt-10">
       <Button>Click me</Button>
    </div>
  );
}
