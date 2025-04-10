"use client";
import withAuthorization from "@/components/AuthProvider/withAuthorization";
import Cadastro from "@/components/Cadastro/Estrutura";
import Cabecalho from "@/components/Layout/Interno/Cabecalho";
import { generica } from "@/utils/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useEnderecoByCep } from "@/utils/brasilianStates";
import { useEmpresaByCnpj } from "@/utils/consultarCNPJ";

const cadastro = () => {
  const router = useRouter();
  const { id } = useParams();
  // Inicializamos com um objeto contendo 'endereco' para evitar problemas
  const [dadosPreenchidos, setDadosPreenchidos] = useState<any>({ endereco: {} });

  const isEditMode = id && id !== "criar";

  const estrutura: any = {
    uri: "unidade-administrativa",
    cabecalho: {
      titulo: isEditMode ? "Editar Unidade Administrativa" : "Cadastrar Unidade Administrativa",
      migalha: [
        { nome: "Gestão Acesso", link: "/gestao-acesso/" },
        { nome: "Unidades Administrativas", link: "/gestao-acesso/unidades-administrativas" },
        {
          nome: isEditMode ? "Editar" : "Criar",
          link: `/gestao-acesso/unidades-administrativas/${isEditMode ? id : "criar"}`,
        },
      ],
    },
    cadastro: {
      campos: [
        // Linha 1
        {
          line: 1,
          colSpan: "md:col-span-2",
          nome: "Nome",
          chave: "nome",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
        },
        {
          line: 1,
          colSpan: "md:col-span-1",
          nome: "Codigo",
          chave: "codigo",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
        },
        {
          line: 2,
          colSpan: "md:col-span-1",
          nome: "Tipo Unidade Administrativa",
          chave: "tipoUnidadeAdministrativaId",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
        },
        {
          line: 2,
          colSpan: "md:col-span-1",
          nome: "Unidade Pai ID",
          chave: "unidadePaiId",
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

  const voltarRegistro = () => {
    router.push("/gestao-acesso/unidades-administrativas");
  };

  /**
   * Salva o registro via POST, transformando os dados para que os itens de endereço
   * fiquem agrupados em um objeto 'endereco'.
   */
  const salvarRegistro = async (item: any) => {
    try {

      const dadosParaEnviar = {
        nome: item.nome,
        codigo: item.codigo,
        tipoUnidadeAdministrativaId: item.tipoUnidadeAdministrativaId,
        unidadePaiId: item.unidadePaiId,
      };

      const body = {
        metodo: "post",
        uri: "/auth/" + estrutura.uri + (isEditMode ? `/${id}` : "/registrar"),
        params: {},
        data: dadosParaEnviar,
      };

      const response = await generica(body);

      // 1) Checar se deu erro no status da resposta
      //    (isso depende de como 'generica' retorna as informações).
      // Exemplo com Axios:
      if (!response || response.status < 200 || response.status >= 300) {
        // Se cair aqui, é porque o status não foi 2xx
        console.error("Status de erro:", response?.status, (response as any)?.statusText || "Status text não disponível");
        if (response) {
          toast(`Erro na requisição (HTTP ${response.status})`, { position: "top-left" });
        } else {
          toast("Erro na requisição: resposta nula", { position: "top-left" });
        }
        return;
      }

      // 2) Checar se existe 'errors' ou 'error' no body
      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
          });
        });
      } else if (response.data?.error) {
        toast(response.data.error.message, { position: "top-left" });
      } else {
        // 3) Se chegou até aqui, é realmente sucesso
        Swal.fire({
          title: "Unidade gestora salvo com sucesso!",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            chamarFuncao("voltar");
          }
        });
      }
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
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
        uri: "/" + estrutura.uri + "/" + item,
        params: {},
        data: item,
      };

      const response = await generica(body);
      if (!response) {
        throw new Error("Resposta inválida do servidor.");
      }

      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
          });
        });
      } else if (response.data?.error) {
        toast(response.data.error.message, { position: "top-left" });
      } else {
        const data = response.data;
        // data.endereco existe e tem { cep, logradouro, ... }.
        // Precisamos jogar cada um deles para o "top-level" do estado,
        // já que o formulário usa dadosPreenchidos.cep, dadosPreenchidos.logradouro, etc.

        const endereco = data.endereco || {};
        const dadosAchatados = {
          ...data,
          cep: endereco.cep || "",
          logradouro: endereco.logradouro || "",
          complemento: endereco.complemento || "",
          numero: endereco.numero || "",
          bairro: endereco.bairro || "",
          municipio: endereco.municipio || "",
          estado: endereco.estado || "",
        };

        setDadosPreenchidos(dadosAchatados);
      }
    } catch (error) {
      console.error("Erro ao localizar registro:", error);
      toast.error("Erro ao localizar registro. Tente novamente!", { position: "top-left" });
    }
  };

  // Se estiver em modo de edição, carrega os dados ao montar
  useEffect(() => {
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
