import {
  useState,
} from "react";

import {
  arrayUnion,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";


export default function useBecomeWorker(){


const [
 loading,
 setLoading,
]=useState(false);



const submit = async()=>{


const uid =
auth.currentUser?.uid;


if(!uid)
 return;



try{


setLoading(true);



await updateDoc(

doc(
 db,
 "users",
 uid,
),

{


roles:
arrayUnion(
 "worker"
),


activeRole:
"worker",


workerProfile:{

verified:false,

online:false,

rating:0,

completedJobs:0,

}


}

);



}
finally{


setLoading(false);


}


};



return{

submit,

loading,

};


}