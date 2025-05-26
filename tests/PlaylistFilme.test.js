import { expect } from 'chai';
import { sequelize, db } from './setup.js';

describe('PlaylistFilme Model', () => {
  let usuario, filme, playlist;

  beforeEach(async () => {
    await sequelize.sync({ force: true }); // Limpa o banco antes de cada teste

    // Criação das dependências
    filme = await db.Filme.create({
      titulo: 'Matrix',
      genero: 'Ficção Científica',
      duracao: 136,
      ano_lancamento: 1999,
      nota_avaliacao: 9.0,
    });

    usuario = await db.Usuario.create({
      login: 'maria123',
      nome: 'Maria Souza',
      data_nascimento: '1995-06-15',
      email: 'maria@example.com',
    });

    playlist = await db.Playlist.create({
      id_usuario: usuario.id,
      nome: 'Favoritos de Sci-Fi',
      data_criacao: new Date(),
    });
  });

  it('Deve criar um PlaylistFilme com dados válidos', async () => {
    const playlistFilme = await db.PlaylistFilme.create({
      id_playlist: playlist.id,
      id_filme: filme.id,
      assistido: true,
      nota_avaliacao_usuario: 4,
    });

    expect(playlistFilme).to.have.property('id');
    expect(playlistFilme.id_playlist).to.equal(playlist.id);
    expect(playlistFilme.assistido).to.be.true;
    expect(playlistFilme.nota_avaliacao_usuario).to.equal(4);
  });

  it('Não deve criar um PlaylistFilme sem id_playlist', async () => {
    try {
      await db.PlaylistFilme.create({
        id_filme: filme.id,
      });
      expect.fail('Deveria ter lançado um erro de validação');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
    }
  });

  it('Não deve criar um PlaylistFilme sem id_filme', async () => {
    try {
      await db.PlaylistFilme.create({
        id_playlist: playlist.id,
      });
      expect.fail('Deveria ter lançado um erro de validação');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
    }
  });

  it('Não deve aceitar nota_avaliacao_usuario fora do intervalo de 1 a 5', async () => {
    for (const nota of [6, 0]) {
      try {
        await db.PlaylistFilme.create({
          id_playlist: playlist.id,
          id_filme: filme.id,
          nota_avaliacao_usuario: nota,
        });
        expect.fail('Deveria ter lançado um erro de validação');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
      }
    }
  });

  it('Pode criar PlaylistFilme com dados parciais (usando defaults)', async () => {
    const playlistFilme = await db.PlaylistFilme.create({
      id_playlist: playlist.id,
      id_filme: filme.id,
    });

    expect(playlistFilme.assistido).to.be.false;
    expect(playlistFilme.tempo_assistido).to.equal(0);
    expect(playlistFilme.data_visualizacao).to.be.null;
    expect(playlistFilme.nota_avaliacao_usuario).to.be.null;
  });
});
