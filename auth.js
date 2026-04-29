const CHAVE_LOGADO = 'castraprev_logado';
const CHAVE_USUARIO = 'castraprev_usuario';
const CHAVE_TIPO_USUARIO = 'castraprev_tipo_usuario';
const CHAVE_USUARIOS = 'castraprev_usuarios';

function carregarUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch (erro) {
        return [];
    }
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function estaLogado() {
    return localStorage.getItem(CHAVE_LOGADO) === 'true';
}

function pegarUsuario() {
    return localStorage.getItem(CHAVE_USUARIO) || 'Usuário';
}

function pegarTipoUsuario() {
    return localStorage.getItem(CHAVE_TIPO_USUARIO) || 'tutor';
}

function nomeTipoUsuario(tipo = pegarTipoUsuario()) {
    return tipo === 'doador' ? 'Doador' : 'Tutor';
}

function salvarSessao(nome, tipo) {
    localStorage.setItem(CHAVE_LOGADO, 'true');
    localStorage.setItem(CHAVE_USUARIO, nome);
    localStorage.setItem(CHAVE_TIPO_USUARIO, tipo || 'tutor');
}

function sair() {
    localStorage.removeItem(CHAVE_LOGADO);
    localStorage.removeItem(CHAVE_USUARIO);
    localStorage.removeItem(CHAVE_TIPO_USUARIO);
    window.location.href = 'index.html';
}

function atualizarAreaLogin() {
    const areaLogin = document.getElementById('area-login');
    if (!areaLogin) return;

    if (estaLogado()) {
        areaLogin.innerHTML = `
            <span class="usuario-logado" title="${pegarUsuario()} - ${nomeTipoUsuario()}">
                <i class="fas fa-user-check"></i> ${pegarUsuario()} <small>${nomeTipoUsuario()}</small>
            </span>
            <button type="button" class="btn-sair" onclick="sair()">Sair</button>
        `;
    } else {
        areaLogin.innerHTML = `
            <a href="login.html" class="btn-login"><i class="fas fa-user"></i> Entrar</a>
        `;
    }
}

function controlarConteudoRestrito() {
    const somenteLogado = document.querySelectorAll('.somente-logado');
    const somenteVisitante = document.querySelectorAll('.somente-visitante');

    somenteLogado.forEach(item => {
        item.style.display = estaLogado() ? '' : 'none';
    });

    somenteVisitante.forEach(item => {
        item.style.display = estaLogado() ? 'none' : '';
    });
}

function protegerLinksDeAgendamento() {
    const linksProtegidos = document.querySelectorAll('[data-requer-login]');

    linksProtegidos.forEach(link => {
        link.addEventListener('click', function (event) {
            if (!estaLogado()) {
                event.preventDefault();
                window.location.href = 'login.html?from=agendamento.html';
            }
        });
    });
}

function mostrarAbaAcesso(aba) {
    const botoes = document.querySelectorAll('[data-auth-tab]');
    const secoes = document.querySelectorAll('[data-auth-section]');

    botoes.forEach(botao => {
        botao.classList.toggle('active', botao.dataset.authTab === aba);
    });

    secoes.forEach(secao => {
        secao.classList.toggle('active', secao.dataset.authSection === aba);
    });
}

function configurarAbasAcesso() {
    const botoes = document.querySelectorAll('[data-auth-tab]');
    if (!botoes.length) return;

    botoes.forEach(botao => {
        botao.addEventListener('click', () => mostrarAbaAcesso(botao.dataset.authTab));
    });

    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get('tab') === 'cadastro') {
        mostrarAbaAcesso('cadastro');
    }
}

function configurarFormularioLogin() {
    const formLogin = document.getElementById('form-login');
    if (!formLogin) return;

    formLogin.addEventListener('submit', function (event) {
        event.preventDefault();

        const identificacao = document.getElementById('login-identificacao').value.trim().toLowerCase();
        const senha = document.getElementById('login-senha').value.trim();
        const erro = document.getElementById('erro-login');
        const usuarios = carregarUsuarios();

        const usuarioEncontrado = usuarios.find(usuario => {
            const mesmoEmail = usuario.email.toLowerCase() === identificacao;
            const mesmoNome = usuario.nome.toLowerCase() === identificacao;
            return (mesmoEmail || mesmoNome) && usuario.senha === senha;
        });

        if (!usuarioEncontrado) {
            erro.textContent = 'Cadastro não encontrado. Confira os dados ou crie uma conta.';
            return;
        }

        salvarSessao(usuarioEncontrado.nome, usuarioEncontrado.tipo);

        const parametros = new URLSearchParams(window.location.search);
        const destino = parametros.get('from') || 'agendamento.html';
        window.location.href = destino;
    });
}

function configurarFormularioCadastro() {
    const formCadastro = document.getElementById('form-cadastro');
    if (!formCadastro) return;

    formCadastro.addEventListener('submit', function (event) {
        event.preventDefault();

        const nome = document.getElementById('cadastro-nome').value.trim();
        const email = document.getElementById('cadastro-email').value.trim().toLowerCase();
        const senha = document.getElementById('cadastro-senha').value.trim();
        const tipoSelecionado = document.querySelector('input[name="cadastro-tipo"]:checked');
        const erro = document.getElementById('erro-cadastro');

        if (nome.length < 3) {
            erro.textContent = 'Digite um nome com pelo menos 3 letras.';
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            erro.textContent = 'Digite um e-mail válido.';
            return;
        }

        if (senha.length < 4) {
            erro.textContent = 'A senha precisa ter pelo menos 4 caracteres.';
            return;
        }

        if (!tipoSelecionado) {
            erro.textContent = 'Escolha se você é tutor ou doador.';
            return;
        }

        const usuarios = carregarUsuarios();
        const emailJaExiste = usuarios.some(usuario => usuario.email.toLowerCase() === email);

        if (emailJaExiste) {
            erro.textContent = 'Este e-mail já foi cadastrado. Use a área de login.';
            return;
        }

        const novoUsuario = {
            nome,
            email,
            senha,
            tipo: tipoSelecionado.value,
            criadoEm: new Date().toISOString()
        };

        usuarios.push(novoUsuario);
        salvarUsuarios(usuarios);
        salvarSessao(nome, novoUsuario.tipo);

        const parametros = new URLSearchParams(window.location.search);
        const destino = parametros.get('from') || 'agendamento.html';
        window.location.href = destino;
    });
}

function preencherDadosDoUsuarioLogado() {
    if (!estaLogado()) return;

    const resumo = document.getElementById('resumo-usuario-logado');
    if (resumo) {
        resumo.textContent = `Login confirmado: ${pegarUsuario()} (${nomeTipoUsuario()}). Escolha abaixo se deseja solicitar atendimento para um animal ou realizar uma doação.`;
    }

    const camposNome = document.querySelectorAll('[data-preencher-nome]');
    camposNome.forEach(campo => {
        if (!campo.value) campo.value = pegarUsuario();
    });

    const seletorTipo = document.getElementById('tipo-atendimento');
    if (seletorTipo) {
        seletorTipo.value = pegarTipoUsuario();
        seletorTipo.dispatchEvent(new Event('change'));
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const paginaProtegida = document.body.dataset.protegida === 'true';

    if (paginaProtegida && !estaLogado()) {
        window.location.href = 'login.html?from=agendamento.html';
        return;
    }

    atualizarAreaLogin();
    controlarConteudoRestrito();
    protegerLinksDeAgendamento();
    configurarAbasAcesso();
    configurarFormularioLogin();
    configurarFormularioCadastro();
    preencherDadosDoUsuarioLogado();
});
