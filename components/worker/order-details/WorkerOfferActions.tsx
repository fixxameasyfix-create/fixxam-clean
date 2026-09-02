import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
} from "@/components/ui";

type Props = {

  loading?: boolean;

  onAccept: () => void;

  onReject: () => void;

};

export default function WorkerOfferActions({

  loading = false,

  onAccept,

  onReject,

}: Props) {

  return (

    <View style={styles.container}>

      <AppButton

        title="Accept Customer Offer"

        loading={loading}

        onPress={onAccept}

      />

      <View style={styles.space} />

      <AppButton

        title="Reject Offer"

        variant="customer"

        loading={loading}

        onPress={onReject}

      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    marginTop: 18,

  },

  space: {

    height: 12,

  },

});