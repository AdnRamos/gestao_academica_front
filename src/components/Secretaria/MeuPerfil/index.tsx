"use client";

import { Form, Formik } from "formik";
import { useEffect, useState } from "react";

import style from "./detalhar-barbeiro.module.scss";
import HeaderDetalhamento from "@/components/Header/HeaderDetalhamento";
import { useRouter } from "next/navigation";
import { useMutation } from "react-query";
import DadosAdmissao from "./DadosAdmissao";
import DadosEndereco from "./DadosEndereco";
import DadosPessoais from "./DadosPessoais";
import { APP_ROUTES } from "@/constants/app-routes";
import { getSecretariaPhotoLogged } from "@/api/secretaria/getSecretariaPhotoLogged";
import { putSecretariaById } from "@/api/secretaria/putSecretariaById";
import { Secretaria } from "@/interfaces/secretariaInterface";

interface DetalharSecretariaProps {
  hrefAnterior: string;
  secretaria: Secretaria | any;
}

const MeuPerfil: React.FC<DetalharSecretariaProps> = ({ hrefAnterior, secretaria }) => {
  const { push } = useRouter();

  const [editar, setEditar] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const [formData, setFormData] = useState<Secretaria>({
    idSecretary: '',
    name: '',
    email: '',
    contact: '',
    password: '',
    cpf: '',
    address: {
      street: '',
      number: 0,
      neighborhood: '',
      city: '',
      state: '',
    },
    salary: 0,
    start: '',
    end: '',
    admissionDate: '',
    workload: 0,
    profilePhoto: undefined,
  });

  useEffect(() => {
    if (secretaria) {
      setFormData({
        idSecretary: secretaria.idSecretary || '',
        name: secretaria.name || '',
        email: secretaria.email || '',
        password: secretaria.password || '',
        contact: secretaria.contact || '',
        cpf: secretaria.cpf || '',
        start: secretaria.start || '',
        end: secretaria.end || '',
        address: secretaria.address || {},
        salary: secretaria.salary || 0,
        admissionDate: secretaria.admissionDate || '',
        workload: secretaria.workload || 0,
        profilePhoto: undefined,
      });

      if (secretaria.idSecretary) {
        getSecretariaPhoto();
      }

    }
  }, [secretaria]);




  const getSecretariaPhoto = async () => {
    try {
      const response = await getSecretariaPhotoLogged();

      if (response.data) {
        const imageBlob = new Blob([response.data], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(imageBlob);


        setImagePreview(imageUrl);  // Atualiza o estado com a URL do Blob
      } else {
        console.error("Nenhum dado encontrado na resposta.");
      }
    } catch (error) {
      console.error("Erro ao buscar a imagem do barbeiro:", error);
    }
  };




  const updateSecretaria = useMutation(
    async (values: Secretaria) => {
      // Extraia a imagem do values
      const profilePhoto = values.profilePhoto as File;

      // Remova a imagem e os services do objeto values
      const { profilePhoto: _, ...updatedValues } = values;


      return putSecretariaById(secretaria.idSecretary, updatedValues, profilePhoto);
    }, {
    onSuccess: () => {
      
    },
    onError: (error) => {
      console.log("Erro ao atualizar o barbeiro", error);
    }
  });



  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    if (!editar) return;

    const file = event.currentTarget.files?.[0];
    if (file) {
      setFieldValue("profilePhoto", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="header" className={style.container}>
      <HeaderDetalhamento
        titulo="Meu Perfil"
        hrefAnterior={APP_ROUTES.private.home.name}
        diretorioAnterior="Home / "
        diretorioAtual="Meu Perfil"
      />
      <div className={style.container__ContainerForm}>
        <Formik
          initialValues={formData}
          enableReinitialize
          onSubmit={(values, { setSubmitting }) => {
            updateSecretaria.mutate(values);
            setSubmitting(false);
          }}
        >
          {(formik) => (
            <Form className={style.container__ContainerForm_form}>
              <div className={style.container__header}>
                <div className={style.container__header_title}>
                  <div className={style.container__photo}>
                    <div className={style.profilePhotoWrapper}>
                      <input
                        type="file"
                        id="profilePhoto"
                        name="profilePhoto"
                        accept="image/jpeg"
                        onChange={(event) => handleImageChange(event, formik.setFieldValue)}
                        disabled={!editar}
                      />
                      <label htmlFor="profilePhoto" className={style.profilePhotoLabel}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Profile Preview" className={style.profileImage} />
                        ) : (
                          <img src="/assets/icons/perfil.svg" alt="Upload Icon" />
                        )}
                      </label>
                      {editar && (
                        <span
                          className={style.editIcon}
                          onClick={() => {
                            const fileInput = document.getElementById('profilePhoto');
                            if (fileInput) {
                              fileInput.click();
                            }
                          }}
                        >
                          <img src="/assets/icons/editar.svg" alt="Edit Icon" />
                        </span>
                      )}
                    </div>

                    {formik.touched.profilePhoto && formik.errors.profilePhoto && (
                      <span className={style.form__error}>{formik.errors.profilePhoto}</span>
                    )}
                  </div>
                  <div>
                    <h1>{formik.values.name}</h1>
                    
                  </div>
                </div>
                {!editar ? (
                  <button
                    type="button"
                    onClick={() => setEditar(true)}
                    className={style.container__header_button}
                  >
                    <span>Editar</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={style.container__header_button}
                    onClick={() => setEditar(false)}

                  >
                    <span>Salvar</span>
                  </button>
                )}
              </div>

              <DadosPessoais formik={formik} editar={editar} hrefAnterior={hrefAnterior} />
              <div className={style.container__header_title}>
                <h1>Endereço</h1>
              </div>

              <DadosEndereco formik={formik} editar={editar} hrefAnterior={hrefAnterior} />
              <div className={style.container__header_title}>
                <h1>Informações de admissão</h1>
              </div>

              <DadosAdmissao formik={formik} editar={editar} hrefAnterior={hrefAnterior}
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default MeuPerfil;
