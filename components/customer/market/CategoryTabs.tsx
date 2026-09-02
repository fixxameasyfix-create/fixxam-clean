import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";


type Category = {

  id: string;

  title: string;

  icon: keyof typeof Ionicons.glyphMap;

};


type Props = {

  selected: string;

  onSelect: (
    id: string,
  ) => void;

};



const categories: Category[] = [

  {
    id: "all",
    title: "All",
    icon: "grid-outline",
  },

  {
    id: "building",
    title: "Building",
    icon: "business-outline",
  },

  {
    id: "electrical",
    title: "Electrical",
    icon: "flash-outline",
  },

  {
    id: "plumbing",
    title: "Plumbing",
    icon: "water-outline",
  },

  {
    id: "paint",
    title: "Paint",
    icon: "color-palette-outline",
  },

  {
    id: "more",
    title: "More",
    icon: "ellipsis-horizontal",
  },

];



export default function CategoryTabs({

  selected,

  onSelect,

}: Props) {


  return (

    <ScrollView

      horizontal

      showsHorizontalScrollIndicator={false}

      contentContainerStyle={
        styles.container
      }

    >

      {categories.map((item) => {


        const active =
          selected === item.id;


        return (

          <Pressable

            key={item.id}

            onPress={() =>
              onSelect(item.id)
            }

            style={
              styles.item}

          >

            <View

              style={[
                styles.iconBox,
                active &&
                styles.activeIconBox,
              ]}

            >

              <Ionicons

                name={item.icon}

                size={20}

                color={
                  active
                    ? "#FFFFFF"
                    : "#2563EB"
                }

              />

            </View>


            <AppText

              style={[
                styles.title,
                active &&
                styles.activeTitle,
              ]}

            >

              {item.title}

            </AppText>


          </Pressable>

        );

      })}

    </ScrollView>

  );

}



const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },

  item: {
    alignItems: "center",
    width: 58,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#F1F5F9",

    elevation: 2,
  },

  activeIconBox: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  title: {
    marginTop: 6,
    fontSize: 11,
    color: "#374151",
    textAlign: "center",
  },

  activeTitle: {
    color: "#2563EB",
    fontWeight: "700",
  },
});