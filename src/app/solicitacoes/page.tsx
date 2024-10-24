import Lista from "@/components/Lista";
import style from "./page.module.scss";
import { APP_ROUTES } from "@/constants/app-routes";
const Page = () => {

    return (
        <div className={style.containerList}>
            <Lista
                titulo="Solicitações"
                hrefAnterior={APP_ROUTES.private.home.name}
                diretorioAnterior="Home /"
                diretorioAtual="Solicitações"
                firstbutton=""
                routefirstbutton={""}
                lastbutton=""
                routelastbutton={""}
                table1="Nome"
                table2="CPF"
                table3="Tipo Perfil"
                table4=""
                table5="Ações"
            />

        </div>
    )
}

export default Page;