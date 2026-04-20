import { axiosInstance } from "../config/axios";

import { create } from "zustand";
// import toast from "react-hot-toast";

export const useAuthStore  = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    isSearchingUsers: false,
    searchResults: [],

    checkAuth: async () => {
        try{
            const res =   await axiosInstance.get('/user/check');
            set({ authUser: res.data})

        }catch(err){
            console.log("checkAuth error:", err);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    
}))