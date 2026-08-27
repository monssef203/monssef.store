export type Category = "Classique" | "Sport" | "Luxe" | "Minimaliste" | "Femme";

export type Movement = "Automatique" | "Quartz" | "Mécanique";

export type MaterialType = "Acier inoxydable" | "Cuir" | "Céramique" | "Maille milanaise" | "Plaqué or";

export interface ProductVariant {
  id: string;
  color: string;
  colorHex: string;
  image: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  collection: string;
  price: number;
  oldPrice?: number;
  images: string[];
  description: string;
  movement: Movement;
  material: MaterialType;
  color: string;
  waterResistance: string;
  diameter: string;
  strap: string;
  warranty: string;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  customer: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    email?: string;
    notes?: string;
  };
  items: { product: Product; quantity: number }[];
  subtotal: number;
  shipping: number;
  total: number;
}
