import { Request, HttpMethod } from 'fetchain';
import { isFunction } from '@viewjs/utils';

export interface IRestRequest {
    header?: { [key: string]: any };
    url: string;
    params?: { [key: string]: any };
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export interface IRestBackend {
    request(request: IRestRequest, data?: any): Promise<any>
}


function toFetchain(m: string) {
    switch (m) {
        case "GET": return HttpMethod.GET;
        case "POST": return HttpMethod.POST;
        case "PATCH": return HttpMethod.PATCH;
        case "PUT": return HttpMethod.PUT;
        case "DELETE": return HttpMethod.DELETE;
    }
}

export class FetchBackend implements IRestBackend {
    request(request: IRestRequest, data?: any): Promise<any> {

        const [req, encodedData] = this.initializeRequest(request, data);

        return req.end(encodedData, true)
            .then(resp => {

                if (resp.status === 204) return Promise.resolve(void 0);

                if (isFunction(resp.arrayBuffer)) {
                    return resp.arrayBuffer().then(data => {
                        return this.decode(data);
                    });
                }
                return resp.text().then(text => this.decode(text));

            }, (err: any) => {
                console.log(req);
                return Promise.reject(err);
            });

    }

    protected initializeRequest(request: IRestRequest, data?: any): [Request, Uint8Array | string | undefined] {
        const req = new Request(request.url, toFetchain(request.method));

        var odata: Uint8Array | string | undefined = void 0;

        if (request.header) req.header(request.header);
        if (request.params) req.params(request.params);

        if ((request.method == 'POST' || request.method == 'PUT' || request.method == 'PATCH') && data) {
            odata = this.encode(data);
        }

        req.header('content-type', 'application/json');

        return [req, odata];
    }


    protected encode(data: any): Uint8Array | string {
        return JSON.stringify(data);
    }

    protected decode(data: string | Uint8Array | ArrayBuffer): object {
        if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
            data = new TextDecoder('utf-8').decode(data);
        }
        return JSON.parse(data);
    }

}


export var backend: IRestBackend = new FetchBackend();



