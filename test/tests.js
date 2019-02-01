/* eslint-disable prefer-arrow-callback */

const expect = require("expect");
const mongoose = require("mongoose");

const Store = require("../dist");
const schema = require("../dist/schema");

const EXPIRE_SHORT = 100000;
const EXPIRE_IMMEDIATE = 0;

describe("MongooseStore", () => {
  before(function() {
    return mongoose
      .connect("mongodb://localhost:27017/test_brute_express_mongoose", {
        useNewUrlParser: true
      })
      .then(() => {
        this.model = mongoose.model("bruteforce", new mongoose.Schema(schema));
      });
  });

  beforeEach(function() {
    mongoose.Promise = Promise;
    this.store = new Store(this.model);
    return this.model.deleteMany({}).exec();
  });

  it("should be able to set a value", function() {
    return this.store
      .set("foo", { count: 123 }, EXPIRE_SHORT)
      .then(() => this.model.findOne({ _id: "foo" }).exec())
      .then(data => {
        expect(data.data).toMatchObject({
          count: 123
        });
        expect(data.expires).toBeInstanceOf(Date);
      });
  });

  it("should be able to get a value", function() {
    return this.store
      .set("foo", { count: 123 }, EXPIRE_SHORT)
      .then(() => this.store.get("foo"))
      .then(data => {
        expect(data).toMatchObject({
          count: 123
        });
      });
  });

  it("should return undef if expired", function() {
    return this.store
      .set("foo", { count: 123 }, EXPIRE_IMMEDIATE)
      .then(() => this.store.get("foo"))
      .then(data => {
        expect(data).toBe(null);
      });
  });

  it("should delete the doc if expired", function() {
    return this.store
      .set("foo", { count: 123 }, EXPIRE_IMMEDIATE)
      .then(() => this.store.get("foo"))
      .then(() => this.model.findOne({ _id: "foo" }).exec())
      .then(data => {
        expect(data).toBe(null);
      });
  });

  it("should be able to reset", function() {
    return this.store
      .set("foo", { count: 123 }, EXPIRE_SHORT)
      .then(() => this.store.reset("foo"))
      .then(() => this.model.findOne({ _id: "foo" }).exec())
      .then(data => {
        expect(data).toBe(null);
      });
  });

  it("should be able to specify defaults", function() {
    const store = new Store(() => {}, { prefix: "testPrefix" });
    expect(store.options.prefix).toBe("testPrefix");
  });
});
