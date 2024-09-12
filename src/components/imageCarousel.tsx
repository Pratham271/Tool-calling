import { Dialog, DialogContent } from "./ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { X } from "lucide-react";

interface SearchImage {
    url: string;
    description: string;
}

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


export default ImageCarousel