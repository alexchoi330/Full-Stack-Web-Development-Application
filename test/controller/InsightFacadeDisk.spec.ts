import {
	InsightDatasetKind,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";

import {expect} from "chai";

describe("InsightFacade", function () {
	this.timeout(10000);
	let insightFacade: InsightFacade;
	const persistDir = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: { [key: string]: string } = {
		courses: "./test/resources/archives/coursesSmall.zip",
		coursesInvalidJSON: "./test/resources/archives/coursesInvalidJSON.zip"
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
	});

	beforeEach(function () {
		// This section resets the insightFacade instance
		// This runs before each test
		console.info(`BeforeTest: ${this.currentTest?.title}`);
		insightFacade = new InsightFacade();
	});

	it("Add valid dataset", function () {

		const id: string = "courses";
		const content: string = datasetContents.get("courses") ?? "";
		const expected: string[] = [id];
		return insightFacade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
			expect(result).to.deep.equal(expected);
		});
	});
});
