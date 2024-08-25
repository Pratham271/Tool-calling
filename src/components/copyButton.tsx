'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Copy, Check } from 'lucide-react';
const CopyButton = ({ text }: { text: string }) => {
    const [isCopied, setIsCopied] = useState(false);

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          if (!navigator.clipboard) {
            return;
          }
          await navigator.clipboard.writeText(text);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
          toast.success("Copied to clipboard");
        }}
        className="h-8 px-2 text-xs rounded-full"
      >
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    );
};

export default CopyButton
