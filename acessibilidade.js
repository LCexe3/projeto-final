(function () {
    const CHAVE_FONTE = 'castraprev_font_scale';
    const FONTE_MIN = 0.9;
    const FONTE_MAX = 1.25;
    const FONTE_PASSO = 0.1;

    const limitarFonte = (valor) => Math.min(FONTE_MAX, Math.max(FONTE_MIN, Number(valor) || 1));

    const obterFonteSalva = () => {
        try {
            return limitarFonte(localStorage.getItem(CHAVE_FONTE) || 1);
        } catch (erro) {
            return 1;
        }
    };

    const salvarFonte = (valor) => {
        try {
            localStorage.setItem(CHAVE_FONTE, String(valor));
        } catch (erro) {
            // Mesmo se o navegador bloquear o armazenamento, a alteração funciona na página atual.
        }
    };

    const aplicarFonte = (valor) => {
        const escala = limitarFonte(valor);
        document.documentElement.style.fontSize = `${escala * 100}%`;
        document.documentElement.dataset.fontScale = String(escala.toFixed(2));
        salvarFonte(escala);
        atualizarStatusFonte(escala);
    };

    const atualizarStatusFonte = (escala) => {
        const status = document.querySelector('[data-accessibility-status]');
        if (status) {
            status.textContent = `Tamanho da fonte em ${Math.round(escala * 100)}%`;
        }
    };

    const ajustarFonte = (acao) => {
        const atual = obterFonteSalva();
        if (acao === 'increase') aplicarFonte(atual + FONTE_PASSO);
        if (acao === 'decrease') aplicarFonte(atual - FONTE_PASSO);
        if (acao === 'reset') aplicarFonte(1);
    };

    const criarLinkPularConteudo = () => {
        if (document.querySelector('.skip-link')) return;

        const principal = document.querySelector('main') || document.body;
        if (!principal.id) principal.id = 'conteudo-principal';

        const link = document.createElement('a');
        link.className = 'skip-link';
        link.href = `#${principal.id}`;
        link.textContent = 'Pular para o conteúdo';
        document.body.insertBefore(link, document.body.firstChild);
    };

    const criarControlesFonte = () => {
        if (document.querySelector('.accessibility-toolbar')) return;

        const barra = document.createElement('section');
        barra.className = 'accessibility-toolbar';
        barra.setAttribute('aria-label', 'Ferramentas de acessibilidade');
        barra.innerHTML = `
            <span class="accessibility-title"><i class="fas fa-universal-access" aria-hidden="true"></i> Acessibilidade</span>
            <button type="button" data-font-action="decrease" aria-label="Diminuir tamanho da fonte">A-</button>
            <button type="button" data-font-action="reset" aria-label="Restaurar tamanho original da fonte">100%</button>
            <button type="button" data-font-action="increase" aria-label="Aumentar tamanho da fonte">A+</button>
            <span class="accessibility-status" data-accessibility-status aria-live="polite"></span>
        `;

        barra.querySelectorAll('[data-font-action]').forEach((botao) => {
            botao.addEventListener('click', () => ajustarFonte(botao.dataset.fontAction));
        });

        document.body.appendChild(barra);
        atualizarStatusFonte(obterFonteSalva());
    };

    const iniciarVLibras = () => {
        if (window.__castraprevVLibrasIniciado) return;
        if (window.VLibras && window.VLibras.Widget) {
            window.__castraprevVLibrasIniciado = true;
            new window.VLibras.Widget('https://vlibras.gov.br/app');
        }
    };

    const integrarVLibras = () => {
        if (!document.querySelector('[vw]')) {
            const vlibras = document.createElement('div');
            vlibras.setAttribute('vw', '');
            vlibras.className = 'enabled';
            vlibras.innerHTML = `
                <div vw-access-button class="active"></div>
                <div vw-plugin-wrapper>
                    <div class="vw-plugin-top-wrapper"></div>
                </div>
            `;
            document.body.appendChild(vlibras);
        }

        const scriptExistente = document.querySelector('script[src*="vlibras-plugin.js"]');
        if (scriptExistente) {
            iniciarVLibras();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.async = true;
        script.onload = iniciarVLibras;
        document.body.appendChild(script);
    };

    aplicarFonte(obterFonteSalva());

    document.addEventListener('DOMContentLoaded', () => {
        criarLinkPularConteudo();
        criarControlesFonte();
        integrarVLibras();
    });
})();
