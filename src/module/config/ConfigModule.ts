import { App, Module } from '@/App';
import { EventEntity } from '@/core/utils/EventEmitter';
import { error } from '@/core/utils/log';
import SettingsPanel from '@/module/config/SettingsPanel.vue';
import get from 'lodash/get';
import set from 'lodash/set';

export interface Config {
    [key: string]: any;
}

export interface App {
    on(event: 'init', fn: () => void, context?: any): this;

    on(event: 'configReady', fn: (config: Config) => void, context?: any): this;

    // Will be emitted on each update of config
    on(event: 'config:*', fn: (path: string, value: any, oldValue: any, config: Config) => void, context?: any): this;

    on(event: 'config:{path}', fn: (value: any, oldValue: any, config: Config) => void, context?: any): this;

    on(event: 'config', fn: (path: string, value: any) => void, context?: any): this;

    emit(event: 'init'): this;

    emit(event: 'configReady', config: Config): this;

    emit(event: 'config:*', path: string, value: any, oldValue: any, config: Config): this;

    emit(event: 'config:{path}', value: any, oldValue: any, config: Config): this;

    emit(event: 'config', path: string, value: any): this;
}

const TAG = 'ConfigModule';

export default class ConfigModule implements Module {
    name = 'Config';

    storageKey = 'config';

    readonly config: Config = {};

    constructor(readonly app: App) {
        this.read();

        app.on('config', this.setConfig, this);

        // immediately call listener of "configReady" when it's added
        app.on('newListener', (event: string, listener: EventEntity, context: any) => {
            if (event === 'configReady') {
                listener.fn.call(listener.context, this.config);

                if (listener.once) app.off(event, listener.fn, undefined, true);
            }
        });

        app.emit('configReady', this.config);

        app.addComponent(SettingsPanel, { configModule: () => this }).then();

        if (!localStorage.v) {
            app.emit('init');
            localStorage.v = process.env.VERSION;
        }
    }

    setConfig(path: string, value: any) {
        const oldValue = get(this.config, path, undefined);

        set(this.config, path, value);
        this.save();

        this.app.emit('config:' + path, value, oldValue, this.config);
        this.app.emit('config:*', path, value, oldValue, this.config);
    }

    getConfig(path: string, defaultValue: any) {
        return get(this.config, path, defaultValue);
    }

    read() {
        try {
            const json = localStorage.getItem(this.storageKey) || '{}';

            if (json) {
                Object.assign(this.config, JSON.parse(json));
            }
        } catch (e) {
            error(TAG, e);
        }
    }

    save(): boolean {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.config));
            return true;
        } catch (e) {
            error(TAG, e);
        }
        return false;
    }
}
