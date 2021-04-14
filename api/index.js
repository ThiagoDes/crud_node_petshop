const express = require('express')
const config = require('config')
const roteador = require('./rotas/fornecedores/index')
const roteadorV2 = require('./rotas/fornecedores/rotas_v2')
const NaoEncontrado = require('./erros/NaoEncontrado')
const CampoInvalido = require('./erros/CampoInvalido')
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos')
const ValorNaoSuportado = require('./erros/ValorNaoSuportado')
const SerializadorErro = require('./Serializador').SerializadorErro
const formatosAceitos = require('./Serializador').formatosAceitos
const app = express()

app.use(express.json());

app.use((requisicao, resposta, proximo) => {
    let formatoRequisitado = requisicao.header('Accept')

    if(formatoRequisitado === '*/*'){
        formatoRequisitado = 'application/json'
    }

    if(formatosAceitos.indexOf(formatoRequisitado) === -1){
        resposta.status(406)
        resposta.end()
        return
    }

    resposta.setHeader('Content-type', formatoRequisitado)
    resposta.set('X-Powered-By', 'Api Petshop')
    proximo()
})

app.use((requisicao, resposta, proximo) => {
    resposta.set('Access-Control-Allow-Origin', '*')
    proximo()
})

app.use('/api/fornecedores', roteador)

app.use('/api/v2/fornecedores', roteadorV2)

app.use((erro, requisicao, resposta, proximo) => {

    let status = 500

    if(erro instanceof NaoEncontrado) {
        status = 404
    }

    if(erro instanceof CampoInvalido || erro instanceof DadosNaoFornecidos) {
        status = 400
    }

    if(erro instanceof ValorNaoSuportado) {
        status = 406
    }

    resposta.status(status)

    const serializador = new SerializadorErro(
        resposta.getHeader('Content-type')
    )

    resposta.send(
        serializador.Serializar({
            mensagem: erro.message,
            id: erro.idErro
        })
    )
})

app.listen(config.get('api.porta'), () => console.log('A Api está funcionando!'))