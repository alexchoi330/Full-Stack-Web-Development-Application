import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect, use} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs-extra";
import {clearDisk, diskLength} from "../TestUtil";

describe("Facade D3", function () {
	this.timeout(20000);
	let facade: InsightFacade;
	let server: Server;
	const datasetContents = new Map<string, any>();

	const datasetsToLoad: {[key: string]: string} = {
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

	describe("PUT tests", function() {

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

		it("PUT test for invalid courses dataset", function () {
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

		it("PUT test for two courses dataset", function () {
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
			try {
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
		});
	});


	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
