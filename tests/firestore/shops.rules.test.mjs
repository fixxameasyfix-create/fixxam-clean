import fs from 'node:fs/promises';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

import {
  doc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

const PROJECT_ID = 'fixxam-clean';

const WORKER_ID = 'test-worker-001';
const SERVICE_ID = 'service-test-001';

const rules = await fs.readFile(
  'firestore.rules',
  'utf8',
);

const testEnv =
  await initializeTestEnvironment({
    projectId: PROJECT_ID,

    firestore: {
      rules,

      host: '127.0.0.1',
      port: 8080,
    },
  });

const workerDb =
  testEnv
    .authenticatedContext(
      WORKER_ID,
    )
    .firestore();

const shopPayload = {
  ownerId: WORKER_ID,

  name: 'Fixxam Test Shop',

  category: 'car-repair',

  description:
    'Professional vehicle repair services.',

  phone:
    '08012345678',

  address:
    'Test Address, Abuja',

  latitude:
    9.0765,

  longitude:
    7.3986,

  coverPhotoUrl:
    'https://example.com/cover.jpg',

  logoUrl:
    'https://example.com/logo.jpg',

  businessHours: [
    {
      id: 'monday',
      day: 'Monday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },

    {
      id: 'tuesday',
      day: 'Tuesday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },

    {
      id: 'wednesday',
      day: 'Wednesday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },

    {
      id: 'thursday',
      day: 'Thursday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },

    {
      id: 'friday',
      day: 'Friday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },

    {
      id: 'saturday',
      day: 'Saturday',
      isOpen: true,
      openTime: '09:00',
      closeTime: '17:00',
    },

    {
      id: 'sunday',
      day: 'Sunday',
      isOpen: false,
      openTime: '09:00',
      closeTime: '16:00',
    },
  ],

  isActive: true,

  rating: 0,

  reviewCount: 0,

  serviceCount: 1,

  minimumStartingPrice:
    2809,

  createdAt:
    serverTimestamp(),

  updatedAt:
    serverTimestamp(),
};

const servicePayload = {
  id: SERVICE_ID,

  name:
    'Engine Repair',

  description:
    'Professional engine repair.',

  startingPrice:
    2809,

  imageUrl:
    'https://example.com/service.jpg',

  isActive:
    true,

  updatedAt:
    serverTimestamp(),
};

async function resetDatabase() {
  await testEnv.clearFirestore();
}

async function testShopCreate() {
  await resetDatabase();

  const shopRef =
    doc(
      workerDb,
      'shops',
      WORKER_ID,
    );

  await assertSucceeds(
    setDoc(
      shopRef,
      shopPayload,
    ),
  );

  console.log(
    '✅ TEST 1 PASSED: shop CREATE allowed',
  );
}

async function testServiceCreateAfterShop() {
  await resetDatabase();

  const shopRef =
    doc(
      workerDb,
      'shops',
      WORKER_ID,
    );

  await assertSucceeds(
    setDoc(
      shopRef,
      shopPayload,
    ),
  );

  const serviceRef =
    doc(
      workerDb,
      'shops',
      WORKER_ID,
      'services',
      SERVICE_ID,
    );

  await assertSucceeds(
    setDoc(
      serviceRef,
      servicePayload,
    ),
  );

  console.log(
    '✅ TEST 2 PASSED: service CREATE allowed',
  );
}

async function testShopAndServiceBatch() {
  await resetDatabase();

  const shopRef =
    doc(
      workerDb,
      'shops',
      WORKER_ID,
    );

  const serviceRef =
    doc(
      workerDb,
      'shops',
      WORKER_ID,
      'services',
      SERVICE_ID,
    );

  const batch =
    writeBatch(
      workerDb,
    );

  batch.set(
    shopRef,
    shopPayload,
  );

  batch.set(
    serviceRef,
    servicePayload,
  );

  await assertSucceeds(
    batch.commit(),
  );

  console.log(
    '✅ TEST 3 PASSED: shop + service BATCH allowed',
  );
}

async function testWrongOwnerRejected() {
  await resetDatabase();

  const attackerDb =
    testEnv
      .authenticatedContext(
        'different-user',
      )
      .firestore();

  await assertFails(
    setDoc(
      doc(
        attackerDb,
        'shops',
        WORKER_ID,
      ),
      shopPayload,
    ),
  );

  console.log(
    '✅ TEST 4 PASSED: wrong owner rejected',
  );
}

try {
  console.log(
    '\nStarting FIXXAM shop rules tests...\n',
  );

  await testShopCreate();

  await testServiceCreateAfterShop();

  await testShopAndServiceBatch();

  await testWrongOwnerRejected();

  console.log(
    '\n🎉 ALL SHOP RULES TESTS PASSED\n',
  );
} catch (error) {
  console.error(
    '\n❌ FIXXAM SHOP RULES TEST FAILED\n',
  );

  console.error(
    error,
  );

  process.exitCode = 1;
} finally {
  await testEnv.cleanup();
}