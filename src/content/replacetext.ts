export const replaceText = (source: string, from: string, to: string): string => {
    const escapeRegExp = (text): string => {
        return text.replace(/[.*+?^=!:${}()|[\]\\/\\]/g, '\\$&'); // $&はマッチした部分文字列全体を意味する
    };
    const regex = new RegExp(escapeRegExp(from), 'g');
    return source.replace(regex, to);
};
