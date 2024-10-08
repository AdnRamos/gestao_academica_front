"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setStorageItem } from "@/utils/localStore";
import { useMutation } from "react-query";
import style from "./login.module.scss";
import Link from "next/link";
import api from "@/api/http-common";
import { setUserLogin } from "@/redux/userLogin/userLoginSlice";
import HomePage from "../HomePage";


const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { push } = useRouter();


  const dispatch = useDispatch();

  const { status, mutate } = useMutation(
    async () => {
      //return postLogin(email, senha);
    }, {
    onSuccess: (res: any) => {
      api.defaults.headers.authorization = `${res.headers.authorization}`;
      setStorageItem("token", res.headers.authorization)
      dispatch(setUserLogin(email));
      setStorageItem("userLogin", email);
      //userDetailsMutation.mutate();
    },
    onError: (error) => {
      console.log("Erro ao fazer o login de usuario", error);
    },
  });

  /**
   * const userDetailsMutation = useMutation(getCurrentUser, {
    onSuccess: (res) => {
      const userRole = res.data.authorities[0].authority; // Assumindo que a resposta inclui um campo 'role'
      setStorageItem("userRole", userRole); 
      // Redirecionamento pode ser feito aqui, se necessário
      push("/");
    },
    onError: (error) => {
      console.log("Erro ao recuperar as informações do usaurio da sessão", error);
    },
  });*/

  const getEnter = (e: any) => {
    if (e.key === "Enter") {
      mutate();
    }
  }
  
    return (
      <div className={style.login}>
        <div className={style.login__login}>
          <form onSubmit={(e) => { e.preventDefault(); mutate(); }}>
            <h1 className={style.login__login_title}>Entrar</h1>
            
            <label htmlFor="email" className={style.login__login_label}>
              <p>E-mail</p>
              <input type="email" name="email" placeholder="Digite seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label htmlFor="senha" className={style.login__login_label}>
              <p>Senha</p>
              <input type="password" name="senha" placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </label>

            <Link className={style.login__login_link} href="/recuperarSenha">
              <h2 className={style.login__login_subtitle}>Esqueceu a senha?</h2>
            </Link>

            {status === "error" ? <p className={style.login__login_errorLogin}>E-mail ou senha incorretos</p> : null}

            <button className={`${style.login__login_button} ${status === "loading" || status === "success" ? style.active : ""}`} onClick={() => {push("/home")}}>
              Entrar
            </button>

            <h2 className={style.login__login_subtitle1}>
              Não possui conta? &nbsp;
              <Link href="/novoUsuario">
                <span>Crie Agora.</span>
              </Link>
            </h2>
          </form>
        </div>
      </div>
    );
}

export default Login;
