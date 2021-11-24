import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect, use} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs-extra";
import {clearDisk, diskLength} from "../TestUtil";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

describe("Facade D3", function () {
	this.timeout(20000);
	let facade: InsightFacade;
	let server: Server;
	const datasetContents = new Map<string, any>();

	const datasetsToLoad: { [key: string]: string } = {
		courses: "./test/resources/archives/courses.zip",
		coursesInvalidJSON: "./test/resources/archives/coursesInvalidJSON.zip",
		rooms: "./test/resources/archives/rooms.zip",
		rooms2: "./test/resources/archives/rooms-2.zip"
	};
	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]);
			datasetContents.set(key, content);
		}
		server.start()
			.catch((error) => {
				console.log(error);
			});
	});

	after(function () {
		// TODO: stop server here once!
		server.stop();
	});

	beforeEach(function () {
		clearDisk();
		// might want to add some process logging here to keep track of what"s going on
	});

	afterEach(function () {
		fs.removeSync("./data");
		// might want to add some process logging here to keep track of what"s going on
	});

	// Sample on how to format PUT requests

	describe("PUT tests", function () {

		it("PUT test for courses dataset", function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("/dataset/courses/Courses")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["courses"]});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});

		it("PUT test for invalid courses dataset MAIN INVALID", function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("/dataset/courses_Invalid/Courses")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error");
						expect(res.status).to.be.equal(400);
						console.log(res.body);
						// expect(res.body).to.deep.equal({result: ["coursesInvalid"]});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});

		it("PUT test for rooms dataset", function () {
			const content: string = datasetContents.get("rooms") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("/dataset/rooms/Rooms")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["rooms"]});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});

		it("PUT test for two courses dataset MAIN PUT TEST", function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				console.log("in test");
				chai.request("http://localhost:4321")
					.put("/dataset/courses/Courses")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["courses"]});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
				console.log("in test2");
				return chai.request("http://localhost:4321")
					.put("/dataset/courses2/Courses")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["courses", "courses2"]});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
			// try {
			//
			// } catch (err) {
			// 	console.log("outside error");
			// 	console.log(err);
			// 	// and some more logging here!
			// }
		});
	});

	describe("GET tests", function () {

		it("GET test for empty dataset", function () {
			const content: string = datasetContents.get("rooms") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.get("/datasets")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error");
						console.log(res.body);
						expect(res.status).to.be.equal(200);
						expect(res.body).to.deep.equal({result: []});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});

		it("GET test for one dataset", function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("/dataset/courses/Courses")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error1");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["courses"]});
						return chai.request("http://localhost:4321")
							.get("/datasets")
							.then(function (res2: any) {
								// some logging here please!
								console.log("no error2");
								expect(res2.status).to.be.equal(200);
								// console.log(res);
								expect(res2.body).to.deep.equal({
									result: [{
										id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612,
									}]
								});
							})
							.catch(function (err) {
								console.log("inside error");
								console.log(err);
								// some logging here please!
								expect.fail();
							});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});

		it("GET test for two datasets MAIN GET TEST", function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("/dataset/courses/Courses")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error1");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["courses"]});
						const content2: string = datasetContents.get("rooms") ?? "";
						return chai.request("http://localhost:4321")
							.put("/dataset/rooms/Rooms")
							.send(content2)
							.set("Content-Type", "application/x-zip-compressed")
							.then(function (res2: any) {
								// some logging here please!
								console.log("no error2");
								expect(res2.status).to.be.equal(200);
								// console.log(res);
								expect(res2.body).to.deep.equal({result: ["courses", "rooms"]});
								return chai.request("http://localhost:4321")
									.get("/datasets")
									.then(function (res3: any) {
										// some logging here please!
										console.log("no error3");
										expect(res3.status).to.be.equal(200);
										// console.log(res);
										expect(res3.body).to.deep.equal({
											result: [
												{id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612,},
												{id: "rooms", kind: InsightDatasetKind.Rooms, numRows: 364,}]
										});
									})
									.catch(function (err) {
										console.log("inside error");
										console.log(err);
										// some logging here please!
										expect.fail();
									});
							})
							.catch(function (err) {
								console.log("inside error");
								console.log(err);
								// some logging here please!
								expect.fail();
							});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});
	});

	describe("DELETE tests", function () {

		it("DELETE test for one dataset", function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("/dataset/courses/Courses")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error1");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["courses"]});
						return chai.request("http://localhost:4321")
							.delete("/dataset/courses")
							.then(function (res2: any) {
								// some logging here please!
								console.log("no error2");
								expect(res2.status).to.be.equal(200);
								// console.log(res);
								expect(res2.body).to.deep.equal({result: "courses"});
								return chai.request("http://localhost:4321")
									.get("/datasets")
									.then(function (res3: any) {
										// some logging here please!
										console.log("no error3");
										expect(res3.status).to.be.equal(200);
										// console.log(res);
										expect(res3.body).to.deep.equal({result: []});
									})
									.catch(function (err) {
										console.log("inside error");
										console.log(err);
										// some logging here please!
										expect.fail();
									});
							})
							.catch(function (err) {
								console.log("inside error");
								console.log(err);
								// some logging here please!
								expect.fail();
							});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});
	});

	it("DELETE test with InsightError", function () {
		const content: string = datasetContents.get("courses") ?? "";
		try {
			console.log("in test");
			return chai.request("http://localhost:4321")
				.put("/dataset/courses/Courses")
				.send(content)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: any) {
					// some logging here please!
					console.log("no error1");
					expect(res.status).to.be.equal(200);
					// console.log(res);
					expect(res.body).to.deep.equal({result: ["courses"]});
					return chai.request("http://localhost:4321")
						.delete("/dataset/cour_ses")
						.then(function (res2: any) {
							// some logging here please!
							console.log("no error2");
							expect(res2.status).to.be.equal(400);
							console.log(res2.body);
							// expect(res2.body).to.deep.equal({result: "courses"});
						})
						.catch(function (err) {
							console.log("inside error");
							console.log(err);
							// some logging here please!
							expect.fail();
						});
				})
				.catch(function (err) {
					console.log("inside error");
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log("outside error");
			console.log(err);
			// and some more logging here!
		}
	});

	it("DELETE test with NotFoundError", function () {
		const content: string = datasetContents.get("courses") ?? "";
		try {
			console.log("in test");
			return chai.request("http://localhost:4321")
				.delete("/dataset/courses")
				.then(function (res2: any) {
					// some logging here please!
					console.log("no error2");
					expect(res2.status).to.be.equal(404);
					console.log(res2.body);
					// expect(res2.body).to.deep.equal({result: "courses"});
				})
				.catch(function (err) {
					console.log("inside error");
					console.log(err);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			console.log("outside error");
			console.log(err);
			// and some more logging here!
		}
	});

	describe("POST tests", function () {

		it("POST test for complex query", function () {
			const content: string = datasetContents.get("rooms") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("/dataset/rooms/Rooms")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error1");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["rooms"]});
						return chai.request("http://localhost:4321")
							.post("/query")
							.send({

								WHERE: {

									AND: [{

										IS: {

											rooms_furniture: "*Tables*"

										}

									}, {

										GT: {

											rooms_seats: 300

										}

									}]

								},

								OPTIONS: {

									COLUMNS: [

										"rooms_shortname",

										"maxSeats"

									],

									ORDER: {

										dir: "DOWN",

										keys: ["maxSeats"]

									}

								},

								TRANSFORMATIONS: {

									GROUP: ["rooms_shortname"],

									APPLY: [{

										maxSeats: {

											MAX: "rooms_seats"

										}

									}]

								}

							})
							.then(function (res2: any) {
								// some logging here please!
								console.log("no error2");
								// console.log(res2.body);
								expect(res2.status).to.be.equal(200);
								expect(res2.body).to.deep.equal({
									result:  [
										{

											rooms_shortname: "OSBO",

											maxSeats: 442

										},  {

											rooms_shortname: "HEBB",

											maxSeats: 375

										}, {

											rooms_shortname: "LSC",

											maxSeats: 350

										}	]
								});
							})
							.catch(function (err) {
								console.log("inside error");
								console.log(err);
								// some logging here please!
								expect.fail();
							});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});

		it("POST test for complex invalid query", function () {
			const content: string = datasetContents.get("rooms") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("/dataset/rooms/Rooms")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error1");
						expect(res.status).to.be.equal(200);
						// console.log(res);
						expect(res.body).to.deep.equal({result: ["rooms"]});
						return chai.request("http://localhost:4321")
							.post("/query")
							.send({

								WHERE: {

									AND: [{

										IS: {

											rooms_furniture: "*Tables*"

										}

									}, {

										GT: {

											rooms_seats: 300

										}

									}]

								},

								OPTIONS: {

									COLUMNS: [

										"room_shortname",

										"maxSeats"

									],

									ORDER: {

										dir: "DOWN",

										keys: ["maxSeats"]

									}

								},

								TRANSFORMATIONS: {

									GROUP: ["rooms_shortname"],

									APPLY: [{

										maxSeats: {

											MAX: "rooms_seats"

										}

									}]

								}

							})
							.then(function (res2: any) {
								// some logging here please!
								console.log("no error2");
								console.log(res2.body);
								expect(res2.status).to.be.equal(400);
								// expect(res2.body).to.deep.equal({result:  []});
							})
							.catch(function (err) {
								console.log("inside error");
								console.log(err);
								// some logging here please!
								expect.fail();
							});
					})
					.catch(function (err) {
						console.log("inside error");
						console.log(err);
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				console.log("outside error");
				console.log(err);
				// and some more logging here!
			}
		});
	});
	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
