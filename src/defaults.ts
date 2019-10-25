import { Theme } from '@/module/theme/ThemeModule';

export const THEMES: Theme[] = [
    {
        v: 1,
        name: 'Default',
        bg: 'img/bg_forest.jpg',
        snow: false,
        leaves: true,
        models: [
            {
                file: 'live2d/neptune/neptune.model.json',
                profiles: {
                    '16:9': {
                        scale: 0.0004,
                        x: 0.5,
                        y: 0.7,
                    },
                },
            },
        ],
    },
    {
        v: 1,
        name: 'Halloween',
        bg: 'img/bg_halloween.jpg',
        snow: true,
        leaves: false,
        models: [
            {
                file: 'live2d/neptune/neptune.model.json',
                profiles: {
                    '16:9': {
                        scale: 0.0004,
                        x: 0.5,
                        y: 0.7,
                    },
                },
            },
        ],
    },
    {
        v: 1,
        name: 'Christmas',
        bg: 'img/bg_lowee.jpg',
        snow: true,
        leaves: false,
        models: [
            {
                file: 'live2d/nepsanta/nepsanta.model.json',
                profiles: {
                    '16:9': {
                        scale: 0.0004,
                        x: 0.5,
                        y: 0.7,
                    },
                },
            },
        ],
    },
];

export const THEME_HALLOWEEN = 1;
export const THEME_CHRISTMAS = 2;

export const BACKGROUNDS = THEMES.map(theme => theme.bg);

export const LIVE2D_DIRECTORY = 'live2d';
export const LIVE2D_SCALE_MAX = 1.5;

export const FOCUS_TIMEOUT = 2000;
export const FOCUS_TIMEOUT_MAX = 10000;

export const SNOW_NUMBER = ~~((innerWidth * innerHeight) / 1000);
export const SNOW_NUMBER_MIN = 10;
export const SNOW_NUMBER_MAX = 9999;

export const LEAVES_NUMBER = ~~(innerWidth / 10);
export const LEAVES_NUMBER_MIN = 1;
export const LEAVES_NUMBER_MAX = 500;
