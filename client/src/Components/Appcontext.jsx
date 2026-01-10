//this is appcontext.jsx

import { createContext,useState } from "react";

export const CatContext=createContext()
export const IdContext=createContext()


function AppProvider({children})
{
   const [category,setCategory]=useState([])
   const [id,setId]=useState("")

   return(

    <CatContext.Provider value={{ category,setCategory }}>
        <IdContext.Provider value={{id,setId}}>
            {children}
        </IdContext.Provider>
    </CatContext.Provider>

   )
 



}

export default AppProvider;