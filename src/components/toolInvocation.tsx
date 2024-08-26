import { ToolInvocation } from "ai";
import {
    SearchIcon,
    Globe,
    Newspaper,
    Code,
    Loader2,
    Download,
  } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import CopyButton from "./copyButton";
import { Button } from "./ui/button";
import { Badge } from '@/components/ui/badge';
import Image from "next/image";
import { motion } from 'framer-motion';

const renderToolInvocation = (toolInvocation: ToolInvocation, index: number) => {
    const args = JSON.parse(JSON.stringify(toolInvocation.args));
    const result = 'result' in toolInvocation ? JSON.parse(JSON.stringify(toolInvocation.result)) : null;
    // console.log("arguments: ",args)
    // console.log("result: ",result)

    if (toolInvocation.toolName === 'programming') {
      return (
        <div className="w-full my-2 border border-gray-200 overflow-hidden rounded-md">
          <div className="bg-gray-100 p-2 flex items-center">
            <Code className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium">Programming</span>
          </div>
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="bg-gray-50 p-0 h-auto shadow-sm rounded-none">
              <TabsTrigger
                value="code"
                className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
              >
                Code
              </TabsTrigger>
              <TabsTrigger
                value="output"
                className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
              >
                Output
              </TabsTrigger>
              {result?.images && result.images.length > 0 && (
                <TabsTrigger
                  value="images"
                  className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
                >
                  Images
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="code" className="p-0 m-0 rounded-none">
              <div className="relative">
                <SyntaxHighlighter
                  language="python"
                  style={oneLight}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '0.875rem',
                    borderRadius: 0,
                  }}
                >
                  {args.code}
                </SyntaxHighlighter>
                <div className="absolute top-2 right-2">
                  <CopyButton text={args.code} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="output" className="p-0 m-0 rounded-none">
              <div className="relative bg-white p-4">
                {result ? (
                  <>
                    <pre className="text-sm">
                      <code>{result.message}</code>
                    </pre>
                    <div className="absolute top-2 right-2">
                      <CopyButton text={result.message} />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-20">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                      <span className="text-gray-500 text-sm">Executing code...</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            {result?.images && result.images.length > 0 && (
              <TabsContent value="images" className="p-0 m-0 bg-white">
                <div className="space-y-4 p-4">
                  {result.images.map((img: { format: 'png' | 'jpeg' | 'svg', data: string }, imgIndex: number) => (
                    <div key={imgIndex} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Image {imgIndex + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-8 w-8"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:image/${img.format === 'svg' ? 'svg+xml' : img.format};base64,${img.data}`;
                            link.download = `generated-image-${imgIndex + 1}.${img.format}`;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                        <Image
                          src={`data:image/${img.format === 'svg' ? 'svg+xml' : img.format};base64,${img.data}`}
                          alt={`Generated image ${imgIndex + 1}`}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      );
    }



    if (toolInvocation.toolName === 'web_search') {
      return (
        <div>
          {!result ? (
            <div className="flex items-center justify-between w-full">
              <div className='flex items-center gap-2'>
                <Globe className="h-5 w-5 text-neutral-700 animate-spin" />
                <span className="text-neutral-700 text-lg">Running a search...</span>
              </div>
              {/* loading animation for ... */}
              <div className="flex space-x-1">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: index * 0.2,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value={`item-${index}`} className='border-none'>
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Newspaper className="h-5 w-5 text-primary" />
                      <h2 className='text-base font-semibold'>Sources Found</h2>
                    </div>
                    {result && (
                      <Badge variant="secondary" className='rounded-full'>{result.results.length} results</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {args?.query && (
                    <Badge variant="secondary" className="mb-4 text-xs sm:text-sm font-light rounded-full">
                      <SearchIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {args.query}
                    </Badge>
                  )}
                  {result && (
                    <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto pb-2">
                      {result.results.map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="flex flex-col w-full sm:w-[280px] flex-shrink-0 bg-card border rounded-lg p-3">
                          <div className="flex items-start gap-3 mb-2">
                            <Image
                              width={48}
                              height={48}
                              unoptimized
                              quality={100}
                              src={`https://www.google.com/s2/favicons?sz=128&domain=${new URL(item.url).hostname}`}
                              alt="Favicon"
                              className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 rounded-sm"
                            />
                            <div className="flex-grow min-w-0">
                              <h3 className="text-sm font-semibold line-clamp-2">{item.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.content}</p>
                            </div>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary truncate hover:underline"
                          >
                            {item.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      );
    }

    if (toolInvocation.toolName === 'retrieve') {
      if (!result) {
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-neutral-700 animate-pulse" />
              <span className="text-neutral-700 text-lg">Retrieving content...</span>
            </div>
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: index * 0.2,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="w-full my-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Retrieved Content</h3>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm sm:text-base">{result.results[0].title}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">{result.results[0].description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{result.results[0].language || 'Unknown language'}</Badge>
              <a href={result.results[0].url} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-primary hover:underline">
                Source
              </a>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="content" className="border-b-0">
              <AccordionTrigger>View Content</AccordionTrigger>
              <AccordionContent>
                <div className="max-h-[50vh] overflow-y-auto bg-muted p-2 sm:p-4 rounded-lg">
                  <ReactMarkdown className="text-xs sm:text-sm">
                    {result.results[0].content}
                  </ReactMarkdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      );
    }
  };

export default renderToolInvocation