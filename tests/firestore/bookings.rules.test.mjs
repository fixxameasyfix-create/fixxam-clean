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
} from 'firebase/firestore';

const PROJECT_ID = 'fixxam-clean';

const CUSTOMER_ID = 'test-customer-001';
const WORKER_ID = 'test-worker-001';

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

const customerDb =
  testEnv
    .authenticatedContext(
      CUSTOMER_ID,
    )
    .firestore();

/* ============================================================
   TEST SERVICE IDS
============================================================ */

const SERVICE_IDS = {
  worker:
    'service-worker-visits-customer',

  customer:
    'service-customer-visits-worker',

  flexible:
    'service-flexible',

  remote:
    'service-remote',

  review:
    'service-needs-review',

  invalid:
    'service-invalid-mode',

  missing:
    'service-does-not-exist',
};

/* ============================================================
   DATABASE HELPERS
============================================================ */

async function resetDatabase() {
  await testEnv.clearFirestore();
}

async function seedService(
  serviceId,
  fulfillmentMode,
) {
  await testEnv.withSecurityRulesDisabled(
    async context => {
      const adminDb =
        context.firestore();

      await setDoc(
        doc(
          adminDb,
          'services',
          serviceId,
        ),
        {
          name:
            `Test Service ${serviceId}`,

          fulfillmentMode,
        },
      );
    },
  );
}

async function seedFulfillmentServices() {
  await seedService(
    SERVICE_IDS.worker,
    'worker_visits_customer',
  );

  await seedService(
    SERVICE_IDS.customer,
    'customer_visits_worker',
  );

  await seedService(
    SERVICE_IDS.flexible,
    'flexible',
  );

  await seedService(
    SERVICE_IDS.remote,
    'remote',
  );

  await seedService(
    SERVICE_IDS.review,
    'needs_review',
  );

  await seedService(
    SERVICE_IDS.invalid,
    'invalid_mode',
  );
}

/* ============================================================
   BOOKING PAYLOAD
============================================================ */

function createBookingPayload({
  serviceId,
  fulfillmentMode,
}) {
  const physical =
    fulfillmentMode !== 'remote';

  const address =
    physical
      ? 'Test Address, Abuja'
      : '';

  const latitude =
    physical
      ? 9.0765
      : null;

  const longitude =
    physical
      ? 7.3986
      : null;

  return {
    customerId:
      CUSTOMER_ID,

    workerId:
      WORKER_ID,

    serviceId,

    fulfillmentMode,

    address,

    latitude,

    longitude,

    location: {
      address,
      latitude,
      longitude,
    },

    status:
      'pending',

    amount:
      null,

    agreedPrice:
      null,

    offerAmount:
      null,

    offerMessage:
      null,

    offerRound:
      0,

    offerStatus:
      'none',

    offerExpiresAt:
      null,

    offerSentAt:
      null,

    offerRespondedAt:
      null,

    offerWorkerId:
      null,

    counterOfferAmount:
      null,

    counterOfferMessage:
      null,

    counterOfferBy:
      null,

    counterOfferStatus:
      'none',

    counterOfferSentAt:
      null,

    counterOfferRespondedAt:
      null,

    negotiationStatus:
      'none',

    paymentStatus:
      'pending',

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };
}

/* ============================================================
   BOOKING WRITE HELPER
============================================================ */

function createBooking(
  bookingId,
  payload,
  db = customerDb,
) {
  return setDoc(
    doc(
      db,
      'bookings',
      bookingId,
    ),
    payload,
  );
}

/* ============================================================
   TEST 1
   WORKER VISITS CUSTOMER -> SAME MODE ALLOWED
============================================================ */

async function testWorkerModeAllowed() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertSucceeds(
    createBooking(
      'booking-test-001',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.worker,

        fulfillmentMode:
          'worker_visits_customer',
      }),
    ),
  );

  console.log(
    '✅ TEST 1 PASSED: worker service accepts worker_visits_customer',
  );
}

/* ============================================================
   TEST 2
   WORKER SERVICE -> CUSTOMER MODE REJECTED
============================================================ */

async function testWorkerServiceRejectsCustomerMode() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-002',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.worker,

        fulfillmentMode:
          'customer_visits_worker',
      }),
    ),
  );

  console.log(
    '✅ TEST 2 PASSED: worker service rejects customer_visits_worker',
  );
}

/* ============================================================
   TEST 3
   WORKER SERVICE -> REMOTE REJECTED
============================================================ */

async function testWorkerServiceRejectsRemote() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-003',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.worker,

        fulfillmentMode:
          'remote',
      }),
    ),
  );

  console.log(
    '✅ TEST 3 PASSED: worker service rejects remote',
  );
}

/* ============================================================
   TEST 4
   CUSTOMER VISITS WORKER -> SAME MODE ALLOWED
============================================================ */

async function testCustomerModeAllowed() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertSucceeds(
    createBooking(
      'booking-test-004',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.customer,

        fulfillmentMode:
          'customer_visits_worker',
      }),
    ),
  );

  console.log(
    '✅ TEST 4 PASSED: customer service accepts customer_visits_worker',
  );
}

/* ============================================================
   TEST 5
   CUSTOMER SERVICE -> WORKER MODE REJECTED
============================================================ */

async function testCustomerServiceRejectsWorkerMode() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-005',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.customer,

        fulfillmentMode:
          'worker_visits_customer',
      }),
    ),
  );

  console.log(
    '✅ TEST 5 PASSED: customer service rejects worker_visits_customer',
  );
}

/* ============================================================
   TEST 6
   CUSTOMER SERVICE -> REMOTE REJECTED
============================================================ */

async function testCustomerServiceRejectsRemote() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-006',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.customer,

        fulfillmentMode:
          'remote',
      }),
    ),
  );

  console.log(
    '✅ TEST 6 PASSED: customer service rejects remote',
  );
}

/* ============================================================
   TEST 7
   REMOTE SERVICE -> REMOTE ALLOWED
============================================================ */

async function testRemoteModeAllowed() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertSucceeds(
    createBooking(
      'booking-test-007',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.remote,

        fulfillmentMode:
          'remote',
      }),
    ),
  );

  console.log(
    '✅ TEST 7 PASSED: remote service accepts remote booking',
  );
}

/* ============================================================
   TEST 8
   REMOTE SERVICE -> PHYSICAL REJECTED
============================================================ */

async function testRemoteRejectsPhysical() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-008',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.remote,

        fulfillmentMode:
          'worker_visits_customer',
      }),
    ),
  );

  console.log(
    '✅ TEST 8 PASSED: remote service rejects physical booking',
  );
}

/* ============================================================
   TEST 9
   FLEXIBLE -> WORKER VISITS CUSTOMER ALLOWED
============================================================ */

async function testFlexibleAllowsWorkerMode() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertSucceeds(
    createBooking(
      'booking-test-009',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.flexible,

        fulfillmentMode:
          'worker_visits_customer',
      }),
    ),
  );

  console.log(
    '✅ TEST 9 PASSED: flexible service accepts worker_visits_customer',
  );
}

/* ============================================================
   TEST 10
   FLEXIBLE -> CUSTOMER VISITS WORKER ALLOWED
============================================================ */

async function testFlexibleAllowsCustomerMode() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertSucceeds(
    createBooking(
      'booking-test-010',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.flexible,

        fulfillmentMode:
          'customer_visits_worker',
      }),
    ),
  );

  console.log(
    '✅ TEST 10 PASSED: flexible service accepts customer_visits_worker',
  );
}

/* ============================================================
   TEST 11
   FLEXIBLE -> REMOTE REJECTED
============================================================ */

async function testFlexibleRejectsRemote() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-011',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.flexible,

        fulfillmentMode:
          'remote',
      }),
    ),
  );

  console.log(
    '✅ TEST 11 PASSED: flexible service rejects remote',
  );
}

/* ============================================================
   TEST 12
   NEEDS REVIEW -> BOOKING REJECTED
============================================================ */

async function testNeedsReviewRejected() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-012',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.review,

        fulfillmentMode:
          'worker_visits_customer',
      }),
    ),
  );

  console.log(
    '✅ TEST 12 PASSED: needs_review service cannot be booked',
  );
}

/* ============================================================
   TEST 13
   INVALID SERVICE MODE -> REJECTED
============================================================ */

async function testInvalidServiceModeRejected() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-013',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.invalid,

        fulfillmentMode:
          'worker_visits_customer',
      }),
    ),
  );

  console.log(
    '✅ TEST 13 PASSED: invalid service fulfillment mode rejected',
  );
}

/* ============================================================
   TEST 14
   MISSING SERVICE -> REJECTED
============================================================ */

async function testMissingServiceRejected() {
  await resetDatabase();

  await seedFulfillmentServices();

  await assertFails(
    createBooking(
      'booking-test-014',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.missing,

        fulfillmentMode:
          'worker_visits_customer',
      }),
    ),
  );

  console.log(
    '✅ TEST 14 PASSED: missing service rejected',
  );
}

/* ============================================================
   TEST 15
   REMOTE BOOKING CANNOT CONTAIN PHYSICAL LOCATION
============================================================ */

async function testRemoteWithPhysicalLocationRejected() {
  await resetDatabase();

  await seedFulfillmentServices();

  const payload =
    createBookingPayload({
      serviceId:
        SERVICE_IDS.remote,

      fulfillmentMode:
        'remote',
    });

  payload.address =
    'Physical Address';

  payload.latitude =
    9.0765;

  payload.longitude =
    7.3986;

  payload.location = {
    address:
      'Physical Address',

    latitude:
      9.0765,

    longitude:
      7.3986,
  };

  await assertFails(
    createBooking(
      'booking-test-015',
      payload,
    ),
  );

  console.log(
    '✅ TEST 15 PASSED: remote booking rejects physical location',
  );
}

/* ============================================================
   TEST 16
   PHYSICAL BOOKING REQUIRES LOCATION
============================================================ */

async function testPhysicalWithoutLocationRejected() {
  await resetDatabase();

  await seedFulfillmentServices();

  const payload =
    createBookingPayload({
      serviceId:
        SERVICE_IDS.worker,

      fulfillmentMode:
        'worker_visits_customer',
    });

  payload.address = '';
  payload.latitude = null;
  payload.longitude = null;

  payload.location = {
    address: '',
    latitude: null,
    longitude: null,
  };

  await assertFails(
    createBooking(
      'booking-test-016',
      payload,
    ),
  );

  console.log(
    '✅ TEST 16 PASSED: physical booking requires location',
  );
}

/* ============================================================
   TEST 17
   NESTED LOCATION MUST MATCH ROOT LOCATION
============================================================ */

async function testMismatchedLocationRejected() {
  await resetDatabase();

  await seedFulfillmentServices();

  const payload =
    createBookingPayload({
      serviceId:
        SERVICE_IDS.worker,

      fulfillmentMode:
        'worker_visits_customer',
    });

  payload.location = {
    address:
      payload.address,

    latitude:
      10.0,

    longitude:
      payload.longitude,
  };

  await assertFails(
    createBooking(
      'booking-test-017',
      payload,
    ),
  );

  console.log(
    '✅ TEST 17 PASSED: mismatched nested location rejected',
  );
}

/* ============================================================
   TEST 18
   UNAUTHENTICATED BOOKING REJECTED
============================================================ */

async function testUnauthenticatedRejected() {
  await resetDatabase();

  await seedFulfillmentServices();

  const unauthenticatedDb =
    testEnv
      .unauthenticatedContext()
      .firestore();

  await assertFails(
    createBooking(
      'booking-test-018',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.worker,

        fulfillmentMode:
          'worker_visits_customer',
      }),

      unauthenticatedDb,
    ),
  );

  console.log(
    '✅ TEST 18 PASSED: unauthenticated booking rejected',
  );
}

/* ============================================================
   TEST 19
   CUSTOMER ID MUST MATCH AUTH USER
============================================================ */

async function testWrongCustomerRejected() {
  await resetDatabase();

  await seedFulfillmentServices();

  const attackerDb =
    testEnv
      .authenticatedContext(
        'different-customer',
      )
      .firestore();

  await assertFails(
    createBooking(
      'booking-test-019',

      createBookingPayload({
        serviceId:
          SERVICE_IDS.worker,

        fulfillmentMode:
          'worker_visits_customer',
      }),

      attackerDb,
    ),
  );

  console.log(
    '✅ TEST 19 PASSED: customerId must match authenticated user',
  );
}

/* ============================================================
   TEST 20
   CUSTOMER CANNOT BOOK THEMSELVES AS WORKER
============================================================ */

async function testCustomerCannotBeWorker() {
  await resetDatabase();

  await seedFulfillmentServices();

  const payload =
    createBookingPayload({
      serviceId:
        SERVICE_IDS.worker,

      fulfillmentMode:
        'worker_visits_customer',
    });

  payload.workerId =
    CUSTOMER_ID;

  await assertFails(
    createBooking(
      'booking-test-020',
      payload,
    ),
  );

  console.log(
    '✅ TEST 20 PASSED: customer cannot book themselves as worker',
  );
}

/* ============================================================
   RUN TESTS
============================================================ */

try {
  console.log(
    '\nStarting FIXXAM booking rules tests...\n',
  );

  await testWorkerModeAllowed();

  await testWorkerServiceRejectsCustomerMode();

  await testWorkerServiceRejectsRemote();

  await testCustomerModeAllowed();

  await testCustomerServiceRejectsWorkerMode();

  await testCustomerServiceRejectsRemote();

  await testRemoteModeAllowed();

  await testRemoteRejectsPhysical();

  await testFlexibleAllowsWorkerMode();

  await testFlexibleAllowsCustomerMode();

  await testFlexibleRejectsRemote();

  await testNeedsReviewRejected();

  await testInvalidServiceModeRejected();

  await testMissingServiceRejected();

  await testRemoteWithPhysicalLocationRejected();

  await testPhysicalWithoutLocationRejected();

  await testMismatchedLocationRejected();

  await testUnauthenticatedRejected();

  await testWrongCustomerRejected();

  await testCustomerCannotBeWorker();

  console.log(
    '\n🎉 ALL BOOKING RULES TESTS PASSED\n',
  );
} catch (error) {
  console.error(
    '\n❌ FIXXAM BOOKING RULES TEST FAILED\n',
  );

  console.error(
    error,
  );

  process.exitCode = 1;
} finally {
  await testEnv.cleanup();
}