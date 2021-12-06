import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";

import {testFolder} from "@ubccpsc310/folder-test";
import {expect} from "chai";
import {clearDisk, diskLength} from "../TestUtil";
// this.timeout(15000);

describe("InsightFacade", function () {
	this.timeout(20000);
	let insightFacade: InsightFacade;
	const persistDir = "./data";
	const size = 64612;
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		courses: "./test/resources/archives/courses.zip",
		coursesInvalidJSON: "./test/resources/archives/coursesInvalidJSON.zip",
		rooms: "./test/resources/archives/rooms.zip",
		rooms2: "./test/resources/archives/rooms-2.zip"
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);
	});

	describe("Add/Remove/List Dataset", function () {

		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			insightFacade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent from the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDir);
		});

		// This is a unit test. You should create more like this!
		it("Should add a valid course dataset", function () {
			clearDisk();
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		it("Should add a valid rooms dataset", function () {
			clearDisk();
			const id: string = "rooms";
			const content: string = datasetContents.get("rooms") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		describe("List Datasets", function() {
			let facade: IInsightFacade;

			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("should list no datasets", function () {
				return facade.listDatasets().then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(0);
				});
			});

			it("should list one dataset", function () {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => facade.listDatasets())
					.then((insightDatasets) => {
						expect(insightDatasets).to.deep.equal([{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: size,
						}]);
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(1);
						const[insightDataset] = insightDatasets;
						expect(insightDataset).to.have.property("id");
						expect(insightDataset.id).to.equal("courses");
					});
			});

			it("should list one room dataset", function () {
				const id: string = "rooms";
				const content: string = datasetContents.get("rooms") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then(() => facade.listDatasets())
					.then((insightDatasets) => {
						expect(insightDatasets).to.deep.equal([
							{
								id: "rooms",
								kind: InsightDatasetKind.Rooms,
								numRows: 364,
							}
						]);
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(1);
						const[insightDataset] = insightDatasets;
						expect(insightDataset).to.have.property("id");
						expect(insightDataset.id).to.equal("rooms");
					});
			});

			it("should list multiple dataset", function () {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.addDataset("courses-2", content, InsightDatasetKind.Courses);
					})
					.then(() => {
						return facade.listDatasets();
					})
					.then((insightDatasets) => {
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(2);
						// const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
						// expect(insightDatasetCourses).to.exist;
						expect(insightDatasets).to.deep.equal([{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: size,
						}, {
							id: "courses-2",
							kind: InsightDatasetKind.Courses,
							numRows: size,
						}]);
					});
			});

			it("should list multiple room datasets", function () {
				const id: string = "rooms";
				const content: string = datasetContents.get("rooms") ?? "";
				const content2: string = datasetContents.get("rooms2") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then(() => {
						return facade.addDataset("rooms-2", content2, InsightDatasetKind.Rooms);
					})
					.then(() => {
						return facade.listDatasets();
					})
					.then((insightDatasets) => {
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(2);
						expect(insightDatasets).to.deep.equal([{
							id: "rooms",
							kind: InsightDatasetKind.Rooms,
							numRows: 364,
						}, {
							id: "rooms-2",
							kind: InsightDatasetKind.Rooms,
							numRows: 364,
						}]);
					});
			});

		});

		describe("Remove Datasets", function() {
			let facade: IInsightFacade;

			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("should throw InsightError when removing from empty Dataset", function() {
				return facade.removeDataset("courses").catch((err) => {
					expect(err).to.be.instanceof(NotFoundError);
				});
			});

			it("should throw InsightError when removing room from empty Dataset", function() {
				return facade.removeDataset("rooms").catch((err) => {
					expect(err).to.be.instanceof(NotFoundError);
				});
			});


			it("should throw NotFoundError when id is not in Dataset", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.removeDataset("courses-2");
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					})
					.catch((err) => {
						expect(err).to.be.instanceof(NotFoundError);
					});
			});

			it("should throw NotFoundError when room id is not in Dataset", function() {
				const id: string = "rooms";
				const content: string = datasetContents.get("rooms") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then(() => {
						return facade.removeDataset("rooms2");
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					})
					.catch((err) => {
						expect(err).to.be.instanceof(NotFoundError);
					});
			});

			it("should return the id of the Dataset that is successfully removed", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.removeDataset(id);
					}).then((res) => {
						expect(res).to.equal(id);
					}).then(() => {
						return facade.listDatasets();
					}).then((insightDatasets) => {
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(0);
					});
			});

			it("should return the room id of the Dataset that is successfully removed", function() {
				const id: string = "rooms";
				const content: string = datasetContents.get("rooms") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then(() => {
						return facade.removeDataset(id);
					}).then((res) => {
						expect(res).to.equal(id);
					}).then(() => {
						return facade.listDatasets();
					}).then((insightDatasets) => {
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(0);
					});
			});


			it("add 2 datasets, only delete 1 of them", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.addDataset("courses-2", content, InsightDatasetKind.Courses);
					}).then(() => {
						return facade.removeDataset("courses-2");
					}).then((res) => {
						expect(res).to.equal("courses-2");
					}).then(() => {
						return facade.listDatasets();
					})
					.then((insightDatasets) => {
						expect(insightDatasets).to.deep.equal([{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: size,
						}]);
					});
			});

			it("add 2 room datasets, only delete 1 of them", function() {
				const id: string = "rooms";
				const content: string = datasetContents.get("rooms") ?? "";
				const content1: string = datasetContents.get("rooms2") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then(() => {
						return facade.addDataset("rooms-2", content1, InsightDatasetKind.Rooms);
					}).then(() => {
						return facade.removeDataset("rooms-2");
					}).then((res) => {
						expect(res).to.equal("rooms-2");
					}).then(() => {
						return facade.listDatasets();
					})
					.then((insightDatasets) => {
						expect(insightDatasets).to.deep.equal([{
							id: "rooms",
							kind: InsightDatasetKind.Rooms,
							numRows: 364,
						}]);
					});
			});

			// it("should delete both disk and memory caches for the dataset for the id", function() {
			// 	const id: string = "courses";
			// 	const content: string = datasetContents.get("courses") ?? "";
			// 	return facade.addDataset(id, content, InsightDatasetKind.Courses)
			// 		.then(() => {
			// 			return facade.removeDataset("courses");
			// 		}).then(() => {
			// 			expect(diskLength()).to.equal(0);
			// 		});
			// });

			it("should throw InsightError when delete id is all spaces", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.removeDataset("        ");
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should throw InsightError when delete id contains underscore", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.removeDataset("courses_");
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

		});

		describe("Add Datasets", function() {
			let facade: IInsightFacade;

			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it ("should ignore a bad json file", function() {
				const id: string = "coursesInvalidJSON";
				const content: string = datasetContents.get("coursesInvalidJSON") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then((res) => {
						expect(res).to.deep.equal(["coursesInvalidJSON"]);
					});
			});

			it("should successfully add one dataset", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then((res) => {
						expect(res).to.be.an.instanceof(Array);
						expect(res).to.have.length(1);
						expect(res).to.deep.equal(["courses"]);
					});
			});


			it("should successfully add two dataset", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.addDataset("courses-2", content, InsightDatasetKind.Courses);
					}).then((res) => {
						expect(res).to.be.an.instanceof(Array);
						expect(res).to.have.length(2);
						expect(res).to.include.deep.members(["courses"]);
						expect(res).to.include.deep.members(["courses-2"]);
					});
			});

			it("should successfully add one room dataset", function() {
				const id: string = "rooms";
				const content: string = datasetContents.get("rooms") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then((res) => {
						expect(res).to.be.an.instanceof(Array);
						expect(res).to.have.length(1);
						expect(res).to.deep.equal(["rooms"]);
					});
			});

			it("should successfully add one room2 dataset", function() {
				const id: string = "rooms-2";
				const content: string = datasetContents.get("rooms2") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then((res) => {
						expect(res).to.be.an.instanceof(Array);
						expect(res).to.have.length(1);
						expect(res).to.deep.equal(["rooms-2"]);
					});
			});

			it("should successfully add two rooms datasets", function() {
				const id: string = "rooms";
				const content: string = datasetContents.get("rooms") ?? "";
				const content2: string = datasetContents.get("rooms2") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then(() => {
						return facade.addDataset("rooms-2", content2, InsightDatasetKind.Rooms);
					}).then((res) => {
						expect(res).to.be.an.instanceof(Array);
						expect(res).to.have.length(2);
						expect(res).to.include.deep.members(["rooms"]);
						expect(res).to.include.deep.members(["rooms-2"]);
					});
			});

			it("should throw InsightError when add id contains underscore", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset("courses_", content, InsightDatasetKind.Courses)
					.then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should throw InsightError when add id is all spaces", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset("     ", content, InsightDatasetKind.Courses)
					.then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject when add duplicate dataset", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.addDataset(id, content, InsightDatasetKind.Courses);
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch ((err) => {
						expect(err).to.be.instanceof(InsightError);
						// => {
						// expect(res).to.be.an.instanceof(Array);
						// expect(res).to.have.length(1);
					});
			});

			it("should reject when add duplicate room datasets", function() {
				const id: string = "rooms";
				const content: string = datasetContents.get("rooms") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Rooms)
					.then(() => {
						return facade.addDataset(id, content, InsightDatasetKind.Rooms);
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch ((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {

		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			insightFacade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			// const loadDatasetPromises = [
			//	insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses),
			// ];

			// return Promise.all(loadDatasetPromises);
			return insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.addDataset("rooms", datasetContents.get("rooms") ?? "",
						InsightDatasetKind.Rooms)
						.catch(() => "error???");
				});
			// return insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses)
			// 	.catch(()=> "error???");
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			fs.removeSync(persistDir);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		testFolder<any, any[], PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => insightFacade.performQuery(input),
			"./test/resources/queries",
			{
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnResult(expected: any[], actual: any, input: any ) {
					const orderKey = input.OPTIONS.ORDER;
					expect(actual).to.be.instanceof(Array);
					// expect(actual).to.have.length(expected.length);
					expect(actual).to.have.deep.members(expected);
					if (orderKey !== undefined) {
						if (typeof orderKey === "string") {
							for (let i = 1; i < actual.length; i = i + 1) {
								expect(actual[i - 1][orderKey]).to.deep.equal(expected[i - 1][orderKey]);
							}
						} else if (orderKey["keys"].length === 1) {
							for (let i = 1; i < actual.length; i = i + 1) {
								expect(actual[i - 1][orderKey["keys"][0]]).to.deep.equal(
									expected[i - 1][orderKey["keys"][0]]);
							}
						} else {
							for (let i = 1; i < actual.length; i = i + 1) {
								expect(actual[i - 1]).to.deep.equal(expected[i - 1]);
							}
						}
					} else {
						for (let i = 1; i < actual.length; i = i + 1) {
							expect(actual[i - 1]).to.deep.include(expected[i - 1]);
						}
					}
				},
				assertOnError(expected, actual) {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						console.log(actual);
						expect(actual).to.be.instanceof(InsightError);
					}
				},
			}
		);

		describe("Query Datasets", function() {
			let facade: IInsightFacade;

			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("should preform query", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.performQuery({
							WHERE:{
								GT:{
									courses_avg:97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"courses_dept",
									"courses_avg"
								],
								ORDER:"courses_avg"
							}
						} );
					}).then((res) => {
						expect(res).to.be.an.instanceof(Array);
						expect(res.length).to.be.greaterThan(0);
						expect(res.length).to.be.lessThan(5000);
					});
			});

			it("should reject with ResultTooLargeError", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.performQuery({
							WHERE:{
								GT: {
									courses_avg: 0
								}
							},
							OPTIONS:{
								COLUMNS:[
									"courses_dept",
									"courses_avg"
								],
								ORDER:"courses_avg"
							}
						});
					}).then((res) => {
						expect(res).to.be.an.instanceof(Array);
						expect(res.length).to.be.greaterThan(5000);
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(ResultTooLargeError);
					});
			});

			it("should reject incorrectly formatted query", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.performQuery("hello_i_am_a_bad_query");
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject if query key doesn't have underscore", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.performQuery({
							WHERE:{
								GT:{
									coursesavg:97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"coursesdept",
									"coursesavg"
								],
								ORDER:"coursesavg"
							}
						});
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject if query key has invalid dataset_key", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.performQuery({
							WHERE:{
								GT:{
									courses_avg:97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"courses_dept",
									"courses_months"
								],
								ORDER:"courses_avg"
							}
						});
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject a dataset not added query", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.performQuery({
							WHERE:{
								GT:{
									courses2_avg:97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"courses2_dept",
									"courses2_avg"
								],
								ORDER:"courses2_avg"
							}
						} );
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should reject query that references multiple datasets", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.performQuery({
							WHERE:{
								GT:{
									courses_avg:97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"courses_dept",
									"courses2_avg"
								],
								ORDER:"courses2_avg"
							}
						} );
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});
			it("query valid tests", function() {
				const id: string = "courses";
				const content: string = datasetContents.get("courses") ?? "";
				return facade.addDataset(id, content, InsightDatasetKind.Courses)
					.then(() => {
						return facade.performQuery({
							WHERE: {
								OR: [
									{
										AND: [
											{
												GT: {
													courses_avg: "90"
												}
											},
											{
												IS: {
													courses_dept: "adhe"
												}
											}
										]
									},
									{
										EQ: {
											courses_avg: 95
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"courses_dept",
									"courses_id",
									"courses_avg"
								],
								ORDER: "courses_avg"
							}
						});
					}).then((res) => {
						throw new Error(`Resolved with: ${res}`);
					}).catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});
		});
	});
});
