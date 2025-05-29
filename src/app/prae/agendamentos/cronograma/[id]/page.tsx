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
  const [dadosPreenchidos, setDadosPreenchidos] = useState<any>({ endereco: {} });
  const [unidadesGestoras, setUnidadesGestoras] = useState<any[]>([]);
  const [lastMunicipioQuery, setLastMunicipioQuery] = useState("");
  const [tiposAtendimento, setTiposAtendimento] = useState<any[]>([]);
  const isEditMode = id && id !== "criar";

  const getOptions = (lista: any[], selecionado: any) => {
    if (!Array.isArray(lista) || lista.length === 0) return [];
    const options = lista.map((item) => ({
      chave: item.id, // ID do item (numérico, por exemplo)
      valor: item.nome, // Texto exibido no <option>
    }));
    if (isEditMode && selecionado) {
      const selectedId = Number(selecionado); // Converte para número, se necessário
      const selectedOption = options.find((opt) => opt.chave === selectedId);
      if (selectedOption) {
        // Coloca a opção selecionada na frente do array
        return [selectedOption, ...options.filter((opt) => opt.chave !== selectedId)];
      }
    }
    return options;
  };

  const fetchTiposAtendimento = async () => {
    try {
      const response = await generica({
        metodo: "get",
        uri: "/prae/tipo-atendimento",
        params: {},
      });
      if (response && response.data) {
        setTiposAtendimento(
          response.data.map((tipo: any) => ({
            chave: tipo.id,
            valor: tipo.nome,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao buscar tipos de atendimento:", error);
      toast.error("Erro ao carregar tipos de atendimento.", { position: "top-left" });
    }
  };

  useEffect(() => {
    fetchTiposAtendimento();
    if (id && id !== "criar") {
      chamarFuncao("editar", id);
    }
  }, [id]);

  const estrutura: any = {
    uri: "cronograma",
    cabecalho: {
      titulo: isEditMode ? "Editar Cronograma" : "Cadastrar Cronograma",
      migalha: [
        { nome: 'Home', link: '/home' },
        { nome: 'Prae', link: '/prae' },
        { nome: 'Cronogramas', link: '/prae/agendamentos/cronograma' },
        {
          nome: isEditMode ? "Editar" : "Criar",
          link: `/prae/agendamentos/cronograma/${isEditMode ? id : "criar"}`,
        },
      ],
    },
    cadastro: {
      campos: [
        // Linha 1
        {
          line: 1,
          colSpan: "md:col-span-1",
          nome: "Tipo de Atendimento",
          chave: "tipoAtendimentoId",
          tipo: "select",
          mensagem: "Selecione o tipo de atendimento",
          obrigatorio: true,
          selectOptions: tiposAtendimento,
        },
        {
          line: 1,
          colSpan: "md:col-span-1",
          nome: "Dias do Atendimento",
          chave: "datas",
          tipo: "date-multiple",
          mensagem: "Selecione as datas",
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
    router.push("/prae/agendamentos/cronograma");
  };

  /**
   * Salva o registro via POST, transformando os dados para que os itens de endereço
   * fiquem agrupados em um objeto 'endereco'.
   */
  const salvarRegistro = async (item: any) => {
    // Suporte para múltiplas datas
    let datasFormatadas: string[] = [];
    if (Array.isArray(item.datas)) {
      datasFormatadas = item.datas.map((data: string) => {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
      });
    } else if (typeof item.datas === "string") {
      const [ano, mes, dia] = item.datas.split('-');
      datasFormatadas = [`${dia}/${mes}/${ano}`];
    }

    const dadosFormatados = {
      datas: datasFormatadas,
      tipoAtendimentoId: Number(item.tipoAtendimentoId),
    };

    console.log("DEBUG: Dados enviados formatados:", dadosFormatados);

    try {
      const body = {
        metodo: `${isEditMode ? "patch" : "post"}`,
        uri: "/prae/" + `${isEditMode ? estrutura.uri + "/" + item.id : estrutura.uri}`,
        params: {},
        data: dadosFormatados,
      };

      const response = await generica(body);

      if (!response || response.status < 200 || response.status >= 300) {
        if (response) {
          console.error(
            "DEBUG: Status de erro:",
            response.status,
            "statusText" in response ? response.statusText : "Sem texto de status"
          );
        }
        toast.error(`Erro na requisição (HTTP ${response?.status || "desconhecido"})`, {
          position: "top-left",
        });
        return;
      }

      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast.error(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
          });
        });
      } else if (response.data?.error) {
        toast.error(response.data.error.message, { position: "top-left" });
      } else {
        Swal.fire({
          title: "Cronograma salvo com sucesso!",
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
      }
      else {
        const dados = response.data;
        if (dados.tipoAtendimento && dados.tipoAtendimento.id) {
          dados.tipoAtendimentoId = dados.tipoAtendimento.id;
        }
        setDadosPreenchidos(dados);
      }
    } catch (error) {
      console.error("DEBUG: Erro ao localizar registro:", error);
      toast.error("Erro ao localizar registro. Tente novamente!", { position: "top-left" });
    }
  };

  // Efeito exclusivo para o modo de edição
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