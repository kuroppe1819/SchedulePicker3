import { EventMenuRgbValue, EventMenuColor } from 'src/types/eventmenucolor';

const getEventMenuColor = (color: EventMenuColor): EventMenuRgbValue => {
    switch (color) {
        case EventMenuColor.BLUE: {
            return { R: 49, G: 130, B: 220 };
        }
        case EventMenuColor.SKYBLUE: {
            return { R: 87, G: 179, B: 237 };
        }
        case EventMenuColor.ORANGE: {
            return { R: 239, G: 146, B: 1 };
        }
        case EventMenuColor.RED: {
            return { R: 244, G: 72, B: 72 };
        }
        case EventMenuColor.PINK: {
            return { R: 241, G: 148, B: 167 };
        }
        case EventMenuColor.PURPULE: {
            return { R: 181, G: 146, B: 216 };
        }
        case EventMenuColor.BROWN: {
            return { R: 185, G: 153, B: 118 };
        }
        case EventMenuColor.GRAY: {
            return { R: 153, G: 153, B: 153 };
        }
        case EventMenuColor.GREEN: {
            return { R: 44, G: 190, B: 78 };
        }
        case EventMenuColor.YELLOWGREEN: {
            return { R: 154, G: 205, B: 50 };
        }
        case EventMenuColor.TEAL: {
            return { R: 38, G: 166, B: 154 };
        }
        default: {
            // EventMenuColor.GREEN;
            return { R: 44, G: 190, B: 78 };
        }
    }
};

export const pickEventMenuColor = (planName: string): EventMenuRgbValue => {
    switch (planName) {
        case '打合':
        case '会議':
            return getEventMenuColor(EventMenuColor.BLUE);
        case '来訪':
        case '取材/講演':
        case '【履歴】来訪':
            return getEventMenuColor(EventMenuColor.SKYBLUE);
        case '出張':
        case 'ウルトラワーク':
        case 'リモートワーク':
        case '出社':
            return getEventMenuColor(EventMenuColor.ORANGE);
        case '副業':
        case '複業':
        case '休み':
            return getEventMenuColor(EventMenuColor.RED);
        case '往訪':
        case '【履歴】往訪':
            return getEventMenuColor(EventMenuColor.PINK);
        case '面接':
        case 'フェア':
        case 'イベン10':
        case '仕事bar':
        case '部活動':
        case '懇親会':
        case '社内イベント':
            return getEventMenuColor(EventMenuColor.PURPULE);
        case '勉強会':
        case 'タスク':
            return getEventMenuColor(EventMenuColor.BROWN);
        case '説明会':
        case 'セミナー':
        case 'その他':
            return getEventMenuColor(EventMenuColor.GRAY);
        case '終日':
            return getEventMenuColor(EventMenuColor.YELLOWGREEN);
        default:
            return getEventMenuColor(EventMenuColor.GREEN);
    }
};
