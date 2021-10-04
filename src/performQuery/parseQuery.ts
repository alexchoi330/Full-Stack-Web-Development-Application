import {IInsightFacade, InsightError, NotFoundError} from "../controller/IInsightFacade";


export function parseQuery (query: any): Promise<any[]> {
	// eslint-disable-next-line no-prototype-builtins
	if (!(query.hasOwnProperty("WHERE") && query.hasOwnProperty("OPTIONS"))) {
		return Promise.reject(new InsightError("WHERE or OPTIONS not correct"));
	}
	console.log("made past first check");
	const whereObj = query["WHERE"];
	const optionObj = query["OPTIONS"];
	console.log(whereObj, optionObj);
	return Promise.reject("Not implemented.");
}
