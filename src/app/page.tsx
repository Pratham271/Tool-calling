'use client';
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "ai/react";
import { suggestQuestions } from "./actions";
import { toast } from 'sonner';
import { AlignLeft, ArrowRight, Edit2, Flame, Link, Sparkles, Sun, Terminal, User2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/copyButton";
import { ToolInvocation } from "ai";
import renderToolInvocation from "@/components/toolInvocation";
import MarkdownRenderer from "@/components/markDownRenderer";

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
      console.log('message in frontend: ',messages)
      console.log("error message: ", error.message)
      console.log("Error stack:", error.stack);
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
    console.log("Input value: ",input.trim())
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
    { icon: <Link className="w-5 h-5 text-gray-400" />, text: "Latest updates on OpenAI" },
    { icon: <Sparkles className="w-5 h-5 text-gray-400" />, text: "Launch a campaing using google ads api" },
    { icon: <Terminal className="w-5 h-5 text-gray-400" />, text: "Count the no. of r's in strawberry" },
  ];

  return (
    <div className="flex flex-col font-sans items-center justify-center p-2 sm:p-4 bg-background text-foreground transition-all duration-500">
    <Navbar />

    <div className={`w-full max-w-[90%] sm:max-w-2xl space-y-6 p-1 ${hasSubmitted ? 'mt-16 sm:mt-20' : 'mt-[26vh] sm:mt-[30vh]'}`}>
      {!hasSubmitted && (
        <div className="text-center">
          <div className="flex text-center items-center justify-center">
            <Image src={"/logo.jpg"} alt="logo" height={80} width={80} quality={100}/>
            <h1 className="text-4xl sm:text-6xl mb-1 text-gray-800 font-serif">Perplex Jr.</h1>
          </div>
          <h2 className='text-xl sm:text-2xl font-serif text-balance text-center mb-6 text-gray-600'>
            In search for minimalism and simplicity
          </h2>
        </div>
      )}
      <AnimatePresence>
        {!hasSubmitted && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 px-2 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  name="search"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e:any) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="w-full min-h-12 py-3 px-4 bg-muted border border-input rounded-full pr-12 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 focus-visible:ring-offset-2 text-sm sm:text-base"
                />
                <Button
                  type="submit"
                  size={'icon'}
                  variant={'ghost'}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  disabled={input.length === 0}
                >
                  <ArrowRight size={20} />
                </Button>
              </div>
            </form>

            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:space-x-4 mt-6">
              {suggestionCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(card.text)}
                  className="flex items-center space-x-2 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-left"
                >
                  <span>{card.icon}</span>
                  <span className="text-xs font-medium text-gray-700 line-clamp-2">{card.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-4 sm:space-y-6 mb-24">
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center space-x-2 mb-4"
                >
                  <User2 className="size-5 sm:size-6 text-primary flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    {isEditingMessage && editingMessageIndex === index ? (
                      <form onSubmit={handleMessageUpdate} className="flex items-center space-x-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          className="flex-grow"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setIsEditingMessage(false)
                            setEditingMessageIndex(-1)
                            setInput('')
                          }}
                          disabled={isLoading}
                        >
                          <X size={16} />
                        </Button>
                        <Button type="submit" size="sm">
                          <ArrowRight size={16} />
                        </Button>
                      </form>
                    ) : (
                      <p className="text-xl sm:text-2xl font-medium font-serif truncate">
                        {message.content}
                      </p>
                    )}
                  </div>
                  {!isEditingMessage && index === lastUserMessageIndex && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessageEdit(index)}
                      className="ml-2"
                      disabled={isLoading}
                    >
                      <Edit2 size={16} />
                    </Button>
                  )}
                </motion.div>
              )}
              {message.role === 'assistant' && message.content && (
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      <Sparkles className="size-5 text-primary" />
                      <h2 className="text-base font-semibold">Answer</h2>
                    </div>
                    <CopyButton text={message.content} />
                  </div>
                  <div>
                    <MarkdownRenderer content={message.content} />
                  </div>
                </div>
              )}
              {message.toolInvocations?.map((toolInvocation: ToolInvocation, toolIndex: number) => (
                <div key={`tool-${toolIndex}`}>
                  {renderToolInvocation(toolInvocation, toolIndex)}
                </div>
              ))}
            </div>
          ))}
          {suggestedQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl sm:max-w-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlignLeft className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">Suggested questions</h2>
              </div>
              <div className="space-y-2 flex flex-col">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-fit font-light rounded-2xl p-1 justify-start text-left h-auto py-2 px-4 bg-neutral-100 text-neutral-950 hover:bg-muted-foreground/10 whitespace-normal"
                    onClick={() => handleSuggestedQuestionClick(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-4 transform -translate-x-1/2 w-full max-w-[90%] md:max-w-2xl mt-3"
          >
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  name="search"
                  placeholder="Ask a new question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="w-full min-h-12 py-3 px-4 bg-muted border border-input rounded-full pr-12 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 focus-visible:ring-offset-2 text-sm sm:text-base"
                />
                <Button
                  type="submit"
                  size={'icon'}
                  variant={'ghost'}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  disabled={input.length === 0 || isLoading}
                >
                  <ArrowRight size={20} />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
