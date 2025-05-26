import { expect } from 'chai';
import { sequelize, db } from './setup.js'; // setup.js configura sequelize + modelos

describe('Playlist Model', () => {
  it('Deve criar uma playlist com dados válidos', async () => {
    const usuario = await db.Usuario.create({
      login: 'teste123',
      nome: 'Usuário Teste',
    });

    const playlist = await db.Playlist.create({
      id_usuario: usuario.id,
      nome: 'Minha Playlist Favorita',
      data_criacao: new Date('2024-01-01'),
    });


    expect(playlist).to.have.property('id');
    expect(playlist.id_usuario).to.equal(usuario.id);
    expect(playlist.nome).to.equal('Minha Playlist Favorita');
    expect(playlist.data_criacao.toISOString()).to.include('2024-01-01');
  });

  it('Não deve criar uma playlist sem id_usuario', async () => {
    try {
      await db.Playlist.create({
        nome: 'Sem Usuário',
        data_criacao: new Date(),
      });
      expect.fail('Deveria ter lançado um erro de validação');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
    }
  });

  it('Pode criar uma playlist sem nome e data_criacao (campos opcionais)', async () => {
    const usuario = await db.Usuario.create({
      login: 'teste124',
      nome: 'Usuário Sem Nome de Playlist',
    });

    const playlist = await db.Playlist.create({
      id_usuario: usuario.id,
    });

    expect(playlist).to.have.property('id');
    expect(playlist.nome).to.be.null;
    expect(playlist.data_criacao).to.be.null;
  });

  it('Deve associar um usuário a várias playlists', async () => {
    const usuario = await db.Usuario.create({
      login: 'teste125',
      nome: 'Usuário Vários Playlists',
    });

    await db.Playlist.create({
      id_usuario: usuario.id,
      nome: 'Playlist 1',
    });

    await db.Playlist.create({
      id_usuario: usuario.id,
      nome: 'Playlist 2',
    });

    const playlists = await usuario.getPlaylists();
    expect(playlists).to.have.lengthOf(2);
    expect(playlists.map(p => p.nome)).to.include.members(['Playlist 1', 'Playlist 2']);
  });
});
