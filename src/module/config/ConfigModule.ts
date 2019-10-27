import { App, Module } from '@/App';
import { error } from '@/core/utils/log';
import SettingsPanel from '@/module/config/SettingsPanel.vue';
import get from 'lodash/get';
import merge from 'lodash/merge';
import set from 'lodash/set';

const UNSET = Symbol();

export class Config {
    [key: string]: any;

    // runtime object won't be saved into localStorage
    runtime: { [key: string]: any } = {};

    get<T>(path: string, defaultValue: T): Readonly<T> {
        let savedValue: any = get(this, path, UNSET);
        let runtimeValue: any = get(this.runtime, path, UNSET);

        if (savedValue === UNSET) return runtimeValue === UNSET ? defaultValue : runtimeValue;
        if (runtimeValue === UNSET) return savedValue;

        // saved value has a higher priority than runtime value
        return typeof savedValue === 'object' ? merge(runtimeValue, savedValue) : savedValue;
    }
}

export interface App {
    on(event: 'init', fn: () => void, context?: any): this;

    on(event: 'configReady', fn: (config: Config) => void, context?: any): this;

    // Will be emitted on each update of config
    on(event: 'config:*', fn: (path: string, value: any, oldValue: any, config: Config) => void, context?: any): this;

    on(event: 'config:{path}', fn: (value: any, oldValue: any, config: Config) => void, context?: any): this;

    on(event: 'config', fn: (path: string, value: any, runtime?: boolean) => void, context?: any): this;

    emit(event: 'init'): this;

    emit(event: 'configReady', config: Config): this;

    emit(event: 'config:*', path: string, value: any, oldValue: any, config: Config): this;

    emit(event: 'config:{path}', value: any, oldValue: any, config: Config): this;

    emit(event: 'config', path: string, value: any, runtime?: boolean): this;
}

const TAG = 'ConfigModule';

export default class ConfigModule implements Module {
    name = 'Config';

    storageKey = 'config';

    readonly config = new Config();

    constructor(readonly app: App) {
        this.read();

        app.on('config', this.setConfig, this);

        app.sticky('configReady', this.config);

        app.addComponent(SettingsPanel, { configModule: () => this }).then();

        if (localStorage.v !== process.env.VERSION) {
            app.sticky('init', localStorage.v);
            localStorage.v = process.env.VERSION;
        }
    }

    setConfig(path: string, value: any, runtime = false) {
        const target = runtime ? this.config.runtime : this.config;

        const oldValue = this.config.get(path, undefined);

        set(target, path, value);

        if (!runtime) this.save();

        const newValue = this.config.get(path, undefined);

        this.app.sticky('config:' + path, newValue, oldValue, this.config);
        this.app.sticky('config:*', path, newValue, oldValue, this.config);
    }

    getConfig<T>(path: string, defaultValue: T): Readonly<T> {
        return this.config.get(path, defaultValue);
    }

    read() {
        try {
            const json = localStorage.getItem(this.storageKey);

            if (json) {
                Object.assign(this.config, JSON.parse(json));
            }
        } catch (e) {
            error(TAG, e);
        }
    }

    save(): boolean {
        try {
            const saving = Object.assign({}, this.config);
            delete saving.runtime;
            localStorage.setItem(this.storageKey, JSON.stringify(saving));
            return true;
        } catch (e) {
            error(TAG, e);
        }
        return false;
    }
}
