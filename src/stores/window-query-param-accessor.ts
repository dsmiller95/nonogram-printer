
export function setQueryString(queryString: string) {
    var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + queryString;
    window.history.pushState({path: newUrl}, '', newUrl);
}

export function setQueryParam(parameter: string, value: string): void {
    let params = new URLSearchParams(location.search);
    params.set(parameter, value);
    setQueryString((params as any).toString());
}

export function getQueryParam(parameter: string): string | null {
    let params = new URLSearchParams(location.search);
    return params.get(parameter);
}