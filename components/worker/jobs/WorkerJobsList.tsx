import React from "react";

import {
View,
FlatList,
} from "react-native";

import {
router,
} from "expo-router";

import WorkerJobCard from "./WorkerJobCard";

import useWorkerJobs from "@/hooks/worker/useWorkerJobs";

type Props = {

workerId: string;

tab:
| "pending"
| "active"
| "completed";

};

export default function WorkerJobsList({

workerId,

tab,

}: Props) {

const jobs =
useWorkerJobs(
workerId,
tab,
);

return (

<FlatList  

  data={jobs}  

  keyExtractor={(item) =>  
    item.id  
  }  

  showsVerticalScrollIndicator={false}  

  renderItem={({ item }) => (  

    <WorkerJobCard  

      customerName={  
        item.customerName ??  
        "Customer"  
      }  

      serviceName={  
        item.serviceName ??  
        "-"  
      }  

      address={  
        item.address ??  
        "-"  
      }  

      status={  
        item.status  
      }  

      date={  
        item.bookingDate ??  
        "-"  
      }  

      amount={  
        item.offerPrice  
      }  

      onPress={() =>  

        router.push({  

          pathname:  
            "/(worker)/(tabs)/orders",  

          params: {  

            id:  
              item.id,  

          },  

        })  

      }  

    />  

  )}  

  ListEmptyComponent={

  <WorkerJobCard

    customerName=""

    serviceName="No Jobs"

    address="There are no jobs in this section."

    status=""

    date=""

    amount={0}

    onPress={() => {}}

  />

}

/>

);

}