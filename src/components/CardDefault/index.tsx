import Image from "next/image";
import style from "./card.module.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CardProps {
  title: string;
  icon: string; 
  description: string;
  link: string;
}

export default function CardDefault({ title, icon, description, link }: CardProps) {
  const router = useRouter();
  return (
    <button className={style.card}>
      <Link className={style.card_link} href={`${link}`}>
        <Image className={style.card__img} src={icon} alt={description} width={70} height={70} />
        <h1>{title}</h1>
      </Link>
    </button>
  );
}
