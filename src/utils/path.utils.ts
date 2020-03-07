

const PATH_DELIMITER = '/';
const DEFAULT_DELIMITERS = '/'

const PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
    '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
].join('|'), 'g');



export function JoinPath(...paths: string[]) {

    let parts: string[] = [];
    let new_parts: string[] = [];

    // split each path into it's parts and add em to the list
    for (var i = 0, l = paths.length; i < l; i++) {
        parts = parts.concat(paths[i].split(PATH_DELIMITER));
    }

    // put all the parts back together
    for (i = 0, l = parts.length; i < l; i++) {

        let part = parts[i];

        // ignore empty parts
        if (!part) {
            continue;
        }


        new_parts.push(part);
    }

    // if the first part started with a slash, we want to keep it
    if (parts[0] === "") {
        new_parts.unshift("");
    }

    // turn back into a single string path
    return new_parts.join(PATH_DELIMITER);

}


export function PathToRegex(str: string, keys?: string[]) {


    let tokens: any[] = [];
    let key = 0;
    let index = 0;
    let path = '';
    let path_escaped = false;
    let res: any = null;

    let delimiters = DEFAULT_DELIMITERS;

    while ((res = PATH_REGEXP.exec(str)) !== null) {

        let m = res[0];
        let escaped = res[1];
        let offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;


        // Ignore already escaped sequences.
        if (escaped) {
            path += escaped[1];
            path_escaped = true;
            continue;
        }

        let prev = '';
        let next = str[index];
        let name = res[2];
        let capture = res[3];
        let group = res[4];
        let modifier = res[5];

        if (!path_escaped && path.length) {
            let k = path.length - 1;

            if (delimiters.indexOf(path[k]) > -1) {
                prev = path[k]
                path = path.slice(0, k)
            }
        }

        // Push the current path onto the tokens.
        if (path) {
            tokens.push(path)
            path = ''
            path_escaped = false
        }

        let partial = prev !== '' && next !== undefined && next !== prev;
        let repeat = modifier === '+' || modifier === '*';
        let optional = modifier === '?' || modifier === '*';
        let delimiter = prev || '/';
        let pattern = capture || group;

        tokens.push({
            name: name || key++,
            prefix: prev,
            delimiter: delimiter,
            optional: optional,
            repeat: repeat,
            partial: partial,
            pattern: pattern ? EscapeGroup(pattern) : '[^' + EscapeString(delimiter) + ']+?'
        })
    }

    // Push any remaining characters.
    if (path || index < str.length) {
        tokens.push(path + str.substr(index));
    }



    let delimiter = EscapeString(PATH_DELIMITER);
    let ends_with = '$';
    let route = ''
    let end_delimited = false

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i]

        if (typeof token === 'string') {
            route += EscapeString(token)
            end_delimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1
        } else {
            var prefix = EscapeString(token.prefix)
            var capture = token.repeat
                ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
                : token.pattern

            if (keys) keys.push(token)

            if (token.optional) {
                if (token.partial) {
                    route += prefix + '(' + capture + ')?'
                } else {
                    route += '(?:' + prefix + '(' + capture + '))?'
                }
            } else {
                route += prefix + '(' + capture + ')'
            }
        }
    }

    route += ends_with === '$' ? '$' : '(?=' + ends_with + ')'

    return new RegExp('^' + route, 'i');

}




/**
 * Escape a regular expression string.
 *
 * @param  str
 * @return
 */
function EscapeString(str: string) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  group
 * @return 
 */
function EscapeGroup(group: string) {
    return group.replace(/([=!:$/()])/g, '\\$1');
}