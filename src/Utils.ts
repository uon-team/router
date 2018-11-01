

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
].join('|'), 'g')

export function PathToRegex(str: string, keys?: string[]) {


    let tokens: any[] = []
    let key = 0
    let index = 0
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
            path += escaped[1]
            path_escaped = true
            continue
        }

        var prev = ''
        var next = str[index]
        var name = res[2]
        var capture = res[3]
        var group = res[4]
        var modifier = res[5]

        if (!path_escaped && path.length) {
            var k = path.length - 1

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

        var partial = prev !== '' && next !== undefined && next !== prev
        var repeat = modifier === '+' || modifier === '*'
        var optional = modifier === '?' || modifier === '*'
        var delimiter = prev || '/'
        var pattern = capture || group

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
        tokens.push(path + str.substr(index))
    }



    var delimiter = EscapeString(PATH_DELIMITER)

    var endsWith = '$';
    var route = ''
    var isEndDelimited = false

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i]

        if (typeof token === 'string') {
            route += EscapeString(token)
            isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1
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




    route += endsWith === '$' ? '$' : '(?=' + endsWith + ')'


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