import * as fs from "fs-extra";

const persistDir = "./data";

function getContentFromArchives(name: string): string {
	return fs.readFileSync(`test/resources/archives/${name}`).toString("base64");
}

function clearDisk(): void {
	fs.removeSync(persistDir);
}

function diskLength(): number{
	fs.readdir(persistDir, function(err, data) {
		return data.length;
	});
	return -1;
}

function datasetFileExists(name: string): boolean{
	if(fs.existsSync(persistDir + "/" + name)) {
		return true;
	} else {
		return false;
	}
}

export {getContentFromArchives, persistDir, clearDisk, diskLength, datasetFileExists};
