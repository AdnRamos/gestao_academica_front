"use client";
import withAuthorization from "@/components/AuthProvider/withAuthorization";
import Cadastro from "@/components/Cadastro/Estrutura";
import Cabecalho from "@/components/Layout/Interno/Cabecalho";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useEnderecoByCep } from "@/utils/brasilianStates";
import { generica } from "@/utils/api";

const cadastro = () => {
  const router = useRouter();
  const { id } = useParams();
  // Inicializamos com um objeto contendo 'endereco' para evitar problemas
  const [dadosPreenchidos, setDadosPreenchidos] = useState<any>({});
  const [unidadesGestoras, setUnidadesGestoras] = useState<any[]>([]);
  const [lastMunicipioQuery, setLastMunicipioQuery] = useState("");
  const [titular, setTitular] = useState<any[]>([]);
  const isEditMode = id && id !== "criar";

  const getOptions = (lista: any[], selecionado: any) => {
    if (!Array.isArray(lista)) return [];

    // Mapeia para { chave: id, valor: nome } → Select mostrará "valor" (nome)
    const options = lista.map((item) => ({
      chave: item.id,       // ID (valor salvo no formulário)
      valor: item.nome || item.aluno.nome    // Nome (exibido no select)
    }));

    // Debug: Verifique as opções geradas
    console.log("Opções do select (nome exibido):", options);
    return options;
  };

  const estrutura: any = {
    uri: "dadosBancarios",
    cabecalho: {
      titulo: isEditMode ? "Editar Dados Bancarios" : "Cadastrar Dados Bancarios",
      migalha: [
        { nome: 'Home', link: '/home' },
        { nome: 'Prae', link: '/prae' },
        { nome: 'Dados Bancarios', link: '/prae/dados-bancarios' },
        {
          nome: isEditMode ? "Editar" : "Criar",
          link: `/prae/dados-bancarios/${isEditMode ? id : "criar"}`,
        },
      ],
    },
    cadastro: {
      campos: [
        // Linha 1
        {
          line: 1,
          colSpan: "md:col-span-1",
          nome: "Aluno",
          chave: "id", //consultar estudantes
          tipo: "select",
          selectOptions: isEditMode ? null : getOptions(titular, dadosPreenchidos[0]?.titular),
          mensagem: "Digite",
          obrigatorio: true,
          bloqueado: isEditMode ? true : null,
        },
        {
          line: 1,
          colSpan: "md:col-span-1",
          nome: "Titular",
          chave: "nomeTitular",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
        },
        {
          line: 1,
          colSpan: "md:col-span-1",
          nome: "Banco",
          chave: "banco",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
        },
        {
          line: 1,
          colSpan: "md:col-span-1",
          nome: "Tipo de Conta",
          chave: "tipoConta",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
        },
        {
          line: 2,
          colSpan: "md:col-span-1",
          nome: "Conta Bancária",
          chave: "conta",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
        },
        {
          line: 2,
          colSpan: "md:col-span-1",
          nome: "Agencia Bancária",
          chave: "agencia",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
        },
      ],
      acoes: [
        { nome: "Cancelar", chave: "voltar", tipo: "botao" },
        { nome: isEditMode ? "Salvar" : "Cadastrar", chave: "salvar", tipo: "submit" },
      ],
    },
  };


  /**
   * Chama funções de acordo com o botão clicado
   */
  const chamarFuncao = async (nomeFuncao = "", valor: any = null) => {
    switch (nomeFuncao) {
      case "salvar":
        await salvarRegistro(valor);
        break;
      case "voltar":
        voltarRegistro();
        break;
      case "editar":
        editarRegistro(valor);
        break;
      default:
        break;
    }
  };

  const pesquisarTitular = async (params = null) => {
    try {
      let body = {
        metodo: 'get',
        uri: '/prae/' + 'estudantes',
        //+ '/page',
        params: params != null ? params : { size: 25, page: 0 },
        data: {}
      }
      const response = await generica(body);
      //tratamento dos erros
      if (response && response.data.errors != undefined) {
        toast("Erro. Tente novamente!", { position: "bottom-left" });
      } else if (response && response.data.error != undefined) {
        toast(response.data.error.message, { position: "bottom-left" });
      } else {
        setTitular(response?.data);
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };


  const voltarRegistro = () => {
    router.push("/prae/dados-bancarios");
  };

  console.log(dadosPreenchidos)


  /**
   * Salva o registro via POST, transformando os dados para que os itens de endereço
   * fiquem agrupados em um objeto 'endereco'.
   */
  const salvarRegistro = async (item: any) => {
    try {
      const modifiedItem = {
        ...item,
        titularId: item.titular,
      }
      console.log("aqui", item)
      const body = {
        metodo: `${isEditMode ? "patch" : "post"}`,
        uri: "/prae/" + `${isEditMode ? estrutura.uri + "/" + item.id : estrutura.uri + "/" + item.id}`,
        params: {},
        data: modifiedItem,
      };
      const response = await generica(body);
      if (!response || response.status < 200 || response.status >= 300) {
        if (response) {
          console.error("DEBUG: Status de erro:", response.status, 'statusText' in response ? response.statusText : "Sem texto de status");
        }
        toast.error(`Erro na requisição (HTTP ${response?.status || "desconhecido"})`, { position: "top-left" });
        return;
      }
      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast.error(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
          });
        });
      } else if (response.data?.error) {
        toast(response.data.error.message, { position: "top-left" });
      } else {
        Swal.fire({
          title: "Dados bancarios salvo com sucesso!",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            chamarFuncao("voltar");
          }
        });
      }
    } catch (error) {
      console.error("DEBUG: Erro ao salvar registro:", error);
      toast.error("Erro ao salvar registro. Tente novamente!", { position: "top-left" });
    }
  };

  /**
   * Localiza o registro para edição e preenche os dados
   */
  const editarRegistro = async (item: any) => {
    try {
      const body = {
        metodo: "get",
        uri: "/prae/" + estrutura.uri + "/" + item,
        params: {},
        data: item,
      };
      const response = await generica(body);
      if (!response) throw new Error("Resposta inválida do servidor.");
      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
          });
        });
      } else if (response.data?.error) {
        toast.error(response.data.error.message, { position: "top-left" });
      } else {
        setDadosPreenchidos(response.data);
      }
    } catch (error) {
      console.error("DEBUG: Erro ao localizar registro:", error);
      toast.error("Erro ao localizar registro. Tente novamente!", { position: "top-left" });
    }
  };

  // Efeito exclusivo para o modo de edição
  useEffect(() => {
    pesquisarTitular();
    if (id && id !== "criar") {
      chamarFuncao("editar", id);
    }
  }, [id]);

  return (
    <main className="flex flex-wrap justify-center mx-auto">
      <div className="w-full md:w-11/12 lg:w-10/12 2xl:w-3/4 max-w-6xl p-4 pt-10 md:pt-12 md:pb-12">
        <Cabecalho dados={estrutura.cabecalho} />
        <Cadastro
          estrutura={estrutura}
          dadosPreenchidos={dadosPreenchidos}
          setDadosPreenchidos={setDadosPreenchidos}
          chamarFuncao={chamarFuncao}
        />
      </div>
    </main>
  );
};

export default withAuthorization(cadastro);