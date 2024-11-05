export class GenreRepositoryMock {
  mockGenre = {
    id: 1,
    name: 'Action',
    external_id: 1,
    watchables: [],
  };

  async find() {
    return Promise.resolve([this.mockGenre]);
  }
}
