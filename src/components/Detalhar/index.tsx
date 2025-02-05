"use client";

import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "react-query";

import style from "./detalhar.module.scss";
import { toast } from "react-toastify";

import HeaderDetalhamento from "@/components/Header/HeaderDetalhamento";
import DadosPessoais from "./DadosPessoais";

// API
import { patchUsuarioById } from "@/api/usuarios/patchUsuarioById";

// Interfaces
import { IUsuario } from "@/interfaces/IUsuario";
import { ISolicitacao } from "@/interfaces/ISolicitacao";
import DadosSolicitacao from "./DadosSolicitacao";
import { postAprovar } from "@/api/solicitacoes/postAprovar";
import { postRejeitar } from "@/api/solicitacoes/postRejeitar";
import { APP_ROUTES } from "@/constants/app-routes";
import { getStorageItem } from "@/utils/localStore";

/** PROPS */
interface DetalharUsuarioProps {
  hrefAnterior: string;
  backDetalhamento: () => void;
  usuario?: IUsuario | any;
  solicitacao?: ISolicitacao;
  diretorioAnterior: string;
  diretorioAtual: string;
  titulo: string;
  firstbutton: string;
  lastbutton: string;
  routefirstbutton: any;
  routelastbutton: any;
}

/** 
 * Função helper (type guard) para saber se o objeto
 * em `formik.values` é um ISolicitacao.
 */
function isSolicitacao(values: IUsuario | ISolicitacao): values is ISolicitacao {
  // Critério: se 'values' tiver 'perfil', 'solicitante' e 'responsavel'.
  // Você pode ajustar conforme sua modelagem.
  if ('perfil' in values && 'solicitante') {
    return (values as ISolicitacao).perfil.tipo !== undefined;
  } else {
    return false;
  }

}
/**
 * Componente principal
 */
export default function Detalhar(props: DetalharUsuarioProps) {
  return <LayoutDetalharUsuario {...props} />;
}

/**
 * LayoutDetalharUsuario
 * Renderiza o Formik, decide se é Solicitação ou Usuário
 * e lida com toda a lógica de edição/upload.
 */
const LayoutDetalharUsuario: React.FC<DetalharUsuarioProps> = ({
  backDetalhamento,
  usuario,
  solicitacao,
  diretorioAnterior,
  diretorioAtual,
  hrefAnterior,
  titulo,
  firstbutton,
  lastbutton,
  routefirstbutton,
  routelastbutton,
}) => {

  const [roles, setRoles] = useState<string[]>(getStorageItem("userRoles") || []);

  const { push } = useRouter();
  const [editar, setEditar] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /**
   * 1) Definindo valores iniciais como IUsuario | ISolicitacao
   *    baseado no 'titulo' ou nas props.
   */
  let initialValues: IUsuario | ISolicitacao;
  // Se for solicitação:
  if (titulo === "Informações da Solicitação" && solicitacao) {
    initialValues = {
      id: solicitacao.id || "",
      dataSolicitacao: solicitacao.dataSolicitacao || "",
      status: solicitacao.status || "",
      dataAvaliacao: solicitacao.dataAvaliacao || "",
      parecer: solicitacao.parecer || "",
      perfil: {
        id: solicitacao?.perfil?.id || "",
        siape: solicitacao?.perfil?.siape || "",
        matricula: solicitacao?.perfil?.matricula || "",
        curso: solicitacao?.perfil?.curso || "",
        cursos: solicitacao?.perfil?.cursos || [],
        tipo: solicitacao?.perfil?.tipo || "",
      },
      solicitante: solicitacao.solicitante,
      responsavel: solicitacao.responsavel,
    } as ISolicitacao;
  } else {

    // Caso contrário, assumimos que é um usuário:
    initialValues = {
      id: usuario?.id || "",
      nome: usuario?.nome || "",
      cpf: usuario?.cpf || "",
      senha: usuario?.senha || "",
      confirmarSenha: usuario?.confirmarSenha || "",
      matricula: usuario?.matricula || "",
      email: usuario?.email || "",
      telefone: usuario?.telefone || "",
      siape: usuario?.siape || "",
      cursoId: usuario?.curso || "",
      cursoIds: usuario?.cursoIds || [],
      nomeSocial: usuario?.nomeSocial || "",
      instituicao: usuario?.instituicao || "",
      tipoUsuario: usuario?.tipoUsuario || "default",
      profilePhoto: undefined,
      documentos: [],
    } as IUsuario;

  }



  /**
   * 2) Definindo a mutation (SÓ para usuário).
   *    Se for Solicitação, você precisa de outra mutation 
   *    ou outro endpoint (ou não chama nada).
   */
  const updateUsuario = useMutation(
    async (values: IUsuario) => {
      const { profilePhoto, ...updatedValues } = values;
      const file = profilePhoto as File | undefined;
      return patchUsuarioById(values.id, updatedValues, file);
    },
    {
      onSuccess: () => {

        toast.success("Alterações salvas com sucesso!");

      },
      onError: (error) => {
        toast.error("Erro ao realizar as alterações!");

      },
    }
  );

  const aprovarSolicitacao = useMutation(
    async (values: ISolicitacao) => {
      return postAprovar(values.id, values.parecer);
    },
    {
      onSuccess: () => {
        toast.success("Solicitação aprovada com sucesso!");
        push(APP_ROUTES.private.solicitacoes.name);

      },
      onError: (error) => {
        toast.error("Erro ao aprovar a solicitação!");
        console.log("Erro ao aprovar a solicitação:", error);
      },
    }
  );
  const rejeitarSolicitacao = useMutation(
    async (values: ISolicitacao) => {
      return postRejeitar(values.id, values.parecer);
    },
    {
      onSuccess: () => {
        toast.success("Solicitação rejeitada com sucesso!");
        window.location.reload();
      },
      onError: (error) => {
        toast.error("Erro ao rejeitar a solicitação!");
        console.log("Erro ao rejeitar a solicitação:", error);
      },
    }
  );

  /**
   * 3) Função para tratar mudança de imagem.
   *    Só faz sentido se formik.values for IUsuario.
   */
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    formValues: IUsuario | ISolicitacao
  ) => {
    if (!editar) return;
    const file = event.currentTarget.files?.[0];
    // Se for IUsuario, atualizamos profilePhoto
    if (file && !isSolicitacao(formValues)) {
      setFieldValue("profilePhoto", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  // Flag para saber se é solicitação (usado no JSX)
  const isSolic = titulo === "Informações da Solicitação";

  return (
    <div className={style.container}>
      <div className={style.container__header}>
        <HeaderDetalhamento
          titulo={titulo}
          hrefAnterior={backDetalhamento}
          diretorioAnterior={diretorioAnterior}
          diretorioAtual={diretorioAtual}
          firstbutton={firstbutton}
          routefirstbutton={routefirstbutton}
          lastbutton={lastbutton}
          routelastbutton={routelastbutton}
        />
      </div>

      <div className={style.container__body}>
        <div className={style.container__body_ContainerForm}>
          {/* 
              4) O Formik agora é de tipo IUsuario | ISolicitacao 
                 pois initialValues podem ser qualquer um dos dois.
          */}
          <Formik<IUsuario | ISolicitacao>
            initialValues={initialValues}
            enableReinitialize
            onSubmit={(values, { setSubmitting }) => {
              // Se for IUsuario, chamamos updateUsuario
              if (!isSolicitacao(values)) {
                updateUsuario.mutate(values);
              } else {
                // Caso seja solicitação:
                console.log("Aprovar solicitação ou outra lógica...");
                // Você criaria aqui a mutation/endpoint para solicitação, se existir.
              }
              setSubmitting(false);
            }}
          >
            {(formik) => (
              <Form className={style.container__body_ContainerForm_form}>
                <div className={style.container__body_ContainerForm_header}>
                  <div className={style.container__body_ContainerForm_header_title}>
                    {/* UPLOAD de foto: só exibe se for Usuário */}
                    <div className={style.container__body_ContainerForm_profilePhotoWrapper}>
                      {!isSolicitacao(formik.values) && (
                        <input
                          type="file"
                          id="profilePhoto"
                          name="profilePhoto"
                          accept="image/jpeg"
                          onChange={(event) =>
                            handleImageChange(event, formik.setFieldValue, formik.values)
                          }
                          disabled={!editar}
                        />
                      )}
                      <label
                        htmlFor="profilePhoto"
                        className={style.container__body_ContainerForm_profilePhotoLabel}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile Preview"
                            className={style.container__body_ContainerForm_profileImage}
                          />
                        ) : (
                          <img src="/assets/icons/perfil.svg" alt="Upload Icon" />
                        )}
                      </label>

                      {/* Ícone de editar foto somente se for usuário e estiver em modo edição */}
                      {editar && !isSolicitacao(formik.values) && (
                        <span
                          className={style.container__body_ContainerForm_editIcon}
                          onClick={() => {
                            const fileInput = document.getElementById("profilePhoto");
                            fileInput?.click();
                          }}
                        >
                          <img src="/assets/icons/editar_white.svg" alt="Edit Icon" />
                        </span>
                      )}
                    </div>

                    {/* Título: se for solicitação, exibe algo, senão exibe o nome do usuário */}
                    <div className={style.container__body_ContainerForm_header_form}>
                      {isSolic ? (
                        // Exemplo: 'Solicitação para o perfil X'
                        <h1>
                          Solicitação para o perfil{" "}
                          <span>
                            {isSolicitacao(formik.values)
                              ? formik.values.perfil.tipo
                              : ""}
                          </span>
                        </h1>
                      ) : (
                        // Se não for solicitação, então é um usuário:
                        <h1>
                          {!isSolicitacao(formik.values)
                            ? formik.values.nome
                            : ""}
                        </h1>
                      )}
                    </div>
                  </div>

                  {/* Botões Editar/Salvar: só se não for solicitação */}
                  {!isSolic && !roles.includes("administrador") && (
                    <>
                      {!editar ? (
                        <button
                          type="button"
                          onClick={() => setEditar(true)}
                          className={style.container__body_ContainerForm_header_button}
                        >
                          <span>Editar</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            formik.handleSubmit()
                            setEditar(false)
                          }}
                          className={style.container__body_ContainerForm_header_button}
                        >
                          <span>Salvar</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* CAMPOS DO FORM */}
                {/* Se for Usuário, renderizamos o <DadosPessoais> */}
                {!isSolicitacao(formik.values) && (
                  <DadosPessoais
                    formik={formik}
                    editar={editar}
                    hrefAnterior={hrefAnterior}
                    roles={roles}
                  />
                )}

                {/* Se for Solicitação, mostramos botões Recusar/Aprovar */}
                {isSolic && (
                  <>
                    <DadosSolicitacao
                      formik={formik}
                      editar={editar}
                      hrefAnterior={hrefAnterior}
                      roles={[]}
                    />
                    <div className={style.container__body_ContainerForm_form_submit}>
                      <button
                        type="button"
                        onClick={() => {
                          rejeitarSolicitacao.mutate(formik.values as ISolicitacao);
                        }}
                      >
                        <span>Recusar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          aprovarSolicitacao.mutate(formik.values as ISolicitacao);
                        }}
                      >
                        <span>Aprovar</span>
                      </button>
                    </div>
                  </>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
