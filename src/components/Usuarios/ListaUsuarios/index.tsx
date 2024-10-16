"use client"
import { useEffect, useState } from "react";
import style from "./usuarios.module.scss";
import { useMutation } from "react-query";
import Table from "./Table";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants/app-routes";
import HeaderDetalhamento from "@/components/Header/HeaderDetalhamento";
import { IUsuario } from "@/interfaces/IUsuario";
import { getAllUsuarios } from "@/api/usuarios/getAllUsuarios";

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<IUsuario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const {push} = useRouter();

  const { mutate } = useMutation(() => getAllUsuarios(), {
    //const { mutate } = useMutation(() => getAllUsuarios(currentPage, 3), {
      onSuccess: (res) => {
      setUsuarios(res.data);
      //setTotalPages(res.data.totalPages);
    },
    onError: (error) => {
      console.error('Erro ao recuperar as promoções:', error);
    }
  });

  useEffect(() => {
    mutate();
  }, [currentPage]);

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUsuario = (usuario: IUsuario) => {
    setSelectedUsuario(usuario);
  };

  const handleBackToList = () => {
    setSelectedUsuario(null);
  };

  //if (selectedUsuario) {
  //  return <DetalharUsuario
  //    usuario={selectedUsuario}
  //    backDetalhamento={handleBackToList}
  //    hrefAnterior={APP_ROUTES.private.home.name}
  //  />
  //}

  return (
    <div className={style.global}>
      <div className={style.header}>
        <HeaderDetalhamento
          titulo="Usuarios"
          hrefAnterior={APP_ROUTES.private.home.name}
          diretorioAnterior="Home /"
          diretorioAtual="Usuarios  "
        />
        <div className={style.header__container}>
         <div className={style.header__container_botoes}>
         <button onClick={() => (
              push(APP_ROUTES.private.cadastrarUsuario.name)
              )}>
              <h1>
                Cadastrar Usuario              
              </h1>
            </button>
            <button onClick={() => (
              push(APP_ROUTES.private.usuarios.name)
              )}>
              <h1>
                Solicitações              
              </h1>
            </button>
          </div>
        </div>
      </div>

      <Table
        listUsuarios={filteredUsuarios}
        setUsuarios={setUsuarios}
        onSelectUsuario={handleSelectUsuario}
        table1="Nome"
        table2="Tipo de Usuario"
        table3="Ações"
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default ListaUsuarios;