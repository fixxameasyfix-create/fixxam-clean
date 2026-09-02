import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "@/firebase/firebaseAuth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

import DotLoader from "./DotLoader";

export default function SplashThree() {
  useEffect(() => {
    console.log("SPLASH THREE STARTED");

    let unsubscribeAuth: (() => void) | undefined;

    const timer = setTimeout(() => {
      console.log("SPLASH TIMER FIRED");

      unsubscribeAuth = onAuthStateChanged(
        auth,
        async (user) => {
          console.log(
            "AUTH STATE FIRED",
            user?.uid ?? "NO USER"
          );

          if (!user) {
            console.log(
              "NO USER → ROLE SELECTION"
            );

            router.replace(
              "/(auth)/role-selection"
            );

            return;
          }

          console.log(
            "USER FOUND →",
            user.uid
          );

          try {
            console.log("BEFORE GET USER DOC");

            // ---------------------------------
            // USER DOCUMENT REFERENCE
            // ---------------------------------

            const userRef = doc(
              db,
              "users",
              user.uid
            );

            console.log(
              "FIRESTORE PROJECT:",
              db.app.options.projectId
            );

            console.log(
              "FIRESTORE DATABASE:",
              "(default)"
            );

            console.log(
              "USER UID:",
              user.uid
            );

            console.log(
              "USER DOC PATH:",
              userRef.path
            );

            // ---------------------------------
            // CHECK USERS COLLECTION
            // ---------------------------------

            const usersSnapshot =
              await getDocs(
                collection(db, "users")
              );

            console.log(
              "USERS COLLECTION COUNT:",
              usersSnapshot.size
            );

            usersSnapshot.forEach(
              (item) => {
                console.log(
                  "USER DOCUMENT ID:",
                  item.id
                );

                console.log(
                  "USER DOCUMENT PATH:",
                  item.ref.path
                );

                console.log(
                  "USER DOCUMENT EXISTS:",
                  item.exists()
                );
              }
            );

            // ---------------------------------
            // GET EXACT USER DOCUMENT
            // ---------------------------------

            const userDoc =
              await getDoc(userRef);

            console.log(
              "AFTER GET USER DOC"
            );

            console.log(
              "USER DOC EXISTS:",
              userDoc.exists()
            );

            // ---------------------------------
            // USER DOCUMENT NOT FOUND
            // ---------------------------------

            if (!userDoc.exists()) {
              console.log(
                "USER DOCUMENT NOT FOUND"
              );

              router.replace(
                "/(auth)/login"
              );

              return;
            }

            // ---------------------------------
            // USER DATA
            // ---------------------------------

            const userData =
              userDoc.data();

            console.log(
              "USER DATA:",
              userData
            );

            // ---------------------------------
            // ROLES
            // ---------------------------------

            const roles: string[] =
              Array.isArray(
                userData.roles
              )
                ? userData.roles.filter(
                    (role): role is string =>
                      typeof role ===
                      "string"
                  )
                : [];

            // ---------------------------------
            // ACTIVE ROLE
            // ---------------------------------

            const activeRole:
              | "customer"
              | "worker"
              | null =
              userData.activeRole ===
                "customer" ||
              userData.activeRole ===
                "worker"
                ? userData.activeRole
                : null;

            console.log(
              "USER ROLES:",
              roles
            );

            console.log(
              "ACTIVE ROLE:",
              activeRole
            );

            // ---------------------------------
            // NO ROLE
            // ---------------------------------

            if (roles.length === 0) {
              console.log(
                "NO ROLES → ROLE SELECTION"
              );

              router.replace(
                "/(auth)/role-selection"
              );

              return;
            }

            // ---------------------------------
            // MULTIPLE ROLES
            // ---------------------------------

            if (roles.length > 1) {
              console.log(
                "MULTIPLE ROLES → SELECT ACCOUNT"
              );

              router.replace(
                "/(auth)/select-account"
              );

              return;
            }

            // ---------------------------------
            // CUSTOMER
            // ---------------------------------

            if (
              roles[0] ===
              "customer"
            ) {
              console.log(
                "CUSTOMER → CUSTOMER HOME"
              );

              router.replace(
                "/(customer)/(tabs)/home"
              );

              return;
            }

            // ---------------------------------
            // WORKER
            // ---------------------------------

            if (
              roles[0] ===
              "worker"
            ) {
              console.log(
                "WORKER → WORKER HOME"
              );

              router.replace(
                "/(worker)/(tabs)/home"
              );

              return;
            }

            // ---------------------------------
            // UNKNOWN ROLE
            // ---------------------------------

            console.log(
              "UNKNOWN ROLE → ROLE SELECTION"
            );

            router.replace(
              "/(auth)/role-selection"
            );
          } catch (error) {
            console.log(
              "SPLASH THREE ERROR:",
              error
            );

            router.replace(
              "/(auth)/login"
            );
          }
        }
      );
    }, 2000);

    // ---------------------------------
    // CLEANUP
    // ---------------------------------

    return () => {
      clearTimeout(timer);

      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
      }}
    >
      <Image
        source={require(
          "../../assets/ui-images/logo.png"
        )}
        resizeMode="contain"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            bottom: 130,
            alignSelf: "center",
          }}
        >
          <DotLoader />
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 20,
          width: "100%",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#0B1F4D",
            fontSize: 22,
            fontWeight: "600",
          }}
        >
          Quick - Reliable - Trust.
        </Text>
      </View>
    </SafeAreaView>
  );
}