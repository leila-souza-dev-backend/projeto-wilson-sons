import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import centroImg from "@/assets/wilson-sons-centro.jpg.asset.json";
import logoImg from "@/assets/wilson-sons-logo.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Análise de Materiais - Inteligência Naval" },
      {
        name: "description",
        content:
          "Extraia listas de materiais de documentos PDF do Centro Logístico Wilson Sons com análise automática e saída estruturada em JSON.",
      },
      { property: "og:title", content: "Análise de Materiais - Inteligência Naval" },
      {
        property: "og:description",
        content:
          "Ferramenta de extração de listas de materiais para operações portuárias da Wilson Sons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [dragover, setDragover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setStatus({ type: "error", msg: "Formato inválido. Envie um arquivo PDF." });
      return;
    }
    setFile(f);
    setStatus(null);
    setResult(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(false);
    onFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFiles(e.target.files);
  };

  const remove = () => {
    setFile(null);
    setResult(null);
    setStatus(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1600));
    const mock = {
      documento: file.name,
      cliente: "Wilson Sons",
      centro_logistico: "Operações Portuárias",
      data_analise: new Date().toISOString(),
      materiais: [
        { codigo: "MAT-0421", descricao: "Cabo de aço 12mm", quantidade: 120, unidade: "m" },
        { codigo: "MAT-0518", descricao: "Manilha reta 3/4\"", quantidade: 40, unidade: "un" },
        { codigo: "MAT-0733", descricao: "Corrente galvanizada 10mm", quantidade: 85, unidade: "m" },
        { codigo: "MAT-0902", descricao: "Bóia de amarração", quantidade: 6, unidade: "un" },
      ],
      total_itens: 4,
    };
    setResult(JSON.stringify(mock, null, 2));
    setStatus({ type: "success", msg: "Análise concluída com sucesso." });
    setLoading(false);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <img src={logoImg.url} alt="Wilson Sons" className="logo-img" />
            Wilson Sons
          </div>
          <div className="user-profile">Empresa de Logística</div>
        </div>
      </nav>

      <main className="app-container">
        <section className="body-gallery">
          <div className="gallery-item">
            <img src={centroImg.url} alt="Centro logístico Wilson Sons" />
            <div className="gallery-caption">Centro Logístico Wilson Sons</div>
          </div>
          <div className="gallery-item">
            <img
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&q=80"
              alt="Operações portuárias"
            />
            <div className="gallery-caption">Operações Portuárias</div>
          </div>
        </section>

        <section className="card">
          <header className="card-header">
            <h1>Extração de Lista de Materiais</h1>
          </header>
          <div className="card-body">
            <div
              className={`upload-zone${dragover ? " dragover" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragover(true);
              }}
              onDragLeave={() => setDragover(false)}
              onDrop={handleDrop}
            >
              <svg
                className="upload-icon"
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <h3>Arraste o arquivo PDF para cá</h3>
              <p>
                ou <span className="browse-link">clique para procurar</span> em seu computador
              </p>
              <input
                ref={inputRef}
                id="fileInput"
                type="file"
                accept="application/pdf"
                onChange={handleChange}
              />
            </div>

            {file && (
              <div className="file-info active">
                <div className="file-details">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="file-name">{file.name}</span>
                </div>
                <button className="remove-btn" onClick={remove} aria-label="Remover arquivo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {status && (
              <div className={`status-msg status-${status.type}`}>{status.msg}</div>
            )}

            <button className="submit-btn" disabled={!file || loading} onClick={analyze}>
              {loading ? (
                <>
                  <span className="loader" />
                  Analisando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Iniciar Análise de Materiais
                </>
              )}
            </button>

            {result && (
              <div className="result-area">
                <div className="result-header">
                  <h3>Dados Estruturados (JSON)</h3>
                  <button className="copy-btn" onClick={copy}>
                    {copied ? "Copiado!" : "Copiar JSON"}
                  </button>
                </div>
                <pre className="json-output">{result}</pre>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
