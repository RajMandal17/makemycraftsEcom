import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    artwork: {
        id: string;
        title: string;
        description: string;
        price: number;
        images: string[];
        artist: {
            firstName: string;
            lastName: string;
            profileImage?: string;
        };
        medium: string;
        dimensions: {
            width: number;
            height: number;
            depth?: number;
        };
        tags: string[];
        averageRating: number;
        totalReviews: number;
    };
    onAddToCart: () => void;
    onAddToWishlist: () => void;
    isInWishlist: boolean;
    isInCart: boolean;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
    isOpen,
    onClose,
    artwork,
    onAddToCart,
    onAddToWishlist,
    isInWishlist,
    isInCart,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % artwork.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + artwork.images.length) % artwork.images.length);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors"
                                >
                                    <X className="h-5 w-5 text-neutral-600" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                    {}
                                    <div className="relative">
                                        <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                                            <img
                                                src={artwork.images[currentImageIndex]}
                                                alt={artwork.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {}
                                        {artwork.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors"
                                                >
                                                    <ChevronLeft className="h-5 w-5 text-neutral-600" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors"
                                                >
                                                    <ChevronRight className="h-5 w-5 text-neutral-600" />
                                                </button>

                                                {}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {artwork.images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                            className={`h-2 rounded-full transition-all ${index === currentImageIndex
                                                                    ? 'w-8 bg-white'
                                                                    : 'w-2 bg-white/50'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {}
                                    <div className="flex flex-col">
                                        <Dialog.Title className="text-2xl font-display font-bold text-neutral-900 mb-2">
                                            {artwork.title}
                                        </Dialog.Title>

                                        {}
                                        <div className="flex items-center gap-2 mb-4">
                                            {artwork.artist.profileImage ? (
                                                <img
                                                    src={artwork.artist.profileImage}
                                                    alt={`${artwork.artist.firstName} ${artwork.artist.lastName}`}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary-700">
                                                        {artwork.artist.firstName[0]}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-sm text-neutral-600">
                                                by {artwork.artist.firstName} {artwork.artist.lastName}
                                            </span>
                                        </div>

                                        {}
                                        <div className="text-3xl font-bold text-primary-600 mb-4">
                                            ₹{artwork.price.toLocaleString()}
                                        </div>

                                        {}
                                        {artwork.averageRating > 0 && (
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg
                                                            key={star}
                                                            className={`h-5 w-5 ${star <= artwork.averageRating
                                                                    ? 'text-yellow-400 fill-current'
                                                                    : 'text-neutral-300'
                                                                }`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-neutral-600">
                                                    ({artwork.totalReviews} reviews)
                                                </span>
                                            </div>
                                        )}

                                        {}
                                        <p className="text-neutral-700 mb-4 flex-1">
                                            {artwork.description}
                                        </p>

                                        {}
                                        <div className="space-y-2 mb-6 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Medium:</span>
                                                <span className="font-medium text-neutral-900">{artwork.medium}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Dimensions:</span>
                                                <span className="font-medium text-neutral-900">
                                                    {artwork.dimensions.width} × {artwork.dimensions.height}
                                                    {artwork.dimensions.depth && ` × ${artwork.dimensions.depth}`} cm
                                                </span>
                                            </div>
                                        </div>

                                        {}
                                        {artwork.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {artwork.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={onAddToCart}
                                                disabled={isInCart}
                                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${isInCart
                                                        ? 'bg-green-500 text-white cursor-default'
                                                        : 'bg-primary-600 text-white hover:bg-primary-700'
                                                    }`}
                                            >
                                                {isInCart ? 'In Cart' : 'Add to Cart'}
                                            </button>
                                            <button
                                                onClick={onAddToWishlist}
                                                className={`px-4 py-3 rounded-lg border-2 transition-colors ${isInWishlist
                                                        ? 'border-red-500 bg-red-50 text-red-600'
                                                        : 'border-neutral-300 hover:border-primary-500 hover:bg-primary-50'
                                                    }`}
                                            >
                                                <svg
                                                    className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default QuickViewModal;
