// ── Firebase Configuration ────────────────────────────────────
// INSTRUÇÕES PARA CONFIGURAR:
//
// 1. Acesse https://console.firebase.google.com
// 2. Clique em "Adicionar projeto" → dê um nome (ex: PoolGuyPro)
// 3. Vá em "Build" → "Firestore Database" → Criar banco → Modo de teste
// 4. Vá em "Configurações do projeto" (ícone ⚙️) → "Seus apps" → Adicionar app Web (</>)
// 5. Copie o objeto firebaseConfig e substitua os valores abaixo:

window.FIREBASE_CONFIG = {
  apiKey:            "COLE_SUA_API_KEY_AQUI",
  authDomain:        "seu-projeto.firebaseapp.com",
  projectId:         "seu-projeto-id",
  storageBucket:     "seu-projeto.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:0000000000000000000000",
};

// ────────────────────────────────────────────────────────────────
// Após preencher, faça o commit e push para o GitHub.
// O Vercel fará o deploy automaticamente.
