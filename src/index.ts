export type AttributeValue = string | boolean

export type AttributeSet = { [key: string]: AttributeValue }

export interface AttributeRule {
  pattern: string
  attributes: AttributeSet
}

function parseAttributes(attributes: string) {
  const values: AttributeSet = {}

  for (let piece of attributes.split(/\s+/g)) {
    if (piece === '=') continue

    let key = piece, value

    if (piece[0] === '-') {
      // Falsy attribute: "-attr"
      key = piece.substr(1)
      value = false
    } else if (piece.indexOf('=') !== -1) {
      // Attribute with value: "attr=value"
      let i = piece.indexOf('=')
      key = piece.substr(0, i)
      value = piece.substr(i + 1)
    } else {
      // Truthy attribute: "attr"
      value = true
    }

    values[key] = value

    // Treat special attributes and backwards compatible attributes
    // https://git-scm.com/docs/gitattributes
    if (key === 'binary' && value)
      values.diff = false
    else if (key === 'crlf' && value === true)
      values.text = true
    else if (key === 'crlf' && value === false)
      values.text = false
    else if (key === 'crlf' && value === 'input')
      values.eol = 'lf'
  }

  return values
}

function parseRule(rule: string) {
  let pattern: string | undefined, attributes: string | undefined
  if (rule[0] === '"') {
    let match = rule.match(/^"(?:[^"\\]|\\.)*"/)
    if (match) {
      pattern = JSON.parse(match[0])
      attributes = rule.substr(match[0].length + 1).trim()
    }
  } else {
    let match = /\s+/g.exec(rule)
    pattern = match ? rule.substr(0, match.index) : rule
    attributes = match ? rule.substr(match.index + match[0].length) : undefined
  }

  return {
    pattern,
    attributes: attributes ? parseAttributes(attributes) : {},
  }
}

function isValidRule(rule: AttributeRule | { pattern: string | undefined, attributes: AttributeSet }): rule is AttributeRule {
  return rule.pattern !== undefined
}

export function parse(content: string): AttributeRule[] {
  return content
    .split('\n')
    .filter(l => l.trim() !== '' && l[0] !== '#')
    .map(parseRule)
    .filter(isValidRule)
}
