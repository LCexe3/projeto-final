// Configuração central do Supabase - CastraPrev
// Este arquivo precisa ser carregado DEPOIS da CDN @supabase/supabase-js e ANTES de auth.js, script.js, veterinario.js e castraprev-supabase.js.
(function () {
    const SUPABASE_URL = 'https://svbtldysioichhkvikkx.supabase.co';

    // Chave pública anon JWT. Pode ficar no front-end. Nunca coloque service_role no navegador.
    const SUPABASE_ANON_PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2YnRsZHlzaW9pY2hoa3Zpa2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MzE5ODAsImV4cCI6MjA5MzUwNzk4MH0.Kc04TX65xBtMtDFsKlHLwl9fhl1XGLd795V1OdB4BgI';

    if (!window.supabase || !window.supabase.createClient) {
        console.error('Biblioteca Supabase não carregou. Verifique se a CDN @supabase/supabase-js está antes do supabaseClient.js no HTML.');
        return;
    }

    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY);
})();
