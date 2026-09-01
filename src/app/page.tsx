import Image from "next/image";
import Link from "next/link";
import styles from "./torneos-landing.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="ALTTEZ Torneos, inicio">
          <Image src="/branding/alttez-symbol-transparent.png" alt="" width={28} height={28} priority />
          <span>ALTTEZ</span><span className={styles.product}>Torneos</span>
        </Link>
        <Link className={styles.headerLogin} href="/auth/login?redirect=/torneos">Iniciar sesión</Link>
      </header>
      <section className={styles.hero} aria-labelledby="welcome-title">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Operación competitiva</p>
          <h1 id="welcome-title">Bienvenido a ALTTEZ Torneos.</h1>
          <p className={styles.lead}>Crea, programa y opera tus competencias desde un solo lugar, estés en la cancha, en la mesa técnica o en movimiento.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/auth/login?redirect=/torneos"><span>Iniciar sesión</span><span aria-hidden="true">→</span></Link>
            <Link className={styles.secondary} href="/auth/register?redirect=/torneos">Crear cuenta de organizador</Link>
          </div>
        </div>
        <aside className={styles.context} aria-label="Capacidades de ALTTEZ Torneos">
          <div className={styles.contextTop}><span className={styles.statusDot} aria-hidden="true" /><span>Entorno de torneos</span></div>
          <p className={styles.contextTitle}>Tu jornada, disponible donde sucede.</p>
          <dl className={styles.capabilities}>
            <div><dt>01</dt><dd>Formatos y participantes</dd></div>
            <div><dt>02</dt><dd>Programación y resultados</dd></div>
            <div><dt>03</dt><dd>Portal público del torneo</dd></div>
          </dl>
        </aside>
      </section>
      <footer className={styles.footer}><span>ALTTEZ Torneos</span><span>Preparado para móvil, tablet y escritorio</span></footer>
    </main>
  );
}
