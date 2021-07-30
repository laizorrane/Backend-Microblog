import {ManterUsuario} from "./ManterUsuario";

export class Postagem {
    id?: string;
    conteudo?: string;
    dataDePostagem?: any;
    criador?: ManterUsuario;
    likes?: ManterUsuario[];
    comentarios?: Comentario[];

    constructor(
        id?: string,
        conteudo?: string,
        dataDePostagem?: any,
        criador?: ManterUsuario,
        likes?: ManterUsuario[],
        comentarios?: Comentario[],

    ) {
      this.id = id;
      this.conteudo = conteudo;
      this.dataDePostagem = dataDePostagem;
      this.criador = criador;
      this.likes = likes;
      this.comentarios = comentarios;
    }

    public isValida(): boolean {
      return this.conteudo !== undefined && this.criador !== undefined;
    }

    static toPostagem(json: any): Postagem {
      return new Postagem(json.id, json.conteudo, new Date(json.dataDePostagem), ManterUsuario.toManterUsuario(json.criador), json.likes, json.comentarios);
    }
    public toJson(): any {
      return JSON.parse(JSON.stringify(this));
    }
}

export class Comentario {
    id?: string;
    dataDoComentario?: Date;
    comentario?: string;
    criador?: ManterUsuario;

    constructor(criador?: ManterUsuario, comentario?: string, dataDoComentario?: Date, id?: string) {
      this.criador = criador;
      this.comentario = comentario;
      this.dataDoComentario = dataDoComentario;
      this.id = id;
    }

    public isValido(): boolean {
      return this.criador !== undefined && this.comentario !== undefined && this.comentario !== "";
    }
    static toComentario(json: any): Comentario {
      return new Comentario(ManterUsuario.toManterUsuario(json.criador), json.comentario, json.dataDoComentario);
    }
    public toJson(): any {
      return JSON.parse(JSON.stringify(this));
    }
}
