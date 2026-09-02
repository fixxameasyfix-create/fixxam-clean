import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";


export type Worker = {

  uid: string;

  name: string;

  photoUrl: string;

  service: string;

  rating: number;

};


export default function useWorkers() {

  const [
    workers,
    setWorkers,
  ] = useState<Worker[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);



  useEffect(() => {


    const q = query(

      collection(
        db,
        "users",
      ),

      where(
        "roles",
        "array-contains",
        "worker",
      ),

    );



    const unsubscribe =
      onSnapshot(

        q,

        (snapshot) => {


          const list: Worker[] =
            snapshot.docs.map(
              (doc) => {


                const data =
                  doc.data();



                return {

                  uid:
                    doc.id,


                  name:
                    [
                      data.firstName,
                      data.otherName,
                      data.surname,
                    ]
                    .filter(Boolean)
                    .join(" "),



                  photoUrl:
                    data.workerProfile?.photoUrl ?? "",



                  service:
                    data.workerProfile?.category ?? "Worker",



                  rating:
                    Number(data.rating ?? 0),


                };


              },
            );



          setWorkers(list);

          setLoading(false);


        },


        (error) => {


          console.log(
            "Workers error:",
            error,
          );


          setWorkers([]);

          setLoading(false);


        },


      );



    return unsubscribe;


  }, []);



  return {

    workers,

    loading,

  };

}