import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs-extra";

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;
	const datasetContents = new Map<string, string>();

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
			const content = fs.readFileSync(datasetsToLoad[key]).toString();
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
		// might want to add some process logging here to keep track of what"s going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	// Sample on how to format PUT requests

	describe("PUT tests", function() {

		it("PUT test for courses dataset", function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				console.log("in test");
				return chai.request("http://localhost:4321")
					.put("dataset/courses/Courses")
					.send(content)
					.set("Content-Type", "application/x-zip-compressed")
					.end(function (res: any) {
						// some logging here please!
						console.log("no error");
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				// and some more logging here!
			}
		});

		it("PUT test for invalid courses dataset", function () {
			try {
				return chai.request("http://localhost:4321")
					.put("courses/course")
					.send("../resources/archives/coursesInvalidJSON.zip")
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						console.log("no error");
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log("error");
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				// and some more logging here!
			}
		});

		it("PUT test for rooms dataset", function () {
			try {
				return chai.request("http://localhost:4321")
					.put("rooms/room")
					.send("../resources/archives/rooms.zip")
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: any) {
						// some logging here please!
						console.log("no error");
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						// some logging here please!
						expect.fail();
					});
			} catch (err) {
				// and some more logging here!
			}
		});

	});


	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
