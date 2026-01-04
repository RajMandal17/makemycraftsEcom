export interface User {
  id: string;
  email: string;
  username?: string; 
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ARTIST' | 'ADMIN';
  profileImage?: string;
  profilePictureUrl?: string;
  createdAt: string;
  
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Artist extends User {
  bio?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  artworkCount?: number;
  averageRating?: number;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  artistId: string;
  artist: {
    id: string;
    username?: string; 
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  medium: string;
  isAvailable: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderationNotes?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  orderItemId: string;
  artworkId: string;
  customerId: string;
  orderId: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerProfileImage: string | null;
  artworkTitle: string;
  artworkImageUrl: string;
  helpfulCount: number;
}

export interface CartItem {
  id: string;
  artwork: Artwork;
  quantity: number;
  addedAt: string;
}

export interface WishlistItem {
  id: string;
  artwork: Artwork;
  addedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  artwork: Artwork;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  cart: CartItem[];
  wishlist: WishlistItem[];
  artworks: Artwork[];
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  redirectUrl: string;
  success: boolean;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ARTIST';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface HomeStats {
  totalArtworks: number;
  totalArtists: number;
  averageRating: number;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
}