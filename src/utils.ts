

export function urlAppend(url: string, component: any): string {
    if (!url) return component;
    else if (!component) return url;
    if (url[url.length - 1] != '/') url += '/';
    if (component[0] == '/') component = component.substring(1, component.length - 1);

    return url + component;
}