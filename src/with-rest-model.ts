
import { Constructor, triggerMethodOn } from '@viewjs/utils';
import { Model/*, ModelConstructor */, ModelCollection, MetaKeys } from '@viewjs/models';
import { createError, RestErrorCode } from './errors';
import { backend, IRestRequest, IRestBackend } from './backend';
import { urlAppend } from './utils';
import { RestEvents } from './types';
export interface RestModelSaveOptions {
    force?: boolean;
}

export interface RestModelFetchOptions { }

export interface RestModelDeleteOptions { }

export interface IRestModel {
    baseURL: string;
    backend: IRestBackend;
    readonly isNew: boolean;
    readonly isDirty: boolean;
    save(options?: RestModelSaveOptions): Promise<any>;
    fetch(options?: RestModelFetchOptions): Promise<any>;
    delete(options?: RestModelDeleteOptions): Promise<any>;
}

export function withRestModel<T extends Constructor<Model>>(Base: T, baseURL?: string, storage?: IRestBackend): T & Constructor<IRestModel> {
    return class extends Base {
        baseURL = baseURL || '';
        backend = storage || backend;
        changes: { [key: string]: any } | undefined;

        get isDirty() {
            return !!this.changes;
        }

        get isNew() {
            return !!!this.id;
        }

        save(options: RestModelSaveOptions = {}) {
            if (!this.baseURL) Promise.reject(createError(RestErrorCode.MissingURL, `url not spicified on ${String(this)}`));

            if (!this.isDirty && !this.isNew && !options.force) {
                return Promise.resolve();
            } else if (!this.isDirty && this.isNew && this[MetaKeys.Attributes].size == 0) {
                return Promise.resolve();
            }

            let req: IRestRequest = {
                method: 'POST',
                url: this.baseURL
            }

            if (this.id) {
                req.url = urlAppend(this.baseURL, this.id!);
                req.method = 'PUT';
            }

            this.trigger(RestEvents.BeforeSave, req);

            return this.backend!.request(req, this.toJSON()).then(resp => {
                this.set(resp);
                this.changes = void 0;
                this.trigger(RestEvents.Save, req, resp);
            });

        }

        fetch(options?: RestModelFetchOptions) {
            if (!this.id) return Promise.reject(createError(`cannot fetch a model with no id`));
            if (!this.baseURL) throw createError(RestErrorCode.MissingURL, `url not spicified on ${String(this)}`);

            let req: IRestRequest = {
                method: 'POST',
                url: urlAppend(this.baseURL, this.id)
            }

            this.trigger(RestEvents.BeforeFetch, req);

            return this.backend!.request(req)
                .then(resp => {
                    this.set(resp);
                    this.changes = void 0;
                    this.trigger(RestEvents.Fetch, req, resp);
                });

        }

        delete(options?: RestModelDeleteOptions) {
            if (!this.id) return Promise.reject(createError(`cannot delete a model with no id`));
            if (!this.baseURL) throw createError(RestErrorCode.MissingURL, `url not spicified on ${String(this)}`);

            this.trigger(RestEvents.BeforeDelete);

            return this.backend!.request({
                method: 'DELETE',
                url: urlAppend(this.baseURL, this.id)
            }).then(resp => {
                triggerMethodOn(this, RestEvents.Delete, this);
            });
        }


        onChange(changes: any) {
            this.changes = changes;
        }


    };
}