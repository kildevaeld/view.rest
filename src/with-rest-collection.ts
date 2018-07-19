
import { Constructor, triggerMethodOn, Base as BaseObject } from '@viewjs/utils';
import { Model/*, ModelConstructor */, ModelCollection, ModelEvents } from '@viewjs/models';
import { createError, RestErrorCode } from './errors';
import { backend, IRestRequest, IRestBackend } from './backend';
import { IRestModel } from './with-rest-model';
import { withEventListener } from '@viewjs/events';
import { RestEvents } from './types';

export interface RestCollectionSaveOptions { }

export interface RestCollectionFetchOptions {
    method?: 'reset' | 'add';
}

export interface RestCollectionDeleteOptions { }

export interface IRestCollection<TModel extends IRestModel & Model> {
    //baseURL: string;
    //backend: IRestBackend;
    create(input: any | object): Promise<TModel>;
    fetch(options?: RestCollectionFetchOptions): Promise<any>;
}

export function withRestCollection<T extends Constructor<ModelCollection<TModel>>, TModel extends IRestModel & Model>(Base: T, baseURL?: string, storage?: IRestBackend): T & Constructor<IRestCollection<TModel>> {
    return class extends Base {

        private _listener = new (withEventListener(BaseObject));

        baseURL = baseURL || '';
        backend = storage || backend;

        create(input: TModel | object): Promise<TModel> {
            const model = this.ensureModel(input);

            if (!model.baseURL) model.baseURL = this.baseURL;
            else if (!model.backend) model.backend = this.backend;

            let promise: Promise<any> = Promise.resolve();
            if (model.isNew) {
                promise = model.save()
            }

            return promise.then(() => {
                this.push(model);
                return model;
            });

        }

        fetch(options: RestCollectionFetchOptions = {}): Promise<any> {

            if (!this.baseURL) Promise.reject(createError(RestErrorCode.MissingURL, `url not spicified on ${String(this)}`));

            this.trigger(RestEvents.BeforeFetch);

            options = Object.assign({
                method: 'reset'
            }, options);

            return this.backend.request({
                method: 'GET',
                url: this.baseURL
            }).then(resp => {

                const result = this.parseRestResult(resp);
                if (options.method == 'reset') {
                    this.reset(result);
                } else {
                    result.map(m => this.push(m));
                }

                this.trigger(RestEvents.Fetch);

            });

        }

        save() {
            this.trigger(RestEvents.BeforeSave)
            return Promise.all(this.map(m => m.save())).then(() => {
                this.trigger(RestEvents.Save);
                return [...this];
            });
        }

        parseRestResult(data: any): any[] {
            return data;
        }

        ensureModel(input: any) {
            const m: TModel = Base.prototype.ensureModel.call(this, input);
            if (!m.baseURL) m.baseURL = this.baseURL;
            if (!m.backend) m.backend = this.backend;
            return m;
        }


        protected didAddModel(model: TModel) {
            this._listener.listenToOnce(model, RestEvents.BeforeDelete, () => {
                this.trigger(RestEvents.BeforeDelete, model);
            })
            this._listener.listenToOnce(model, RestEvents.Delete, () => {
                this.trigger(RestEvents.Delete, model);
                this.remove(model);
            }, this);
        }

        protected didRemoveModel(model: TModel) {
            this._listener.stopListening(model);
        }

        destroy() {
            super.destroy();
            this._listener.stopListening();
            return this;
        }

    };
}