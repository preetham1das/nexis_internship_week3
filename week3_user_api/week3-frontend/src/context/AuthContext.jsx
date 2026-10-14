import { createContext,useContext,useState } from "react";
import axios from "axios";
import { API_URL } from "../api";
const AuthContext = createContext(null);

export function AuthProvider({children}){
    const [token ,setToken] = useState(
        ()=> localStorage.getItem('token')
    );
    const login = async (email,password)=>{
        const response = await axios.post(
            `${API_URL}/api/users/login`,
            {email , password}
        );
        const  newToken = response.data.token;
        localStorage.setItem("token",newToken);
        setToken(newToken);
        return response.data;
    };
    const logout =() =>{
        localStorage.removeItem("token");
        setToken(null);
    };
    return(
        <AuthContext.Provider value={{token,login,logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext);
}