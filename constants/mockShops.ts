import type { Shop } from '../types/shop';

export const MOCK_SHOPS: Shop[] = [
  {
    id: 'speed-auto-care',
    name: 'Speed Auto Care',
    category: 'car-repair',
    serviceLabel: 'Car Repair & Maintenance',
    rating: 4.8,
    reviews: 120,
    distanceKm: 1.2,
    location: 'Garki, Abuja',
    isOpen: true,
    imageUrl:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
    logoUrl: '',
  },

  {
    id: 'tech-solutions',
    name: 'Tech Solutions',
    category: 'phone-repair',
    serviceLabel: 'Phone Repair & Accessories',
    rating: 4.6,
    reviews: 98,
    distanceKm: 2.4,
    location: 'Wuse 2, Abuja',
    isOpen: true,
    imageUrl:
      'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?auto=format&fit=crop&w=800&q=80',
    logoUrl: '',
  },

  {
    id: 'zahra-tailoring',
    name: 'Zahra Tailoring',
    category: 'tailoring',
    serviceLabel: 'Tailoring & Fashion',
    rating: 4.9,
    reviews: 76,
    distanceKm: 3.1,
    location: 'Utako, Abuja',
    isOpen: true,
    imageUrl:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
    logoUrl: '',
  },

  {
    id: 'bright-plumbing',
    name: 'Bright Plumbing',
    category: 'plumbing',
    serviceLabel: 'Plumbing & Sanitary',
    rating: 4.7,
    reviews: 64,
    distanceKm: 2.8,
    location: 'Jabi, Abuja',
    isOpen: true,
    imageUrl:
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    logoUrl: '',
  },

  {
    id: 'home-fix-electronics',
    name: 'Home Fix Electronics',
    category: 'electronics-repair',
    serviceLabel: 'Electronics & Appliances',
    rating: 4.5,
    reviews: 52,
    distanceKm: 3.6,
    location: 'Kubwa, Abuja',
    isOpen: false,
    imageUrl:
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    logoUrl: '',
  },
];