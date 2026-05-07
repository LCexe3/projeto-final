const CHAVE_LOGADO = 'castraprev_logado';
const CHAVE_USUARIO = 'castraprev_usuario';
const CHAVE_USUARIO_EMAIL = 'castraprev_usuario_email';
const CHAVE_TIPO_USUARIO = 'castraprev_tipo_usuario';
const CHAVE_USUARIOS = 'castraprev_usuarios';

function carregarUsuarios() {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function estaLogado() {
    return localStorage.getItem(CHAVE_LOGADO) === 'true';
}

function pegarUsuario() {
    return localStorage.getItem(CHAVE_USUARIO) || '';
}

function pegarEmailUsuario() {
    return localStorage.getItem(CHAVE_USUARIO_EMAIL) || '';
}

function pegarTipoUsuario() {
    return localStorage.getItem(CHAVE_TIPO_USUARIO) || 'tutor';
}

function nomeTipoUsuario(tipo = pegarTipoUsuario()) {
    return tipo === 'doador' ? 'Doador' : 'Tutor';
}

function salvarSessao(nome, tipo, email = '') {
    localStorage.setItem(CHAVE_LOGADO, 'true');
    localStorage.setItem(CHAVE_USUARIO, nome);
    localStorage.setItem(CHAVE_TIPO_USUARIO, tipo || 'tutor');

    if (email) {
        localStorage.setItem(CHAVE_USUARIO_EMAIL, email);
    }
}

function sair() {
    localStorage.removeItem(CHAVE_LOGADO);
    localStorage.removeItem(CHAVE_USUARIO);
    localStorage.removeItem(CHAVE_USUARIO_EMAIL);
    localStorage.removeItem(CHAVE_TIPO_USUARIO);
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
    const nome = limparTexto(usuario?.nome || 'Usuário CastraPrev');

    if (usuario?.fotoPerfil) {
        return `<span class="avatar-box${classe}"><img src="${usuario.fotoPerfil}" alt="Foto de perfil de ${nome}"></span>`;
    }

    return `<span class="avatar-box avatar-fallback${classe}"><i class="fas fa-user"></i></span>`;
}

function atualizarPreviewAvatarPerfil(fotoPerfil = '', nome = '') {
    ['perfil-resumo-avatar', 'perfil-foto-preview'].forEach(id => {
        const avatar = document.getElementById(id);
        if (avatar) {
            avatar.innerHTML = obterMarkupAvatar({ fotoPerfil, nome });
        }
    });
}

function pegarUsuarioLogadoCompleto() {
    const usuarios = carregarUsuarios();
    const emailSessao = pegarEmailUsuario().toLowerCase();
    const nomeSessao = pegarUsuario().toLowerCase();

    let usuario = null;

    if (emailSessao) {
        usuario = usuarios.find(item => (item.email || '').toLowerCase() === emailSessao);
    }

    if (!usuario && nomeSessao) {
        usuario = usuarios.find(item => (item.nome || '').toLowerCase() === nomeSessao);
    }

    return usuario || null;
}

function formatarTelefoneCampo(campo) {
    if (!campo) return;

    let valor = campo.value.replace(/\D/g, '').slice(0, 11);

    if (valor.length > 10) {
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (valor.length > 6) {
        valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (valor.length > 0) {
        valor = valor.replace(/^(\d*)$/, '($1');
    }

    campo.value = valor;
}

function formatarCepCampo(campo) {
    if (!campo) return;

    let valor = campo.value.replace(/\D/g, '').slice(0, 8);

    if (valor.length > 5) {
        valor = valor.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
    }

    campo.value = valor;
}

function configurarMascarasAuth() {
    document.querySelectorAll('[data-telefone-mask]').forEach(campo => {
        campo.addEventListener('input', () => formatarTelefoneCampo(campo));
    });

    document.querySelectorAll('[data-cep-mask]').forEach(campo => {
        campo.addEventListener('input', () => formatarCepCampo(campo));
    });
}

function atualizarAreaLogin() {
    const areaLogin = document.getElementById('area-login');
    if (!areaLogin) return;

    if (estaLogado()) {
        const usuarioCompleto = pegarUsuarioLogadoCompleto();
        const nome = usuarioCompleto?.nome || pegarUsuario();
        const tipo = usuarioCompleto?.tipo || pegarTipoUsuario();

        areaLogin.innerHTML = `
            <a href="perfil.html" class="usuario-logado" title="${limparTexto(nome)} - ${nomeTipoUsuario(tipo)}">
                ${obterMarkupAvatar(usuarioCompleto, 'avatar-mini')}
                <span class="usuario-texto">${limparTexto(nome)} <small>${nomeTipoUsuario(tipo)}</small></span>
            </a>
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
                const destino = link.getAttribute('href') || 'agendamento.html';
                window.location.href = `login.html?from=${encodeURIComponent(destino)}`;
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
            const mesmoEmail = (usuario.email || '').toLowerCase() === identificacao;
            const mesmoNome = (usuario.nome || '').toLowerCase() === identificacao;
            return (mesmoEmail || mesmoNome) && usuario.senha === senha;
        });

        if (!usuarioEncontrado) {
            erro.textContent = 'Cadastro não encontrado. Confira os dados ou crie uma conta.';
            return;
        }

        erro.textContent = '';
        salvarSessao(usuarioEncontrado.nome, usuarioEncontrado.tipo, usuarioEncontrado.email);

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
        const telefone = document.getElementById('cadastro-telefone')?.value.trim() || '';
        const cep = document.getElementById('cadastro-cep')?.value.trim() || '';
        const endereco = document.getElementById('cadastro-endereco')?.value.trim() || '';
        const numero = document.getElementById('cadastro-numero')?.value.trim() || '';
        const bairro = document.getElementById('cadastro-bairro')?.value.trim() || '';
        const complemento = document.getElementById('cadastro-complemento')?.value.trim() || '';
        const cidade = document.getElementById('cadastro-cidade')?.value.trim() || '';
        const uf = document.getElementById('cadastro-uf')?.value.trim() || '';
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

        if (cep.replace(/\D/g, '').length !== 8) {
            erro.textContent = 'Digite um CEP válido com 8 números.';
            return;
        }

        if (!endereco || !numero || !bairro || !cidade || !uf) {
            erro.textContent = 'Preencha o endereço completo: endereço, número, bairro, cidade, UF e CEP.';
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
        const emailJaExiste = usuarios.some(usuario => (usuario.email || '').toLowerCase() === email);

        if (emailJaExiste) {
            erro.textContent = 'Este e-mail já foi cadastrado. Use a área de login.';
            return;
        }

        const novoUsuario = {
            id: Date.now(),
            nome,
            email,
            telefone,
            cep,
            endereco,
            numero,
            bairro,
            cidade,
            uf,
            complemento,
            fotoPerfil: '',
            senha,
            tipo: tipoSelecionado.value,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString()
        };

        usuarios.push(novoUsuario);
        salvarUsuarios(usuarios);
        salvarSessao(nome, novoUsuario.tipo, email);

        const parametros = new URLSearchParams(window.location.search);
        const destino = parametros.get('from') || 'agendamento.html';
        window.location.href = destino;
    });
}

function preencherDadosDoUsuarioLogado() {
    if (!estaLogado()) return;

    const usuarioCompleto = pegarUsuarioLogadoCompleto();
    const nome = usuarioCompleto?.nome || pegarUsuario();
    const tipo = usuarioCompleto?.tipo || pegarTipoUsuario();

    const resumo = document.getElementById('resumo-usuario-logado');
    if (resumo) {
        resumo.textContent = `Login confirmado: ${nome} (${nomeTipoUsuario(tipo)}). Escolha abaixo se deseja solicitar atendimento para um animal ou realizar uma doação.`;
    }

    const preenchimentos = {
        '[data-preencher-nome]': usuarioCompleto?.nome || nome,
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
        document.querySelectorAll(seletor).forEach(campo => {
            if (!campo.value && valor) {
                campo.value = valor;
            }
        });
    });

    const seletorTipo = document.getElementById('tipo-atendimento');
    if (seletorTipo) {
        seletorTipo.value = tipo;
        seletorTipo.dispatchEvent(new Event('change'));
    }
}

function preencherResumoPerfil(usuario) {
    const nomeResumo = document.getElementById('perfil-resumo-nome');
    const tipoResumo = document.getElementById('perfil-resumo-tipo');
    const emailResumo = document.getElementById('perfil-resumo-email');
    const telefoneResumo = document.getElementById('perfil-resumo-telefone');
    const enderecoResumo = document.getElementById('perfil-resumo-endereco');

    if (nomeResumo) nomeResumo.textContent = usuario.nome || 'Usuário CastraPrev';
    if (tipoResumo) tipoResumo.textContent = nomeTipoUsuario(usuario.tipo);
    if (emailResumo) emailResumo.textContent = usuario.email || 'E-mail não informado';
    if (telefoneResumo) telefoneResumo.textContent = usuario.telefone || 'Telefone não informado';

    const partesEndereco = [
        usuario.endereco,
        usuario.numero ? `Nº ${usuario.numero}` : '',
        usuario.bairro,
        usuario.cidade,
        usuario.uf,
        usuario.cep ? `CEP ${usuario.cep}` : ''
    ].filter(Boolean).join(', ');

    if (enderecoResumo) enderecoResumo.textContent = partesEndereco || 'Endereço ainda não informado';
    atualizarPreviewAvatarPerfil(usuario.fotoPerfil || '', usuario.nome || 'Usuário CastraPrev');
}

function configurarPerfilUsuario() {
    const formPerfil = document.getElementById('form-perfil');
    if (!formPerfil) return;

    const mensagem = document.getElementById('mensagem-perfil');
    const erro = document.getElementById('erro-perfil');
    const usuarioLogado = pegarUsuarioLogadoCompleto();

    if (!usuarioLogado) {
        if (erro) erro.textContent = 'Não encontrei os dados do seu cadastro. Saia e entre novamente para atualizar a sessão.';
        return;
    }

    preencherResumoPerfil(usuarioLogado);

    document.getElementById('perfil-nome').value = usuarioLogado.nome || '';
    document.getElementById('perfil-email').value = usuarioLogado.email || '';
    document.getElementById('perfil-telefone').value = usuarioLogado.telefone || '';
    document.getElementById('perfil-tipo').value = usuarioLogado.tipo || 'tutor';
    document.getElementById('perfil-cep').value = usuarioLogado.cep || '';
    document.getElementById('perfil-uf').value = usuarioLogado.uf || '';
    document.getElementById('perfil-endereco').value = usuarioLogado.endereco || '';
    document.getElementById('perfil-numero').value = usuarioLogado.numero || '';
    document.getElementById('perfil-bairro').value = usuarioLogado.bairro || '';
    document.getElementById('perfil-cidade').value = usuarioLogado.cidade || '';
    document.getElementById('perfil-complemento').value = usuarioLogado.complemento || '';

    const campoNome = document.getElementById('perfil-nome');
    const inputFoto = document.getElementById('perfil-foto');
    const botaoRemoverFoto = document.getElementById('perfil-remover-foto');
    let fotoPerfilAtual = usuarioLogado.fotoPerfil || '';

    atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value || usuarioLogado.nome || 'Usuário CastraPrev');

    if (campoNome) {
        campoNome.addEventListener('input', function () {
            atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value.trim() || 'Usuário CastraPrev');
        });
    }

    if (inputFoto) {
        inputFoto.addEventListener('change', function () {
            const arquivo = inputFoto.files && inputFoto.files[0];
            if (!arquivo) return;

            if (!arquivo.type.startsWith('image/')) {
                if (erro) erro.textContent = 'Escolha um arquivo de imagem válido para a foto de perfil.';
                inputFoto.value = '';
                return;
            }

            const leitor = new FileReader();
            leitor.onload = function (evento) {
                fotoPerfilAtual = evento.target?.result || '';
                atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value.trim() || usuarioLogado.nome || 'Usuário CastraPrev');
                if (erro) erro.textContent = '';
            };
            leitor.readAsDataURL(arquivo);
        });
    }

    if (botaoRemoverFoto) {
        botaoRemoverFoto.addEventListener('click', function () {
            fotoPerfilAtual = '';
            if (inputFoto) inputFoto.value = '';
            atualizarPreviewAvatarPerfil('', campoNome.value.trim() || usuarioLogado.nome || 'Usuário CastraPrev');
            if (erro) erro.textContent = '';
        });
    }

    formPerfil.addEventListener('submit', function (event) {
        event.preventDefault();

        const nome = document.getElementById('perfil-nome').value.trim();
        const email = document.getElementById('perfil-email').value.trim().toLowerCase();
        const telefone = document.getElementById('perfil-telefone').value.trim();
        const tipo = document.getElementById('perfil-tipo').value;
        const cep = document.getElementById('perfil-cep').value.trim();
        const uf = document.getElementById('perfil-uf').value.trim();
        const endereco = document.getElementById('perfil-endereco').value.trim();
        const numero = document.getElementById('perfil-numero').value.trim();
        const bairro = document.getElementById('perfil-bairro').value.trim();
        const cidade = document.getElementById('perfil-cidade').value.trim();
        const complemento = document.getElementById('perfil-complemento').value.trim();
        const senhaAtual = document.getElementById('perfil-senha-atual').value.trim();
        const novaSenha = document.getElementById('perfil-nova-senha').value.trim();
        const confirmarSenha = document.getElementById('perfil-confirmar-senha').value.trim();

        if (erro) erro.textContent = '';
        if (mensagem) {
            mensagem.textContent = '';
            mensagem.classList.remove('show');
        }

        if (nome.length < 3) {
            if (erro) erro.textContent = 'Digite um nome com pelo menos 3 letras.';
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            if (erro) erro.textContent = 'Digite um e-mail válido.';
            return;
        }

        if (cep.replace(/\D/g, '').length !== 8) {
            if (erro) erro.textContent = 'Digite um CEP válido com 8 números.';
            return;
        }

        if (!endereco || !numero || !bairro || !cidade || !uf) {
            if (erro) erro.textContent = 'Preencha o endereço completo: endereço, número, bairro, cidade, UF e CEP.';
            return;
        }

        const usuarios = carregarUsuarios();
        const indiceUsuario = usuarios.findIndex(usuario => {
            if (usuarioLogado.email) {
                return (usuario.email || '').toLowerCase() === usuarioLogado.email.toLowerCase();
            }
            return usuario.id === usuarioLogado.id;
        });

        if (indiceUsuario === -1) {
            if (erro) erro.textContent = 'Não foi possível localizar seu cadastro para salvar as alterações.';
            return;
        }

        const emailJaExiste = usuarios.some((usuario, indice) => {
            return indice !== indiceUsuario && (usuario.email || '').toLowerCase() === email;
        });

        if (emailJaExiste) {
            if (erro) erro.textContent = 'Este e-mail já está sendo usado em outro cadastro.';
            return;
        }

        let senhaFinal = usuarios[indiceUsuario].senha;

        if (novaSenha || confirmarSenha || senhaAtual) {
            if (senhaAtual !== usuarios[indiceUsuario].senha) {
                if (erro) erro.textContent = 'Para trocar a senha, digite sua senha atual corretamente.';
                return;
            }

            if (novaSenha.length < 4) {
                if (erro) erro.textContent = 'A nova senha precisa ter pelo menos 4 caracteres.';
                return;
            }

            if (novaSenha !== confirmarSenha) {
                if (erro) erro.textContent = 'A confirmação da nova senha não confere.';
                return;
            }

            senhaFinal = novaSenha;
        }

        const usuarioAtualizado = {
            ...usuarios[indiceUsuario],
            nome,
            email,
            telefone,
            tipo,
            cep,
            endereco,
            numero,
            bairro,
            cidade,
            uf,
            complemento,
            fotoPerfil: fotoPerfilAtual,
            senha: senhaFinal,
            atualizadoEm: new Date().toISOString()
        };

        usuarios[indiceUsuario] = usuarioAtualizado;
        salvarUsuarios(usuarios);
        salvarSessao(usuarioAtualizado.nome, usuarioAtualizado.tipo, usuarioAtualizado.email);
        preencherResumoPerfil(usuarioAtualizado);
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

document.addEventListener('DOMContentLoaded', function () {
    const paginaProtegida = document.body.dataset.protegida === 'true';

    if (paginaProtegida && !estaLogado()) {
        const paginaAtual = pegarPaginaAtual();
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
