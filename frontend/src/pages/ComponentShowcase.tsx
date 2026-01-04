import React, { useState } from 'react';
import { ShoppingCart, Heart, Search, Star, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Card, { CardImage, CardContent } from '../components/ui/Card';
import Modal, { ConfirmModal } from '../components/ui/Modal';
import Carousel, { HeroSlide } from '../components/ui/Carousel';
import MasonryGrid, { MasonryItem } from '../components/ui/MasonryGrid';


const ComponentShowcase: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleLoadingDemo = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-display font-bold text-neutral-900 mb-4">
                        MakeMyCrafts Design System
                    </h1>
                    <p className="text-xl text-neutral-600">
                        Production-grade UI components for an Etsy-level experience
                    </p>
                </div>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Color Palette
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <div className="h-24 bg-primary-500 rounded-lg shadow-md mb-2"></div>
                            <p className="text-sm font-medium">Primary</p>
                            <p className="text-xs text-neutral-500">#10B981</p>
                        </div>
                        <div>
                            <div className="h-24 bg-secondary-500 rounded-lg shadow-md mb-2"></div>
                            <p className="text-sm font-medium">Secondary</p>
                            <p className="text-xs text-neutral-500">#6366F1</p>
                        </div>
                        <div>
                            <div className="h-24 bg-accent-warm rounded-lg shadow-md mb-2"></div>
                            <p className="text-sm font-medium">Accent Warm</p>
                            <p className="text-xs text-neutral-500">#F59E0B</p>
                        </div>
                        <div>
                            <div className="h-24 bg-accent-cool rounded-lg shadow-md mb-2"></div>
                            <p className="text-sm font-medium">Accent Cool</p>
                            <p className="text-xs text-neutral-500">#06B6D4</p>
                        </div>
                        <div>
                            <div className="h-24 bg-accent-rose rounded-lg shadow-md mb-2"></div>
                            <p className="text-sm font-medium">Accent Rose</p>
                            <p className="text-xs text-neutral-500">#F43F5E</p>
                        </div>
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Typography
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-8 space-y-4">
                        <h1 className="font-display">Display Font - Playfair Display</h1>
                        <p className="font-sans">Body Font - Inter</p>
                        <p className="font-mono">Monospace Font - JetBrains Mono</p>
                        <div className="space-y-2 pt-4 border-t">
                            <p className="text-5xl font-display">Heading 1</p>
                            <p className="text-4xl font-display">Heading 2</p>
                            <p className="text-3xl font-display">Heading 3</p>
                            <p className="text-2xl font-display">Heading 4</p>
                            <p className="text-xl">Large Text</p>
                            <p className="text-base">Base Text</p>
                            <p className="text-sm">Small Text</p>
                            <p className="text-xs">Extra Small Text</p>
                        </div>
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Buttons
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        {}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Variants</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button variant="primary">Primary</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="danger">Danger</Button>
                            </div>
                        </div>

                        {}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Sizes</h3>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button size="xs">Extra Small</Button>
                                <Button size="sm">Small</Button>
                                <Button size="md">Medium</Button>
                                <Button size="lg">Large</Button>
                                <Button size="xl">Extra Large</Button>
                            </div>
                        </div>

                        {}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">With Icons</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button leftIcon={<ShoppingCart />}>Add to Cart</Button>
                                <Button variant="secondary" leftIcon={<Heart />}>Add to Wishlist</Button>
                                <Button variant="outline" rightIcon={<Search />}>Search</Button>
                                <Button variant="primary" loading={loading} onClick={handleLoadingDemo}>
                                    {loading ? 'Processing...' : 'Click to Load'}
                                </Button>
                            </div>
                        </div>

                        {}
                        <div>
                            <h3 className="text-xl font-semibold mb-4">States</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button>Normal</Button>
                                <Button disabled>Disabled</Button>
                                <Button loading>Loading</Button>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Badges
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="new">New</Badge>
                            <Badge variant="sale">Sale</Badge>
                            <Badge variant="topSeller">Top Seller</Badge>
                            <Badge variant="soldOut">Sold Out</Badge>
                            <Badge variant="featured">Featured</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="warning">Warning</Badge>
                            <Badge variant="error">Error</Badge>
                            <Badge variant="info">Info</Badge>
                            <Badge variant="neutral">Neutral</Badge>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-4">Sizes</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge size="sm">Small</Badge>
                                <Badge size="md">Medium</Badge>
                                <Badge size="lg">Large</Badge>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Inputs
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                variant="text"
                                label="Full Name"
                                placeholder="Enter your name"
                                helperText="This is helper text"
                            />
                            <Input
                                variant="email"
                                label="Email Address"
                                placeholder="you@example.com"
                            />
                            <Input
                                variant="search"
                                placeholder="Search artworks..."
                                fullWidth
                            />
                            <Input
                                variant="text"
                                label="With Error"
                                placeholder="Enter something"
                                error="This field is required"
                            />
                        </div>
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Cards
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {}
                        <Card variant="product" hover>
                            <CardImage
                                src="https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg"
                                alt="Artwork"
                                aspectRatio="portrait"
                            />
                            <CardContent>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg">Abstract Sunset</h3>
                                    <Badge variant="new" size="sm">New</Badge>
                                </div>
                                <p className="text-sm text-neutral-600 mb-2">by Artist Name</p>
                                <div className="flex items-center mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="text-sm text-neutral-600 ml-2">(127)</span>
                                </div>
                                <p className="text-2xl font-bold text-primary-600 mb-4">₹2,499</p>
                                <Button fullWidth leftIcon={<ShoppingCart />}>
                                    Add to Cart
                                </Button>
                            </CardContent>
                        </Card>

                        {}
                        <Card variant="artist" hover>
                            <CardContent>
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mr-4"></div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Artist Name</h3>
                                        <p className="text-sm text-neutral-600">Digital Artist</p>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-700 mb-4">
                                    Creating beautiful digital art that speaks to the soul...
                                </p>
                                <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
                                    <span>42 Artworks</span>
                                    <span>★ 4.8</span>
                                </div>
                                <Button variant="outline" fullWidth>
                                    View Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {}
                        <Card variant="collection" hover>
                            <CardImage
                                src="https://images.pexels.com/photos/8953363/pexels-photo-8953363.jpeg"
                                alt="Collection"
                                aspectRatio="landscape"
                            />
                            <CardContent>
                                <Badge variant="featured" size="sm" className="mb-2">Featured</Badge>
                                <h3 className="font-semibold text-xl mb-2">Holiday Collection</h3>
                                <p className="text-sm text-neutral-600 mb-4">
                                    Curated artworks perfect for the holiday season
                                </p>
                                <Button variant="secondary" fullWidth rightIcon={<Sparkles />}>
                                    Explore Collection
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Animations
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-6 bg-primary-50 rounded-lg animate-fade-in">
                                <p className="text-center font-medium">Fade In</p>
                            </div>
                            <div className="p-6 bg-secondary-50 rounded-lg animate-slide-up">
                                <p className="text-center font-medium">Slide Up</p>
                            </div>
                            <div className="p-6 bg-accent-warm/20 rounded-lg animate-scale-in">
                                <p className="text-center font-medium">Scale In</p>
                            </div>
                            <div className="p-6 bg-accent-cool/20 rounded-lg animate-bounce-subtle">
                                <p className="text-center font-medium">Bounce Subtle</p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Modals
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="flex flex-wrap gap-4">
                            <Button onClick={() => setModalOpen(true)}>
                                Open Modal
                            </Button>
                            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                                Open Confirm Modal
                            </Button>
                        </div>

                        {}
                        <Modal
                            isOpen={modalOpen}
                            onClose={() => setModalOpen(false)}
                            title="Example Modal"
                            description="This is a demonstration of the modal component"
                            size="md"
                            footer={
                                <>
                                    <Button variant="ghost" onClick={() => setModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => setModalOpen(false)}>
                                        Confirm
                                    </Button>
                                </>
                            }
                        >
                            <p className="text-neutral-700">
                                This modal component uses Headless UI for accessibility and smooth transitions.
                                It supports multiple sizes, custom headers, footers, and backdrop blur effects.
                            </p>
                        </Modal>

                        {}
                        <ConfirmModal
                            isOpen={confirmOpen}
                            onClose={() => setConfirmOpen(false)}
                            onConfirm={() => {
                                setConfirmOpen(false);
                                alert('Confirmed!');
                            }}
                            title="Confirm Action"
                            message="Are you sure you want to proceed with this action?"
                            variant="danger"
                        />
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Carousel
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h3 className="text-xl font-semibold mb-4">Product Carousel</h3>
                        <Carousel
                            autoPlay
                            showNavigation
                            showIndicators
                            itemsPerView={3}
                            gap={16}
                            className="group"
                        >
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <div key={num} className="bg-neutral-100 rounded-lg p-8 h-48 flex items-center justify-center">
                                    <p className="text-2xl font-bold text-neutral-600">Slide {num}</p>
                                </div>
                            ))}
                        </Carousel>

                        <h3 className="text-xl font-semibold mb-4 mt-8">Hero Carousel</h3>
                        <Carousel
                            variant="hero"
                            autoPlay
                            showNavigation
                            showIndicators
                            autoPlayInterval={4000}
                            className="group"
                        >
                            <HeroSlide
                                image="https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg"
                                title="Discover Amazing Art"
                                description="Explore our curated collection of handcrafted artworks"
                                cta={{
                                    text: "Browse Collection",
                                    onClick: () => alert('Navigate to collection')
                                }}
                            />
                            <HeroSlide
                                image="https://images.pexels.com/photos/8953363/pexels-photo-8953363.jpeg"
                                title="Support Local Artists"
                                description="Connect with talented creators from around the world"
                                cta={{
                                    text: "Meet Artists",
                                    onClick: () => alert('Navigate to artists')
                                }}
                            />
                            <HeroSlide
                                image="https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg"
                                title="Unique Pieces"
                                description="Find one-of-a-kind artworks that speak to your soul"
                                cta={{
                                    text: "Start Shopping",
                                    onClick: () => alert('Navigate to shop')
                                }}
                            />
                        </Carousel>
                    </div>
                </section>

                {}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
                        Masonry Grid
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <p className="text-neutral-600 mb-6">
                            Pinterest-style masonry layout with lazy loading and responsive columns
                        </p>
                        <MasonryGrid
                            lazyLoad
                            breakpointCols={{
                                default: 4,
                                1280: 3,
                                1024: 2,
                                640: 1,
                            }}
                        >
                            {[
                                { height: 'h-48', color: 'bg-primary-100' },
                                { height: 'h-64', color: 'bg-secondary-100' },
                                { height: 'h-56', color: 'bg-accent-warm/20' },
                                { height: 'h-72', color: 'bg-accent-cool/20' },
                                { height: 'h-48', color: 'bg-accent-rose/20' },
                                { height: 'h-80', color: 'bg-primary-200' },
                                { height: 'h-56', color: 'bg-secondary-200' },
                                { height: 'h-64', color: 'bg-accent-warm/30' },
                            ].map((item, index) => (
                                <MasonryItem key={index}>
                                    <div className={`${item.height} ${item.color} flex items-center justify-center rounded-lg`}>
                                        <p className="text-lg font-semibold text-neutral-700">Item {index + 1}</p>
                                    </div>
                                </MasonryItem>
                            ))}
                        </MasonryGrid>
                    </div>
                </section>

                {}
                <div className="text-center text-neutral-600 mt-16">
                    <p>MakeMyCrafts Design System v1.0</p>
                    <p className="text-sm mt-2">Built with ❤️ using React, TypeScript, and Tailwind CSS</p>
                </div>
            </div>
        </div>
    );
};

export default ComponentShowcase;
