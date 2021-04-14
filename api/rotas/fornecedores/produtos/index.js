const roteador = require('express').Router({ mergeParams: true })
const TabelaProduto = require('./TabelaProduto')
const Produto = require('./Produto')
const Serializador = require('../../../Serializador').SerializadorProduto

roteador.options('/', async (requisicao, resposta) => {
    resposta.set('Access-Control-Allow-Methods', 'GET, POST')
    resposta.set('Access-Control-Allow-Headers', 'Content-type')
    resposta.status(204)
    resposta.end()
})

roteador.get('/', async (requisicao, resposta) => {
    const produtos = await TabelaProduto.listar(requisicao.fornecedor.id)
    const serializador = new Serializador(
        resposta.getHeader('Content-type')
    )
    resposta.status(200)
    resposta.send(
        serializador.Serializar(produtos)
    )
})

roteador.post('/', async (requisicao, resposta, proximo) => {
   try {
    const idFornecedor = requisicao.fornecedor.id
    const corpo = requisicao.body
    const dados = Object.assign({}, corpo, { fornecedor: idFornecedor })
    const produto = new Produto(dados)
    await produto.criar()
    const serializador = new Serializador(
        resposta.getHeader('Content-type')
    )
    resposta.set('ETag', produto.versao)
    const timestamp = (new Date(produto.dataAtualizacao)).getTime()
    resposta.set('Last-Modified', timestamp)
    resposta.set('Location', `/api/fornecedores/${produto.fornecedor}/produtos/${produto.id}`)
    resposta.status(201)
    resposta.send(
        serializador.Serializar(produto)
    )
   } catch (erro) {
       proximo(erro)
   }
})

roteador.options('/:id', async (requisicao, resposta) => {
    resposta.set('Access-Control-Allow-Methods', 'HEAD, GET, PUT, DELETE')
    resposta.set('Access-Control-Allow-Headers', 'Content-type')
    resposta.status(204)
    resposta.end()
})

roteador.get('/:id', async (requisicao, resposta, proximo) => {
    try {
        const dados = {
            id: requisicao.params.id,
            fornecedor: requisicao.fornecedor.id
        }
    
        const produto = new Produto(dados)
        await produto.carregar()
        const serializador = new Serializador(
            resposta.getHeader('Content-type'),
            ['preco', 'estoque', 'fornecedor', 'dataCriacao', 'dataAtualizacao', 'versao']
        )
        resposta.set('ETag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)
        resposta.send(
            serializador.Serializar(produto)
        )
    } catch (erro) {
        proximo(erro)
    }
})

roteador.put('/:id', async (requisicao, resposta, proximo) => {
    try {
        const dados = Object.assign(
            {},
            requisicao.body,
            {
                id: requisicao.params.id,
                fornecedor: requisicao.fornecedor.id
            }
        )

        const produto = new Produto(dados)
        await produto.atualizar()
        await produto.carregar()
        resposta.set('ETag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)
        resposta.status(204)
        resposta.end()
    } catch (erro) {
        proximo(erro)
    }
 })

roteador.delete('/:id', async (requisicao, resposta) => {
    const dados = {
        id: requisicao.params.id,
        fornecedor: requisicao.fornecedor.id
    }

    const produto = new Produto(dados)
    await produto.apagar()
    resposta.status(204)
    resposta.end()
})

roteador.options('/:id/diminuir_estoque', async (requisicao, resposta) => {
    resposta.set('Access-Control-Allow-Methods', 'POST')
    resposta.set('Access-Control-Allow-Headers', 'Content-type')
    resposta.status(204)
    resposta.end()
})

roteador.post('/:id/diminuir_estoque', async (requisicao, resposta, proximo) => {
   try {
        const produto = new Produto({
            id: requisicao.params.id,
            fornecedor: requisicao.fornecedor.id
        })

        await produto.carregar() 
        const qtd = requisicao.body.quantidade
        
        produto.estoque = produto.estoque - qtd 

        await produto.diminuirEstoque()
        await produto.carregar() 
        resposta.set('ETag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)
        resposta.status(204)
        resposta.end()
   } catch (erro) {
       proximo(erro)
   }
})

roteador.head('/:id', async (requisicao, resposta, proximo) => {
    try {
        const dados = {
            id: requisicao.params.id,
            fornecedor: requisicao.fornecedor.id
        }
    
        const produto = new Produto(dados)
        await produto.carregar()
        const serializador = new Serializador(
            resposta.getHeader('Content-type'),
            ['preco', 'estoque', 'fornecedor', 'dataCriacao', 'dataAtualizacao', 'versao']
        )
        resposta.set('ETag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)
        resposta.status(200)
        resposta.end()
    } catch (erro) {
        proximo(erro)
    }
})


module.exports = roteador