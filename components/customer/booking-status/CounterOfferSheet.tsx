import React, {
  useState,
} from "react";

import {
  Modal,
  View,
  StyleSheet,
  TextInput,
} from "react-native";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import {
  addOffer,
} from "@/firebase/queries/bookings/addOffer";

type Props = {

  visible: boolean;

  bookingId: string;

  onClose: () => void;

};

export default function CounterOfferSheet({

  visible,

  bookingId,

  onClose,

}: Props) {

  const [
    price,
    setPrice,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  async function handleSend() {

    if (!price) {

      return;

    }

    await addOffer({

      bookingId,

      sender: "customer",

      amount: Number(price),

      message,

    });

    onClose();

    setPrice("");

    setMessage("");

  }

  return (

    <Modal

      visible={visible}

      transparent

      animationType="slide"

    >

      <View style={styles.overlay}>

        <View style={styles.sheet}>

          <AppText
            weight="bold"
            style={styles.title}
          >
            Counter Offer
          </AppText>

          <TextInput

            placeholder="Price"

            keyboardType="numeric"

            value={price}

            onChangeText={setPrice}

            style={styles.input}

          />

          <TextInput

            placeholder="Message"

            value={message}

            onChangeText={setMessage}

            multiline

            style={[
              styles.input,
              styles.message,
            ]}

          />

          <AppButton

            title="Send Counter Offer"

            onPress={handleSend}

          />

          <View style={{ height: 12 }} />

          <AppButton

            title="Cancel"

            variant="customer"

            onPress={onClose}

          />

        </View>

      </View>

    </Modal>

  );

}

const styles = StyleSheet.create({

  overlay: {

    flex: 1,

    justifyContent: "flex-end",

    backgroundColor: "rgba(0,0,0,.35)",

  },

  sheet: {

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 24,

    borderTopRightRadius: 24,

    padding: 20,

  },

  title: {

    fontSize: 20,

    marginBottom: 16,

  },

  input: {

    borderWidth: 1,

    borderColor: "#CBD5E1",

    borderRadius: 12,

    padding: 12,

    marginBottom: 12,

  },

  message: {

    height: 100,

    textAlignVertical: "top",

  },

});