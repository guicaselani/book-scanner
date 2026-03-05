import { useState, useRef, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0a06; min-height: 100vh; font-family: 'DM Mono', monospace; }
  .app { min-height: 100vh; background: #0d0a06; display: flex; flex-direction: column; align-items: center; padding: 40px 20px 60px; color: #e8d5b0; }
  .header { text-align: center; margin-bottom: 40px; }
  .header-label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #8b6a3a; margin-bottom: 12px; }
  .header h1 { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem,5vw,3rem); font-weight: 400; color: #e8d5b0; line-height: 1.2; }
  .header h1 em { font-style: italic; color: #c9a05a; }
  .header-line { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #8b6a3a, transparent); margin: 16px auto 0; }
  .upload-zone { width: 100%; max-width: 520px; border: 1px dashed #3a2d1a; border-radius: 4px; padding: 48px 32px; text-align: center; cursor: pointer; transition: all 0.3s; }
  .upload-zone:hover, .upload-zone.drag-over { border-color: #8b6a3a; background: rgba(139,90,43,0.05); }
  .upload-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.5; }
  .upload-text { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #b89060; margin-bottom: 8px; }
  .upload-sub { font-size: 11px; letter-spacing: 0.15em; color: #5a4530; text-transform: uppercase; }
  .library-btn { margin-top: 20px; background: none; border: 1px solid #2a1f0f; border-radius: 2px; color: #5a4530; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; padding: 10px 20px; transition: all 0.2s; }
  .library-btn:hover { border-color: #8b6a3a; color: #c9a05a; }
  .library-count-badge { display: inline-block; background: #8b6a3a; color: #0d0a06; border-radius: 10px; font-size: 9px; padding: 1px 7px; margin-left: 8px; font-weight: bold; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.2s; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: #0d0a06; border: 1px solid #2a1f0f; border-radius: 8px 8px 0 0; width: 100%; max-width: 520px; max-height: 80vh; overflow-y: auto; padding: 24px 20px 40px; animation: slideUp 0.25s ease; }
  @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .modal-title { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #8b6a3a; }
  .modal-close { background: none; border: none; color: #5a4530; cursor: pointer; font-size: 20px; line-height: 1; padding: 2px 6px; }
  .modal-close:hover { color: #e8d5b0; }
  .empty-list { text-align: center; color: #3a2d1a; font-size: 12px; padding: 32px 0; font-style: italic; }
  .wrap { width: 100%; max-width: 520px; display: flex; flex-direction: column; gap: 14px; }
  .preview-image-wrap { border-radius: 4px; overflow: hidden; border: 1px solid #2a1f0f; }
  .preview-image-wrap img { width: 100%; max-height: 300px; object-fit: contain; background: #0a0805; display: block; }
  .actions { display: flex; gap: 10px; }
  .btn { flex: 1; padding: 13px 20px; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; transition: all 0.2s; border-radius: 2px; }
  .btn-primary { background: #8b6a3a; color: #0d0a06; }
  .btn-primary:hover:not(:disabled) { background: #c9a05a; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-ghost { background: transparent; border: 1px solid #3a2d1a; color: #8b6a3a; flex: 0 0 auto; }
  .btn-ghost:hover { border-color: #8b6a3a; color: #c9a05a; }
  .loading-wrap { width: 100%; max-width: 520px; padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .spinner { width: 36px; height: 36px; border: 1px solid #3a2d1a; border-top-color: #8b6a3a; border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 11px; letter-spacing: 0.25em; color: #5a4530; text-transform: uppercase; }
  .result-card { border: 1px solid #2a1f0f; border-radius: 4px; overflow: hidden; animation: fadeUp 0.5s ease forwards; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .result-header { background: rgba(139,90,43,0.08); border-bottom: 1px solid #2a1f0f; padding: 12px 24px; display: flex; align-items: center; gap: 10px; }
  .result-dot { width: 6px; height: 6px; border-radius: 50%; background: #8b6a3a; }
  .result-label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #8b6a3a; }
  .result-body { padding: 28px 24px; }
  .field-key { font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase; color: #5a4530; margin-bottom: 8px; }
  .field-value { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #e8d5b0; line-height: 1.3; margin-bottom: 24px; }
  .field-value.author { font-size: 1rem; font-style: italic; color: #c9a05a; margin-bottom: 0; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, #2a1f0f, transparent); margin: 0 0 24px; }
  .extra-text { font-size: 12px; line-height: 1.7; color: #6a5535; font-style: italic; margin-top: 20px; }
  .result-actions { padding: 16px 24px; border-top: 1px solid #2a1f0f; display: flex; gap: 10px; }
  .error-box { border: 1px solid #5a1a1a; border-radius: 4px; padding: 14px 18px; background: rgba(90,26,26,0.1); font-size: 12px; color: #c06060; line-height: 1.6; word-break: break-word; }
  .debug { font-size: 10px; color: #5a4530; margin-top: 6px; font-family: monospace; }
  .saved-section { width: 100%; max-width: 520px; margin-top: 36px; }
  .saved-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .saved-title { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #5a4530; white-space: nowrap; }
  .saved-line { flex: 1; height: 1px; background: #1a1208; }
  .saved-count { font-size: 10px; color: #8b6a3a; }
  .saved-item { border: 1px solid #1a1208; border-radius: 2px; padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
  .saved-item-title { font-family: 'Playfair Display', serif; font-size: 0.9rem; color: #c9a05a; }
  .saved-item-author { font-size: 11px; color: #5a4530; margin-top: 2px; }
  .rm-btn { background: none; border: none; color: #3a2d1a; cursor: pointer; font-size: 18px; line-height: 1; padding: 2px 6px; }
  .rm-btn:hover { color: #c06060; }
  .copy-btn { background: none; border: 1px solid #2a1f0f; border-radius: 2px; color: #5a4530; cursor: pointer; font-size: 10px; font-family: 'DM Mono', monospace; letter-spacing: 0.1em; padding: 4px 8px; transition: all 0.2s; white-space: nowrap; }
  .copy-btn:hover { border-color: #8b6a3a; color: #c9a05a; }
  .copy-btn.copied { border-color: #3a6a3a; color: #6a9a6a; }
  .saved-item-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
`;

// Compress image aggressively to keep payload tiny for the proxy
function compressToBase64(dataUrl) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      // Keep max 200px — enough for Claude to read text, tiny for proxy
      const MAX = 200;
      let w = img.width, h = img.height;
      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
      else { w = Math.round(w * MAX / h); h = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      // Quality 0.4 → very small file
      const out = canvas.toDataURL("image/jpeg", 0.4);
      console.log("[BookScanner] compressed size (bytes approx):", Math.round(out.length * 0.75));
      resolve(out.split(",")[1]);
    };
    img.src = dataUrl;
  });
}

export default function BookScanner() {
  const [image, setImage] = useState(null);
  const [b64, setB64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [library, setLibrary] = useState([]);
  const [saved, setSaved] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileRef = useRef();

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null); setError(null); setSaved(false); setDebugInfo(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setImage(dataUrl);
      const compressed = await compressToBase64(dataUrl);
      setB64(compressed);
      setDebugInfo(`Imagem comprimida: ~${Math.round(compressed.length * 0.75 / 1024)}KB`);
    };
    reader.readAsDataURL(file);
  }, []);

  const analyze = async () => {
    if (!b64) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: b64 }
          },
          {
            type: "text",
            text: `Look at this book image and identify it. Reply ONLY with valid JSON (no markdown):
{"title":"Book Title","author":"Author Name","extra":"publisher or year if visible, else empty string"}
Use "Not identified" if title unknown, "Not found" if author unknown.`
          }
        ]
      }]
    };

    console.log("[BookScanner] payload size (bytes approx):", JSON.stringify(body).length);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      let raw = "";
      try { raw = await res.text(); } catch (e) { throw new Error("Falha ao ler resposta: " + e.message); }

      console.log("[BookScanner] raw response:", raw.slice(0, 300));

      let data;
      try { data = JSON.parse(raw); }
      catch { throw new Error(`JSON inválido (status ${res.status}): ${raw.slice(0, 200)}`); }

      if (!res.ok) throw new Error(`API ${res.status}: ${data?.error?.message || JSON.stringify(data).slice(0, 150)}`);

      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      try { setResult(JSON.parse(clean)); }
      catch { setResult({ title: clean || "Sem resposta", author: "—", extra: "" }); }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBook = (book) => {
    const text = `${book.title} — ${book.author}`;
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(book.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const reset = () => { setImage(null); setB64(null); setResult(null); setError(null); setSaved(false); setDebugInfo(null); };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-label">Scanner de Livros</div>
          <h1>Leia <em>qualquer</em> livro<br />com um print</h1>
          <div className="header-line" />
        </div>

        {!image && (
          <div
            className={`upload-zone ${dragOver ? "drag-over" : ""}`}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon">📖</div>
            <div className="upload-text">Arraste ou clique para enviar</div>
            <div className="upload-sub">Foto da capa, lombada ou página</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => processFile(e.target.files[0])} />
          </div>
          {library.length > 0 && (
            <button className="library-btn" onClick={() => setShowLibrary(true)}>
              Minha lista <span className="library-count-badge">{library.length}</span>
            </button>
          )}
        )}

        {showLibrary && (
          <div className="modal-overlay" onClick={(e) => { if (e.target.className === "modal-overlay") setShowLibrary(false); }}>
            <div className="modal">
              <div className="modal-header">
                <div className="modal-title">Minha lista de livros</div>
                <button className="modal-close" onClick={() => setShowLibrary(false)}>×</button>
              </div>
              {library.length === 0 ? (
                <div className="empty-list">Nenhum livro salvo ainda.</div>
              ) : library.map(book => (
                <div key={book.id} className="saved-item">
                  <div>
                    <div className="saved-item-title">{book.title}</div>
                    <div className="saved-item-author">{book.author}</div>
                  </div>
                  <div className="saved-item-actions">
                    <button className={`copy-btn${copiedId === book.id ? " copied" : ""}`} onClick={() => copyBook(book)}>
                      {copiedId === book.id ? "Copiado" : "copiar"}
                    </button>
                    <button className="rm-btn" onClick={() => setLibrary(p => p.filter(b => b.id !== book.id))}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {image && !loading && !result && (
          <div className="wrap">
            <div className="preview-image-wrap">
              <img src={image} alt="Livro" />
            </div>
            {debugInfo && <div className="debug">📐 {debugInfo}</div>}
            {error && (
              <div className="error-box">
                ⚠️ {error}
                <div className="debug">Veja o console do navegador (F12) para mais detalhes</div>
              </div>
            )}
            <div className="actions">
              <button className="btn btn-primary" onClick={analyze} disabled={!b64}>
                Identificar Livro
              </button>
              <button className="btn btn-ghost" onClick={reset}>Trocar</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-wrap">
            <div className="spinner" />
            <div className="loading-text">Lendo a capa...</div>
          </div>
        )}

        {result && (
          <div className="wrap">
            <div className="preview-image-wrap">
              <img src={image} alt="Livro" style={{ maxHeight: 160 }} />
            </div>
            <div className="result-card">
              <div className="result-header">
                <div className="result-dot" />
                <div className="result-label">Livro identificado</div>
              </div>
              <div className="result-body">
                <div className="field-key">Título</div>
                <div className="field-value">{result.title}</div>
                <div className="divider" />
                <div className="field-key">Autor</div>
                <div className="field-value author">{result.author}</div>
                {result.extra && <div className="extra-text">{result.extra}</div>}
              </div>
              <div className="result-actions">
                <button className="btn btn-primary" disabled={saved}
                  onClick={() => { setLibrary(p => [...p, { ...result, id: Date.now() }]); setSaved(true); }}>
                  {saved ? "Salvo" : "Salvar na lista"}
                </button>
                <button className="btn btn-ghost" onClick={reset}>Nova leitura</button>
              </div>
            </div>
          </div>
        )}

        {library.length > 0 && (
          <div className="saved-section">
            <div className="saved-header">
              <div className="saved-title">Minha lista</div>
              <div className="saved-line" />
              <div className="saved-count">{library.length} livro{library.length !== 1 ? "s" : ""}</div>
            </div>
            {library.map(book => (
              <div key={book.id} className="saved-item">
                <div>
                  <div className="saved-item-title">{book.title}</div>
                  <div className="saved-item-author">{book.author}</div>
                </div>
                <div className="saved-item-actions">
                  <button className="copy-btn" onClick={() => copyBook(book)}>
                    {copiedId === book.id ? "Copiado" : "copiar"}
                  </button>
                  <button className="rm-btn" onClick={() => setLibrary(p => p.filter(b => b.id !== book.id))}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
