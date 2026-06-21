import React, {useEffect,useState} from "react";
import axios from "axios";
import "./Streak.css";
const Streak=({userId})=>{
const [days,setDays]=useState([]);
useEffect(()=>{
    fetchStreak();

},[userId]);
const fetchStreak=async()=>{
const res=await axios.get(
`https://taskmanagerbysatyamsaroj.onrender.com/api/streak/${userId}`
);
setDays(res.data.days);
};
const markDay = async(index)=>{

    // only allow today's day
    if(days[index].date !== today){
        return;
    }

    const updated=[...days];

    updated[index].completed = !updated[index].completed;

    setDays(updated);

    await axios.put(
        `https://taskmanagerbysatyamsaroj.onrender.com/api/streak/${userId}/${index+1}`,
        {
            completed: updated[index].completed
        }
    );
};
const today = new Date().toISOString().split("T")[0];
return(
<div className="streak-container">
<h2>
🔥 30 Days Streak
</h2>
<div className="streak-grid">

{days.map((day,index)=>(

<div
key={index}
onClick={()=>markDay(index)}

className={
    day.completed
    ? "day completed"
    : day.date === today
    ? "day today"
    : "day locked"
}

>
{day.day}
</div>

))}

</div></div>)}


export default Streak;

