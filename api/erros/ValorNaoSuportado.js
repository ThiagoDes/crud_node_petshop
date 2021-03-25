class ValorNaoSuportado extends Error {
    constructor(contentType) {
        const mensagem = `O tipo de conteúdo ${contentType} não é suportado.`
        super(mensagem)
        this.name = 'ValorNaoSuportado'
        this.idErro = 3
    }
}

module.exports = ValorNaoSuportado