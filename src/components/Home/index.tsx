// Tela inicial
"use client"
import Card from "@/components/CardDefault";
import style from "./home.module.scss";
import { useState } from "react";
import { getStorageItem } from "@/utils/localStore";
import { useSelector } from "react-redux";



export default function Home() {

  const [role, setRole] = useState(getStorageItem("userRole"));

  const userLogin = useSelector((state: any) => state.userLogin);

  function whatIsTypeUser() {
    if (role) {
      if (role == "ROLE_ADMIN" || role == "ROLE_COPPABACS") {
        return <LayoutAdmin />
      } else if (role == "ROLE_GERENTE") {
        return <LayoutCoordenador />
      } else if (role == "ROLE_AGRICULTOR") {
        return <LayoutAgricultor />
      }
    } else {
      return <LayoutAdmin />
    }

  }

  return (
    <div>
      {
        /**
         * 
        {!userLogin ? <div className={style.mapa}><img className={style.mapa__img} src="/assets/Group 12.png " alt="menu burguer" /></div> : false}
         */
      }
      <div className={style.menu} style={!userLogin ? { paddingTop: '0px' } : {}}>
        <div className={style.conjuntoCards}>
          <h1>asuhaush</h1>
          {whatIsTypeUser()}
        </div>
      </div>
    </div>
  )

}

const LayoutAdmin = () => {

  return (
    <>
    <h1>aushufah</h1>
      <Card title="Agricultores" icon="/assets/iconAgricultor.svg" description="Agricultores" link="/agricultores" />
      <Card title="Coordenadores" icon="/assets/IconCordenadores.svg" description="Coordenadores" link="/coordenadores" />
      <Card title="Funcionários" icon="/assets/iconAssociates.svg" description="Funcionários" link="/funcionarios" />
      <Card title="Bancos de Sementes" icon="/assets/iconBancoDeSementes.svg" description="Banco Sementes" link="/bancoSementes" />
      <Card title="Gestão de Sementes" icon="/assets/iconSeedGreen.svg" description="Sementes" link="/sementes" />
      <Card title="Mural" icon="/assets/iconMural.svg" description="Mural" link="/mural" />
    </>
  )
}

const LayoutCoordenador = () => {

  return (
    <>
      <Card title="Agricultores" icon="/assets/iconAgricultor.svg" description="Agricultores" link="/agricultores" />
      <Card title="Bancos de Sementes" icon="/assets/iconBancoDeSementes.svg" description="Banco Sementes" link="/bancoSementes" />
      <Card title="Doações de Sementes" icon="/assets/iconDoacaoDeSementes.svg" description="Doações Sementes" link="/doacoes" />
      <Card title="Retirada de Sementes" icon="/assets/iconRetiradaDeSementes.svg" description="Doações Sementes" link="/retiradas" />
      <Card title="Gestão de Sementes" icon="/assets/iconSeedGreen.svg" description="Sementes" link="/sementes" />
      <Card title="Mural" icon="/assets/iconMural.svg" description="Mural" link="/mural" />
    </>
  )
}

const LayoutAgricultor = () => {

  return (
    <>
      <Card title="Bancos de Sementes" icon="/assets/iconBancoDeSementes.svg" description="Banco Sementes" link="/bancoSementes" />
      <Card title="Sementes" icon="/assets/iconSeedGreen.svg" description="Sementes" link="/sementes" />
      <Card title="Histórico de Doações" icon="/assets/iconMovimentacaoBancoSementes.svg" description="Doações Sementes" link="/doacoes" />
      <Card title="Histórico de Retirada" icon="/assets/iconMovimentacaoBancoSementes.svg" description="Doações Sementes" link="/retiradas" />
      <Card title="Mural" icon="/assets/iconMural.svg" description="Mural" link="/mural" />
    </>
  )
}
