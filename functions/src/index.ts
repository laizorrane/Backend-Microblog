import * as functions from "firebase-functions";
import * as express from "express";
import * as admin from "firebase-admin";
import {UsuarioService} from "./services/Usuario.service";
import {PostagemService} from "./services/Postagem.service";

// Banco firestore
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
// Relacionada ao usuário

const usuarioExpress = express();

const usuarioService = new UsuarioService(db);

usuarioExpress.post("/cadastrarUsuario", (req, res) => usuarioService.cadastrarUsuario(req, res));

usuarioExpress.get("/logarUsuario", (req, res) => usuarioService.logarUsuario(req, res));

usuarioExpress.put("/editarUsuario", (req, res) => usuarioService.editarUsuario(req, res));

export const usuarioLaiz = functions.https.onRequest(usuarioExpress);

// A segunda relacionada aos posts

const postagemExpress = express();

const postagemService = new PostagemService(db);

postagemExpress.post("/manterPostagem", (req, res) => postagemService.ManterPostagem(req, res));

postagemExpress.post("/comentarPost", (req, res) => postagemService.comentaPublicacao(req, res));

postagemExpress.delete("/excluirPostagem", (req, res) => postagemService.excluiPostagem(req, res));

postagemExpress.delete("/excluirComentario", (req, res) => postagemService.excluirComentario(req, res));

postagemExpress.post("/darLike", (req, res) => postagemService.darLikeNoPost(req, res));

postagemExpress.delete("/removerLike", (req, res) => postagemService.removerLikeDoPost(req, res));

postagemExpress.get("/consultarPublicacoes", (req, res) => postagemService.listaPublicacoes(req, res));

export const feedLaiz = functions.https.onRequest(postagemExpress);
