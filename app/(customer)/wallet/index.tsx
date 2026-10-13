import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  Stack,
} from "expo-router";

import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type WalletData = {
  availableBalance: number;

  pendingBalance: number;

  currency: string;
};

type PaymentMethodType =
  | "card"
  | "bank";

type PaymentMethod = {
  id: string;

  type: PaymentMethodType;

  brand?: string;

  last4?: string;

  bankName?: string;

  accountLast4?: string;

  isDefault: boolean;
};

type WalletTransactionType =
  | "credit"
  | "debit"
  | "refund"
  | "payment"
  | "withdrawal";

type WalletTransactionStatus =
  | "pending"
  | "completed"
  | "failed";

type WalletTransaction = {
  id: string;

  title: string;

  amount: number;

  type: WalletTransactionType;

  status: WalletTransactionStatus;

  currency: string;

  createdAt: Timestamp | null;
};

/* ============================================================
   HELPERS
============================================================ */

function safeNumber(
  value: unknown,
): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

function safeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function safeLast4(
  value: unknown,
): string {
  const clean =
    safeText(value).replace(
      /\D/g,
      "",
    );

  return clean.length >= 4
    ? clean.slice(-4)
    : "";
}

function formatMoney(
  amount: number,
  currency = "NGN",
): string {
  try {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(
      amount,
    );
  } catch {
    return `₦${amount.toLocaleString(
      "en-NG",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  }
}

function formatDate(
  timestamp: Timestamp | null,
): string {
  if (!timestamp) {
    return "";
  }

  try {
    return timestamp
      .toDate()
      .toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      );
  } catch {
    return "";
  }
}

function normalizeTransactionType(
  value: unknown,
): WalletTransactionType {
  switch (value) {
    case "credit":
    case "debit":
    case "refund":
    case "payment":
    case "withdrawal":
      return value;

    default:
      return "payment";
  }
}

function normalizeTransactionStatus(
  value: unknown,
): WalletTransactionStatus {
  switch (value) {
    case "pending":
    case "completed":
    case "failed":
      return value;

    default:
      return "pending";
  }
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerWalletScreen() {
  const [
    wallet,
    setWallet,
  ] =
    useState<WalletData>({
      availableBalance: 0,
      pendingBalance: 0,
      currency: "NGN",
    });

  const [
    paymentMethods,
    setPaymentMethods,
  ] =
    useState<
      PaymentMethod[]
    >([]);

  const [
    transactions,
    setTransactions,
  ] =
    useState<
      WalletTransaction[]
    >([]);

  const [
    walletLoading,
    setWalletLoading,
  ] =
    useState(true);

  const [
    methodsLoading,
    setMethodsLoading,
  ] =
    useState(true);

  const [
    transactionsLoading,
    setTransactionsLoading,
  ] =
    useState(true);

  const [
    walletError,
    setWalletError,
  ] =
    useState(false);

  const [
    methodsError,
    setMethodsError,
  ] =
    useState(false);

  const [
    transactionsError,
    setTransactionsError,
  ] =
    useState(false);

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);

  const userId =
    auth.currentUser?.uid ??
    "";

  /* ==========================================================
     WALLET
  ========================================================== */

  useEffect(() => {
    if (!userId) {
      setWalletLoading(
        false,
      );

      return;
    }

    setWalletLoading(
      true,
    );

    setWalletError(
      false,
    );

    const walletRef =
      doc(
        db,
        "wallets",
        userId,
      );

    const unsubscribe =
      onSnapshot(
        walletRef,

        (snapshot) => {
          setWalletError(
            false,
          );

          if (
            !snapshot.exists()
          ) {
            setWallet({
              availableBalance:
                0,

              pendingBalance:
                0,

              currency:
                "NGN",
            });

            setWalletLoading(
              false,
            );

            return;
          }

          const data =
            snapshot.data();

          setWallet({
            availableBalance:
              Math.max(
                0,
                safeNumber(
                  data.availableBalance,
                ),
              ),

            pendingBalance:
              Math.max(
                0,
                safeNumber(
                  data.pendingBalance,
                ),
              ),

            currency:
              safeText(
                data.currency,
              ) ||
              "NGN",
          });

          setWalletLoading(
            false,
          );
        },

        (error) => {
          console.error(
            "CUSTOMER_WALLET_LISTENER_ERROR:",
            error,
          );

          setWalletError(
            true,
          );

          setWalletLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    refreshKey,
    userId,
  ]);

  /* ==========================================================
     PAYMENT METHODS
  ========================================================== */

  useEffect(() => {
    if (!userId) {
      setMethodsLoading(
        false,
      );

      return;
    }

    setMethodsLoading(
      true,
    );

    setMethodsError(
      false,
    );

    const methodsRef =
      collection(
        db,
        "users",
        userId,
        "paymentMethods",
      );

    const unsubscribe =
      onSnapshot(
        methodsRef,

        (snapshot) => {
          const methods =
            snapshot.docs
              .map(
                (
                  snapshotDoc,
                ): PaymentMethod | null => {
                  const data =
                    snapshotDoc.data();

                  const type:
                    PaymentMethodType =
                    data.type ===
                    "bank"
                      ? "bank"
                      : "card";

                  const last4 =
                    safeLast4(
                      data.last4,
                    );

                  const accountLast4 =
                    safeLast4(
                      data.accountLast4,
                    );

                  if (
                    type ===
                      "card" &&
                    !last4
                  ) {
                    return null;
                  }

                  if (
                    type ===
                      "bank" &&
                    !accountLast4
                  ) {
                    return null;
                  }

                  return {
                    id:
                      snapshotDoc.id,

                    type,

                    brand:
                      safeText(
                        data.brand,
                      ) ||
                      undefined,

                    last4:
                      last4 ||
                      undefined,

                    bankName:
                      safeText(
                        data.bankName,
                      ) ||
                      undefined,

                    accountLast4:
                      accountLast4 ||
                      undefined,

                    isDefault:
                      data.isDefault ===
                      true,
                  };
                },
              )
              .filter(
                (
                  method,
                ): method is PaymentMethod =>
                  method !==
                  null,
              )
              .sort(
                (
                  a,
                  b,
                ) =>
                  Number(
                    b.isDefault,
                  ) -
                  Number(
                    a.isDefault,
                  ),
              );

          setPaymentMethods(
            methods,
          );

          setMethodsError(
            false,
          );

          setMethodsLoading(
            false,
          );
        },

        (error) => {
          console.error(
            "PAYMENT_METHODS_LISTENER_ERROR:",
            error,
          );

          setPaymentMethods(
            [],
          );

          setMethodsError(
            true,
          );

          setMethodsLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    refreshKey,
    userId,
  ]);

  /* ==========================================================
     TRANSACTIONS
  ========================================================== */

  useEffect(() => {
    if (!userId) {
      setTransactionsLoading(
        false,
      );

      return;
    }

    setTransactionsLoading(
      true,
    );

    setTransactionsError(
      false,
    );

    const transactionsRef =
      collection(
        db,
        "wallets",
        userId,
        "transactions",
      );

    const transactionsQuery =
      query(
        transactionsRef,
        orderBy(
          "createdAt",
          "desc",
        ),
        limit(
          8,
        ),
      );

    const unsubscribe =
      onSnapshot(
        transactionsQuery,

        (snapshot) => {
          const items =
            snapshot.docs.map(
              (
                snapshotDoc,
              ): WalletTransaction => {
                const data =
                  snapshotDoc.data();

                return {
                  id:
                    snapshotDoc.id,

                  title:
                    safeText(
                      data.title,
                    ) ||
                    "Wallet transaction",

                  amount:
                    safeNumber(
                      data.amount,
                    ),

                  type:
                    normalizeTransactionType(
                      data.type,
                    ),

                  status:
                    normalizeTransactionStatus(
                      data.status,
                    ),

                  currency:
                    safeText(
                      data.currency,
                    ) ||
                    "NGN",

                  createdAt:
                    data.createdAt instanceof
                    Timestamp
                      ? data.createdAt
                      : null,
                };
              },
            );

          setTransactions(
            items,
          );

          setTransactionsError(
            false,
          );

          setTransactionsLoading(
            false,
          );
        },

        (error) => {
          console.error(
            "WALLET_TRANSACTIONS_LISTENER_ERROR:",
            error,
          );

          setTransactions(
            [],
          );

          setTransactionsError(
            true,
          );

          setTransactionsLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    refreshKey,
    userId,
  ]);

  /* ==========================================================
     DERIVED
  ========================================================== */

  const availableBalance =
    useMemo(
      () =>
        formatMoney(
          wallet.availableBalance,
          wallet.currency,
        ),
      [
        wallet.availableBalance,
        wallet.currency,
      ],
    );

  const pendingBalance =
    useMemo(
      () =>
        formatMoney(
          wallet.pendingBalance,
          wallet.currency,
        ),
      [
        wallet.pendingBalance,
        wallet.currency,
      ],
    );

  const hasAnyError =
    walletError ||
    methodsError ||
    transactionsError;

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry =
    () => {
      setRefreshKey(
        (current) =>
          current + 1,
      );
    };

  /* ==========================================================
     AUTH REQUIRED
  ========================================================== */

  if (!userId) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown:
              false,
          }}
        />

        <AppScreen
          role="customer"
          padded={false}
        >
          <View
            style={
              styles.centerState
            }
          >
            <View
              style={
                styles.stateIcon
              }
            >
              <AppIcon
                name="lock"
                role="customer"
                size="md"
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              Sign in required
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.stateDescription
              }
            >
              Sign in to view your Fixxam wallet.
            </AppText>

            <Pressable
              onPress={() =>
                router.push(
                  "/(auth)/login" as never,
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              style={({
                pressed,
              }) => [
                styles.signInButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.signInText
                }
              >
                Sign in
              </AppText>
            </Pressable>
          </View>
        </AppScreen>
      </>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <AppScreen
        role="customer"
        padded={false}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={
              8
            }
            style={({
              pressed,
            }) => [
              styles.headerButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="sm"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.headerTitle
            }
          >
            My Wallet
          </AppText>

          <View
            style={
              styles.headerButton
            }
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          {/* ==================================================
              WALLET BALANCE
          ================================================== */}

          <View
            style={
              styles.balanceCard
            }
          >
            <View
              style={
                styles.balanceHeader
              }
            >
              <View
                style={
                  styles.balanceIcon
                }
              >
                <AppIcon
                  name="wallet"
                  size="sm"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <AppText
                variant="caption"
                weight="semibold"
                style={
                  styles.balanceLabel
                }
              >
                Available balance
              </AppText>
            </View>

            {walletLoading ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.textInverse
                }
                style={
                  styles.balanceLoader
                }
              />
            ) : (
              <AppText
                variant="bodyLarge"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.balanceAmount
                }
              >
                {walletError
                  ? "—"
                  : availableBalance}
              </AppText>
            )}

            <View
              style={
                styles.balanceFooter
              }
            >
              <View>
                <AppText
                  variant="caption"
                  style={
                    styles.balanceSecondaryLabel
                  }
                >
                  Pending
                </AppText>

                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={
                    styles.pendingAmount
                  }
                >
                  {walletError
                    ? "—"
                    : pendingBalance}
                </AppText>
              </View>

              <View
                style={
                  styles.secureBadge
                }
              >
                <AppIcon
                  name="lock"
                  size="xs"
                  color={
                    Colors.textInverse
                  }
                />

                <AppText
                  variant="caption"
                  weight="semibold"
                  style={
                    styles.secureText
                  }
                >
                  Secure
                </AppText>
              </View>
            </View>
          </View>

          {/* ==================================================
              ERROR
          ================================================== */}

          {hasAnyError ? (
            <View
              style={
                styles.notice
              }
            >
              <View
                style={
                  styles.noticeIcon
                }
              >
                <AppIcon
                  name="info"
                  size="sm"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.noticeContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={
                    styles.noticeTitle
                  }
                >
                  Wallet data unavailable
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.noticeText
                  }
                >
                  We couldn&apos;t load all your wallet information.
                </AppText>
              </View>

              <Pressable
                onPress={
                  handleRetry
                }
                accessibilityRole="button"
                accessibilityLabel="Try loading wallet again"
                style={({
                  pressed,
                }) => [
                  styles.retryButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.retryText
                  }
                >
                  Try again
                </AppText>
              </Pressable>
            </View>
          ) : null}

          {/* ==================================================
              PAYMENT METHODS
          ================================================== */}

          <View
            style={
              styles.section
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.sectionTitle
                  }
                >
                  Payment methods
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Cards and bank accounts
                </AppText>
              </View>

              {!methodsLoading &&
              !methodsError &&
              paymentMethods.length >
                0 ? (
                <AppText
                  variant="caption"
                  tone="secondary"
                >
                  {paymentMethods.length}
                </AppText>
              ) : null}
            </View>

            {methodsLoading ? (
              <SectionLoader />
            ) : methodsError ? (
              <CompactState
                icon="payment"
                title="Payment methods unavailable"
                description="Try again in a moment."
              />
            ) : paymentMethods.length >
              0 ? (
              <View
                style={
                  styles.list
                }
              >
                {paymentMethods.map(
                  (
                    method,
                    index,
                  ) => (
                    <PaymentMethodRow
                      key={
                        method.id
                      }
                      method={
                        method
                      }
                      showDivider={
                        index <
                        paymentMethods.length -
                          1
                      }
                    />
                  ),
                )}
              </View>
            ) : (
              <CompactState
                icon="payment"
                title="No payment method saved"
                description="Your saved cards or bank accounts will appear here."
              />
            )}

            <View
              style={
                styles.securityRow
              }
            >
              <AppIcon
                name="lock"
                size="xs"
                color={
                  Colors.textMuted
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.securityText
                }
              >
                Only masked payment details are shown.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              RECENT ACTIVITY
          ================================================== */}

          <View
            style={
              styles.section
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.sectionTitle
                  }
                >
                  Recent activity
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Payments and refunds
                </AppText>
              </View>
            </View>

            {transactionsLoading ? (
              <SectionLoader />
            ) : transactionsError ? (
              <CompactState
                icon="file"
                title="Activity unavailable"
                description="We couldn't load your wallet activity."
              />
            ) : transactions.length >
              0 ? (
              <View
                style={
                  styles.list
                }
              >
                {transactions.map(
                  (
                    transaction,
                    index,
                  ) => (
                    <TransactionRow
                      key={
                        transaction.id
                      }
                      transaction={
                        transaction
                      }
                      showDivider={
                        index <
                        transactions.length -
                          1
                      }
                    />
                  ),
                )}
              </View>
            ) : (
              <CompactState
                icon="file"
                title="No transactions yet"
                description="Your payments, refunds and wallet activity will appear here."
              />
            )}
          </View>
        </ScrollView>
      </AppScreen>
    </>
  );
}

/* ============================================================
   PAYMENT METHOD
============================================================ */

const PaymentMethodRow =
  memo(
    function PaymentMethodRow({
      method,
      showDivider,
    }: {
      method: PaymentMethod;

      showDivider: boolean;
    }) {
      const title =
        method.type ===
        "bank"
          ? method.bankName ||
            "Bank account"
          : method.brand ||
            "Card";

      const subtitle =
        method.type ===
        "bank"
          ? `Account ending ${method.accountLast4}`
          : `Card ending ${method.last4}`;

      return (
        <View
          style={[
            styles.listRow,

            showDivider
              ? styles.listDivider
              : null,
          ]}
        >
          <View
            style={
              styles.rowIcon
            }
          >
            <AppIcon
              name={
                method.type ===
                "bank"
                  ? "wallet"
                  : "payment"
              }
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.rowContent
            }
          >
            <View
              style={
                styles.methodTitleRow
              }
            >
              <AppText
                variant="bodyMedium"
                weight="semibold"
                numberOfLines={1}
                style={
                  styles.rowTitle
                }
              >
                {title}
              </AppText>

              {method.isDefault ? (
                <View
                  style={
                    styles.defaultBadge
                  }
                >
                  <AppText
                    variant="caption"
                    weight="semibold"
                    style={
                      styles.defaultBadgeText
                    }
                  >
                    Default
                  </AppText>
                </View>
              ) : null}
            </View>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.rowSubtitle
              }
            >
              {subtitle}
            </AppText>
          </View>
        </View>
      );
    },
  );

/* ============================================================
   TRANSACTION
============================================================ */

const TransactionRow =
  memo(
    function TransactionRow({
      transaction,
      showDivider,
    }: {
      transaction: WalletTransaction;

      showDivider: boolean;
    }) {
      const incoming =
        transaction.type ===
          "credit" ||
        transaction.type ===
          "refund";

      const amount =
        formatMoney(
          Math.abs(
            transaction.amount,
          ),
          transaction.currency,
        );

      const date =
        formatDate(
          transaction.createdAt,
        );

      return (
        <View
          style={[
            styles.listRow,

            showDivider
              ? styles.listDivider
              : null,
          ]}
        >
          <View
            style={
              styles.rowIcon
            }
          >
            <AppIcon
              name="wallet"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.rowContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              style={
                styles.rowTitle
              }
            >
              {transaction.title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.rowSubtitle
              }
            >
              {date ||
                transaction.status}
            </AppText>
          </View>

          <View
            style={
              styles.amountContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={[
                styles.transactionAmount,

                incoming
                  ? styles.creditAmount
                  : null,
              ]}
            >
              {incoming
                ? "+"
                : "-"}
              {amount}
            </AppText>

            {transaction.status !==
            "completed" ? (
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.transactionStatus
                }
              >
                {transaction.status}
              </AppText>
            ) : null}
          </View>
        </View>
      );
    },
  );

/* ============================================================
   COMPACT STATE
============================================================ */

const CompactState =
  memo(
    function CompactState({
      icon,
      title,
      description,
    }: {
      icon:
        | "payment"
        | "file";

      title: string;

      description: string;
    }) {
      return (
        <View
          style={
            styles.compactState
          }
        >
          <View
            style={
              styles.compactStateIcon
            }
          >
            <AppIcon
              name={
                icon
              }
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.compactStateContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.compactStateTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.compactStateText
              }
            >
              {description}
            </AppText>
          </View>
        </View>
      );
    },
  );

/* ============================================================
   LOADER
============================================================ */

const SectionLoader =
  memo(
    function SectionLoader() {
      return (
        <View
          style={
            styles.sectionLoader
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />
        </View>
      );
    },
  );

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    header: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    headerButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    headerTitle: {
      flex:
        1,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       BALANCE
    ======================================================== */

    balanceCard: {
      padding:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primary,
    },

    balanceHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    balanceIcon: {
      width:
        38,

      height:
        38,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    balanceLabel: {
      color:
        Colors.textInverse,
    },

    balanceAmount: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textInverse,
    },

    balanceLoader: {
      marginTop:
        FixxamTokens.spacing.lg,

      alignSelf:
        "flex-start",
    },

    balanceFooter: {
      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",
    },

    balanceSecondaryLabel: {
      color:
        Colors.textInverse,
    },

    pendingAmount: {
      marginTop:
        2,

      color:
        Colors.textInverse,
    },

    secureBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    secureText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       NOTICE
    ======================================================== */

    notice: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    noticeIcon: {
      width:
        36,

      height:
        36,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    noticeContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    noticeTitle: {
      color:
        Colors.textPrimary,
    },

    noticeText: {
      marginTop:
        2,
    },

    retryButton: {
      minHeight:
        36,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    retryText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       SECTIONS
    ======================================================== */

    section: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    sectionHeader: {
      minHeight:
        44,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    sectionTitle: {
      color:
        Colors.textPrimary,
    },

    sectionSubtitle: {
      marginTop:
        2,
    },

    list: {
      overflow:
        "hidden",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    listRow: {
      minHeight:
        64,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    listDivider: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    rowIcon: {
      width:
        38,

      height:
        38,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    rowContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    rowTitle: {
      color:
        Colors.textPrimary,
    },

    rowSubtitle: {
      marginTop:
        2,
    },

    methodTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    defaultBadge: {
      paddingHorizontal:
        FixxamTokens.spacing.xs,

      paddingVertical:
        2,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    defaultBadgeText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       TRANSACTION
    ======================================================== */

    amountContent: {
      flexShrink:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      alignItems:
        "flex-end",
    },

    transactionAmount: {
      color:
        Colors.textPrimary,
    },

    creditAmount: {
      color:
        CustomerColors.primary,
    },

    transactionStatus: {
      marginTop:
        2,

      textTransform:
        "capitalize",
    },

    /* ========================================================
       EMPTY / ERROR
    ======================================================== */

    compactState: {
      minHeight:
        72,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    compactStateIcon: {
      width:
        40,

      height:
        40,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    compactStateContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    compactStateTitle: {
      color:
        Colors.textPrimary,
    },

    compactStateText: {
      marginTop:
        2,

      lineHeight:
        17,
    },

    securityRow: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    securityText: {
      flex:
        1,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    sectionLoader: {
      minHeight:
        72,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       AUTH
    ======================================================== */

    centerState: {
      flex:
        1,

      padding:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    stateIcon: {
      width:
        56,

      height:
        56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    stateDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      textAlign:
        "center",
    },

    signInButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    signInText: {
      color:
        Colors.textInverse,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });