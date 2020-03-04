
export function setQueryString(queryString: string) {
    var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + queryString;
    window.history.pushState({path: newUrl}, '', newUrl);
}

export function setQueryParams(paramsObject: Record<string, string>): void {
    let params = new URLSearchParams(location.search);
    for (const param in paramsObject) {
        if (paramsObject.hasOwnProperty(param)) {
            const value = paramsObject[param];
            params.set(param, value);
        }
    }
    setQueryString((params as any).toString());
}

export function setQueryParam(parameter: string, value: string): void {
    let params = new URLSearchParams(location.search);
    params.set(parameter, value);
    setQueryString((params as any).toString());
}

export function getQueryParams(...args: string[]): Record<string, string> {
    let params = new URLSearchParams(location.search);
    let result: Record<string, string> = {};
    args.forEach(param => {
        const value = params.get(param);
        if(value){
            result[param] = value;
        }
    });
    return result;
}

export function getQueryParam(parameter: string): string | null {
    let params = new URLSearchParams(location.search);
    return params.get(parameter);
}