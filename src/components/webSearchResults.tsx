import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Newspaper, SearchIcon, ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent } from "./ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";

interface SearchImage {
    url: string;
    description: string;
}


const WebSearchResults = ({ result, args }: { result: any, args: any }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <div>
            <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="item-1" className='border-none'>
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
                                            <img
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
            {result && result.images && result.images.length > 0 && (
                <div className="mt-4">
                    <div
                        className='flex items-center gap-2 cursor-pointer mb-2'
                    >
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-semibold">Images</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {result.images.slice(0, 4).map((image: SearchImage, itemIndex: number) => (
                            <div
                                key={itemIndex}
                                className="relative aspect-square cursor-pointer overflow-hidden rounded-md"
                                onClick={() => handleImageClick(itemIndex)}
                            >
                                <img
                                    src={image.url}
                                    alt={image.description}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                                {itemIndex === 3 && result.images.length > 4 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                        <PlusCircledIcon className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {openDialog && result.images && (
                <ImageCarousel
                    images={result.images}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
};

export default WebSearchResults



const ImageCarousel = ({ images, onClose }: { images: SearchImage[], onClose: () => void }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                <Carousel className="w-full h-full">
                    <CarouselContent>
                        {images.map((image, index) => (
                            <CarouselItem key={index} className="flex flex-col items-center justify-center p-4">
                                <img
                                    src={image.url}
                                    alt={image.description}
                                    className="max-w-full max-h-[70vh] object-contain mb-4"
                                />
                                <p className="text-center text-sm">{image.description}</p>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </Carousel>
            </DialogContent>
        </Dialog>
    );
};