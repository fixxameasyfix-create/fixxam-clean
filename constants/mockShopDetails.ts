import type {
  Shop,
  ShopProfileDetails,
} from '../types/shop';

const SHARED_PHOTOS = [
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
];

const SHOP_DETAILS: Record<
  string,
  ShopProfileDetails
> = {
  'speed-auto-care': {
    description:
      'Speed Auto Care is a trusted auto service center in Garki, Abuja. We provide professional car repair, maintenance and genuine parts with experienced technicians.',

    verified: true,

    openingStatusLabel:
      'Open Now (8:00 AM – 8:00 PM)',

    services: [
      {
        id: 'car-diagnosis',
        name: 'Car Diagnosis',
        description:
          'Complete computer diagnosis and vehicle inspection.',
        priceLabel: 'From ₦5,000',
        imageUrl:
          'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 'oil-change',
        name: 'Oil Change',
        description:
          'Engine oil change with quality oil and filter.',
        priceLabel: 'From ₦8,000',
        imageUrl:
          'https://images.unsplash.com/photo-1635784063416-30a1d6a88cc8?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 'brake-repair',
        name: 'Brake Repair',
        description:
          'Brake inspection, repair and replacement service.',
        priceLabel: 'From ₦12,000',
        imageUrl:
          'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 'general-maintenance',
        name: 'General Maintenance',
        description:
          'General vehicle inspection and routine maintenance.',
        priceLabel: 'Price after inspection',
        imageUrl:
          'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=700&q=80',
      },
    ],

    openingHours: [
      {
        id: 'monday-friday',
        day: 'Monday - Friday',
        hours: '8:00 AM – 8:00 PM',
      },
      {
        id: 'saturday',
        day: 'Saturday',
        hours: '8:00 AM – 6:00 PM',
      },
      {
        id: 'sunday',
        day: 'Sunday',
        hours: '10:00 AM – 4:00 PM',
      },
    ],

    photos: SHARED_PHOTOS,

    reviews: [
      {
        id: 'review-1',
        customerName: 'Ahmed S.',
        rating: 5,
        comment:
          'Great service! Professional and fast. Highly recommended.',
        createdLabel: '2 weeks ago',
      },
      {
        id: 'review-2',
        customerName: 'Michael O.',
        rating: 5,
        comment:
          'Good customer service and the repair was completed on time.',
        createdLabel: '1 month ago',
      },
    ],
  },
};

export function getMockShopDetails(
  shop: Shop,
): ShopProfileDetails {
  const existingDetails =
    SHOP_DETAILS[shop.id];

  if (existingDetails) {
    return existingDetails;
  }

  return {
    description: `${shop.name} provides trusted ${shop.serviceLabel.toLowerCase()} services in ${shop.location}. Customers can browse available services, opening hours, photos and ratings before booking.`,

    verified: true,

    openingStatusLabel: shop.isOpen
      ? 'Open Now'
      : 'Closed',

    services: [
      {
        id: `${shop.id}-service-1`,
        name: shop.serviceLabel,
        description: `Professional ${shop.serviceLabel.toLowerCase()} service.`,
        priceLabel: 'Price after inspection',
        imageUrl: shop.imageUrl,
      },
      {
        id: `${shop.id}-service-2`,
        name: 'Inspection',
        description:
          'Initial inspection before service or repair.',
        priceLabel: 'From ₦5,000',
        imageUrl: shop.imageUrl,
      },
    ],

    openingHours: [
      {
        id: 'monday-friday',
        day: 'Monday - Friday',
        hours: '8:00 AM – 6:00 PM',
      },
      {
        id: 'saturday',
        day: 'Saturday',
        hours: '9:00 AM – 5:00 PM',
      },
      {
        id: 'sunday',
        day: 'Sunday',
        hours: 'Closed',
      },
    ],

    photos: [
      shop.imageUrl,
      ...SHARED_PHOTOS.slice(0, 2),
    ],

    reviews: [
      {
        id: `${shop.id}-review-1`,
        customerName: 'Verified Customer',
        rating: Math.round(shop.rating),
        comment:
          'Good service and professional customer support.',
        createdLabel: 'Recently',
      },
    ],
  };
}