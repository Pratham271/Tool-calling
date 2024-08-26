import Link from "next/link";
import { Button } from "./ui/button";
import { Heart, Plus } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const Navbar = () => (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-background">
      <Link href="/new">
        <Button
          type="button"
          variant={'secondary'}
          className="rounded-full bg-secondary/80 group transition-all hover:scale-105 pointer-events-auto"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-all" />
          <span className="text-sm ml-2 group-hover:block hidden animate-in fade-in duration-300">
            New
          </span>
        </Button>
      </Link>
      <div
        className='flex items-center space-x-2'
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open("https://github.com/Pratham271/Tool-calling", "_blank")}
          className="flex items-center space-x-2"
        >
          <GitHubLogoIcon className="h-4 w-4 text-primary" />
          <span>GitHub</span>
        </Button>
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => window.open("https://github.com/sponsors/zaidmukaddam", "_blank")}
                className="flex items-center space-x-2"
              >
                <Heart className="h-4 w-4 text-red-500" />
                <span>Sponsor</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sponsor this project on GitHub</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>
    </div>
);
export default Navbar