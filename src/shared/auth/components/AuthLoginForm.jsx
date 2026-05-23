import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, ArrowLeft } from "lucide-react";
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

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleLogin = async () => {
    const { errors: errs, cleanData } = validateLoginForm(form);
    setErrors(errs);
    if (!cleanData) return;

    setLoading(true);
    setMsg(null);
    const { error, user, profile } = await auth.signIn(cleanData.email, cleanData.password);
    setLoading(false);
    if (error) {
      setMsg({ type: "error", text: error });
      return;
    }
    const currentPath = pathname;
    router.replace(getPostLoginRedirect({
      redirectPath: getRedirectParam() || searchParams.get('redirect'),
      currentPath,
      userMetadata: user?.user_metadata,
      profile: profile
    }));
  };

  const googleRedirect = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="relative w-full max-w-[440px] mx-auto font-sans">
      <button
        onClick={() => router.push("/")}
        type="button"
        className="absolute -top-12 left-0 flex items-center gap-2 text-xs font-bold text-[#CE8946] hover:text-[#D8A06B] transition-colors bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={14} strokeWidth={3} />
        Volver al ecosistema
      </button>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-[24px] p-8 sm:p-10 shadow-xl border border-[#EDE8D0]"
      >
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="w-14 h-14 rounded-[14px] bg-[#F6F1EA] border border-[#EDE8D0] flex items-center justify-center text-[#CE8946] mb-2">
            <LogIn size={24} />
          </div>
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-[#1F1F1D] leading-tight">
              Iniciar sesión
            </h1>
            <p className="text-xs text-[#1F1F1D]/60 mt-1.5 font-medium">
              Ingresa tus credenciales para continuar
            </p>
          </div>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl mb-6 text-xs font-bold border ${msg.type === "error" ? "bg-[#D95C5C]/10 text-[#D95C5C] border-[#D95C5C]/20" : "bg-[#2FA56F]/10 text-[#2FA56F] border-[#2FA56F]/20"}`}>
            {msg.text}
          </div>
        )}

        <AuthFormField label="Correo electrónico" error={errors.email}>
          <input
            style={mkAuthInput(!!errors.email)}
            value={form.email}
            onChange={e => update("email", e.target.value)}
            placeholder="tu@email.com"
            maxLength={80}
            type="email"
            autoComplete="email"
            className="focus:border-[#CE8946] focus:ring-1 focus:ring-[#CE8946]"
          />
        </AuthFormField>

        <AuthFormField label="Contraseña" error={errors.password}>
          <PasswordInput
            id="login-password"
            value={form.password}
            onChange={e => update("password", e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Tu contraseña"
            hasError={!!errors.password}
            autoComplete="current-password"
          />
        </AuthFormField>

        <div
          onClick={onRecoverClick}
          className="text-right -mt-1 mb-6 text-[11px] text-[#CE8946] font-bold cursor-pointer hover:text-[#D8A06B] transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#CE8946] hover:bg-[#D8A06B] disabled:bg-[#EDE8D0] disabled:text-[#1F1F1D]/40 text-white min-h-[52px] rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-md hover:shadow-lg disabled:shadow-none mb-6 flex items-center justify-center"
        >
          {loading ? "Iniciando..." : "Ingresar"}
        </button>

        {/* Separador */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-[#EDE8D0]" />
          <span className="text-[10px] text-[#1F1F1D]/40 font-bold uppercase tracking-wider">O</span>
          <div className="flex-1 h-[1px] bg-[#EDE8D0]" />
        </div>

        <GoogleLoginButton redirectTo={googleRedirect} disabled={loading} />

        <div
          onClick={onRegisterClick}
          className="mt-8 text-center text-xs text-[#1F1F1D]/60 cursor-pointer hover:text-[#1F1F1D] transition-colors"
        >
          No tengo cuenta.{" "}
          <span className="text-[#CE8946] font-bold hover:text-[#D8A06B]">Crear cuenta</span>
        </div>
      </motion.div>
    </div>
  );
}
