import type { WorkerShopRequest } from '../types/workerShopRequest';

export const MOCK_SHOP_REQUESTS: WorkerShopRequest[] = [
  {
    id: 'request-001',

    customerId: 'customer-001',
    customerName: 'Ahmed Musa',

    serviceId: 'oil-change',
    serviceName: 'Oil Change',
    servicePriceLabel: 'From ₦8,000',

    requestedDate: '16 Sep 2026',
    requestedTime: '10:00 AM',

    description:
      'I need an oil change and general engine oil inspection.',

    photoUris: [],

    status: 'pending',

    createdAtLabel: '10 min ago',
  },

  {
    id: 'request-002',

    customerId: 'customer-002',
    customerName: 'Mary John',

    serviceId: 'car-diagnosis',
    serviceName: 'Car Diagnosis',
    servicePriceLabel: 'From ₦5,000',

    requestedDate: '17 Sep 2026',
    requestedTime: '2:30 PM',

    description:
      'The check engine light is showing. I need a full diagnosis.',

    photoUris: [],

    status: 'pending',

    createdAtLabel: '1 hour ago',
  },

  {
    id: 'request-003',

    customerId: 'customer-003',
    customerName: 'David Okoro',

    serviceId: 'brake-repair',
    serviceName: 'Brake Repair',
    servicePriceLabel: 'From ₦12,000',

    requestedDate: '18 Sep 2026',
    requestedTime: '9:00 AM',

    description:
      'There is a noise when I press the brake pedal.',

    photoUris: [],

    status: 'accepted',

    createdAtLabel: 'Yesterday',
  },
];