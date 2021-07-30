import {firestore} from "firebase-admin";
import {Request, Response} from "express";
import {HttpUtil} from "../util/HttpUtil";
import {Comentario, Postagem} from "../Model/Postagem";
import {ManterUsuario} from "../Model/ManterUsuario";

export class PostagemService {
    private db: firestore.Firestore;

    constructor(db:firestore.Firestore) {
      this.db = db;
    }

    /**
     * realizar/editar uma Postagem
     */

    public ManterPostagem(request: Request, response: Response) {
      if (request.body === undefined) {
        request.body = {};
      }
      const postagem = Postagem.toPostagem(request.body);
      if (postagem.isValida()) {
        if (postagem.id === undefined || postagem.id === null || postagem.id === "null") {
          postagem.id = this.db.collection("x").doc().id;
          postagem.dataDePostagem = new Date();
        } else {
          postagem.dataDePostagem = new Date (postagem.dataDePostagem?.toString());
        }
        this.db.doc(`publicacoesLaiz/${postagem.id}`).set(postagem.toJson(), {merge: true})
            .then(_resultadoSnap => {
              HttpUtil.sucesso(postagem.toJson(), response);
            }).catch(erro => {
              HttpUtil.falha("Postagem inválida." +erro, response);
            });
      } else {
        HttpUtil.falha("Postagem inválida.", response);
      }
    }

    /**
     * comentaPublicacao
     */
    public comentaPublicacao(request: Request, response: Response) {
      const idPostagem = request.query.id;
      const comentario = Comentario.toComentario(request.body);
      var post: Postagem;
      if (idPostagem === undefined || idPostagem === "") {
        HttpUtil.falha("O parâmetro ID não pode ser nulo", response);
      } else if (!comentario.isValido()) {
        HttpUtil.falha("O comentário deve ser preenchido", response);
      } else {
        this.db.doc(`publicacoesLaiz/${idPostagem}`).get()
            .then((postSnap) => {
              post = Postagem.toPostagem(postSnap.data());
              comentario.dataDoComentario = new Date();
              comentario.id = this.db.collection("x").doc().id;
              if (post.comentarios === undefined) post.comentarios = [];
              post.comentarios.push(comentario);
              return postSnap.ref.set(post.toJson(), {merge: true});
            }).then(_=> {
              HttpUtil.sucesso(post.toJson(), response);
            }).catch((erro) => {
              HttpUtil.falha("Houve uma falha ao tentar inserir um comentário" +erro, response);
            });
      }
    }

    /**
     * excluiPostagem
     */
    public excluiPostagem(request: Request, response: Response) {
      if (request.query.id === undefined || request.query.id === "") {
        HttpUtil.falha("Post inválido", response);
      } else {
        this.db.doc(`publicacoesLaiz/${request.query.id}`).delete().then((_) => {
          HttpUtil.sucesso("Post excluído com sucesso", response);
        }).catch((erro) => {
          HttpUtil.falha("Ops, tive uma falha" +erro, response);
        });
      }
    }

    /**
     * excluirComentario
     */
    public excluirComentario(request: Request, response: Response) {
      const idPostagem = request.query.id;
      const idComentario = request.query.idComentario;
      var postgem:Postagem;
      if (idPostagem === undefined || idPostagem === "" || idComentario === undefined || idComentario === "") {
        HttpUtil.falha("Post ou comentário inválido", response);
      } else {
        this.db.doc(`publicacoesLaiz/${idPostagem}`).get().then((postSnap) => {
          postgem = Postagem.toPostagem(postSnap.data());
          postgem.comentarios = postgem.comentarios?.filter((c)=>c.id !== idComentario);
          return postSnap.ref.set(postgem.toJson());
        }).then(_=> {
          HttpUtil.sucesso(postgem.toJson(), response);
        }).catch((erro) => {
          HttpUtil.falha("Ops! Houve um erro inesperado" +erro, response);
        });
      }
    }

    /**
     * darLikeNoPost
     */
    public darLikeNoPost(request: Request, response: Response) {
      const idPostagem = request.query.id;
      const like = ManterUsuario.toManterUsuario(request.body);
      var postgem:Postagem;
      if (idPostagem === undefined || idPostagem === "" || like === undefined) {
        HttpUtil.falha("O like não pode ser dado, pois o parâmetro ID está vazio", response);
      } else {
        this.db.doc(`publicacoesLaiz/${idPostagem}`).get().then((postSnap) => {
          postgem = Postagem.toPostagem(postSnap.data());
          if (postgem.likes === undefined || postgem.likes === null) postgem.likes = [];
          postgem.likes.push(like);
          return postSnap.ref.set(postgem.toJson());
        }).then(_=> {
          HttpUtil.sucesso(postgem.toJson(), response);
        }).catch((erro) => {
          HttpUtil.falha("Ops! Houve um erro inesperado" +erro, response);
        });
      }
    }

    /**
     * removerLikeDoPost
     */
    public removerLikeDoPost(request: Request, response: Response) {
      const idPostagem = request.query.id;
      const idUsuario = request.query.idUsuario;
      var postgem:Postagem;
      if (idPostagem === undefined || idPostagem === "" || idUsuario === undefined || idUsuario === "") {
        HttpUtil.falha("Não é possível remover o like, falta ID da publicação ou ID do usuário", response);
      } else {
        this.db.doc(`publicacoesLaiz/${idPostagem}`).get().then((postSnap) => {
          postgem = Postagem.toPostagem(postSnap.data());
          postgem.likes = postgem.likes?.filter((l)=>l.id !== idUsuario);
          return postSnap.ref.set(postgem.toJson());
        }).then(_=> {
          HttpUtil.sucesso(postgem.toJson(), response);
        }).catch((erro) => {
          HttpUtil.falha("Ops! Houve um erro inesperado" +erro, response);
        });
      }
    }

    /**
     * listaPublicacoes
     */
    public listaPublicacoes(_request: Request, response: Response) {
      this.db.collection("publicacoesLaiz").orderBy("dataDePostagem", "asc").get().then((postagensSnap) => {
        const listPublicacoes: Postagem[] = [];
        postagensSnap.docs.forEach((postSnap) => {
          listPublicacoes.push(Postagem.toPostagem(postSnap.data()));
        });
        HttpUtil.sucesso(listPublicacoes, response);
      }).catch((erro) => {
        HttpUtil.falha("Ops! Houve um erro inesperado" +erro, response);
      });
    }
}


