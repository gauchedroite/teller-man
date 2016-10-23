declare var FastClick: any;

interface String {    
    startsWith(searchString: string, endPosition?: number): boolean;
    endsWith(searchString: string, endPosition?: number): boolean;
};

if (!(<any>String).prototype.startsWith) {
    (<any>String).prototype.startsWith = function (searchString: string, position: number) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

if (!(<any>String).prototype.endsWith) {
    (<any>String).prototype.endsWith = function (searchString: string, position: number) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}
