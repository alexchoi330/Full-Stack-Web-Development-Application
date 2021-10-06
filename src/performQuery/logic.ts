function greaterThan(data: Map<string, any[]>, comparator: string, compare_value: number): Map<string, any[]> {
	let result = new Map<string, any[]>();
	data.forEach((value: any[], key: string) => {
		let course = JSON.parse(JSON.stringify(value));
		for (let currSection of course.result) {
			let currValue = currSection[comparator];
			if(currValue > compare_value) {
				let sections = result.get(key) as any[];
				if(sections !== undefined) {
					sections.push(currSection);
				} else {
					sections = [];
					sections.push(currSection);
				}
				result.set(key, sections);
			}
		}
	});
	return result;
}

function lessThan(data: Map<string, any[]>, comparator: string, compare_value: number): Map<string, any[]> {
	let result = new Map<string, any[]>();
	data.forEach((value: any[], key: string) => {
		let course = JSON.parse(JSON.stringify(value));
		for (let currSection of course.result) {
			let currValue = currSection[comparator];
			if(currValue < compare_value) {
				let sections = result.get(key) as any[];
				if(sections !== undefined) {
					sections.push(currSection);
				} else {
					sections = [];
					sections.push(currSection);
				}
				result.set(key, sections);
			}
		}
	});
	return result;
}

function equalTo(data: Map<string, any[]>, comparator: string, compare_value: number): Map<string, any[]> {
	let result = new Map<string, any[]>();
	data.forEach((value: any[], key: string) => {
		let course = JSON.parse(JSON.stringify(value));
		for (let currSection of course.result) {
			let currValue = currSection[comparator];
			if(currValue === compare_value) {
				let sections = result.get(key) as any[];
				if(sections !== undefined) {
					sections.push(currSection);
				} else {
					sections = [];
					sections.push(currSection);
				}
				result.set(key, sections);
			}
		}
	});
	return result;
}

function and(data_1: any[], data_2: any[]): any[] {
	return [];
}

function or(data_1: any[], data_2: any[]): any[] {
	return [];
}

function is(data: any[], comparator: string, compare_value: string): any[] {
	return [];
}

export{greaterThan, lessThan, equalTo, and, or, is};
