const CHAVE_LOGADO = 'castraprev_logado';
const CHAVE_USUARIO = 'castraprev_usuario';
const CHAVE_USUARIO_EMAIL = 'castraprev_usuario_email';
const CHAVE_USUARIO_APELIDO = 'castraprev_usuario_apelido';
const CHAVE_TIPO_USUARIO = 'castraprev_tipo_usuario';
const CHAVE_USUARIOS = 'castraprev_usuarios';
const CHAVE_USUARIO_PERFIL = 'castraprev_usuario_perfil';
const CHAVE_VETERINARIO_SESSAO = 'castraprev_veterinario_sessao';

const sbAuth = () => window.supabaseClient || null;

function perfilDbParaLocal(perfil = {}, user = null) {
    const email = perfil.email || user?.email || '';
    const nome = perfil.nome || user?.user_metadata?.nome || email || 'Usuário CastraPrev';
    const apelido = perfil.apelido || user?.user_metadata?.apelido || obterPrimeiroNome(nome);

    return {
        id: perfil.id || user?.id || '',
        nome,
        apelido,
        email,
        telefone: perfil.telefone || '',
        cep: perfil.cep || '',
        endereco: perfil.endereco || '',
        numero: perfil.numero || '',
        bairro: perfil.bairro || '',
        cidade: perfil.cidade || '',
        uf: perfil.uf || '',
        complemento: perfil.complemento || '',
        fotoPerfil: perfil.foto_perfil || perfil.fotoPerfil || '',
        foto_perfil: perfil.foto_perfil || perfil.fotoPerfil || '',
        tipo: perfil.tipo || user?.user_metadata?.tipo || 'tutor',
        criadoEm: perfil.created_at || '',
        atualizadoEm: perfil.updated_at || ''
    };
}

function usuarioLocalParaDb(usuario = {}) {
    return {
        id: usuario.id,
        nome: usuario.nome,
        apelido: usuario.apelido || obterPrimeiroNome(usuario.nome),
        email: usuario.email,
        telefone: usuario.telefone || '',
        cep: usuario.cep || '',
        endereco: usuario.endereco || '',
        numero: usuario.numero || '',
        bairro: usuario.bairro || '',
        cidade: usuario.cidade || '',
        uf: usuario.uf || '',
        complemento: usuario.complemento || '',
        foto_perfil: usuario.fotoPerfil || usuario.foto_perfil || '',
        tipo: usuario.tipo || 'tutor'
    };
}

function salvarPerfilLocal(usuario) {
    if (!usuario) return;
    try {
        localStorage.setItem(CHAVE_USUARIO_PERFIL, JSON.stringify(usuario));
        localStorage.setItem(CHAVE_USUARIOS, JSON.stringify([usuario]));
    } catch (erro) {
        console.warn('Não foi possível salvar o cache local do perfil:', erro);
    }
}

function carregarUsuarios() {
    const perfil = pegarUsuarioLogadoCompleto();
    if (perfil) return [perfil];

    try {
        const usuariosSalvos = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
        return Array.isArray(usuariosSalvos) ? usuariosSalvos : [];
    } catch (erro) {
        console.warn('Não foi possível carregar os usuários salvos:', erro);
        return [];
    }
}

function salvarUsuarios(usuarios) {
    try {
        localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
        if (Array.isArray(usuarios) && usuarios[0]) salvarPerfilLocal(usuarios[0]);
        return true;
    } catch (erro) {
        console.warn('Não foi possível salvar os usuários:', erro);
        return false;
    }
}

function estaLogado() {
    return localStorage.getItem(CHAVE_LOGADO) === 'true';
}

function pegarUsuario() {
    return localStorage.getItem(CHAVE_USUARIO) || '';
}

function pegarApelidoUsuario() {
    return localStorage.getItem(CHAVE_USUARIO_APELIDO) || '';
}

function obterPrimeiroNome(nome = '') {
    return String(nome).trim().split(/\s+/)[0] || 'Usuário';
}

function obterApelidoUsuario(usuario = null) {
    return (usuario?.apelido || pegarApelidoUsuario() || obterPrimeiroNome(usuario?.nome || pegarUsuario())).trim();
}

function pegarEmailUsuario() {
    return localStorage.getItem(CHAVE_USUARIO_EMAIL) || '';
}

function pegarTipoUsuario() {
    return localStorage.getItem(CHAVE_TIPO_USUARIO) || 'tutor';
}

function nomeTipoUsuario(tipo = pegarTipoUsuario()) {
    return tipo === 'veterinario' ? 'Veterinário' : 'Tutor';
}

function salvarSessao(nome, tipo, email = '', apelido = '') {
    const apelidoFinal = (apelido || obterPrimeiroNome(nome)).trim();

    localStorage.setItem(CHAVE_LOGADO, 'true');
    localStorage.setItem(CHAVE_USUARIO, nome);
    localStorage.setItem(CHAVE_USUARIO_APELIDO, apelidoFinal);
    localStorage.setItem(CHAVE_TIPO_USUARIO, tipo || 'tutor');

    if (email) localStorage.setItem(CHAVE_USUARIO_EMAIL, email);
}

function limparSessaoLocal() {
    localStorage.removeItem(CHAVE_LOGADO);
    localStorage.removeItem(CHAVE_USUARIO);
    localStorage.removeItem(CHAVE_USUARIO_EMAIL);
    localStorage.removeItem(CHAVE_USUARIO_APELIDO);
    localStorage.removeItem(CHAVE_TIPO_USUARIO);
    localStorage.removeItem(CHAVE_USUARIO_PERFIL);
    localStorage.removeItem(CHAVE_VETERINARIO_SESSAO);
}


async function sair() {
    try {
        if (sbAuth()) await sbAuth().auth.signOut();
    } catch (erro) {
        console.warn('Erro ao sair do Supabase:', erro);
    }
    limparSessaoLocal();
    window.location.href = 'index.html';
}

function limparTexto(texto = '') {
    return String(texto)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function pegarPaginaAtual() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

function obterMarkupAvatar(usuario, classeExtra = '') {
    const classe = classeExtra ? ` ${classeExtra}` : '';
    const nome = limparTexto(usuario?.nome || obterApelidoUsuario(usuario) || 'Usuário CastraPrev');
    const foto = usuario?.fotoPerfil || usuario?.foto_perfil || '';

    if (foto) {
        return `<span class="avatar-box${classe}"><img src="${foto}" alt="Foto de perfil de ${nome}"></span>`;
    }

    return `<span class="avatar-box avatar-fallback${classe}"><i class="fas fa-user"></i></span>`;
}

function atualizarPreviewAvatarPerfil(fotoPerfil = '', nome = '') {
    ['perfil-resumo-avatar', 'perfil-foto-preview'].forEach(id => {
        const avatar = document.getElementById(id);
        if (avatar) avatar.innerHTML = obterMarkupAvatar({ fotoPerfil, nome });
    });
}

function atualizarPreviewFotoCadastro(fotoPerfil = '') {
    const preview = document.getElementById('cadastro-foto-preview');
    if (!preview) return;

    if (fotoPerfil) preview.innerHTML = `<img src="${fotoPerfil}" alt="Prévia da foto de perfil">`;
    else preview.innerHTML = '<i class="fas fa-user"></i>';
}

function converterImagemPerfilParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
        if (!arquivo) return resolve('');
        if (!arquivo.type.startsWith('image/')) return reject(new Error('arquivo-invalido'));

        const leitor = new FileReader();
        leitor.onload = function (evento) {
            const imagemOriginal = evento.target?.result || '';
            const imagem = new Image();

            imagem.onload = function () {
                const tamanhoMaximo = 520;
                const proporcao = Math.min(1, tamanhoMaximo / Math.max(imagem.width, imagem.height));
                const largura = Math.max(1, Math.round(imagem.width * proporcao));
                const altura = Math.max(1, Math.round(imagem.height * proporcao));
                const canvas = document.createElement('canvas');
                canvas.width = largura;
                canvas.height = altura;
                const contexto = canvas.getContext('2d');
                contexto.drawImage(imagem, 0, 0, largura, altura);
                resolve(canvas.toDataURL('image/jpeg', 0.86));
            };
            imagem.onerror = function () { resolve(imagemOriginal); };
            imagem.src = imagemOriginal;
        };
        leitor.onerror = function () { reject(new Error('erro-leitura')); };
        leitor.readAsDataURL(arquivo);
    });
}

function pegarUsuarioLogadoCompleto() {
    try {
        const perfil = JSON.parse(localStorage.getItem(CHAVE_USUARIO_PERFIL));
        if (perfil && typeof perfil === 'object') return perfil;
    } catch (erro) {}

    const emailSessao = pegarEmailUsuario().toLowerCase();
    const nomeSessao = pegarUsuario().toLowerCase();

    try {
        const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
        let usuario = null;
        if (emailSessao) usuario = usuarios.find(item => (item.email || '').toLowerCase() === emailSessao);
        if (!usuario && nomeSessao) usuario = usuarios.find(item => (item.nome || '').toLowerCase() === nomeSessao);
        return usuario || null;
    } catch (erro) {
        return null;
    }
}

async function obterUsuarioSupabase() {
    if (!sbAuth()) return null;
    const { data, error } = await sbAuth().auth.getUser();
    if (error) return null;
    return data?.user || null;
}

async function carregarPerfilSupabase(userId) {
    if (!sbAuth() || !userId) return null;
    const { data, error } = await sbAuth().from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
        console.warn('Erro ao carregar perfil:', error.message);
        return null;
    }
    return data || null;
}

async function carregarVeterinarioSupabase(userId) {
    if (!sbAuth() || !userId) return null;
    const { data, error } = await sbAuth()
        .from('veterinarians')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true)
        .maybeSingle();

    if (error) {
        console.warn('Erro ao carregar veterinário:', error.message);
        return null;
    }

    return data || null;
}

function veterinarioDbParaLocal(veterinario = {}, user = null, perfil = null) {
    const nome = veterinario.nome || perfil?.nome || user?.user_metadata?.nome || user?.email || 'Veterinário CastraPrev';
    return {
        id: user?.id || veterinario.user_id || perfil?.id || '',
        veterinarioId: veterinario.id || '',
        nome,
        apelido: perfil?.apelido || user?.user_metadata?.apelido || obterPrimeiroNome(nome),
        email: veterinario.email || perfil?.email || user?.email || '',
        telefone: veterinario.telefone || perfil?.telefone || '',
        cep: perfil?.cep || '',
        endereco: perfil?.endereco || '',
        numero: perfil?.numero || '',
        bairro: perfil?.bairro || '',
        cidade: veterinario.cidade || perfil?.cidade || '',
        uf: veterinario.uf || perfil?.uf || '',
        complemento: perfil?.complemento || '',
        fotoPerfil: perfil?.foto_perfil || perfil?.fotoPerfil || '',
        foto_perfil: perfil?.foto_perfil || perfil?.fotoPerfil || '',
        tipo: 'veterinario',
        crmv: veterinario.crmv || '',
        clinica: veterinario.clinica || '',
        criadoEm: perfil?.created_at || veterinario.created_at || '',
        atualizadoEm: perfil?.updated_at || veterinario.updated_at || ''
    };
}

async function garantirPerfilVeterinarioSupabase(user, veterinario, perfilAtual = null) {
    if (!sbAuth() || !user || !veterinario) return perfilAtual;

    const perfilVeterinario = {
        id: user.id,
        nome: veterinario.nome || perfilAtual?.nome || user.email || 'Veterinário CastraPrev',
        apelido: perfilAtual?.apelido || obterPrimeiroNome(veterinario.nome || user.email),
        email: veterinario.email || perfilAtual?.email || user.email || '',
        telefone: veterinario.telefone || perfilAtual?.telefone || '',
        cep: perfilAtual?.cep || '',
        endereco: perfilAtual?.endereco || '',
        numero: perfilAtual?.numero || '',
        bairro: perfilAtual?.bairro || '',
        cidade: veterinario.cidade || perfilAtual?.cidade || '',
        uf: veterinario.uf || perfilAtual?.uf || '',
        complemento: perfilAtual?.complemento || '',
        foto_perfil: perfilAtual?.foto_perfil || '',
        tipo: 'veterinario'
    };

    const { data, error } = await sbAuth()
        .from('profiles')
        .upsert(perfilVeterinario, { onConflict: 'id' })
        .select()
        .maybeSingle();

    if (error) {
        console.warn('Não foi possível sincronizar o perfil veterinário:', error.message);
        return perfilAtual || perfilVeterinario;
    }

    return data || perfilAtual || perfilVeterinario;
}

async function sincronizarSessaoSupabase() {
    const user = await obterUsuarioSupabase();
    if (!user) {
        limparSessaoLocal();
        return null;
    }

    let perfil = await carregarPerfilSupabase(user.id);
    const veterinario = await carregarVeterinarioSupabase(user.id);

    if (veterinario) {
        perfil = await garantirPerfilVeterinarioSupabase(user, veterinario, perfil);
        const usuarioLocal = veterinarioDbParaLocal(veterinario, user, perfil);
        salvarSessao(usuarioLocal.nome, 'veterinario', usuarioLocal.email, usuarioLocal.apelido);
        salvarPerfilLocal(usuarioLocal);
        localStorage.setItem(CHAVE_VETERINARIO_SESSAO, JSON.stringify({
            id: usuarioLocal.veterinarioId,
            userId: usuarioLocal.id,
            nome: usuarioLocal.nome,
            email: usuarioLocal.email,
            crmv: usuarioLocal.crmv,
            clinica: usuarioLocal.clinica
        }));
        return usuarioLocal;
    }

    if (!perfil) {
        const perfilMinimo = {
            id: user.id,
            nome: user.user_metadata?.nome || user.email || 'Usuário CastraPrev',
            apelido: user.user_metadata?.apelido || obterPrimeiroNome(user.user_metadata?.nome || user.email),
            email: user.email || '',
            tipo: user.user_metadata?.tipo || 'tutor'
        };
        const { data } = await sbAuth().from('profiles').upsert(perfilMinimo, { onConflict: 'id' }).select().maybeSingle();
        perfil = data || perfilMinimo;
    }

    const usuarioLocal = perfilDbParaLocal(perfil, user);
    salvarSessao(usuarioLocal.nome, usuarioLocal.tipo, usuarioLocal.email, usuarioLocal.apelido);
    salvarPerfilLocal(usuarioLocal);
    return usuarioLocal;
}

function formatarTelefoneCampo(campo) {
    if (!campo) return;
    let valor = campo.value.replace(/\D/g, '').slice(0, 11);
    if (valor.length > 10) valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    else if (valor.length > 6) valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    else if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    else if (valor.length > 0) valor = valor.replace(/^(\d*)$/, '($1');
    campo.value = valor;
}

function formatarCepCampo(campo) {
    if (!campo) return;
    let valor = campo.value.replace(/\D/g, '').slice(0, 8);
    if (valor.length > 5) valor = valor.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
    campo.value = valor;
}

function definirStatusCep(prefixo, mensagem = '', tipo = '') {
    const status = document.getElementById(`${prefixo}-cep-status`);
    if (!status) return;
    status.textContent = mensagem;
    status.classList.remove('sucesso', 'erro');
    if (tipo) status.classList.add(tipo);
}

function preencherCampoEndereco(id, valor) {
    const campo = document.getElementById(id);
    if (campo && valor) {
        campo.value = valor;
        campo.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

async function buscarEnderecoPorCep(campoCep) {
    if (!campoCep) return;
    const cepLimpo = campoCep.value.replace(/\D/g, '');
    const prefixo = campoCep.id.startsWith('perfil-') ? 'perfil' : 'cadastro';
    if (cepLimpo.length < 8) {
        definirStatusCep(prefixo);
        campoCep.dataset.ultimoCepBuscado = '';
        return;
    }
    if (campoCep.dataset.ultimoCepBuscado === cepLimpo) return;
    campoCep.dataset.ultimoCepBuscado = cepLimpo;
    definirStatusCep(prefixo, 'Buscando endereço pelo CEP...', '');
    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        if (!resposta.ok) throw new Error('falha-na-busca');
        const dados = await resposta.json();
        if (dados.erro) throw new Error('cep-nao-encontrado');
        preencherCampoEndereco(`${prefixo}-endereco`, dados.logradouro || '');
        preencherCampoEndereco(`${prefixo}-bairro`, dados.bairro || '');
        preencherCampoEndereco(`${prefixo}-cidade`, dados.localidade || '');
        preencherCampoEndereco(`${prefixo}-uf`, dados.uf || '');
        definirStatusCep(prefixo, 'Endereço encontrado automaticamente. Confira o número e o complemento.', 'sucesso');
        const campoNumero = document.getElementById(`${prefixo}-numero`);
        if (campoNumero && !campoNumero.value) campoNumero.focus();
    } catch (erro) {
        campoCep.dataset.ultimoCepBuscado = '';
        definirStatusCep(prefixo, 'CEP não encontrado. Confira os números ou preencha o endereço manualmente.', 'erro');
    }
}

function configurarMascarasAuth() {
    document.querySelectorAll('[data-telefone-mask]').forEach(campo => {
        campo.addEventListener('input', () => formatarTelefoneCampo(campo));
    });
    document.querySelectorAll('[data-cep-mask]').forEach(campo => {
        let tempoBuscaCep;
        campo.addEventListener('input', () => {
            formatarCepCampo(campo);
            clearTimeout(tempoBuscaCep);
            tempoBuscaCep = setTimeout(() => buscarEnderecoPorCep(campo), 450);
        });
        campo.addEventListener('blur', () => buscarEnderecoPorCep(campo));
    });
}

function atualizarAreaLogin() {
    const areaLogin = document.getElementById('area-login');
    if (!areaLogin) return;

    if (estaLogado()) {
        const usuarioCompleto = pegarUsuarioLogadoCompleto();
        const nome = usuarioCompleto?.nome || pegarUsuario();
        const apelido = obterApelidoUsuario(usuarioCompleto);
        const tipo = usuarioCompleto?.tipo || pegarTipoUsuario();
        const linkPerfil = tipo === 'veterinario' ? 'veterinario-dashboard.html' : 'perfil.html';
        areaLogin.innerHTML = `
            <a href="${linkPerfil}" class="usuario-logado" title="${limparTexto(nome)} - ${nomeTipoUsuario(tipo)}">
                ${obterMarkupAvatar(usuarioCompleto, 'avatar-mini')}
                <span class="usuario-texto"><strong>Olá, ${limparTexto(apelido)}</strong><small>${nomeTipoUsuario(tipo)}</small></span>
            </a>
            <button type="button" class="btn-sair" onclick="sair()">Sair</button>
        `;
    } else {
        areaLogin.innerHTML = `<a href="login.html" class="btn-login"><i class="fas fa-user"></i> Entrar</a>`;
    }
}

function controlarConteudoRestrito() {
    document.querySelectorAll('.somente-logado').forEach(item => item.style.display = estaLogado() ? '' : 'none');
    document.querySelectorAll('.somente-visitante').forEach(item => item.style.display = estaLogado() ? 'none' : '');
}

function protegerLinksDeAgendamento() {
    document.querySelectorAll('[data-requer-login]').forEach(link => {
        link.addEventListener('click', function (event) {
            if (!estaLogado()) {
                event.preventDefault();
                const destino = link.getAttribute('href') || 'agendamento.html';
                window.location.href = `login.html?from=${encodeURIComponent(destino)}`;
            }
        });
    });
}

function mostrarAbaAcesso(aba) {
    document.querySelectorAll('[data-auth-tab]').forEach(botao => botao.classList.toggle('active', botao.dataset.authTab === aba));
    document.querySelectorAll('[data-auth-section]').forEach(secao => secao.classList.toggle('active', secao.dataset.authSection === aba));
}

function configurarAbasAcesso() {
    const botoes = document.querySelectorAll('[data-auth-tab]');
    if (!botoes.length) return;
    botoes.forEach(botao => botao.addEventListener('click', () => mostrarAbaAcesso(botao.dataset.authTab)));
    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get('tab') === 'cadastro') mostrarAbaAcesso('cadastro');
}

function destinoAposLogin(padrao = 'agendamento.html') {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get('from') || padrao;
}

function configurarFormularioLogin() {
    const formLogin = document.getElementById('form-login');
    if (!formLogin) return;
    formLogin.addEventListener('submit', async function (event) {
        event.preventDefault();
        const identificacao = document.getElementById('login-identificacao').value.trim().toLowerCase();
        const senha = document.getElementById('login-senha').value.trim();
        const erro = document.getElementById('erro-login');
        if (erro) erro.textContent = '';

        if (!sbAuth()) {
            if (erro) erro.textContent = 'Supabase não carregou. Confira se a CDN e o arquivo supabaseClient.js estão antes do auth.js.';
            return;
        }
        if (!identificacao.includes('@')) {
            if (erro) erro.textContent = 'Digite o e-mail cadastrado.';
            return;
        }

        const { error } = await sbAuth().auth.signInWithPassword({ email: identificacao, password: senha });
        if (error) {
            if (erro) erro.textContent = 'Cadastro não encontrado ou senha incorreta.';
            return;
        }

        await sincronizarSessaoSupabase();
        window.location.href = destinoAposLogin('agendamento.html');
    });
}

function configurarFormularioCadastro() {
    const formCadastro = document.getElementById('form-cadastro');
    if (!formCadastro) return;

    const inputFotoCadastro = document.getElementById('cadastro-foto');
    const erroCadastro = document.getElementById('erro-cadastro');
    let fotoPerfilCadastro = '';

    if (inputFotoCadastro) {
        inputFotoCadastro.addEventListener('change', async function () {
            const arquivo = inputFotoCadastro.files && inputFotoCadastro.files[0];
            if (!arquivo) {
                fotoPerfilCadastro = '';
                atualizarPreviewFotoCadastro('');
                return;
            }
            try {
                fotoPerfilCadastro = await converterImagemPerfilParaBase64(arquivo);
                atualizarPreviewFotoCadastro(fotoPerfilCadastro);
                if (erroCadastro) erroCadastro.textContent = '';
            } catch (erro) {
                fotoPerfilCadastro = '';
                atualizarPreviewFotoCadastro('');
                inputFotoCadastro.value = '';
                if (erroCadastro) erroCadastro.textContent = 'Escolha um arquivo de imagem válido para a foto de perfil.';
            }
        });
    }

    formCadastro.addEventListener('submit', async function (event) {
        event.preventDefault();
        const nome = document.getElementById('cadastro-nome').value.trim();
        const apelido = document.getElementById('cadastro-apelido')?.value.trim() || obterPrimeiroNome(nome);
        const email = document.getElementById('cadastro-email').value.trim().toLowerCase();
        const telefone = document.getElementById('cadastro-telefone')?.value.trim() || '';
        const cep = document.getElementById('cadastro-cep')?.value.trim() || '';
        const endereco = document.getElementById('cadastro-endereco')?.value.trim() || '';
        const numero = document.getElementById('cadastro-numero')?.value.trim() || '';
        const bairro = document.getElementById('cadastro-bairro')?.value.trim() || '';
        const complemento = document.getElementById('cadastro-complemento')?.value.trim() || '';
        const cidade = document.getElementById('cadastro-cidade')?.value.trim() || '';
        const uf = document.getElementById('cadastro-uf')?.value.trim().toUpperCase() || '';
        const senha = document.getElementById('cadastro-senha').value.trim();
        const erro = erroCadastro || document.getElementById('erro-cadastro');
        if (erro) erro.textContent = '';

        if (inputFotoCadastro?.files?.[0] && !fotoPerfilCadastro) {
            try { fotoPerfilCadastro = await converterImagemPerfilParaBase64(inputFotoCadastro.files[0]); }
            catch (erroImagem) {
                if (erro) erro.textContent = 'Escolha um arquivo de imagem válido para a foto de perfil.';
                return;
            }
        }

        if (nome.length < 3) return erro.textContent = 'Digite um nome com pelo menos 3 letras.';
        if (apelido.length < 2) return erro.textContent = 'Digite um apelido com pelo menos 2 letras. Esse nome aparecerá no topo do site.';
        if (!email.includes('@') || !email.includes('.')) return erro.textContent = 'Digite um e-mail válido.';
        if (cep.replace(/\D/g, '').length !== 8) return erro.textContent = 'Digite um CEP válido com 8 números.';
        if (!endereco || !numero || !bairro || !cidade || !uf) return erro.textContent = 'Preencha o endereço completo: endereço, número, bairro, cidade, UF e CEP.';
        if (senha.length < 4) return erro.textContent = 'A senha precisa ter pelo menos 4 caracteres.';
        if (!sbAuth()) return erro.textContent = 'Supabase não carregou. Confira a ordem dos scripts no HTML.';

        const { data, error: authError } = await sbAuth().auth.signUp({
            email,
            password: senha,
            options: { data: { nome, apelido, tipo: 'tutor' } }
        });
        if (authError) return erro.textContent = authError.message;
        if (!data.user) return erro.textContent = 'Cadastro criado. Confirme seu e-mail antes de entrar.';

        const novoUsuario = {
            id: data.user.id,
            nome,
            apelido,
            email,
            telefone,
            cep,
            endereco,
            numero,
            bairro,
            cidade,
            uf,
            complemento,
            fotoPerfil: fotoPerfilCadastro,
            tipo: 'tutor'
        };

        const { data: perfilSalvo, error: perfilError } = await sbAuth()
            .from('profiles')
            .upsert(usuarioLocalParaDb(novoUsuario), { onConflict: 'id' })
            .select()
            .single();

        if (perfilError) {
            erro.textContent = `${perfilError.message}. Se estiver usando confirmação por e-mail, desative Confirm email em Authentication > Providers > Email para este teste.`;
            return;
        }

        const localFinal = perfilDbParaLocal(perfilSalvo, data.user);
        salvarSessao(localFinal.nome, localFinal.tipo, localFinal.email, localFinal.apelido);
        salvarPerfilLocal(localFinal);
        window.location.href = destinoAposLogin('agendamento.html');
    });
}

function preencherDadosDoUsuarioLogado() {
    if (!estaLogado()) return;
    const usuarioCompleto = pegarUsuarioLogadoCompleto();
    const nome = usuarioCompleto?.nome || pegarUsuario();
    const tipo = usuarioCompleto?.tipo || pegarTipoUsuario();
    const resumo = document.getElementById('resumo-usuario-logado');
    if (resumo) resumo.textContent = `Login confirmado: ${nome} (${nomeTipoUsuario(tipo)}). Solicite atendimento e acompanhe o processo do animal pelo site.`;

    const preenchimentos = {
        '[data-preencher-nome]': usuarioCompleto?.nome || nome,
        '[data-preencher-apelido]': obterApelidoUsuario(usuarioCompleto),
        '[data-preencher-email]': usuarioCompleto?.email || '',
        '[data-preencher-telefone]': usuarioCompleto?.telefone || '',
        '[data-preencher-endereco]': usuarioCompleto?.endereco || '',
        '[data-preencher-cep]': usuarioCompleto?.cep || '',
        '[data-preencher-numero]': usuarioCompleto?.numero || '',
        '[data-preencher-bairro]': usuarioCompleto?.bairro || '',
        '[data-preencher-cidade]': usuarioCompleto?.cidade || '',
        '[data-preencher-uf]': usuarioCompleto?.uf || ''
    };
    Object.entries(preenchimentos).forEach(([seletor, valor]) => {
        document.querySelectorAll(seletor).forEach(campo => { if (!campo.value && valor) campo.value = valor; });
    });
    const seletorTipo = document.getElementById('tipo-atendimento');
    if (seletorTipo) {
        seletorTipo.value = 'tutor';
        seletorTipo.dispatchEvent(new Event('change'));
    }
}

function preencherResumoPerfil(usuario) {
    const apelido = obterApelidoUsuario(usuario);
    const nomeResumo = document.getElementById('perfil-resumo-nome');
    const apelidoResumo = document.getElementById('perfil-resumo-apelido');
    const tipoResumo = document.getElementById('perfil-resumo-tipo');
    const emailResumo = document.getElementById('perfil-resumo-email');
    const telefoneResumo = document.getElementById('perfil-resumo-telefone');
    const enderecoResumo = document.getElementById('perfil-resumo-endereco');
    if (nomeResumo) nomeResumo.textContent = usuario.nome || 'Usuário CastraPrev';
    if (apelidoResumo) apelidoResumo.textContent = `@${apelido}`;
    if (tipoResumo) tipoResumo.textContent = nomeTipoUsuario(usuario.tipo);
    if (emailResumo) emailResumo.textContent = usuario.email || 'E-mail não informado';
    if (telefoneResumo) telefoneResumo.textContent = usuario.telefone || 'Telefone não informado';
    const partesEndereco = [usuario.endereco, usuario.numero ? `Nº ${usuario.numero}` : '', usuario.bairro, usuario.cidade, usuario.uf, usuario.cep ? `CEP ${usuario.cep}` : ''].filter(Boolean).join(', ');
    if (enderecoResumo) enderecoResumo.textContent = partesEndereco || 'Endereço ainda não informado';
    atualizarPreviewAvatarPerfil(usuario.fotoPerfil || usuario.foto_perfil || '', usuario.nome || 'Usuário CastraPrev');
}

function configurarPerfilUsuario() {
    const formPerfil = document.getElementById('form-perfil');
    if (!formPerfil) return;

    const mensagem = document.getElementById('mensagem-perfil');
    const erro = document.getElementById('erro-perfil');
    let usuarioLogado = pegarUsuarioLogadoCompleto();

    if (!usuarioLogado) {
        if (erro) erro.textContent = 'Não encontrei os dados do seu cadastro. Saia e entre novamente para atualizar a sessão.';
        return;
    }

    preencherResumoPerfil(usuarioLogado);
    document.getElementById('perfil-nome').value = usuarioLogado.nome || '';
    document.getElementById('perfil-apelido').value = obterApelidoUsuario(usuarioLogado);
    document.getElementById('perfil-email').value = usuarioLogado.email || '';
    document.getElementById('perfil-telefone').value = usuarioLogado.telefone || '';
    const campoTipoPerfil = document.getElementById('perfil-tipo');
    if (campoTipoPerfil) campoTipoPerfil.value = 'tutor';
    document.getElementById('perfil-cep').value = usuarioLogado.cep || '';
    document.getElementById('perfil-uf').value = usuarioLogado.uf || '';
    document.getElementById('perfil-endereco').value = usuarioLogado.endereco || '';
    document.getElementById('perfil-numero').value = usuarioLogado.numero || '';
    document.getElementById('perfil-bairro').value = usuarioLogado.bairro || '';
    document.getElementById('perfil-cidade').value = usuarioLogado.cidade || '';
    document.getElementById('perfil-complemento').value = usuarioLogado.complemento || '';

    const campoNome = document.getElementById('perfil-nome');
    const campoApelido = document.getElementById('perfil-apelido');
    const inputFoto = document.getElementById('perfil-foto');
    const botaoRemoverFoto = document.getElementById('perfil-remover-foto');
    let fotoPerfilAtual = usuarioLogado.fotoPerfil || usuarioLogado.foto_perfil || '';
    let promessaFotoPerfil = Promise.resolve(fotoPerfilAtual);
    atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value || usuarioLogado.nome || 'Usuário CastraPrev');

    if (campoNome) campoNome.addEventListener('input', () => atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value.trim() || 'Usuário CastraPrev'));
    if (campoApelido) campoApelido.addEventListener('input', () => {
        const apelidoResumo = document.getElementById('perfil-resumo-apelido');
        if (apelidoResumo) apelidoResumo.textContent = `@${campoApelido.value.trim() || obterPrimeiroNome(campoNome.value)}`;
    });
    if (inputFoto) inputFoto.addEventListener('change', function () {
        const arquivo = inputFoto.files && inputFoto.files[0];
        if (!arquivo) return;
        if (!arquivo.type.startsWith('image/')) {
            if (erro) erro.textContent = 'Escolha um arquivo de imagem válido para a foto de perfil.';
            inputFoto.value = '';
            return;
        }
        promessaFotoPerfil = converterImagemPerfilParaBase64(arquivo).then(img => {
            fotoPerfilAtual = img;
            atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value.trim() || usuarioLogado.nome || 'Usuário CastraPrev');
            if (erro) erro.textContent = '';
            return fotoPerfilAtual;
        }).catch(() => {
            fotoPerfilAtual = '';
            inputFoto.value = '';
            atualizarPreviewAvatarPerfil('', campoNome.value.trim() || usuarioLogado.nome || 'Usuário CastraPrev');
            if (erro) erro.textContent = 'Não foi possível carregar essa imagem. Escolha outra foto menor.';
            return '';
        });
    });
    if (botaoRemoverFoto) botaoRemoverFoto.addEventListener('click', function () {
        fotoPerfilAtual = '';
        promessaFotoPerfil = Promise.resolve('');
        if (inputFoto) inputFoto.value = '';
        atualizarPreviewAvatarPerfil('', campoNome.value.trim() || usuarioLogado.nome || 'Usuário CastraPrev');
        if (erro) erro.textContent = '';
    });

    formPerfil.addEventListener('submit', async function (event) {
        event.preventDefault();
        fotoPerfilAtual = await promessaFotoPerfil;
        if (erro) erro.textContent = '';
        if (mensagem) { mensagem.textContent = ''; mensagem.classList.remove('show'); }

        const usuarioAtualizado = {
            ...usuarioLogado,
            nome: document.getElementById('perfil-nome').value.trim(),
            apelido: document.getElementById('perfil-apelido').value.trim(),
            email: document.getElementById('perfil-email').value.trim().toLowerCase(),
            telefone: document.getElementById('perfil-telefone').value.trim(),
            tipo: 'tutor',
            cep: document.getElementById('perfil-cep').value.trim(),
            uf: document.getElementById('perfil-uf').value.trim().toUpperCase(),
            endereco: document.getElementById('perfil-endereco').value.trim(),
            numero: document.getElementById('perfil-numero').value.trim(),
            bairro: document.getElementById('perfil-bairro').value.trim(),
            cidade: document.getElementById('perfil-cidade').value.trim(),
            complemento: document.getElementById('perfil-complemento').value.trim(),
            fotoPerfil: fotoPerfilAtual
        };

        const novaSenha = document.getElementById('perfil-nova-senha').value.trim();
        const confirmarSenha = document.getElementById('perfil-confirmar-senha').value.trim();

        if (usuarioAtualizado.nome.length < 3) return erro.textContent = 'Digite um nome com pelo menos 3 letras.';
        if (usuarioAtualizado.apelido.length < 2) return erro.textContent = 'Digite um apelido com pelo menos 2 letras.';
        if (!usuarioAtualizado.email.includes('@') || !usuarioAtualizado.email.includes('.')) return erro.textContent = 'Digite um e-mail válido.';
        if (usuarioAtualizado.cep.replace(/\D/g, '').length !== 8) return erro.textContent = 'Digite um CEP válido com 8 números.';
        if (!usuarioAtualizado.endereco || !usuarioAtualizado.numero || !usuarioAtualizado.bairro || !usuarioAtualizado.cidade || !usuarioAtualizado.uf) return erro.textContent = 'Preencha o endereço completo: endereço, número, bairro, cidade, UF e CEP.';
        if (novaSenha || confirmarSenha) {
            if (novaSenha.length < 4) return erro.textContent = 'A nova senha precisa ter pelo menos 4 caracteres.';
            if (novaSenha !== confirmarSenha) return erro.textContent = 'A confirmação da nova senha não confere.';
            const { error: senhaError } = await sbAuth().auth.updateUser({ password: novaSenha });
            if (senhaError) return erro.textContent = senhaError.message;
        }

        const user = await obterUsuarioSupabase();
        if (!user) return erro.textContent = 'Sua sessão expirou. Faça login novamente.';
        usuarioAtualizado.id = user.id;

        const { data: perfilSalvo, error: updateError } = await sbAuth()
            .from('profiles')
            .update(usuarioLocalParaDb(usuarioAtualizado))
            .eq('id', user.id)
            .select()
            .single();
        if (updateError) return erro.textContent = updateError.message;

        if (usuarioAtualizado.email !== user.email) {
            const { error: emailError } = await sbAuth().auth.updateUser({ email: usuarioAtualizado.email });
            if (emailError) console.warn('E-mail no Auth não foi alterado:', emailError.message);
        }

        const localFinal = perfilDbParaLocal(perfilSalvo, user);
        salvarSessao(localFinal.nome, localFinal.tipo, localFinal.email, localFinal.apelido);
        salvarPerfilLocal(localFinal);
        usuarioLogado = localFinal;
        preencherResumoPerfil(localFinal);
        atualizarAreaLogin();
        document.getElementById('perfil-senha-atual').value = '';
        document.getElementById('perfil-nova-senha').value = '';
        document.getElementById('perfil-confirmar-senha').value = '';
        if (mensagem) {
            mensagem.textContent = 'Perfil atualizado com sucesso! Seus novos dados já foram salvos.';
            mensagem.classList.add('show');
        }
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    await sincronizarSessaoSupabase();

    const paginaAtual = pegarPaginaAtual();
    if (paginaAtual === 'login.html' && estaLogado()) {
        const destino = pegarTipoUsuario() === 'veterinario' ? 'veterinario-dashboard.html' : destinoAposLogin('agendamento.html');
        window.location.href = destino;
        return;
    }

    const paginaProtegida = document.body.dataset.protegida === 'true';
    if (paginaProtegida && !estaLogado()) {
        window.location.href = `login.html?from=${encodeURIComponent(paginaAtual)}`;
        return;
    }

    atualizarAreaLogin();
    controlarConteudoRestrito();
    protegerLinksDeAgendamento();
    configurarAbasAcesso();
    configurarMascarasAuth();
    configurarFormularioLogin();
    configurarFormularioCadastro();
    preencherDadosDoUsuarioLogado();
    configurarPerfilUsuario();
});
