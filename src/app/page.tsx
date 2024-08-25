'use client';
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react";
import { useChat } from "ai/react";
import { suggestQuestions } from "./actions";
import { toast } from 'sonner';

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

  return (
    <div className="flex justify-center mt-10">
       <Button>Click me</Button>
    </div>
  );
}
