import { Component } from "react";
import { PALETTE as C } from "../tokens/palette";
import { AlertCircle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#0F0F0E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: 480,
              padding: "48px 32px",
              borderRadius: 24,
              border: "1px solid rgba(216, 154, 43, 0.15)",
              background: "rgba(26, 26, 24, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "rgba(216, 154, 43, 0.1)",
                border: "1px solid rgba(216, 154, 43, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                color: "#D89A2B",
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#FFF",
                marginBottom: 12,
                letterSpacing: "-0.02em",
              }}
            >
              Hemos tenido un contratiempo
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Algo no salió como esperábamos. No te preocupes, tus datos locales suelen estar a salvo.
            </p>
            
            <div
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                color: "#D89A2B",
                background: "rgba(216, 154, 43, 0.05)",
                padding: "12px 16px",
                borderRadius: 12,
                marginBottom: 32,
                border: "1px solid rgba(216, 154, 43, 0.1)",
                wordBreak: "break-word",
                opacity: 0.8,
              }}
            >
              {this.state.error?.message || "Error de ejecución inesperado"}
            </div>

            <button
              onClick={this.handleRetry}
              style={{
                background: "#D89A2B",
                color: "#FFF",
                border: "none",
                padding: "14px 32px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                transition: "all 0.2s ease",
              }}
            >
              <RefreshCw size={18} />
              Reintentar ahora
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
