import { keys, merge } from "lodash";

export function StripProps(value: any, props: string[]) {
    return keys(value)
        .filter(key => !props.includes(key))
        .map(key => {
            const o = {};
            o[key] = value[key];
            return o;
        })
        .reduce((a, b) => merge(a, b), {});
}
