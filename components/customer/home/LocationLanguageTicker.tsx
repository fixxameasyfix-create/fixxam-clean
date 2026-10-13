import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

/* ============================================================
   TYPES
============================================================ */

type LocationLanguageTickerProps = {
  location?: string | null;
};

type LanguageMessage = {
  key: string;
  text: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const RED = "#E53935";

const TICKER_HEIGHT = 40;

const MIN_ANIMATION_DURATION = 10000;

const PIXELS_PER_SECOND = 22;

/*
 * Large width used only for measuring
 * the complete single-line text.
 */
const MEASURE_WIDTH = 10000;

/* ============================================================
   COMPONENT
============================================================ */

export default function LocationLanguageTicker({
  location,
}: LocationLanguageTickerProps) {
  const translateX =
    useRef(
      new Animated.Value(0),
    ).current;

  const [
    containerWidth,
    setContainerWidth,
  ] = useState(0);

  const [
    textWidth,
    setTextWidth,
  ] = useState(0);

  const [
    languageIndex,
    setLanguageIndex,
  ] = useState(0);

  /* ==========================================================
     LOCATION
  ========================================================== */

  const displayLocation =
    location?.trim() ||
    "your current area";

  /* ==========================================================
     MESSAGES
  ========================================================== */

  const messages =
    useMemo<LanguageMessage[]>(
      () => [
        /* ------------------------------------------------------
           ENGLISH
        ------------------------------------------------------ */

        {
          key: "en",

          text:
            `Here is your current location: ${displayLocation} • ` +
            `Need a service? Start a request now or call for help ` +
            `when you need it. You can also FIND a SHOP near you ` +
            `for professional services, spare parts and more. ` +
            `Explore all the helpful features on FIXXAM Easyfix — ` +
            `Easyfix, Easylife.`,
        },

        /* ------------------------------------------------------
           FRENCH
        ------------------------------------------------------ */

        {
          key: "fr",

          text:
            `Voici votre position actuelle : ${displayLocation} • ` +
            `Besoin d'un service ? Faites une demande maintenant ` +
            `ou appelez pour obtenir de l'aide quand vous en avez ` +
            `besoin. Vous pouvez également TROUVER une BOUTIQUE ` +
            `près de chez vous pour des services professionnels, ` +
            `des pièces détachées et bien plus encore. Découvrez ` +
            `toutes les fonctionnalités utiles de FIXXAM Easyfix — ` +
            `Easyfix, Easylife.`,
        },

        /* ------------------------------------------------------
           IGBO
        ------------------------------------------------------ */

        {
          key: "ig",

          text:
            `Nke a bụ ebe ị nọ ugbu a: ${displayLocation} • ` +
            `Ị chọrọ ọrụ? Malite arịrịọ gị ugbu a ma ọ bụ kpọọ ` +
            `maka enyemaka mgbe ịchọrọ ya. Ị nwekwara ike ` +
            `CHỌTA ỤLỌ AHỊA dị gị nso maka ọrụ ndị ọkachamara, ` +
            `akụkụ ndozi na ọtụtụ ihe ndị ọzọ. Chọpụta atụmatụ ` +
            `niile bara uru nke FIXXAM Easyfix — Easyfix, Easylife.`,
        },

        /* ------------------------------------------------------
           YORUBA
        ------------------------------------------------------ */

        {
          key: "yo",

          text:
            `Eyi ni ipo rẹ lọwọlọwọ: ${displayLocation} • ` +
            `Ṣe o nilo iṣẹ? Bẹrẹ ibeere rẹ bayi tabi pe fun iranlọwọ ` +
            `nigbati o ba nilo rẹ. O tun le WA ILE ITAJA kan nitosi ` +
            `rẹ fun awọn iṣẹ amọja, awọn ẹya ẹrọ ati ọpọlọpọ awọn ` +
            `ohun miiran. Ṣawari gbogbo awọn ẹya iranlọwọ ti ` +
            `FIXXAM Easyfix — Easyfix, Easylife.`,
        },

        /* ------------------------------------------------------
           HAUSA
        ------------------------------------------------------ */

        {
          key: "ha",

          text:
            `Ga wurin da kake yanzu: ${displayLocation} • ` +
            `Kana buƙatar sabis? Fara neman sabis yanzu ko kira ` +
            `don samun taimako lokacin da kake buƙata. Haka kuma ` +
            `za ka iya NEMAN SHAGO kusa da kai domin samun ` +
            `ƙwararrun masu sabis, kayan gyara da sauran abubuwa ` +
            `masu amfani. Gano dukkan abubuwan amfani da FIXXAM ` +
            `Easyfix ke bayarwa — Easyfix, Easylife.`,
        },
      ],
      [displayLocation],
    );

  const currentMessage =
    messages[languageIndex];

  /* ==========================================================
     CONTAINER LAYOUT
  ========================================================== */

  const handleContainerLayout =
    (
      event: LayoutChangeEvent,
    ) => {
      const width =
        event.nativeEvent.layout.width;

      if (
        width > 0 &&
        width !== containerWidth
      ) {
        setContainerWidth(
          width,
        );
      }
    };

  /* ==========================================================
     TEXT MEASUREMENT
  ========================================================== */

  const handleTextLayout =
    (
      event: any,
    ) => {
      const lines =
        event.nativeEvent?.lines;

      if (
        !Array.isArray(lines) ||
        lines.length === 0
      ) {
        return;
      }

      const measuredWidth =
        Math.ceil(
          Math.max(
            ...lines.map(
              (line: {
                width: number;
              }) =>
                line.width,
            ),
          ),
        );

      if (
        measuredWidth > 0 &&
        measuredWidth !== textWidth
      ) {
        setTextWidth(
          measuredWidth,
        );
      }
    };

  /* ==========================================================
     RESET WHEN MESSAGE CHANGES
  ========================================================== */

  useEffect(() => {
    setTextWidth(0);

    translateX.stopAnimation();

    translateX.setValue(0);
  }, [
    currentMessage.key,
    translateX,
  ]);

  /* ==========================================================
     HORIZONTAL ANIMATION
  ========================================================== */

  useEffect(() => {
    if (
      containerWidth <= 0 ||
      textWidth <= 0
    ) {
      return;
    }

    translateX.stopAnimation();

    /*
     * Start outside the right side.
     */

    translateX.setValue(
      containerWidth,
    );

    const totalDistance =
      containerWidth +
      textWidth;

    const duration =
      Math.max(
        MIN_ANIMATION_DURATION,
        (totalDistance /
          PIXELS_PER_SECOND) *
          1000,
      );

    const animation =
      Animated.timing(
        translateX,
        {
          toValue:
            -textWidth,

          duration,

          easing:
            Easing.linear,

          useNativeDriver:
            true,
        },
      );

    animation.start(
      ({
        finished,
      }) => {
        if (!finished) {
          return;
        }

        setLanguageIndex(
          (current) =>
            (current + 1) %
            messages.length,
        );
      },
    );

    return () => {
      animation.stop();

      translateX.stopAnimation();
    };
  }, [
    containerWidth,
    textWidth,
    languageIndex,
    messages.length,
    translateX,
  ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.wrapper
      }
    >
      {/* ======================================================
          FIXED LOCATION ICON
      ====================================================== */}

      <View
        style={
          styles.iconContainer
        }
      >
        <Ionicons
          name="location"
          size={22}
          color={RED}
        />
      </View>

      {/* ======================================================
          TICKER CONTAINER
      ====================================================== */}

      <View
        style={
          styles.tickerContainer
        }
        onLayout={
          handleContainerLayout
        }
      >
        {/* ====================================================
            HIDDEN TEXT MEASUREMENT

            IMPORTANT:
            onTextLayout is used here.
            onLayout does NOT provide "lines".
        ==================================================== */}

        {textWidth === 0 && (
          <Text
            style={
              styles.measureText
            }
            onTextLayout={
              handleTextLayout
            }
          >
            {
              currentMessage.text
            }
          </Text>
        )}

        {/* ====================================================
            MOVING TEXT
        ==================================================== */}

        {textWidth > 0 && (
          <Animated.View
            style={[
              styles.animatedText,
              {
                width:
                  textWidth,

                transform: [
                  {
                    translateX,
                  },
                ],
              },
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="clip"
              style={
                styles.text
              }
            >
              {
                currentMessage.text
              }
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    overflow: "hidden",
  },

  iconContainer: {
    width: 30,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "#F8F9FB",
  },

  tickerContainer: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },

  animatedText: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 40,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  text: {
    color: RED,
    fontSize: 13,
    fontWeight: "600",

    /*
     * Same vertical center as the
     * location icon.
     */
    lineHeight: 20,
    includeFontPadding: false,

    flexShrink: 0,
    textAlignVertical: "center",
  },

  measureText: {
    position: "absolute",
    left: 0,
    top: 0,

    opacity: 0,

    width: MEASURE_WIDTH,

    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,

    includeFontPadding: false,

    flexShrink: 0,
    alignSelf: "flex-start",
  },
});