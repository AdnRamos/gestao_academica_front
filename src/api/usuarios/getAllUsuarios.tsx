import api from "@/api/http-common";

export async function getAllUsuarios(){
    //export async function getAllUsuarios(page: number, size: number){
        //return await api.get(`/usuarios?page=${page}&size=${size}`);
    return await api.get("/usuario");
}