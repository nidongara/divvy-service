
class Helper {
  constructor(model) {
    this.apiServer = supertest(app);
  }
}

module.exports = Helper;
