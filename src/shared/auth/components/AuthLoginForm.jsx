import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { useAuth } from "../useAuth";
import { getPostLoginRedirect, getRedirectParam } from "../authRedirects";
import { validateLoginForm } from "../authValidation";
import { AuthFormField, mkAuthInput } from "./AuthFormField";
import PasswordInput from "./PasswordInput";
import GoogleLoginButton from "./GoogleLoginButton";

export default function AuthLoginForm({ onRegisterClick, onRecoverClick }) {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const alertRef = useRef(null);
  const redirectPath = searchParams.get("redirect");
  const destination = "ALTTEZ Torneos";

  useEffect(() => {
    if (msg) alertRef.current?.focus();
  }, [msg]);

  const update = (key, value) => { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); };
  const handleLogin = async () => {
    const { errors: nextErrors, cleanData } = validateLoginForm(form);
    setErrors(nextErrors);
    if (!cleanData) return;
    setLoading(true); setMsg(null);
    const { error, user, profile } = await auth.signIn(cleanData.email, cleanData.password);
    setLoading(false);
    if (error) { setMsg({ type: "error", text: error }); return; }
    router.replace(getPostLoginRedirect({ redirectPath: getRedirectParam() || searchParams.get("redirect"), currentPath: pathname, userMetadata: user?.user_metadata, profile }));
  };
  const googleRedirect = typeof window !== "undefined" ? `${window.location.origin}${redirectPath?.startsWith("/torneos") ? redirectPath : "/torneos"}` : "";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!loading) handleLogin();
  };

  return <section className="auth-login" aria-labelledby="login-title">
    <button onClick={() => router.push("/")} type="button" className="auth-login__back"><ArrowLeft size={15} />Volver a ALTTEZ</button>
    <div className="auth-login__eyebrow"><LockKeyhole size={15} /><span>Acceso protegido</span></div>
    <h1 id="login-title">Continúa tu operación.</h1>
    <p className="auth-login__intro">Identifícate para acceder a {destination}. Tu destino se conservará después del ingreso.</p>
    {msg && <div ref={alertRef} tabIndex={-1} role="alert" className="auth-login__alert">{msg.text}<button type="button" onClick={() => setMsg(null)} aria-label="Cerrar mensaje">×</button></div>}
    <form className="auth-login__form" onSubmit={handleSubmit} noValidate aria-busy={loading}>
      <AuthFormField label="Correo electrónico" error={errors.email}><input style={mkAuthInput(!!errors.email)} value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="nombre@organizacion.com" maxLength={80} type="email" autoComplete="email" /></AuthFormField>
      <AuthFormField label="Contraseña" error={errors.password}><PasswordInput id="login-password" value={form.password} onChange={(event) => update("password", event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleLogin()} placeholder="Tu contraseña" hasError={!!errors.password} autoComplete="current-password" /></AuthFormField>
      <button type="button" onClick={onRecoverClick} className="auth-login__recover">Recuperar acceso</button>
      <button type="submit" disabled={loading} className="auth-login__submit"><span aria-live="polite">{loading ? "Verificando acceso..." : `Ingresar a ${destination}`}</span>{!loading && <ArrowRight size={17} />}</button>
    </form>
    <div className="auth-login__separator"><span>o continúa con</span></div>
    <GoogleLoginButton redirectTo={googleRedirect} disabled={loading} />
    <p className="auth-login__register">¿Tu organización aún no usa ALTTEZ? <button type="button" onClick={onRegisterClick}>Crear una cuenta</button></p>
    <style>{`
      .auth-login{width:100%;color:#111315}.auth-login__back{display:flex;align-items:center;gap:8px;margin:0 0 64px;padding:0;border:0;background:transparent;color:#5E6469;font:600 12px/1 var(--font-inter),sans-serif;cursor:pointer;transition:color 160ms cubic-bezier(.22,1,.36,1)}.auth-login__back:hover{color:#111315}.auth-login__eyebrow{display:flex;align-items:center;gap:9px;margin-bottom:18px;color:#9B5E31;font-size:11px;font-weight:650;letter-spacing:.08em;text-transform:uppercase}.auth-login h1{margin:0;font:650 clamp(34px,4vw,52px)/1 var(--font-sora),sans-serif;letter-spacing:-.05em}.auth-login__intro{max-width:52ch;margin:18px 0 36px;color:#62686D;font-size:14px;line-height:1.65}.auth-login__alert{margin-bottom:24px;padding:13px 14px;border:1px solid rgba(185,59,59,.24);border-radius:8px;background:#F7EAEA;color:#9D3232;font-size:12px;font-weight:600;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.auth-login__alert:focus{outline:3px solid rgba(157,50,50,.18);outline-offset:2px}.auth-login__alert button{border:0;background:transparent;color:inherit;font-size:17px;line-height:12px;cursor:pointer}.auth-login__form{position:relative}.auth-login__recover{display:block;margin:-5px 0 22px auto;padding:4px 0;border:0;background:transparent;color:#8A542E;font-size:11px;font-weight:650;cursor:pointer}.auth-login__submit{width:100%;min-height:52px;padding:0 16px 0 20px;border:1px solid #111315;border-radius:8px;background:#111315;color:#F5F7F8;display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:650;cursor:pointer;transition:transform 160ms cubic-bezier(.22,1,.36,1),background-color 160ms cubic-bezier(.22,1,.36,1)}.auth-login__submit:hover{background:#202428}.auth-login__submit:active{transform:scale(.985)}.auth-login__submit:disabled{cursor:wait;opacity:.58}.auth-login__separator{display:flex;align-items:center;gap:14px;margin:28px 0 20px;color:#8B8F92;font-size:10px}.auth-login__separator:before,.auth-login__separator:after{content:"";height:1px;flex:1;background:#D5D1C9}.auth-login__register{margin:30px 0 0;color:#696E72;text-align:center;font-size:11px}.auth-login__register button{padding:0;border:0;background:transparent;color:#8A542E;font:650 inherit;cursor:pointer}
      .auth-login input{min-height:50px!important;background:#F8F7F3!important;border-color:#CDC9C1!important;border-radius:8px!important;box-shadow:none!important}.auth-login label{text-transform:none!important;letter-spacing:0!important;color:#41464A!important;font-size:12px!important}.auth-login [class*="rounded-xl"]{border-radius:8px!important;box-shadow:none!important}@media(max-width:880px){.auth-login__back{margin-bottom:44px}.auth-login h1{font-size:38px}}@media(prefers-reduced-motion:reduce){.auth-login *{transition-duration:.01ms!important}}
    `}</style>
  </section>;
}
