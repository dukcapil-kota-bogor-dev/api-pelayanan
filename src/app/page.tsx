import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Image
          src="/logo_kota_bogor.png"
          alt="logo_kota_bogor"
          width={100}
          height={100}
        />
        <Image
          src="/logo-dukcapil.png"
          alt="logo_dukcapil"
          width={100}
          height={100}
        />
      </div>
      <div className={styles.content}>
        <h1>DISDUKCAPIL Kota Bogor - API Pelayanan</h1>
      </div>
      <div className={styles.content}>
        <ul>
          <li>
            <a href="/api/persyaratan">/api/persyaratan</a>
          </li>
          <li>
            <a href="/api/formulir">/api/formulir</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
