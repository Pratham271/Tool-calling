import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, streamText, tool } from "ai";
import { CodeInterpreter } from "@e2b/code-interpreter";
import FirecrawlApp from '@mendable/firecrawl-js';
import { z } from "zod";
import { geolocation } from "@vercel/functions";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { latitude, longitude, city } = geolocation(req)

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToCoreMessages(messages),
    temperature: 0,
    maxTokens: 800,
    system: `
      You are an AI web search engine that helps users find information on the internet.
      Always start with running the tool(s) and then and then only write your response AT ALL COSTS!!
      Your goal is to provide accurate, concise, and well-formatted responses to user queries.
      Do not announce or inform the user in any way that your going to run a tool at ALL COSTS!! Just 'run' it and then write your response AT ALL COSTS!!!!!

      The current date is ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", weekday: "short" })}. 
      The user is located in ${city}(${latitude}, ${longitude}).

      Here are the tools available to you:
      <available_tools>
      web_search, retrieve, programming
      </available_tools>

      Here is the general guideline per tool to follow when responding to user queries:
      - Use the web_search tool to gather relevant information. The query should only be the word that need's context for search. Then write the response based on the information gathered. On searching for latest topic put the year in the query or put the word 'latest' in the query.
      - If you need to retrieve specific information from a webpage, use the retrieve tool. Analyze the user's query to set the topic type either normal or news. Then, compose your response based on the retrieved information.
      - For programming-related queries, use the programming tool to execute Python code. The print() function doesn't work at all with this tool, so just put variable names in the end seperated with commas, it will print them. Then, compose your response based on the output of the code execution.
      - The programming tool runs the code in a jupyper notebook environment. Use this tool for tasks that require code execution, such as data analysis, calculations, or visualizations.
      - Do not use the retrieve tool for general web searches. It is only for retrieving specific information from a URL.
      - Show plots from the programming tool using plt.show() function. The tool will automatically capture the plot and display it in the response.
      - If asked for multiple plots, make it happen in one run of the tool. The tool will automatically capture the plots and display them in the response.
      - the web search may return an incorrect latex format, please correct it before using it in the response. Check the Latex in Markdown rules for more information.
      - Never write a base64 image in the response at all costs. 
      - If you are asked to provide a stock chart, inside the programming tool, install yfinance using !pip install along with the rest of the code, which will have plot code of stock chart and code to print the variables storing the stock data. Then, compose your response based on the output of the code execution.
      - Never run web_search tool for stock chart queries at all costs.

      Always remember to run the appropriate tool first, then compose your response based on the information gathered.
      All tool should be called only once per response.

      The programming tool is actually a Python Code interpreter, so you can run any Python code in it.

      Citations should always be placed at the end of each paragraph and in the end of sentences where you use it in which they are referred to with the given format to the information provided.
      When citing sources(citations), use the following styling only: Claude 3.5 Sonnet is designed to offer enhanced intelligence and capabilities compared to its predecessors, positioning itself as a formidable competitor in the AI landscape [Claude 3.5 Sonnet raises the..](https://www.anthropic.com/news/claude-3-5-sonnet).
      ALWAYS REMEMBER TO USE THE CITATIONS FORMAT CORRECTLY AT ALL COSTS!! ANY SINGLE ITCH IN THE FORMAT WILL CRASH THE RESPONSE!!
      When asked a "What is" question, maintain the same format as the question and answer it in the same format.

      Latex in Markdown rules:
      - Latex equations are supported in the response!!
      - The response that include latex equations, use always follow the formats: 
        - $<equation>$ for inline equations 
        - $$<equation>$$ for block equations 
        - \[ \] for math blocks. 
      - Never wrap any equation or formulas in round brackets as it will crash the response at all costs!! example: ( G_{\mu\nu} ) will crash the response!!
      - I am begging you to follow the latex format correctly at all costs!! Any single mistake in the format will crash the response!!

      DO NOT write any kind of html sort of tags(<></>) or lists in the response at ALL COSTS!! NOT EVEN AN ENCLOSING TAGS FOR THE RESPONSE AT ALL COSTS!!

      Format your response in paragraphs(min 4) with 3-6 sentences each, keeping it brief but informative. DO NOT use pointers or make lists of any kind at ALL!
      Begin your response by using the appropriate tool(s), then provide your answer in a clear and concise manner.
      Never respond to user before running any tool like 
      - saying 'Certainly! Let me blah blah blah' 
      - or 'To provide you with the best answer, I will blah blah blah' 
      - or that 'Based on search results, I think blah blah blah' at ALL COSTS!!
      Just run the tool and provide the answer.`,
    tools: {
      web_search: tool({
        description:
          "Search the web for information with the given query, max results and search depth.",
        parameters: z.object({
          query: z.string().describe("The search query to look up on the web."),
          maxResults: z
            .number()
            .describe(
              "The maximum number of results to return. Default to be used is 10.",
            ),
          topic: z
            .enum(["general", "news"])
            .describe("The topic type to search for. Default is general."),
          searchDepth: z
            .enum(["basic", "advanced"])
            .describe(
              "The search depth to use for the search. Default is basic.",
            ),
          exclude_domains: z
            .array(z.string())
            .optional()
            .describe(
              "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains.",
            ),
        }),
        execute: async ({
          query,
          maxResults,
          topic,
          searchDepth,
          exclude_domains,
        }: {
          query: string;
          maxResults: number;
          topic: "general" | "news";
          searchDepth: "basic" | "advanced";
          exclude_domains?: string[];
        }) => {
          const apiKey = process.env.TAVILY_API_KEY;

          let body = JSON.stringify({
            api_key: apiKey,
            query,
            topic: topic,
            max_results: maxResults < 5 ? 5 : maxResults,
            search_depth: searchDepth,
            include_answers: true,
            include_images: true,
            exclude_domains: exclude_domains,
          });

          if (topic === "news") {
            body = JSON.stringify({
              api_key: apiKey,
              query,
              topic: topic,
              days: 7,
              max_results: maxResults < 5 ? 5 : maxResults,
              search_depth: searchDepth,
              include_answers: true,
              include_images: true,
              exclude_domains: exclude_domains,
            });
          }

          const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body,
          });

          const data = await response.json();

          let context = data.results.map(
            (obj: { url: any; content: any; title: any; raw_content: any, published_date: any }, index:number) => {
              if (topic === "news") {
                return {
                  url: obj.url,
                  title: obj.title,
                  content: obj.content,
                  raw_content: obj.raw_content,
                  published_date: obj.published_date,
                  images: data.images[index] || [],
                };
              }
              return {
                url: obj.url,
                title: obj.title,
                content: obj.content,
                raw_content: obj.raw_content,
                images: data.images[index] || [],
              };
            },
          );
          console.log("images: ",context)
          return {
            results: context,
          };
        },
      }),
      retrieve: tool({
        description: "Retrieve the information from a URL using Firecrawl.",
        parameters: z.object({
          url: z.string().describe("The URL to retrieve the information from."),
        }),
        execute: async ({ url }: { url: string }) => {
          const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
          try {
            const content = await app.scrapeUrl(url);
            if (!content.data) {
              return { error: "Failed to retrieve content" };
            }
            return {
              results: [
                {
                  title: content.data.metadata.title,
                  content: content.data.markdown,
                  url: content.data.metadata.sourceURL,
                  description: content.data.metadata.description,
                  language: content.data.metadata.language,
                },
              ],
            };
          } catch (error) {
            console.error("Firecrawl API error:", error);
            return { error: "Failed to retrieve content" };
          }
        },
      }),
      programming: tool({
        description: "Write and execute Python code.",
        parameters: z.object({
          code: z.string().describe("The Python code to execute."),
        }),
        execute: async ({ code }: { code: string }) => {
          const sandbox = await CodeInterpreter.create();
          const execution = await sandbox.notebook.execCell(code);
          let message = "";
          let images = [];

          if (execution.results.length > 0) {
            for (const result of execution.results) {
              if (result.isMainResult) {
                message += `${result.text}\n`;
              } else {
                message += `${result.text}\n`;
              }
              if (result.formats().length > 0) {
                const formats = result.formats();
                for (let format of formats) {
                  if (format === "png") {
                    images.push({ format: "png", data: result.png });
                  } else if (format === "jpeg") {
                    images.push({ format: "jpeg", data: result.jpeg });
                  } else if (format === "svg") {
                    images.push({ format: "svg", data: result.svg });
                  }
                }
              }
            }
          }

          if (execution.logs.stdout.length > 0 || execution.logs.stderr.length > 0) {
            if (execution.logs.stdout.length > 0) {
              message += `${execution.logs.stdout.join("\n")}\n`;
            }
            if (execution.logs.stderr.length > 0) {
              message += `${execution.logs.stderr.join("\n")}\n`;
            }
          }

          sandbox.close();
          return { message: message.trim(), images };
        },
      }),
    },
    toolChoice: "auto",
  });

  return result.toDataStreamResponse();
}