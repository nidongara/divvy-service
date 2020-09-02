const request = require("supertest");
const app = require("../../src/app");
const agent = request.agent(app);
const urlPrefix = "/api/v1";
jest.setTimeout(60000)
beforeAll((done) => {
  app.on("cacheInitialized", () =>{
    done();
  });
});

describe("GET /api/v1/station", () => {
  it("Fetching Station information with Token", async () => {
    const response = await agent
      .get(`${urlPrefix}/station/1436495105198659242`)
      .auth(process.env.BASIC_USER, process.env.BASIC_SECRET)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("external_id");
    expect(response.body).toHaveProperty("station_id", "1436495105198659242");
  });
  it("Fetching Station information without Token", async () => {
    const response = await agent
      .get(`${urlPrefix}/station/1436495105198659242`)
    expect(response.statusCode).toBe(401);
  });
  it("Fetching Station information that does not exist", async () => {
    const response = await agent
      .get(`${urlPrefix}/station/1436495105`)
      .auth(process.env.BASIC_USER, process.env.BASIC_SECRET)
    expect(response.statusCode).toBe(404);
  });
});
