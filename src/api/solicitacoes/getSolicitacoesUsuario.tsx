import api from "@/api/http-common";


export const getSolicitacoesUsuario = () => {

    return api.get("/solicitacao/usuario");
  };