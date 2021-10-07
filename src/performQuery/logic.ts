function greaterThan(data: Map<string, any[]>, comparator: string, compare_value: number): Map<string, any[]> {
	let result = new Map<string, any[]>();
	data.forEach((value: any[], key: string) => {
		let course = JSON.parse(JSON.stringify(value));
		for (let currSection of course) {
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
		for (let currSection of course) {
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
		for (let currSection of course) {
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

function and(data: Array<Map<string, any[]>>): Map<string, any[]> {
	let result = andTwo(data[0], data[1]);
	for (let i = 2; i < data.length; i++) {
		result = andTwo(result, data[i]);
	}
	return result;
}

function andTwo(data_1: Map<string, any[]>, data_2: Map<string, any[]>): Map<string, any[]> {
	let result = new Map<string, any[]>();
	data_1.forEach((value: any[], key: string) => {
		if(data_2.has(key)) {
			let course1 = JSON.parse(JSON.stringify(value));
			let course2 = JSON.parse(JSON.stringify(data_2.get(key)));
			for (let currSection1 of course1) {
				let id1 = currSection1["id"];
				for (let currSection2 of course2) {
					let id2 = currSection2["id"];
					if(id1 === id2) {
						let sections = result.get(key) as any[];
						if(sections !== undefined) {
							sections.push(currSection1);
						} else {
							sections = [];
							sections.push(currSection1);
						}
						result.set(key, sections);
						break;
					}
				}
			}

		}
	});
	return result;
}

function or(data_1: any[], data_2: any[]): any[] {
	return [];
}

function is(data: any[], comparator: string, compare_value: string): any[] {
	return [];
}

export{greaterThan, lessThan, equalTo, and, or, is};
