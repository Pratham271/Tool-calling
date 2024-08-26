import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
  } from "@/components/ui/hover-card";
  
import Image from "next/image";
import React from "react";

interface CitationComponentProps {
    href: string;
    children: React.ReactNode;
    index: number;
}
  
const CitationComponent: React.FC<CitationComponentProps> = React.memo(({ href, index }) => {
    const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${new URL(href).hostname}`;
  
    return (
      <HoverCard key={index}>
        <HoverCardTrigger asChild>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-help text-sm text-primary py-0.5 px-1.5 m-0 bg-secondary rounded-full no-underline"
          >
            {index + 1}
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="flex items-center gap-1 !p-0 !px-0.5 max-w-xs bg-card text-card-foreground !m-0 h-6 rounded-xl">
          <Image src={faviconUrl} alt="Favicon" width={16} height={16} className="w-4 h-4 flex-shrink-0 rounded-full" />
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary no-underline truncate">
            {href}
          </a>
        </HoverCardContent>
      </HoverCard>
    );
  });
  
CitationComponent.displayName = "CitationComponent";

export default CitationComponent