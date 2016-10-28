/*prerequisites*/
/* Zepto v1.2.0 - zepto event ajax form ie - zeptojs.com/license */
(function(global, factory) {
  if (typeof define === 'function' && define.amd)
    define('zepto', ['require'], function(require) { return factory(global) })
  else
    factory(global)
}(this, function(window) {
  var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.matches || element.webkitMatchesSelector ||
                          element.mozMatchesSelector || element.oMatchesSelector ||
                          element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }

  function likeArray(obj) {
    var length = !!obj && 'length' in obj && obj.length,
      type = $.type(obj)

    return 'function' != type && !isWindow(obj) && (
      'array' == type || length === 0 ||
        (typeof length == 'number' && length > 0 && (length - 1) in obj)
    )
  }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overridden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overridden in plugins.
  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overridden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overridden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overridden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
      slice.call(
        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.isNumeric = function(val) {
    var num = Number(val), type = typeof val
    return val != null && type != 'boolean' &&
      (type != 'string' || val.length) &&
      !isNaN(num) && isFinite(num) || false
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }
  $.noop = function() {}

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function(){
      var i, value, args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = zepto.isZ(value) ? value.toArray() : value
      }
      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var nodes = [], collection = typeof selector == 'object' && $(selector)
      this.each(function(_, node){
        while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
          node = node !== context && !isDocument(node) && node.parentNode
        if (node && nodes.indexOf(node) < 0) nodes.push(node)
      })
      return $(nodes)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this.pluck('textContent').join("") : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    removeProp: function(name){
      name = propMap[name] || name
      return this.each(function(){ delete this[name] })
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      if (0 in arguments) {
        if (value == null) value = ""
        return this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
      } else {
        return this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
      }
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
        return {top: 0, left: 0}
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0]
        if (typeof property == 'string') {
          if (!element) return
          return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
        } else if (isArray(property)) {
          if (!element) return
          var props = {}
          var computedStyle = getComputedStyle(element, '')
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            var arr = []
            argType = type(arg)
            if (argType == "array") {
              arg.forEach(function(el) {
                if (el.nodeType !== undefined) return arr.push(el)
                else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
                arr = arr.concat(zepto.fragment(el))
              })
              return arr
            }
            return argType == "object" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src){
              var target = el.ownerDocument ? el.ownerDocument.defaultView : window
              target['eval'].call(target, el.innerHTML)
            }
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      event.timeStamp || (event.timeStamp = Date.now())

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (callback === undefined || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = +new Date(),
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  function ajaxDataFilter(data, type, settings) {
    if (settings.dataFilter == empty) return data
    var context = settings.context
    return settings.dataFilter.call(context, data, type)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
    //Used to handle the raw response data of XMLHttpRequest.
    //This is a pre-filtering function to sanitize the response.
    //The sanitized response should be returned
    dataFilter: empty
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor, hashIndex
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))

          if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
            result = xhr.response
          else {
            result = xhr.responseText

            try {
              // http://perfectionkills.com/global-eval-what-are-the-options/
              // sanitize response accordingly if data filter callback provided
              result = ajaxDataFilter(result, dataType, settings)
              if (dataType == 'script')    (1,eval)(result)
              else if (dataType == 'xml')  result = xhr.responseXML
              else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
            } catch (e) { error = e }

            if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
          }

          ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function(){
  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle
    window.getComputedStyle = function(element, pseudoElement){
      try {
        return nativeGetComputedStyle(element, pseudoElement)
      } catch(e) {
        return null
      }
    }
  }
})()
  return Zepto
}))
;
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
  // Option flags:
  //   - once: Callbacks fired at most one time.
  //   - memory: Remember the most recent context and arguments
  //   - stopOnFalse: Cease iterating over callback list
  //   - unique: Permit adding at most one instance of the same callback
  $.Callbacks = function(options) {
    options = $.extend({}, options)

    var memory, // Last fire value (for non-forgettable lists)
        fired,  // Flag to know if list was already fired
        firing, // Flag to know if list is currently firing
        firingStart, // First callback to fire (used internally by add and fireWith)
        firingLength, // End of the loop when firing
        firingIndex, // Index of currently firing callback (modified by remove if needed)
        list = [], // Actual callback list
        stack = !options.once && [], // Stack of fire calls for repeatable lists
        fire = function(data) {
          memory = options.memory && data
          fired = true
          firingIndex = firingStart || 0
          firingStart = 0
          firingLength = list.length
          firing = true
          for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
            if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
              memory = false
              break
            }
          }
          firing = false
          if (list) {
            if (stack) stack.length && fire(stack.shift())
            else if (memory) list.length = 0
            else Callbacks.disable()
          }
        },

        Callbacks = {
          add: function() {
            if (list) {
              var start = list.length,
                  add = function(args) {
                    $.each(args, function(_, arg){
                      if (typeof arg === "function") {
                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                      }
                      else if (arg && arg.length && typeof arg !== 'string') add(arg)
                    })
                  }
              add(arguments)
              if (firing) firingLength = list.length
              else if (memory) {
                firingStart = start
                fire(memory)
              }
            }
            return this
          },
          remove: function() {
            if (list) {
              $.each(arguments, function(_, arg){
                var index
                while ((index = $.inArray(arg, list, index)) > -1) {
                  list.splice(index, 1)
                  // Handle firing indexes
                  if (firing) {
                    if (index <= firingLength) --firingLength
                    if (index <= firingIndex) --firingIndex
                  }
                }
              })
            }
            return this
          },
          has: function(fn) {
            return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
          },
          empty: function() {
            firingLength = list.length = 0
            return this
          },
          disable: function() {
            list = stack = memory = undefined
            return this
          },
          disabled: function() {
            return !list
          },
          lock: function() {
            stack = undefined
            if (!memory) Callbacks.disable()
            return this
          },
          locked: function() {
            return !stack
          },
          fireWith: function(context, args) {
            if (list && (!fired || stack)) {
              args = args || []
              args = [context, args.slice ? args.slice() : args]
              if (firing) stack.push(args)
              else fire(args)
            }
            return this
          },
          fire: function() {
            return Callbacks.fireWith(this, arguments)
          },
          fired: function() {
            return !!fired
          }
        }

    return Callbacks
  }
})(Zepto)
;
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
//
//     Some code (c) 2005, 2013 jQuery Foundation, Inc. and other contributors

;(function($){
  var slice = Array.prototype.slice

  function Deferred(func) {
    var tuples = [
          // action, add listener, listener list, final state
          [ "resolve", "done", $.Callbacks({once:1, memory:1}), "resolved" ],
          [ "reject", "fail", $.Callbacks({once:1, memory:1}), "rejected" ],
          [ "notify", "progress", $.Callbacks({memory:1}) ]
        ],
        state = "pending",
        promise = {
          state: function() {
            return state
          },
          always: function() {
            deferred.done(arguments).fail(arguments)
            return this
          },
          then: function(/* fnDone [, fnFailed [, fnProgress]] */) {
            var fns = arguments
            return Deferred(function(defer){
              $.each(tuples, function(i, tuple){
                var fn = $.isFunction(fns[i]) && fns[i]
                deferred[tuple[1]](function(){
                  var returned = fn && fn.apply(this, arguments)
                  if (returned && $.isFunction(returned.promise)) {
                    returned.promise()
                      .done(defer.resolve)
                      .fail(defer.reject)
                      .progress(defer.notify)
                  } else {
                    var context = this === promise ? defer.promise() : this,
                        values = fn ? [returned] : arguments
                    defer[tuple[0] + "With"](context, values)
                  }
                })
              })
              fns = null
            }).promise()
          },

          promise: function(obj) {
            return obj != null ? $.extend( obj, promise ) : promise
          }
        },
        deferred = {}

    $.each(tuples, function(i, tuple){
      var list = tuple[2],
          stateString = tuple[3]

      promise[tuple[1]] = list.add

      if (stateString) {
        list.add(function(){
          state = stateString
        }, tuples[i^1][2].disable, tuples[2][2].lock)
      }

      deferred[tuple[0]] = function(){
        deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
        return this
      }
      deferred[tuple[0] + "With"] = list.fireWith
    })

    promise.promise(deferred)
    if (func) func.call(deferred, deferred)
    return deferred
  }

  $.when = function(sub) {
    var resolveValues = slice.call(arguments),
        len = resolveValues.length,
        i = 0,
        remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
        deferred = remain === 1 ? sub : Deferred(),
        progressValues, progressContexts, resolveContexts,
        updateFn = function(i, ctx, val){
          return function(value){
            ctx[i] = this
            val[i] = arguments.length > 1 ? slice.call(arguments) : value
            if (val === progressValues) {
              deferred.notifyWith(ctx, val)
            } else if (!(--remain)) {
              deferred.resolveWith(ctx, val)
            }
          }
        }

    if (len > 1) {
      progressValues = new Array(len)
      progressContexts = new Array(len)
      resolveContexts = new Array(len)
      for ( ; i < len; ++i ) {
        if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
          resolveValues[i].promise()
            .done(updateFn(i, resolveContexts, resolveValues))
            .fail(deferred.reject)
            .progress(updateFn(i, progressContexts, progressValues))
        } else {
          --remain
        }
      }
    }
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
    return deferred.promise()
  }

  $.Deferred = Deferred
})(Zepto)
;
/**
 * ESL (Enterprise Standard Loader)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Browser端标准加载器，符合AMD规范
 * @author errorrik(errorrik@gmail.com)
 *         Firede(firede@firede.us)
 */

/* eslint-disable no-unused-vars */
/* jshint ignore:start */
var define;
var require;
var esl;
/* jshint ignore:end */
/* eslint-enable no-unused-vars */

/* eslint-disable guard-for-in */
/* eslint-env amd:false */

(function (global) {
    // "mod"开头的变量或函数为内部模块管理函数
    // 为提高压缩率，不使用function或object包装

    /**
     * 模块容器
     *
     * @inner
     * @type {Object}
     */
    var modModules = {};

    // 模块状态枚举量
    var MODULE_PRE_DEFINED = 1;
    var MODULE_ANALYZED = 2;
    var MODULE_PREPARED = 3;
    var MODULE_DEFINED = 4;

    /**
     * 自动定义的模块表
     *
     * 模块define factory是用到时才执行，但是以下几种情况需要自动马上执行：
     * 1. require([moduleId], callback)
     * 2. plugin module and plugin resource: require('plugin!resource')
     * 3. shim module
     *
     * @inner
     * @type {Object}
     */
    var modAutoDefineModules = {};

    /**
     * 标记模块自动进行定义
     *
     * @inner
     * @param {string} id 模块id
     */
    function modFlagAutoDefine(id) {
        if (!modIs(id, MODULE_DEFINED)) {
            modAutoDefineModules[id] = 1;
        }
    }

    /**
     * 内建module名称集合
     *
     * @inner
     * @type {Object}
     */
    var BUILDIN_MODULE = {
        require: globalRequire,
        exports: 1,
        module: 1
    };

    /**
     * 全局require函数
     *
     * @inner
     * @type {Function}
     */
    var actualGlobalRequire = createLocalRequire();

    // #begin-ignore
    /**
     * 超时提醒定时器
     *
     * @inner
     * @type {number}
     */
    var waitTimeout;
    // #end-ignore

    /**
     * require配置
     *
     * @inner
     * @type {Object}
     */
    var requireConf = {
        baseUrl    : './',
        paths      : {},
        config     : {},
        map        : {},
        packages   : [],
        shim       : {},
        // #begin-ignore
        waitSeconds: 0,
        // #end-ignore
        bundles    : {},
        urlArgs    : {}
    };

    /**
     * 加载模块
     *
     * @param {string|Array} requireId 模块id或模块id数组，
     * @param {Function=} callback 加载完成的回调函数
     * @return {*} requireId为string时返回模块暴露对象
     */
    function globalRequire(requireId, callback) {
        // #begin-ignore
        // #begin assertNotContainRelativeId
        // 确定require的模块id不包含相对id。用于global require，提前预防难以跟踪的错误出现
        var invalidIds = [];

        /**
         * 监测模块id是否relative id
         *
         * @inner
         * @param {string} id 模块id
         */
        function monitor(id) {
            if (id.indexOf('.') === 0) {
                invalidIds.push(id);
            }
        }

        if (typeof requireId === 'string') {
            monitor(requireId);
        }
        else {
            each(
                requireId,
                function (id) {
                    monitor(id);
                }
            );
        }

        // 包含相对id时，直接抛出错误
        if (invalidIds.length > 0) {
            throw new Error(
                '[REQUIRE_FATAL]Relative ID is not allowed in global require: '
                + invalidIds.join(', ')
            );
        }
        // #end assertNotContainRelativeId

        // 超时提醒
        var timeout = requireConf.waitSeconds;
        if (timeout && (requireId instanceof Array)) {
            if (waitTimeout) {
                clearTimeout(waitTimeout);
            }
            waitTimeout = setTimeout(waitTimeoutNotice, timeout * 1000);
        }
        // #end-ignore

        return actualGlobalRequire(requireId, callback);
    }

    /**
     * 版本号
     *
     * @type {string}
     */
    globalRequire.version = '2.1.4';

    /**
     * loader名称
     *
     * @type {string}
     */
    globalRequire.loader = 'esl';

    /**
     * 将模块标识转换成相对的url
     *
     * @param {string} id 模块标识
     * @return {string}
     */
    globalRequire.toUrl = actualGlobalRequire.toUrl;

    // #begin-ignore
    /**
     * 超时提醒函数
     *
     * @inner
     */
    function waitTimeoutNotice() {
        var hangModules = [];
        var missModules = [];
        var hangModulesMap = {};
        var missModulesMap = {};
        var visited = {};

        /**
         * 检查模块的加载错误
         *
         * @inner
         * @param {string} id 模块id
         * @param {boolean} hard 是否装载时依赖
         */
        function checkError(id, hard) {
            if (visited[id] || modIs(id, MODULE_DEFINED)) {
                return;
            }

            visited[id] = 1;
            var mod = modModules[id];
            if (!mod) {
                if (!missModulesMap[id]) {
                    missModulesMap[id] = 1;
                    missModules.push(id);
                }
            }
            else if (hard || !modIs(id, MODULE_PREPARED) || mod.hang) {
                if (!hangModulesMap[id]) {
                    hangModulesMap[id] = 1;
                    hangModules.push(id);
                }

                each(
                    mod.depMs,
                    function (dep) {
                        checkError(dep.absId, dep.hard);
                    }
                );
            }
        }

        for (var id in modAutoDefineModules) {
            checkError(id, 1);
        }

        if (hangModules.length || missModules.length) {
            throw new Error(
                '[MODULE_TIMEOUT]Hang('
                + (hangModules.join(', ') || 'none')
                + ') Miss('
                + (missModules.join(', ') || 'none')
                + ')'
            );
        }


    }
    // #end-ignore

    /**
     * 未预定义的模块集合
     * 主要存储匿名方式define的模块
     *
     * @inner
     * @type {Array}
     */
    var wait4PreDefine = [];

    /**
     * 完成模块预定义，此时处理的模块是匿名define的模块
     *
     * @inner
     * @param {string} currentId 匿名define的模块的id
     */
    function modCompletePreDefine(currentId) {
        // HACK: 这里在IE下有个性能陷阱，不能使用任何变量。
        //       否则貌似会形成变量引用和修改的读写锁，导致wait4PreDefine释放困难
        each(wait4PreDefine, function (mod) {
            modPreDefine(
                currentId,
                mod.deps,
                mod.factory
            );
        });

        wait4PreDefine.length = 0;
    }

    /**
     * 定义模块
     *
     * @param {string=} id 模块标识
     * @param {Array=} dependencies 依赖模块列表
     * @param {Function=} factory 创建模块的工厂方法
     */
    function globalDefine(id, dependencies, factory) {
        // define(factory)
        // define(dependencies, factory)
        // define(id, factory)
        // define(id, dependencies, factory)
        if (factory == null) {
            if (dependencies == null) {
                factory = id;
                id = null;
            }
            else {
                factory = dependencies;
                dependencies = null;
                if (id instanceof Array) {
                    dependencies = id;
                    id = null;
                }
            }
        }

        if (factory == null) {
            return;
        }

        var opera = window.opera;

        // IE下通过current script的data-require-id获取当前id
        if (
            !id
            && document.attachEvent
            && (!(opera && opera.toString() === '[object Opera]'))
        ) {
            var currentScript = getCurrentScript();
            id = currentScript && currentScript.getAttribute('data-require-id');
        }

        if (id) {
            modPreDefine(id, dependencies, factory);
        }
        else {
            // 纪录到共享变量中，在load或readystatechange中处理
            // 标准浏览器下，使用匿名define时，将进入这个分支
            wait4PreDefine[0] = {
                deps: dependencies,
                factory: factory
            };
        }
    }

    globalDefine.amd = {};

    /**
     * 模块配置获取函数
     *
     * @inner
     * @return {Object} 模块配置对象
     */
    function moduleConfigGetter() {
        var conf = requireConf.config[this.id];
        if (conf && typeof conf === 'object') {
            return conf;
        }

        return {};
    }

    /**
     * 预定义模块
     *
     * @inner
     * @param {string} id 模块标识
     * @param {Array.<string>} dependencies 显式声明的依赖模块列表
     * @param {*} factory 模块定义函数或模块对象
     */
    function modPreDefine(id, dependencies, factory) {
        // 将模块存入容器
        //
        // 模块内部信息包括
        // -----------------------------------
        // id: module id
        // depsDec: 模块定义时声明的依赖
        // deps: 模块依赖，默认为['require', 'exports', 'module']
        // factory: 初始化函数或对象
        // factoryDeps: 初始化函数的参数依赖
        // exports: 模块的实际暴露对象（AMD定义）
        // config: 用于获取模块配置信息的函数（AMD定义）
        // state: 模块当前状态
        // require: local require函数
        // depMs: 实际依赖的模块集合，数组形式
        // depMkv: 实际依赖的模块集合，表形式，便于查找
        // depRs: 实际依赖的资源集合
        // ------------------------------------
        if (!modModules[id]) {
            modModules[id] = {
                id         : id,
                depsDec    : dependencies,
                deps       : dependencies || ['require', 'exports', 'module'],
                factoryDeps: [],
                factory    : factory,
                exports    : {},
                config     : moduleConfigGetter,
                state      : MODULE_PRE_DEFINED,
                require    : createLocalRequire(id),
                depMs      : [],
                depMkv     : {},
                depRs      : [],
                hang       : 0
            };
        }
    }

    /**
     * 开始执行模块定义前的准备工作
     *
     * 首先，完成对factory中声明依赖的分析提取
     * 然后，尝试加载"资源加载所需模块"
     *
     * 需要先加载模块的原因是：如果模块不存在，无法进行resourceId normalize化
     *
     * @inner
     * @param {string} id 模块id
     */
    function modPrepare(id) {
        var mod = modModules[id];
        if (!mod || modIs(id, MODULE_ANALYZED)) {
            return;
        }

        var deps = mod.deps;
        var factory = mod.factory;
        var hardDependsCount = 0;

        // 分析function body中的require
        // 如果包含显式依赖声明，根据AMD规定和性能考虑，可以不分析factoryBody
        if (typeof factory === 'function') {
            hardDependsCount = Math.min(factory.length, deps.length);

            // If the dependencies argument is present, the module loader
            // SHOULD NOT scan for dependencies within the factory function.
            !mod.depsDec && factory.toString()
                .replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, '')
                .replace(/require\(\s*(['"])([^'"]+)\1\s*\)/g,
                    function ($0, $1, depId) {
                        deps.push(depId);
                    }
                );
        }

        var requireModules = [];
        var depResources = [];
        each(deps, function (depId, index) {
            var idInfo = parseId(depId);
            var absId = normalize(idInfo.mod, id);
            var moduleInfo;
            var resInfo;

            if (absId && !BUILDIN_MODULE[absId]) {
                // 如果依赖是一个资源，将其信息添加到module.depRs
                //
                // module.depRs中的项有可能是重复的。
                // 在这个阶段，加载resource的module可能还未defined，
                // 导致此时resource id无法被normalize。
                //
                // 比如对a/b/c而言，下面几个resource可能指的是同一个资源：
                // - js!../name.js
                // - js!a/name.js
                // - ../../js!../name.js
                //
                // 所以加载资源的module ready时，需要遍历module.depRs进行处理
                if (idInfo.res) {
                    resInfo = {
                        id: depId,
                        mod: absId,
                        res: idInfo.res
                    };
                    depResources.push(depId);
                    mod.depRs.push(resInfo);
                }

                // 对依赖模块的id normalize能保证正确性，在此处进行去重
                moduleInfo = mod.depMkv[absId];
                if (!moduleInfo) {
                    moduleInfo = {
                        id: idInfo.mod,
                        absId: absId,
                        hard: index < hardDependsCount
                    };
                    mod.depMs.push(moduleInfo);
                    mod.depMkv[absId] = moduleInfo;
                    requireModules.push(absId);
                }
            }
            else {
                moduleInfo = {absId: absId};
            }

            // 如果当前正在分析的依赖项是define中声明的，
            // 则记录到module.factoryDeps中
            // 在factory invoke前将用于生成invoke arguments
            if (index < hardDependsCount) {
                mod.factoryDeps.push(resInfo || moduleInfo);
            }
        });

        mod.state = MODULE_ANALYZED;
        modInitFactoryInvoker(id);
        nativeAsyncRequire(requireModules);
        depResources.length && mod.require(
            depResources,
            function () {
                each(mod.depRs, function (res) {
                    if (!res.absId) {
                        res.absId = normalize(res.id, id);
                    }
                });
                modAutoDefine();
            }
        );
    }

    /**
     * 对一些需要自动定义的模块进行自动定义
     *
     * @inner
     */
    function modAutoDefine() {
        for (var id in modAutoDefineModules) {
            modPrepare(id);
            modUpdatePreparedState(id);
            modTryInvokeFactory(id);
        }
    }

    /**
     * 更新模块的准备状态
     *
     * @inner
     * @param {string} id 模块id
     */
    function modUpdatePreparedState(id) {
        var updatingModules = {};
        update(id);

        function update(id) {
            modPrepare(id);
            if (!modIs(id, MODULE_ANALYZED)) {
                return false;
            }

            if (modIs(id, MODULE_PREPARED) || updatingModules[id]) {
                return true;
            }

            updatingModules[id] = 1;
            var mod = modModules[id];
            var prepared = true;

            each(
                mod.depMs,
                function (dep) {
                    // return (prepared = update(dep.absId));
                    prepared = update(dep.absId) && prepared;
                }
            );

            // 判断resource是否加载完成。如果resource未加载完成，则认为未准备好
            /* jshint ignore:start */
            prepared && each(
                mod.depRs,
                function (dep) {
                    prepared = !!dep.absId;
                    return prepared;
                }
            );
            /* jshint ignore:end */

            if (prepared && !modIs(id, MODULE_PREPARED)) {
                mod.state = MODULE_PREPARED;
            }
            updatingModules[id] = 0;
            return prepared;
        }
    }

    /**
     * 初始化模块定义时所需的factory执行器
     *
     * @inner
     * @param {string} id 模块id
     */
    function modInitFactoryInvoker(id) {
        var mod = modModules[id];
        var invoking;

        mod.invokeFactory = invokeFactory;

        /**
         * 初始化模块
         *
         * @inner
         */
        function invokeFactory() {
            if (invoking || mod.state !== MODULE_PREPARED) {
                return;
            }

            invoking = 1;

            // 拼接factory invoke所需的arguments
            var factoryReady = 1;
            each(
                mod.factoryDeps,
                function (dep) {
                    var depId = dep.absId;

                    if (!BUILDIN_MODULE[depId]) {
                        modTryInvokeFactory(depId);
                        return (factoryReady = modIs(depId, MODULE_DEFINED));
                    }
                }
            );

            if (factoryReady) {
                try {
                    // 调用factory函数初始化module
                    var factory = mod.factory;
                    var exports = typeof factory === 'function'
                        ? factory.apply(global, modGetModulesExports(
                                mod.factoryDeps,
                                {
                                    require: mod.require,
                                    exports: mod.exports,
                                    module: mod
                                }
                            ))
                        : factory;

                    if (exports != null) {
                        mod.exports = exports;
                    }

                    mod.invokeFactory = null;
                }
                catch (ex) {
                    mod.hang = 1;
                    throw ex;
                }

                // 完成define
                // 不放在try里，避免后续的运行错误被这里吞掉
                modDefined(id);
            }
        }
    }

    /**
     * 判断模块是否完成相应的状态
     *
     * @inner
     * @param {string} id 模块标识
     * @param {number} state 状态码，使用时传入相应的枚举变量，比如`MODULE_DEFINED`
     * @return {boolean} 是否完成相应的状态
     */
    function modIs(id, state) {
        return modModules[id] && modModules[id].state >= state;
    }

    /**
     * 尝试执行模块factory函数，进行模块初始化
     *
     * @inner
     * @param {string} id 模块id
     */
    function modTryInvokeFactory(id) {
        var mod = modModules[id];

        if (mod && mod.invokeFactory) {
            mod.invokeFactory();
        }
    }

    /**
     * 根据模块id数组，获取其的exports数组
     * 用于模块初始化的factory参数或require的callback参数生成
     *
     * @inner
     * @param {Array} modules 模块id数组
     * @param {Object} buildinModules 内建模块对象
     * @return {Array} 模块exports数组
     */
    function modGetModulesExports(modules, buildinModules) {
        var args = [];
        each(
            modules,
            function (id, index) {
                if (typeof id === 'object') {
                    id = id.absId;
                }
                args[index] = buildinModules[id] || modModules[id].exports;
            }
        );

        return args;
    }

    /**
     * 模块定义完成事件监听器容器
     *
     * @inner
     * @type {Object}
     */
    var modDefinedListeners = {};

    /**
     * 添加模块定义完成时间的监听器
     *
     * @inner
     * @param {string} id 模块标识
     * @param {Function} listener 监听函数
     */
    function modAddDefinedListener(id, listener) {
        if (modIs(id, MODULE_DEFINED)) {
            listener();
            return;
        }

        var listeners = modDefinedListeners[id];
        if (!listeners) {
            listeners = modDefinedListeners[id] = [];
        }

        listeners.push(listener);
    }

    /**
     * 模块状态切换为定义完成
     * 因为需要触发事件，MODULE_DEFINED状态切换通过该函数
     *
     * @inner
     * @param {string} id 模块标识
     */
    function modDefined(id) {
        var mod = modModules[id];
        mod.state = MODULE_DEFINED;
        delete modAutoDefineModules[id];

        var listeners = modDefinedListeners[id] || [];
        var len = listeners.length;
        while (len--) {
            // 这里不做function类型的检测
            // 因为listener都是通过modOn传入的，modOn为内部调用
            listeners[len]();
        }

        // 清理listeners
        listeners.length = 0;
        modDefinedListeners[id] = null;
    }

    /**
     * 异步加载模块
     * 内部使用，模块ID必须是经过normalize的Top-Level ID
     *
     * @inner
     * @param {Array} ids 模块名称或模块名称列表
     * @param {Function=} callback 获取模块完成时的回调函数
     * @param {string} baseId 基础id，用于当ids是relative id时的normalize
     */
    function nativeAsyncRequire(ids, callback, baseId) {
        var isCallbackCalled = 0;

        each(ids, function (id) {
            if (!(BUILDIN_MODULE[id] || modIs(id, MODULE_DEFINED))) {
                modAddDefinedListener(id, tryFinishRequire);
                (id.indexOf('!') > 0
                    ? loadResource
                    : loadModule
                )(id, baseId);
            }
        });
        tryFinishRequire();

        /**
         * 尝试完成require，调用callback
         * 在模块与其依赖模块都加载完时调用
         *
         * @inner
         */
        function tryFinishRequire() {
            if (typeof callback === 'function' && !isCallbackCalled) {
                var isAllCompleted = 1;
                each(ids, function (id) {
                    if (!BUILDIN_MODULE[id]) {
                        return (isAllCompleted = !!modIs(id, MODULE_DEFINED));
                    }
                });

                // 检测并调用callback
                if (isAllCompleted) {
                    isCallbackCalled = 1;

                    callback.apply(
                        global,
                        modGetModulesExports(ids, BUILDIN_MODULE)
                    );
                }
            }
        }
    }

    /**
     * 正在加载的模块列表
     *
     * @inner
     * @type {Object}
     */
    var loadingModules = {};

    /**
     * 加载模块
     *
     * @inner
     * @param {string} moduleId 模块标识
     */
    function loadModule(moduleId) {
        // 加载过的模块，就不要再继续了
        if (loadingModules[moduleId] || modModules[moduleId]) {
            return;
        }
        loadingModules[moduleId] = 1;

        // 初始化相关 shim 的配置
        var shimConf = requireConf.shim[moduleId];
        if (shimConf instanceof Array) {
            requireConf.shim[moduleId] = shimConf = {
                deps: shimConf
            };
        }

        // shim依赖的模块需要自动标识为shim
        // 无论是纯正的shim模块还是hybird模块
        var shimDeps = shimConf && (shimConf.deps || []);
        if (shimDeps) {
            each(shimDeps, function (dep) {
                if (!requireConf.shim[dep]) {
                    requireConf.shim[dep] = {};
                }
            });
            actualGlobalRequire(shimDeps, load);
        }
        else {
            load();
        }

        /**
         * 发送请求去加载模块
         *
         * @inner
         */
        function load() {
            /* eslint-disable no-use-before-define */
            var bundleModuleId = bundlesIndex[moduleId];
            createScript(bundleModuleId || moduleId, loaded);
            /* eslint-enable no-use-before-define */
        }

        /**
         * script标签加载完成的事件处理函数
         *
         * @inner
         */
        function loaded() {
            if (shimConf) {
                var exports;
                if (typeof shimConf.init === 'function') {
                    exports = shimConf.init.apply(
                        global,
                        modGetModulesExports(shimDeps, BUILDIN_MODULE)
                    );
                }

                if (exports == null && shimConf.exports) {
                    exports = global;
                    each(
                        shimConf.exports.split('.'),
                        function (prop) {
                            exports = exports[prop];
                            return !!exports;
                        }
                    );
                }

                globalDefine(moduleId, shimDeps, function () { 
                    return exports || {};
                });
            }
            else {
                modCompletePreDefine(moduleId);
            }

            modAutoDefine();
        }
    }

    /**
     * 加载资源
     *
     * @inner
     * @param {string} pluginAndResource 插件与资源标识
     * @param {string} baseId 当前环境的模块标识
     */
    function loadResource(pluginAndResource, baseId) {
        if (modModules[pluginAndResource]) {
            return;
        }

        /* eslint-disable no-use-before-define */
        var bundleModuleId = bundlesIndex[pluginAndResource];
        if (bundleModuleId) {
            loadModule(bundleModuleId);
            return;
        }
        /* eslint-enable no-use-before-define */

        var idInfo = parseId(pluginAndResource);
        var resource = {
            id: pluginAndResource,
            state: MODULE_ANALYZED
        };
        modModules[pluginAndResource] = resource;

        /**
         * plugin加载完成的回调函数
         *
         * @inner
         * @param {*} value resource的值
         */
        function pluginOnload(value) {
            resource.exports = value || true;
            modDefined(pluginAndResource);
        }

        /* jshint ignore:start */
        /**
         * 该方法允许plugin使用加载的资源声明模块
         *
         * @param {string} id 模块id
         * @param {string} text 模块声明字符串
         */
        pluginOnload.fromText = function (id, text) {
            new Function(text)();
            modCompletePreDefine(id);
        };
        /* jshint ignore:end */

        /**
         * 加载资源
         *
         * @inner
         * @param {Object} plugin 用于加载资源的插件模块
         */
        function load(plugin) {
            var pluginRequire = baseId
                ? modModules[baseId].require
                : actualGlobalRequire;

            plugin.load(
                idInfo.res,
                pluginRequire,
                pluginOnload,
                moduleConfigGetter.call({id: pluginAndResource})
            );
        }

        load(actualGlobalRequire(idInfo.mod));
    }

    /**
     * 配置require
     *
     * @param {Object} conf 配置对象
     */
    globalRequire.config = function (conf) {
        if (conf) {
            for (var key in requireConf) {
                var newValue = conf[key];
                var oldValue = requireConf[key];

                if (!newValue) {
                    continue;
                }

                if (key === 'urlArgs' && typeof newValue === 'string') {
                    requireConf.urlArgs['*'] = newValue;
                }
                else {
                    // 简单的多处配置还是需要支持，所以配置实现为支持二级mix
                    if (oldValue instanceof Array) {
                        oldValue.push.apply(oldValue, newValue);
                    }
                    else if (typeof oldValue === 'object') {
                        for (var k in newValue) {
                            oldValue[k] = newValue[k];
                        }
                    }
                    else {
                        requireConf[key] = newValue;
                    }
                }
            }

            createConfIndex();
        }
    };

    // 初始化时需要创建配置索引
    createConfIndex();

    /**
     * paths内部索引
     *
     * @inner
     * @type {Array}
     */
    var pathsIndex;

    /**
     * packages内部索引
     *
     * @inner
     * @type {Array}
     */
    var packagesIndex;

    /**
     * mapping内部索引
     *
     * @inner
     * @type {Array}
     */
    var mappingIdIndex;

    /**
     * bundles内部索引
     *
     * @inner
     * @type {Object}
     */
    var bundlesIndex;

    /**
     * urlArgs内部索引
     *
     * @inner
     * @type {Array}
     */
    var urlArgsIndex;

    /**
     * 将key为module id prefix的Object，生成数组形式的索引，并按照长度和字面排序
     *
     * @inner
     * @param {Object} value 源值
     * @param {boolean} allowAsterisk 是否允许*号表示匹配所有
     * @return {Array} 索引对象
     */
    function createKVSortedIndex(value, allowAsterisk) {
        var index = kv2List(value, 1, allowAsterisk);
        index.sort(descSorterByKOrName);
        return index;
    }

    /**
     * 创建配置信息内部索引
     *
     * @inner
     */
    function createConfIndex() {
        requireConf.baseUrl = requireConf.baseUrl.replace(/\/$/, '') + '/';

        // create paths index
        pathsIndex = createKVSortedIndex(requireConf.paths);

        // create mappingId index
        mappingIdIndex = createKVSortedIndex(requireConf.map, 1);
        each(
            mappingIdIndex,
            function (item) {
                item.v = createKVSortedIndex(item.v);
            }
        );

        var lastMapItem = mappingIdIndex[mappingIdIndex.length - 1];
        if (lastMapItem && lastMapItem.k === '*') {
            each(
                mappingIdIndex,
                function (item) {
                    if (item != lastMapItem) {
                        item.v = item.v.concat(lastMapItem.v);
                    }
                }
            );
        }

        // create packages index
        packagesIndex = [];
        each(
            requireConf.packages,
            function (packageConf) {
                var pkg = packageConf;
                if (typeof packageConf === 'string') {
                    pkg = {
                        name: packageConf.split('/')[0],
                        location: packageConf,
                        main: 'main'
                    };
                }

                pkg.location = pkg.location || pkg.name;
                pkg.main = (pkg.main || 'main').replace(/\.js$/i, '');
                pkg.reg = createPrefixRegexp(pkg.name);
                packagesIndex.push(pkg);
            }
        );
        packagesIndex.sort(descSorterByKOrName);

        // create urlArgs index
        urlArgsIndex = createKVSortedIndex(requireConf.urlArgs, 1);

        // create bundles index
        bundlesIndex = {};
        /* eslint-disable no-use-before-define */
        function bundlesIterator(id) {
            bundlesIndex[resolvePackageId(id)] = key;
        }
        /* eslint-enable no-use-before-define */
        for (var key in requireConf.bundles) {
            each(requireConf.bundles[key], bundlesIterator);
        }
    }

    /**
     * 对配置信息的索引进行检索
     *
     * @inner
     * @param {string} value 要检索的值
     * @param {Array} index 索引对象
     * @param {Function} hitBehavior 索引命中的行为函数
     */
    function indexRetrieve(value, index, hitBehavior) {
        each(index, function (item) {
            if (item.reg.test(value)) {
                hitBehavior(item.v, item.k, item);
                return false;
            }
        });
    }

    /**
     * 将`模块标识+'.extension'`形式的字符串转换成相对的url
     *
     * @inner
     * @param {string} source 源字符串
     * @param {string} baseId 当前module id
     * @return {string} url
     */
    function toUrl(source, baseId) {
        // 分离 模块标识 和 .extension
        var extReg = /(\.[a-z0-9]+)$/i;
        var queryReg = /(\?[^#]*)$/;
        var extname = '';
        var id = source;
        var query = '';

        if (queryReg.test(source)) {
            query = RegExp.$1;
            source = source.replace(queryReg, '');
        }

        if (extReg.test(source)) {
            extname = RegExp.$1;
            id = source.replace(extReg, '');
        }

        if (baseId != null) {
            id = normalize(id, baseId);
        }

        var url = id;

        // paths处理和匹配
        var isPathMap;
        indexRetrieve(id, pathsIndex, function (value, key) {
            url = url.replace(key, value);
            isPathMap = 1;
        });

        // packages处理和匹配
        if (!isPathMap) {
            indexRetrieve(id, packagesIndex, function (value, key, item) {
                url = url.replace(item.name, item.location);
            });
        }

        // 相对路径时，附加baseUrl
        if (!/^([a-z]{2,10}:\/)?\//i.test(url)) {
            url = requireConf.baseUrl + url;
        }

        // 附加 .extension 和 query
        url += extname + query;

        // urlArgs处理和匹配
        indexRetrieve(id, urlArgsIndex, function (value) {
            url += (url.indexOf('?') > 0 ? '&' : '?') + value;
        });

        return url;
    }

    /**
     * 创建local require函数
     *
     * @inner
     * @param {number} baseId 当前module id
     * @return {Function} local require函数
     */
    function createLocalRequire(baseId) {
        var requiredCache = {};

        function req(requireId, callback) {
            if (typeof requireId === 'string') {
                if (!requiredCache[requireId]) {
                    var topLevelId = normalize(requireId, baseId);

                    // 根据 https://github.com/amdjs/amdjs-api/wiki/require
                    // It MUST throw an error if the module has not
                    // already been loaded and evaluated.
                    modTryInvokeFactory(topLevelId);
                    if (!modIs(topLevelId, MODULE_DEFINED)) {
                        throw new Error('[MODULE_MISS]"' + topLevelId + '" is not exists!');
                    }

                    requiredCache[requireId] = modModules[topLevelId].exports;
                }

                return requiredCache[requireId];
            }
            else if (requireId instanceof Array) {
                // 分析是否有resource，取出pluginModule先
                var pureModules = [];
                var normalizedIds = [];

                each(
                    requireId,
                    function (id, i) {
                        var idInfo = parseId(id);
                        var absId = normalize(idInfo.mod, baseId);
                        var resId = idInfo.res;
                        var normalizedId = absId;

                        if (resId) {
                            var trueResId = absId + '!' + resId;
                            if (resId.indexOf('.') !== 0 && bundlesIndex[trueResId]) {
                                absId = normalizedId = trueResId;
                            }
                            else {
                                normalizedId = null;
                            }
                        }

                        normalizedIds[i] = normalizedId;
                        modFlagAutoDefine(absId);
                        pureModules.push(absId);
                    }
                );

                // 加载模块
                nativeAsyncRequire(
                    pureModules,
                    function () {
                        /* jshint ignore:start */
                        each(normalizedIds, function (id, i) {
                            if (id == null) {
                                id = normalizedIds[i] = normalize(requireId[i], baseId);
                                modFlagAutoDefine(id);
                            }
                        });
                        /* jshint ignore:end */

                        // modAutoDefine中，factory invoke可能发生错误
                        // 从而导致nativeAsyncRequire没有被调用，callback没挂上
                        // 所以nativeAsyncRequire要先运行
                        nativeAsyncRequire(normalizedIds, callback, baseId);
                        modAutoDefine();
                    },
                    baseId
                );
                modAutoDefine();
            }
        }

        /**
         * 将[module ID] + '.extension'格式的字符串转换成url
         *
         * @inner
         * @param {string} id 符合描述格式的源字符串
         * @return {string} url
         */
        req.toUrl = function (id) {
            return toUrl(id, baseId || '');
        };

        return req;
    }

    /**
     * id normalize化
     *
     * @inner
     * @param {string} id 需要normalize的模块标识
     * @param {string} baseId 当前环境的模块标识
     * @return {string} normalize结果
     */
    function normalize(id, baseId) {
        if (!id) {
            return '';
        }

        baseId = baseId || '';
        var idInfo = parseId(id);
        if (!idInfo) {
            return id;
        }

        var resourceId = idInfo.res;
        var moduleId = relative2absolute(idInfo.mod, baseId);

        // 根据config中的map配置进行module id mapping
        indexRetrieve(
            baseId,
            mappingIdIndex,
            function (value) {
                indexRetrieve(
                    moduleId,
                    value,
                    function (mdValue, mdKey) {
                        moduleId = moduleId.replace(mdKey, mdValue);
                    }
                );
            }
        );

        moduleId = resolvePackageId(moduleId);

        if (resourceId) {
            var mod = modIs(moduleId, MODULE_DEFINED) && actualGlobalRequire(moduleId);
            resourceId = mod && mod.normalize
                ? mod.normalize(
                    resourceId,
                    function (resId) {
                        return normalize(resId, baseId);
                    }
                  )
                : normalize(resourceId, baseId);

            moduleId += '!' + resourceId;
        }

        return moduleId;
    }

    /**
     * 对id进行package解析
     * 如果是package，则附加主模块id
     *
     * @inner
     * @param {string} id 模块id
     * @return {string} 解析后的id
     */
    function resolvePackageId(id) {
        each(
            packagesIndex,
            function (packageConf) {
                var name = packageConf.name;
                if (name === id) {
                    id = name + '/' + packageConf.main;
                    return false;
                }
            }
        );

        return id;
    }

    /**
     * 相对id转换成绝对id
     *
     * @inner
     * @param {string} id 要转换的相对id
     * @param {string} baseId 当前所在环境id
     * @return {string} 绝对id
     */
    function relative2absolute(id, baseId) {
        if (id.indexOf('.') !== 0) {
            return id;
        }

        var segs = baseId.split('/').slice(0, -1).concat(id.split('/'));
        var res = [];
        for (var i = 0; i < segs.length; i++) {
            var seg = segs[i];

            switch (seg) {
                case '.':
                    break;
                case '..':
                    if (res.length && res[res.length - 1] !== '..') {
                        res.pop();
                    }
                    else { // allow above root
                        res.push(seg);
                    }
                    break;
                default:
                    seg && res.push(seg);
            }
        }

        return res.join('/');
    }

    /**
     * 解析id，返回带有module和resource属性的Object
     *
     * @inner
     * @param {string} id 标识
     * @return {Object} id解析结果对象
     */
    function parseId(id) {
        var segs = id.split('!');

        if (segs[0]) {
            return {
                mod: segs[0],
                res: segs[1]
            };
        }
    }

    /**
     * 将对象数据转换成数组，数组每项是带有k和v的Object
     *
     * @inner
     * @param {Object} source 对象数据
     * @param {boolean} keyMatchable key是否允许被前缀匹配
     * @param {boolean} allowAsterisk 是否支持*匹配所有
     * @return {Array.<Object>} 对象转换数组
     */
    function kv2List(source, keyMatchable, allowAsterisk) {
        var list = [];
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                var item = {
                    k: key,
                    v: source[key]
                };
                list.push(item);

                if (keyMatchable) {
                    item.reg = key === '*' && allowAsterisk
                        ? /^/
                        : createPrefixRegexp(key);
                }
            }
        }

        return list;
    }



    /**
     * 创建id前缀匹配的正则对象
     *
     * @inner
     * @param {string} prefix id前缀
     * @return {RegExp} 前缀匹配的正则对象
     */
    function createPrefixRegexp(prefix) {
        return new RegExp('^' + prefix + '(/|$)');
    }

    /**
     * 循环遍历数组集合
     *
     * @inner
     * @param {Array} source 数组源
     * @param {function(Array,Number):boolean} iterator 遍历函数
     */
    function each(source, iterator) {
        if (source instanceof Array) {
            for (var i = 0, len = source.length; i < len; i++) {
                if (iterator(source[i], i) === false) {
                    break;
                }
            }
        }
    }

    /**
     * 根据元素的k或name项进行数组字符数逆序的排序函数
     *
     * @inner
     * @param {Object} a 要比较的对象a
     * @param {Object} b 要比较的对象b
     * @return {number} 比较结果
     */
    function descSorterByKOrName(a, b) {
        var aValue = a.k || a.name;
        var bValue = b.k || b.name;

        if (bValue === '*') {
            return -1;
        }

        if (aValue === '*') {
            return 1;
        }

        return bValue.length - aValue.length;
    }

    // 感谢requirejs，通过currentlyAddingScript兼容老旧ie
    //
    // For some cache cases in IE 6-8, the script executes before the end
    // of the appendChild execution, so to tie an anonymous define
    // call to the module name (which is stored on the node), hold on
    // to a reference to this node, but clear after the DOM insertion.
    var currentlyAddingScript;
    var interactiveScript;

    /**
     * 获取当前script标签
     * 用于ie下define未指定module id时获取id
     *
     * @inner
     * @return {HTMLScriptElement} 当前script标签
     */
    function getCurrentScript() {
        if (currentlyAddingScript) {
            return currentlyAddingScript;
        }
        else if (
            interactiveScript
            && interactiveScript.readyState === 'interactive'
        ) {
            return interactiveScript;
        }

        var scripts = document.getElementsByTagName('script');
        var scriptLen = scripts.length;
        while (scriptLen--) {
            var script = scripts[scriptLen];
            if (script.readyState === 'interactive') {
                interactiveScript = script;
                return script;
            }
        }
    }

    var headElement = document.getElementsByTagName('head')[0];
    var baseElement = document.getElementsByTagName('base')[0];
    if (baseElement) {
        headElement = baseElement.parentNode;
    }

    function createScript(moduleId, onload) {
        // 创建script标签
        //
        // 这里不挂接onerror的错误处理
        // 因为高级浏览器在devtool的console面板会报错
        // 再throw一个Error多此一举了
        var script = document.createElement('script');
        script.setAttribute('data-require-id', moduleId);
        script.src = toUrl(moduleId + '.js');
        script.async = true;
        if (script.readyState) {
            script.onreadystatechange = innerOnload;
        }
        else {
            script.onload = innerOnload;
        }

        function innerOnload() {
            var readyState = script.readyState;
            if (
                typeof readyState === 'undefined'
                || /^(loaded|complete)$/.test(readyState)
            ) {
                script.onload = script.onreadystatechange = null;
                script = null;

                onload();
            }
        }
        currentlyAddingScript = script;

        // If BASE tag is in play, using appendChild is a problem for IE6.
        // See: http://dev.jquery.com/ticket/2709
        baseElement
            ? headElement.insertBefore(script, baseElement)
            : headElement.appendChild(script);

        currentlyAddingScript = null;
    }

    // 暴露全局对象
    if (!define) {
        define = globalDefine;

        // 可能碰到其他形式的loader，所以，不要覆盖人家
        if (!require) {
            require = globalRequire;
        }

        // 如果存在其他版本的esl，在define那里就判断过了，不会进入这个分支
        // 所以这里就不判断了，直接写
        esl = globalRequire;
    }

    // data-main
    var mainModule;
    (function () {
        var scripts = document.getElementsByTagName('script');
        var len = scripts.length;

        while (len--) {
            var script = scripts[len];
            if ((mainModule = script.getAttribute('data-main'))) {
                break;
            }
        }
    })();

    mainModule && setTimeout(function () {
        globalRequire([mainModule]);
    }, 4);
})(this);
;

/*router*/
/**
 * saber-lang
 *
 * @file  extend
 * @author  firede[firede@firede.us]
 */

define('router/lang/extend', ['require'], function (require) {

    /**
     * 对象属性拷贝
     *
     * @param {Object} target 目标对象
     * @param {...Object} source 源对象
     * @return {Object}
     */
    function extend(target, source) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];

            if (!source) {
                continue;
            }

            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }

        }

        return target;
    }

    return extend;

});
;
/**
 * saber-lang
 *
 * @file  inherits
 * @author  firede[firede@firede.us]
 */

define('router/lang/inherits', ['require'], function (require) {

    /**
     * 为类型构造器建立继承关系
     *
     * @param {Function} subClass 子类构造器
     * @param {Function} superClass 父类构造器
     * @return {Function}
     */
    function inherits(subClass, superClass) {
        var Empty = function () {};
        Empty.prototype = superClass.prototype;
        var selfPrototype = subClass.prototype;
        var proto = subClass.prototype = new Empty();

        for (var key in selfPrototype) {
            if (selfPrototype.hasOwnProperty(key)) {
                proto[key] = selfPrototype[key];
            }
        }
        subClass.prototype.constructor = subClass;

        return subClass;
    }

    return inherits;

});
;
/**
 * @file  Event Emitter
 * @author  Firede(firede@firede.us)
 */

define('router/emitter', ['require'], function (require) {

    /**
     * Emitter
     *
     * @exports Emitter
     * @constructor
     */
    function Emitter() {}

    /**
     * Emitter的prototype（为了便于访问）
     *
     * @inner
     */
    var proto = Emitter.prototype;

    /**
     * 获取事件列表
     * 若还没有任何事件则初始化列表
     *
     * @private
     * @return {Object}
     */
    proto._getEvents = function () {
        if (!this._events) {
            this._events = {};
        }

        return this._events;
    };

    /**
     * 获取最大监听器个数
     * 若尚未设置，则初始化最大个数为10
     *
     * @private
     * @return {number}
     */
    proto._getMaxListeners = function () {
        if (isNaN(this.maxListeners)) {
            this.maxListeners = 10;
        }

        return this.maxListeners;
    };

    /**
     * 挂载事件
     *
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.on = function (event, listener) {
        var events = this._getEvents();
        var maxListeners = this._getMaxListeners();

        events[event] = events[event] || [];

        var currentListeners = events[event].length;
        if (currentListeners >= maxListeners && maxListeners !== 0) {
            throw new RangeError(
                'Warning: possible Emitter memory leak detected. '
                + currentListeners
                + ' listeners added.'
           );
        }

        events[event].push(listener);

        return this;
    };

    /**
     * 挂载只执行一次的事件
     *
     * @public
     * @param {string} event 事件名
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    proto.once = function (event, listener) {
        var me = this;

        function on() {
            me.off(event, on);
            listener.apply(this, arguments);
        }
        // 挂到on上以方便删除
        on.listener = listener;

        this.on(event, on);

        return this;
    };

    /**
     * 注销事件与监听器
     * 任何参数都`不传`将注销当前实例的所有事件
     * 只传入`event`将注销该事件下挂载的所有监听器
     * 传入`event`与`listener`将只注销该监听器
     *
     * @public
     * @param {string=} event 事件名
     * @param {Function=} listener 监听器
     * @return {Emitter}
     */
    proto.off = function (event, listener) {
        var events = this._getEvents();

        // 移除所有事件
        if (0 === arguments.length) {
            this._events = {};
            return this;
        }

        var listeners = events[event];
        if (!listeners) {
            return this;
        }

        // 移除指定事件下的所有监听器
        if (1 === arguments.length) {
            delete events[event];
            return this;
        }

        // 移除指定监听器（包括对once的处理）
        var cb;
        for (var i = 0; i < listeners.length; i++) {
            cb = listeners[i];
            if (cb === listener || cb.listener === listener) {
                listeners.splice(i, 1);
                break;
            }
        }
        return this;
    };

    /**
     * 触发事件
     *
     * @public
     * @param {string} event 事件名
     * @param {...*} args 传递给监听器的参数，可以有多个
     * @return {Emitter}
     */
    proto.emit = function (event) {
        var events = this._getEvents();
        var listeners = events[event];
        // 内联arguments的转化 提升性能
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        if (listeners) {
            listeners = listeners.slice(0);
            for (i = 0; i < listeners.length; i++) {
                listeners[i].apply(this, args);
            }
        }

        return this;
    };

    /**
     * 返回指定事件的监听器列表
     *
     * @public
     * @param {string} event 事件名
     * @return {Array} 监听器列表
     */
    proto.listeners = function (event) {
        var events = this._getEvents();
        return events[event] || [];
    };

    /**
     * 设置监听器的最大个数，为0时不限制
     *
     * @param {number} number 监听器个数
     * @return {Emitter}
     */
    proto.setMaxListeners = function (number) {
        this.maxListeners = number;

        return this;
    };

    var protoKeys = Object.keys(proto);

    /**
     * 将Emitter混入目标对象
     *
     * @param {Object} obj 目标对象
     * @return {Object} 混入Emitter后的对象
     */
    Emitter.mixin = function (obj) {
        // forIn不利于V8的优化
        var key;
        for (var i = 0, max = protoKeys.length; i < max; i++) {
            key = protoKeys[i];
            obj[key] = proto[key];
        }
        return obj;
    };

    // Export
    return Emitter;

});
;
/**
 * @file url处理
 * @author treelite(c.xinle@gmail.com)
 */

define('router/router/URL', ['require', 'router/uri/component/Path', 'router/uri/component/Query', 'router/uri/component/Fragment', 'router/router/config'], function (require) {

    var Path = require('router/uri/component/Path');
    var Query = require('router/uri/component/Query');
    var Fragment = require('router/uri/component/Fragment');
    var config = require('router/router/config');

    var DEFAULT_TOKEN = '?';

    /**
     * URL
     *
     * @constructor
     * @param {string} str url
     * @param {Object=} options 选项
     * @param {Object=} options.query 查询条件
     * @param {URL=} options.base 基路径
     * @param {string=} options.root 根路径
     */
    function URL(str, options) {
        options = options || {};

        str = (str || '').trim() || config.path;

        var token = this.token = options.token || DEFAULT_TOKEN;
        var root = options.root || config.root;
        if (root.charAt(root.length - 1) === '/') {
            root = root.substring(0, root.length - 1);
        }
        this.root = root;

        str = str.split('#');
        this.fragment = new Fragment(str[1]);

        str = str[0].split(token);
        var base = options.base || {};
        this.path = new Path(str[0], base.path);
        this.query = new Query(str[1]);

        // 路径修正
        // * 针对相对路径修正
        // * 添加默认的'/'
        var path = this.path.get();
        this.outRoot = path.indexOf('..') === 0;
        if (this.outRoot) {
            path = Path.resolve(root + '/', path);
            if (path.indexOf(root) === 0) {
                path = path.substring(root.length);
                this.path.set(path);
                this.outRoot = false;
            }
        }

        if (!this.outRoot && path.charAt(0) !== '/') {
            this.path.set('/' + path);
        }

        if (options.query) {
            this.query.add(options.query);
        }
    }

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    URL.prototype.toString = function () {
        var root = this.root;
        var path = this.path.get();
        if (this.outRoot) {
            path = Path.resolve(root + '/', path);
        }
        else {
            path = root + path;
        }

        return path
            + this.query.toString(this.token)
            + this.fragment.toString();
    };

    /**
     * 比较Path
     *
     * @public
     * @param {string} path 路径
     * @return {boolean}
     */
    URL.prototype.equalPath = function (path) {
        return this.path.get() === path;
    };

    /**
     * 比较Path与Query是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equal = function (url) {
        return this.query.equal(url.query)
            && this.equalPath(url.path.get());
    };

    /**
     * 比较Path, Query及Fragment是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equalWithFragment = function (url) {
        return this.equal(url)
            && this.fragment.equal(url.fragment);
    };

    /**
     * 获取查询条件
     *
     * @public
     * @return {Object}
     */
    URL.prototype.getQuery = function () {
        return this.query.get();
    };

    /**
     * 获取路径
     *
     * @public
     * @return {string}
     */
    URL.prototype.getPath = function () {
        return this.path.get();
    };

    return URL;

});
;
/**
 * @file 配置信息
 * @author treelite(c.xinle@gmail.com)
 */

define('router/router/config', [], {

    /**
     * 默认的路径
     * 只对hash控制器生效
     *
     * @type {string}
     */
    path: '/',

    /**
     * 默认的根路径
     *
     * @type {string}
     */
    root: '',

    /**
     * 路由模式
     * 可选async或page
     *
     * @type {string}
     */
    mode: 'async'

});
;
/**
 * @file controller
 * @author treelite(c.xinle@gmail.com), Firede(firede@firede.us)
 */

define('router/router/controller', ['require', 'router/lang/extend', 'router/router/URL', 'router/router/config'], function (require) {

    var extend = require('router/lang/extend');
    var URL = require('router/router/URL');
    var config = require('router/router/config');
    var applyHandler;
    var curLocation;

    /**
     * 调用路由处理器
     *
     * @inner
     * @param {URL} url URL对象
     * @param {Object} options 参数
     */
    function callHandler(url, options) {
        if (equalWithCurLocation(url, options)) {
            return;
        }
        applyHandler(url, options);
        curLocation = url;
    }

    /**
     * 判断是否与当前路径相等
     *
     * @inner
     * @param {URL} url URL对象
     * @param {Object} options 参数
     * @return {boolean}
     */
    function equalWithCurLocation(url, options) {
        return curLocation && url.equal(curLocation) && !options.force;
    }

    /**
     * url忽略root
     *
     * @inner
     * @param {string} url url
     * @return {string}
     */
    function ignoreRoot(url) {
        var root = config.root;
        if (url.charAt(0) === '/' && root) {
            if (url.indexOf(root) === 0) {
                url = url.replace(root, '');
            }
            else {
                // 绝对地址超出了root的范围
                // 转化为相对路径
                var dirs = root.split('/').slice(1);
                dirs = dirs.map(function () {
                    return '..';
                });
                url = dirs.join('/') + url;
                // 此时的相对路径是针对root的
                // 所以把curlocation置为空
                curLocation = null;
            }
        }

        return url;
    }

    /**
     * 创建URL对象
     *
     * @inner
     * @param {string=} url url字符串
     * @param {Object=} query 查询条件
     * @return {URL}
     */
    function createURL(url, query) {
        if (!url) {
            url = ignoreRoot(location.pathname);
        }
        return new URL(url, {query: query, base: curLocation});
    }

    /**
     * 路由监控
     *
     * @inner
     * @param {Object=} e 事件参数
     * @param {boolean} isSync 是否为同步渲染
     * @return {*}
     */
    function monitor(e, isSync) {
        e = e || {};

        var url = ignoreRoot(location.pathname);
        if (location.search.length > 1) {
            url += location.search;
        }
        url = createURL(url);

        if (url.outRoot) {
            return outOfControl(url.toString(), true);
        }

        var options = isSync ? {src: 'sync'} : extend({}, e.state, {src: 'history'});
        callHandler(url, options);
    }

    /**
     * 获取元素的本页跳转地址
     *
     * @inner
     * @param {HTMLElement} ele DOM元素
     * @return {!string}
     */
    function getLink(ele) {
        var target = ele.getAttribute('target');
        var href = ele.getAttribute('href');

        if (!href || (target && target !== '_self')) {
            return;
        }

        return href.charAt(0) !== '#' && href.indexOf(':') < 0 && href;
    }

    var exports = {};

    /**
     * 劫持全局的click事件
     *
     * @inner
     * @param {Event} e 事件参数
     */
    function hackClick(e) {
        var target = e.target;
        // 先上寻找A标签
        if (e.path) {
            for (var i = 0, item; item = e.path[i]; i++) {
                if (item.tagName === 'A') {
                    target = item;
                    break;
                }
            }
        }
        else {
            while (target && target.tagName !== 'A') {
                target = target.parentNode;
            }
        }

        if (!target) {
            return;
        }

        var href = getLink(target);
        if (href) {
            exports.redirect(ignoreRoot(href), null, {src: 'hijack'});
            e.preventDefault();
        }
    }

    /**
     * URL超出控制范围
     *
     * @inner
     * @param {string} url url地址
     * @param {boolean} silent 是否不添加历史纪录 默认为false
     */
    function outOfControl(url, silent) {
        exports.dispose();

        if (silent) {
            location.replace(url);
        }
        else {
            location.href = url;
        }
    }

    /**
     * 初始化
     *
     * @public
     * @param {Function} apply 调用路由处理器
     */
    exports.init = function (apply) {
        window.addEventListener('popstate', monitor, false);
        //document.body.addEventListener('click', hackClick, false);
        applyHandler = apply;

        // 首次调用为同步渲染
        monitor(null, true);
    };

    /**
     * 路由跳转
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 跳转参数
     * @param {boolean=} options.force 是否强制跳转
     * @param {boolean=} options.silent 是否静默跳转（不改变URL）
     * @return {*}
     */
    exports.redirect = function (url, query, options) {
        options = options || {};
        url = createURL(url, query);

        if (url.outRoot || config.mode === 'page') {
            return !equalWithCurLocation(url, options) && outOfControl(url.toString());
        }

        if (!curLocation.equalWithFragment(url) && !options.silent) {
            history.pushState(options, options.title, url.toString());
        }

        callHandler(url, options);
    };

    /**
     * 重置当前的URL
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 重置参数
     * @param {boolean=} options.silent 是否静默重置，静默重置只重置URL，不加载action
     * @return {*}
     */
    exports.reset = function (url, query, options) {
        options = options || {};
        url = createURL(url, query);

        if (url.outRoot || config.mode === 'page') {
            return !equalWithCurLocation(url, options) && outOfControl(url.toString());
        }

        if (!options.silent) {
            callHandler(url, options);
        }
        else {
            curLocation = url;
        }
        history.replaceState(options, options.title, url.toString());
    };

    /**
     * 销毁
     *
     * @public
     */
    exports.dispose = function () {
        window.removeEventListener('popstate', monitor, false);
        //document.body.removeEventListener('click', hackClick, false);
        curLocation = null;
    };

    return exports;

});
;
/**
 * @file 路由管理
 * @author treelite(c.xinle@gmail.com), Firede(firede@firede.us)
 */

define('router/router', ['require', 'router/lang/extend', 'router/router/config', 'router/router/controller'], function (require) {

    var extend = require('router/lang/extend');
    var globalConfig = require('router/router/config');
    var controller = require('router/router/controller');

    var exports = {};

    /**
     * 路由规则
     *
     * @type {Array.<Object>}
     */
    var rules = [];

    /**
     * 上一次的route信息
     *
     * @type {Object}
     */
    var prevState = {};

    /**
     * 判断是否已存在路由处理器
     *
     * @inner
     * @param {string|RegExp} path 路径
     * @return {number}
     */
    function indexOfHandler(path) {
        var index = -1;

        path = path.toString();
        rules.some(function (item, i) {
            // toString是为了判断正则是否相等
            if (item.raw.toString() === path) {
                index = i;
            }
            return index !== -1;
        });

        return index;
    }

    /**
     * 从path中获取query
     * 针对正则表达式的规则
     *
     * @inner
     * @param {string} path 路径
     * @param {Object} item 路由信息
     * @return {Object}
     */
    function getParamsFromPath(path, item) {
        var res = {};
        var names = item.params || [];
        var params = path.match(item.path) || [];

        for (var i = 1, name; i < params.length; i++) {
            name = names[i - 1] || '$' + i;
            res[name] = decodeURIComponent(params[i]);
        }

        return res;
    }

    /**
     * 是否正在等待处理器执行
     *
     * @type {boolean}
     */
    var pending = false;

    /**
     * 等待调用处理器的参数
     *
     * @type {!Object}
     */
    var waitingRoute;

    /**
     * 根据URL调用处理器
     *
     * @inner
     * @param {URL} url url对象
     * @param {Object=} options 参数
     * @param {string=} options.title 页面标题
     */
    function apply(url, options) {
        options = options || {};

        // 只保存最后一次的待调用信息
        if (pending) {
            waitingRoute = {
                url: url,
                options: options
            };
            return;
        }

        function finish() {
            pending = false;
            if (waitingRoute) {
                var route = extend({}, waitingRoute);
                waitingRoute = null;
                apply(route.url, route.options);
            }
        }

        pending = true;

        var handler;
        var defHandler;
        var query = extend({}, url.getQuery());
        var params = {};
        var path = url.getPath();

        rules.some(function (item) {
            if (item.path instanceof RegExp) {
                if (item.path.test(path)) {
                    handler = item;
                    params = getParamsFromPath(path, item);
                }
            }
            else if (url.equalPath(item.path)) {
                handler = item;
            }

            if (!item.path) {
                defHandler = item;
            }

            return !!handler;
        });

        handler = handler || defHandler;

        if (!handler) {
            waitingRoute = null;
            pending = false;
            throw new Error('can not found route for: ' + path);
        }

        if (options.title) {
            document.title = options.title;
        }

        var curState = {
            path: path,
            query: query,
            params: params,
            url: url.toString(),
            options: options
        };
        var args = [curState, prevState];
        prevState = curState;

        if (handler.fn.length > args.length) {
            args.push(finish);
            handler.fn.apply(handler.thisArg, args);
        }
        else {
            handler.fn.apply(handler.thisArg, args);
            finish();
        }
    }

    /**
     * 处理RESTful风格的路径
     * 使用正则表达式
     *
     * @inner
     * @param {string} path 路径
     * @return {Object}
     */
    function restful(path) {
        var res = {
            params: []
        };

        res.path = path.replace(/:([^/]+)/g, function ($0, $1) {
            res.params.push($1);
            return '([^/]+)';
        });

        res.path = new RegExp('^' + res.path + '$');

        return res;
    }

    /**
     * 添加路由规则
     *
     * @inner
     * @param {string} path 路径
     * @param {Function} fn 路由处理函数
     * @param {Object} thisArg 路由处理函数的this指针
     */
    function addRule(path, fn, thisArg) {
        var rule = {
                raw: path,
                path: path,
                fn: fn,
                thisArg: thisArg
            };

        if (!(path instanceof RegExp)
            && path.indexOf(':') >= 0
        ) {
            rule = extend(rule, restful(path));
        }

        rules.push(rule);
    }

    /**
     * 重置当前的URL
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 选项
     * @param {boolean=} options.silent 是否静默重置，静默重置只重置URL，不加载action
     */
    exports.reset = function (url, query, options) {
        controller.reset(url, query, options);
    };

    /**
     * 设置配置信息
     *
     * @public
     * @param {Object} options 配置信息
     * @param {string=} options.path 默认路径
     * @param {string=} options.index index文件名称
     * @param {string=} options.mode 路由模式，可选async、page，默认为async
     */
    exports.config = function (options) {
        options = options || {};
        // 修正root，添加头部的`/`并去掉末尾的'/'
        var root = options.root;
        if (root && root.charAt(root.length - 1) === '/') {
            root = options.root = root.substring(0, root.length - 1);
        }
        if (root && root.charAt(0) !== '/') {
            options.root = '/' + root;
        }
        extend(globalConfig, options);
    };

    /**
     * 添加路由规则
     *
     * @public
     * @param {string|RegExp=} path 路径
     * @param {function(path, query)} fn 路由处理函数
     * @param {Object=} thisArg 路由处理函数的this指针
     */
    exports.add = function (path, fn, thisArg) {
        if (indexOfHandler(path) >= 0) {
            throw new Error('path already exist');
        }
        addRule(path, fn, thisArg);
    };

    /**
     * 删除路由规则
     *
     * @public
     * @param {string} path 路径
     */
    exports.remove = function (path) {
        var i = indexOfHandler(path);
        if (i >= 0) {
            rules.splice(i, 1);
        }
    };

    /**
     * 测试路由规则存在性
     *
     * @public
     * @param {string} path 路径
     */
    exports.exist = function (path) {
        return indexOfHandler(path) >= 0;
    };

    /**
     * 清除所有路由规则
     *
     * @public
     */
    exports.clear = function () {
        rules = [];
    };

    /**
     * URL跳转
     *
     * @public
     * @param {string} url 路径
     * @param {?Object} query 查询条件
     * @param {Object=} options 跳转参数
     * @param {string=} options.title 跳转后页面的title
     * @param {boolean=} options.force 是否强制跳转
     * @param {boolean=} options.silent 是否静默跳转（不改变URL）
     */
    exports.redirect = function (url, query, options) {
        controller.redirect(url, query, options);
    };

    /**
     * 启动路由监控
     *
     * @public
     * @param {Object} options 配置项
     */
    exports.start = function (options) {
        exports.config(options);
        controller.init(apply);
    };

    /**
     * 停止路由监控
     *
     * @public
     */
    exports.stop = function () {
        controller.dispose();
        exports.clear();
        waitingRoute = null;
        prevState = {};
    };

    /**
     * 更换控制器
     * 仅用于单元测试及自定义控制器的调试
     *
     * @public
     * @param {Object} implement 路由控制器
     */
    exports.controller = function (implement) {
        controller = implement;
    };

    return exports;
});
;
/**
 * @file URI main file
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri', ['require', 'router/uri/URI', 'router/uri/util/uri-parser', 'router/uri/component/Path'], function (require) {

    var URI = require('router/uri/URI');

    /**
     * 创建URI对象
     *
     * @public
     * @param {...string|Object} data uri
     * @return {Object}
     */
    var exports = function (data) {
        return new URI(data);
    };


    /**
     * 解析URI字符串
     *
     * @public
     * @param {string} str URI字符串
     * @return {Object}
     */
    exports.parse = require('router/uri/util/uri-parser');

    /**
     * resolve path
     *
     * @public
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    exports.resolve = require('router/uri/component/Path').resolve;

    return exports;
});
;
/**
 * @file URI
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/URI', ['require', 'router/uri/util/uri-parser', 'router/uri/component/Scheme', 'router/uri/component/UserName', 'router/uri/component/Password', 'router/uri/component/Host', 'router/uri/component/Port', 'router/uri/component/Path', 'router/uri/component/Query', 'router/uri/component/Fragment'], function (require) {

    var parseURI = require('router/uri/util/uri-parser');

    /**
     * 属性构造函数
     *
     * @const
     * @type {Object}
     */
    var COMPONENTS = {
        scheme: require('router/uri/component/Scheme'),
        username: require('router/uri/component/UserName'),
        password: require('router/uri/component/Password'),
        host: require('router/uri/component/Host'),
        port: require('router/uri/component/Port'),
        path: require('router/uri/component/Path'),
        query: require('router/uri/component/Query'),
        fragment: require('router/uri/component/Fragment')
    };

    /**
     * URI
     *
     * @contructor
     * @param {string|Object} data URL
     */
    function URI(data) {
        data = parseURI(data);

        var Factory;
        var me = this;
        Object.keys(COMPONENTS).forEach(function (name) {
            Factory = COMPONENTS[name];
            me[name] = new Factory(data[name]);
        });
    }

    /**
     * 字符串化authority
     *
     * @inner
     * @param {URI} uri URI对象
     * @return {string}
     */
    function stringifyAuthority(uri) {
        var res = [];
        var username = uri.username.toString();
        var password = uri.password.toString();
        var host = uri.host.toString();
        var port = uri.port.toString();

        if (username || password) {
            res.push(username + ':' + password + '@');
        }

        res.push(host);
        res.push(port);

        return res.join('');
    }

    /**
     * 设置属性
     *
     * @public
     * @param {string=} name 属性名称
     * @param {...*} args 数据
     */
    URI.prototype.set = function () {
        var i = 0;
        var arg = {};
        if (arguments.length > 1) {
            arg.name = arguments[i++];
        }
        arg.data = Array.prototype.slice.call(arguments, i);

        var component = this[arg.name];
        if (component) {
            component.set.apply(component, arg.data);
        }
        else {
            var me = this;
            var data = parseURI(arg.data[0]);
            Object.keys(COMPONENTS).forEach(function (name) {
                me[name].set(data[name]);
            });
        }
    };

    /**
     * 获取属性
     *
     * @public
     * @param {string} name 属性名称
     * @return {*}
     */
    URI.prototype.get = function () {
        var arg = {
                name: arguments[0],
                data: Array.prototype.slice.call(arguments, 1)
            };
        var component = this[arg.name];

        if (component) {
            return component.get.apply(component, arg.data);
        }
    };

    /**
     * 转化成字符串
     *
     * @public
     * @param {string=} name 属性名称
     * @return {string}
     */
    URI.prototype.toString = function (name) {
        var str;
        var component = this[name];

        if (component) {
            str = component.toString();
        }
        else {
            str = [];
            var scheme = this.scheme.toString();
            if (scheme) {
                str.push(scheme + ':');
            }
            var authority = stringifyAuthority(this);
            if (scheme && authority) {
                str.push('//');
            }
            str.push(authority);
            str.push(this.path.toString());
            str.push(this.query.toString());
            str.push(this.fragment.toString());
            str = str.join('');
        }

        return str;
    };

    /**
     * 比较uri
     *
     * @public
     * @param {string|URI} uri 待比较的URL对象
     * @return {boolean}
     */
    URI.prototype.equal = function (uri) {
        if (!(uri instanceof URI)) {
            uri = new URI(uri);
        }

        var res = true;
        var names = Object.keys(COMPONENTS);

        for (var i = 0, name; res && (name = names[i]); i++) {
            if (name === 'port') {
                res = this[name].equal(uri[name].get(), this.scheme.get());
            }
            else {
                res = this[name].equal(uri[name]);
            }
        }

        return res;
    };

    return URI;

});
;
/**
 * @file abstract component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/Abstract', ['require'], function (require) {

    /**
     * URI Component 虚基类
     * 提供基础方法
     *
     * @constructor
     * @param {string} data 数据
     */
    function Abstract() {
        var args = Array.prototype.slice.call(arguments);
        this.set.apply(this, args);
    }

    /**
     * 获取数据
     *
     * @public
     * @return {string}
     */
    Abstract.prototype.get = function () {
        return this.data;
    };

    /**
     * 设置数据
     *
     * @public
     * @param {string} data 数据
     */
    Abstract.prototype.set = function (data) {
        this.data = data || '';
    };

    /**
     * 添加数据
     *
     * @public
     * @param {string} data 数据
     */
    Abstract.prototype.add = function (data) {
        this.set(data);
    };

    /**
     * 移除数据
     *
     * @public
     */
    Abstract.prototype.remove = function () {
        this.data = '';
    };

    /**
     * 字符串输出
     *
     * @public
     * @return {string}
     */
    Abstract.prototype.toString = function () {
        return this.data.toString();
    };

    /**
     * 数据比较
     *
     * @public
     * @param {Object} data 带比较对象
     * @return {boolean}
     */
    Abstract.prototype.equal = function (data) {
        if (data instanceof Abstract) {
            data = data.get();
        }
        // 需要类型转化的比较
        /* eslint-disable eqeqeq */
        return this.data == data;
        /* eslint-enable eqeqeq */
    };

    return Abstract;
});
;
/**
 * @file fragment component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/Fragment', ['require', 'router/lang/inherits', 'router/uri/component/Abstract'], function (require) {
    var inherits = require('router/lang/inherits');
    var Abstract = require('router/uri/component/Abstract');

    var DEFAULT_PREFIX = '#';

    /**
     * Fragment
     *
     * @constructor
     * @param {string} data 数据
     */
    function Fragment(data) {
        Abstract.call(this, data);
    }

    inherits(Fragment, Abstract);

    /**
     * 字符串化
     *
     * @public
     * @param {string=} prefix 前缀分割符
     * @return {string}
     */
    Fragment.prototype.toString = function (prefix) {
        prefix = prefix || DEFAULT_PREFIX;
        return this.data ? prefix + this.data : '';
    };

    return Fragment;
});
;
/**
 * @file host component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/Host', ['require', 'router/lang/inherits', 'router/uri/component/Abstract'], function (require) {
    var inherits = require('router/lang/inherits');
    var Abstract = require('router/uri/component/Abstract');

    /**
     * Host
     *
     * @constructor
     * @param {string} data 数据
     */
    function Host(data) {
        Abstract.call(this, data);
    }

    inherits(Host, Abstract);

    /**
     * 设置host
     * 忽略大小写
     *
     * @public
     * @param {string} host Host
     */
    Host.prototype.set = function (host) {
        host = host || '';
        this.data = host.toLowerCase();
    };

    /**
     * 比较host
     * 忽略大小写
     *
     * @public
     * @param {string|Host} host Host
     * @return {boolean}
     */
    Host.prototype.equal = function (host) {
        if (host instanceof Host) {
            host = host.get();
        }
        else {
            host = host || '';
        }
        return this.data === host.toLowerCase();
    };

    return Host;
});
;
/**
 * @file password component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/Password', ['require', 'router/lang/inherits', 'router/uri/component/Abstract'], function (require) {
    var inherits = require('router/lang/inherits');
    var Abstract = require('router/uri/component/Abstract');

    /**
     * Password
     *
     * @constructor
     * @param {string} data 数据
     */
    function Password(data) {
        Abstract.call(this, data);
    }

    inherits(Password, Abstract);

    return Password;
});
;
/**
 * @file path component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/Path', ['require', 'router/lang/inherits', 'router/uri/component/Abstract'], function (require) {
    var inherits = require('router/lang/inherits');
    var Abstract = require('router/uri/component/Abstract');

    /**
     * normalize path
     * see rfc3986 #6.2.3. Scheme-Based Normalization
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function normalize(path) {
        if (!path) {
            path = '/';
        }

        return path;
    }

    /**
     * 获取目录
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function dirname(path) {
        path = path.split('/');
        path.pop();
        return path.join('/');
    }

    /**
     * 处理路径中的相对路径
     *
     * @inner
     * @param {Array} paths 分割后的路径
     * @param {boolean} overRoot 是否已超出根目录
     * @return {Array}
     */
    function resolveArray(paths, overRoot) {
        var up = 0;
        for (var i = paths.length - 1, item; item = paths[i]; i--) {
            if (item === '.') {
                paths.splice(i, 1);
            }
            else if (item === '..') {
                paths.splice(i, 1);
                up++;
            }
            else if (up) {
                paths.splice(i, 1);
                up--;
            }
        }

        if (overRoot) {
            while (up-- > 0) {
                paths.unshift('..');
            }
        }

        return paths;
    }

    /**
     * Path
     *
     * @constructor
     * @param {string} data 路径
     * @param {string|Path=} base 相对路径
     */
    function Path(data, base) {
        Abstract.call(this, data, base);
    }

    /**
     * 应用路径
     *
     * @public
     * @param {string} from 起始路径
     * @param {string=} to 目标路径
     * @return {string}
     */
    Path.resolve = function (from, to) {
        to = to || '';

        if (to.charAt(0) === '/') {
            return Path.resolve(to);
        }

        var isAbsolute = from.charAt(0) === '/';
        var isDir = false;
        if (to) {
            from = dirname(from);
            isDir = to.charAt(to.length - 1) === '/';
        }
        // 对于`/`不处理
        else if (from.length > 1) {
            isDir = from.charAt(from.length - 1) === '/';
        }

        var path = from.split('/')
            .concat(to.split('/'))
            .filter(
                function (item) {
                    return !!item;
                }
            );

        path = resolveArray(path, !isAbsolute);


        return (isAbsolute ? '/' : '')
            + (path.length > 0 ? path.join('/') + (isDir ? '/' : '') : '');
    };

    inherits(Path, Abstract);

    /**
     * 设置path
     *
     * @public
     * @param {string} path 路径
     * @param {string|Path=} base 相对路径
     */
    Path.prototype.set = function (path, base) {
        if (base instanceof Path) {
            base = base.get();
        }

        var args = [path || ''];
        if (base) {
            args.unshift(base);
        }
        this.data = Path.resolve.apply(Path, args);
    };

    /**
     * 比较path
     *
     * @public
     * @param {string|Path} path 路径
     * @return {boolean}
     */
    Path.prototype.equal = function (path) {
        var myPath = normalize(this.data);

        if (path instanceof Path) {
            path = normalize(path.get());
        }
        else {
            path = normalize(Path.resolve(path || ''));
        }

        return myPath === path;
    };

    /**
     * 应用路径
     *
     * @public
     * @param {string|Path} path 起始路径
     * @param {boolean} from 目标路径
     */
    Path.prototype.resolve = function (path, from) {
        if (path instanceof Path) {
            path = path.get();
        }

        var args = [this.data];
        if (from) {
            args.unshift(path);
        }
        else {
            args.push(path);
        }

        this.data = Path.resolve.apply(Path, args);
    };

    return Path;
});
;
/**
 * @file port component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/Port', ['require', 'router/lang/inherits', 'router/uri/component/Abstract'], function (require) {
    var inherits = require('router/lang/inherits');
    var Abstract = require('router/uri/component/Abstract');

    /**
     * 常见协议的默认端口号
     *
     * @const
     * @type {Object}
     */
    var DEFAULT_PORT = {
            ftp: '21',
            ssh: '22',
            telnet: '23',
            http: '80',
            https: '443',
            ws: '80',
            wss: '443'
        };

    /**
     * Prot
     *
     * @constructor
     * @param {string} data 端口号
     */
    function Port(data) {
        Abstract.call(this, data);
    }

    inherits(Port, Abstract);

    /**
     * 比较port
     *
     * @public
     * @param {string|Port} port 端口号
     * @param {string=} scheme 协议
     * @return {boolean}
     */
    Port.prototype.equal = function (port, scheme) {
        var myPort = this.data || DEFAULT_PORT[scheme];
        if (port instanceof Port) {
            port = port.get();
        }
        port = port || DEFAULT_PORT[scheme];

        return myPort === port;
    };

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    Port.prototype.toString = function () {
        return this.data ? ':' + this.data : '';
    };

    return Port;
});
;
/**
 * @file query component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/Query', ['require', 'router/lang/inherits', 'router/lang/extend', 'router/uri/component/Abstract', 'router/uri/util/parse-query', 'router/uri/util/stringify-query'], function (require) {
    var inherits = require('router/lang/inherits');
    var extend = require('router/lang/extend');
    var Abstract = require('router/uri/component/Abstract');

    var parse = require('router/uri/util/parse-query');
    var stringify = require('router/uri/util/stringify-query');

    /**
     * 默认的查询条件分割符
     *
     * @const
     * @type {string}
     */
    var DEFAULT_PREFIX = '?';

    /**
     * 判断对象
     *
     * @inner
     * @param {*} data 变量
     * @return {boolean}
     */
    function isObject(data) {
        return '[object Object]'
            === Object.prototype.toString.call(data);
    }

    /**
     * 判断字符串
     *
     * @inner
     * @param {*} str 变量
     * @return {boolean}
     */
    function isString(str) {
        return typeof str === 'string';
    }

    /**
     * 比较数组
     *
     * @inner
     * @param {Array} a 待比较数组
     * @param {Array} b 待比较数组
     * @return {boolean}
     */
    function compareArray(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            return false;
        }

        if (a.length !== b.length) {
            return false;
        }

        a = a.slice(0);
        a = a.slice(0);
        a.sort();
        b.sort();

        var res = true;
        for (var i = 0, len = a.length; res && i < len; i++) {
            // 需要类型转化的比较
            /* eslint-disable eqeqeq */
            res = a[i] == b[i];
            /* eslint-enable eqeqeq */
        }

        return res;
    }

    /**
     * 比较对象
     *
     * @inner
     * @param {Object} a 待比较对象
     * @param {Object} b 待比较对象
     * @return {boolean}
     */
    function compareObject(a, b) {

        if (!isObject(a) || !isObject(b)) {
            return false;
        }

        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) {
            return false;
        }

        var res = true;
        for (var i = 0, key, item; res && (key = aKeys[i]); i++) {
            if (!b.hasOwnProperty(key)) {
                res = false;
                break;
            }

            item = a[key];
            if (Array.isArray(item)) {
                res = compareArray(item, b[key]);
            }
            else {
                // 需要类型转化的比较
                /* eslint-disable eqeqeq */
                res = item == b[key];
                /* eslint-enable eqeqeq */
            }
        }

        return res;
    }

    /**
     * 解码数据
     *
     * @inner
     * @param {string|Array.<string>} value 数据
     * @return {string|Array.<string>}
     */
    function decodeValue(value) {
        if (Array.isArray(value)) {
            value = value.map(function (k) {
                return decodeURIComponent(k || '');
            });
        }
        else if (!value && !isString(value)) {
            value = null;
        }
        else {
            value = decodeURIComponent(value);
        }
        return value;
    }

    /**
     * 添加查询条件
     *
     * @inner
     * @param {string} key 键
     * @param {string|Array.<string>} value 值
     * @param {Object} items 目标数据
     * @return {Object}
     */
    function addQueryItem(key, value, items) {
        var item = items[key];

        value = decodeValue(value);

        if (item) {
            if (!Array.isArray(item)) {
                item = [item];
            }
            if (Array.isArray(value)) {
                item = item.concat(value);
            }
            else {
                item.push(value);
            }
        }
        else {
            item = value;
        }

        items[key] = item;

        return items;
    }

    /**
     * Query
     *
     * @constructor
     * @param {string|Object} data 查询条件
     */
    function Query(data) {
        data = data || {};
        Abstract.call(this, data);
    }

    inherits(Query, Abstract);

    /**
     * 设置query
     *
     * @public
     * @param {...string|Object} data 查询条件
     */
    Query.prototype.set = function () {

        if (arguments.length === 1) {
            var query = arguments[0];
            if (isObject(query)) {
                var data = this.data = {};
                Object.keys(query).forEach(function (key) {
                    data[key] = decodeValue(query[key]);
                });
            }
            else {
                this.data = parse(query);
            }
        }
        else {
            this.data[arguments[0]] = decodeValue(arguments[1]);
        }

    };

    /**
     * 获取query
     *
     * @public
     * @param {string=} name 查询条件名称
     * @return {*}
     */
    Query.prototype.get = function (name) {
        return name ? this.data[name] : extend({}, this.data);
    };

    /**
     * 字符串化
     *
     * @public
     * @param {string=} prefix 前缀分割符
     * @return {string}
     */
    Query.prototype.toString = function (prefix) {
        prefix = prefix || DEFAULT_PREFIX;
        var str = stringify(this.data);

        return str ? prefix + str : '';
    };

    /**
     * 比较query
     *
     * @public
     * @param {string|Object|Query} query 查询条件
     * @return {boolean}
     */
    Query.prototype.equal = function (query) {
        if (isString(query)) {
            query = parse(query);
        }
        else if (query instanceof Query) {
            query = query.get();
        }

        return compareObject(this.data, query);
    };

    /**
     * 添加query item
     *
     * @public
     * @param {string|Object} key 键
     * @param {string=} value 值
     */
    Query.prototype.add = function (key, value) {
        var data = this.data;

        if (isObject(key)) {
            Object.keys(key).forEach(function (k) {
                addQueryItem(k, key[k], data);
            });
        }
        else {
            addQueryItem(key, value, data);
        }

        this.data = data;
    };

    /**
     * 删除query item
     *
     * @public
     * @param {string=} key 键，忽略该参数则清除所有的query item
     */
    Query.prototype.remove = function (key) {
        if (!key) {
            this.data = {};
        }
        else if (this.data.hasOwnProperty(key)) {
            delete this.data[key];
        }
    };

    return Query;
});
;
/**
 * @file scheme component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/Scheme', ['require', 'router/lang/inherits', 'router/uri/component/Abstract'], function (require) {
    var inherits = require('router/lang/inherits');
    var Abstract = require('router/uri/component/Abstract');

    /**
     * Scheme
     *
     * @constructor
     * @param {string} data 协议
     */
    function Scheme(data) {
        Abstract.call(this, data);
    }

    inherits(Scheme, Abstract);

    /**
     * 设置scheme
     * 忽略大小写
     *
     * @public
     * @param {string} scheme 协议
     */
    Scheme.prototype.set = function (scheme) {
        scheme = scheme || '';
        this.data = scheme.toLowerCase();
    };

    /**
     * 比较scheme
     * 忽略大小写
     *
     * @public
     * @param {string|Scheme} scheme 协议
     * @return {boolean}
     */
    Scheme.prototype.equal = function (scheme) {
        if (scheme instanceof Scheme) {
            scheme = scheme.get();
        }
        else {
            scheme = scheme || '';
        }
        return this.data === scheme.toLowerCase();
    };

    return Scheme;
});
;
/**
 * @file username component
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/component/UserName', ['require', 'router/lang/inherits', 'router/uri/component/Abstract'], function (require) {
    var inherits = require('router/lang/inherits');
    var Abstract = require('router/uri/component/Abstract');

    /**
     * UserName
     *
     * @constructor
     * @param {string} data 用户名
     */
    function UserName(data) {
        Abstract.call(this, data);
    }

    inherits(UserName, Abstract);

    return UserName;
});
;
/**
 * @file parse query
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/util/parse-query', ['require'], function (require) {

    /**
     * 解析query
     *
     * @public
     * @param {string} query 查询条件
     * @return {Object}
     */
    function parse(query) {
        var res = {};

        query = query.split('&');
        var key;
        var value;
        query.forEach(function (item) {
            if (!item) {
                return;
            }

            item = item.split('=');
            key = item[0];
            value = item.length >= 2
                ? decodeURIComponent(item[1])
                : null;

            if (res[key]) {
                if (!Array.isArray(res[key])) {
                    res[key] = [res[key]];
                }
                res[key].push(value);
            }
            else {
                res[key] = value;
            }
        });

        return res;
    }

    return parse;

});
;
/**
 * @file stringify query
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/util/stringify-query', ['require'], function (require) {

    /**
     * 字符串化query
     *
     * @public
     * @param {Object} query 查询条件
     * @return {string}
     */
    function stringify(query) {
        var str = [];
        var item;

        Object.keys(query).forEach(function (key) {
            item = query[key];

            if (!Array.isArray(item)) {
                item = [item];
            }

            item.forEach(function (value) {
                if (value === null) {
                    str.push(key);
                }
                else {
                    str.push(key + '=' + encodeURIComponent(value || ''));
                }
            });
        });

        return str.join('&');
    }

    return stringify;
});
;
/**
 * @file uri parser
 * @author treelite(c.xinle@gmail.com)
 */

define('router/uri/util/uri-parser', ['require', 'router/lang/extend'], function (require) {

    var UNDEFINED;

    var extend = require('router/lang/extend');

    /**
     * 标准化URI数据
     *
     * @inner
     * @param {Object} data URI数据
     * @return {Object}
     */
    function normalize(data) {
        var res = {};
        // URI组成
        // http://tools.ietf.org/html/rfc3986#section-3
        var components = [
                'scheme', 'username', 'password', 'host',
                'port', 'path', 'query', 'fragment'
            ];

        components.forEach(function (name) {
            res[name] = data[name] || UNDEFINED;
        });

        return res;
    }

    /**
     * 解析authority
     * ! 不支持IPv6
     *
     * @inner
     * @param {string} str authority
     * @return {Object}
     */
    function parseAuthority(str) {
        var res = {};

        str.replace(
            /^([^@]+@)?([^:]+)(:\d+)?$/,
            function ($0, userInfo, host, port) {
                if (userInfo) {
                    userInfo = userInfo.slice(0, -1);
                    userInfo = userInfo.split(':');
                    res.username = userInfo[0];
                    res.password = userInfo[1];
                }

                res.host = host;

                if (port) {
                    res.port = port.substring(1);
                }
            }
        );

        return res;

    }

    /**
     * 检测是否有port
     *
     * @inner
     * @param {string} str uri字符串
     * @param {Object} data 数据容器
     * @return {boolean}
     */
    function detectPort(str, data) {
        // 忽略scheme 与 userinfo
        var res = /[^:]+:\d{2,}(\/|$)/.test(str);

        // 有port
        // 必定没有scheme
        if (res) {
            str = str.split('/');
            extend(data, parseAuthority(str.shift()));
            if (str.length > 0) {
                data.path = '/' + str.join('/');
            }
        }

        return res;
    }

    /**
     * 检测是否有scheme
     *
     * @inner
     * @param {string} str uri字符串
     * @param {Object} data 数据容器
     * @return {boolean}
     */
    function detectScheme(str, data) {
        var i = str.indexOf(':');
        var slashIndex = str.indexOf('/');
        slashIndex = slashIndex >= 0 ? slashIndex : str.length;

        // 不考虑authority
        var res = i >= 0 && i < slashIndex;

        if (res) {
            data.scheme = str.substring(0, i);
            data.path = str.substring(i + 1);
        }

        return res;
    }

    /**
     * 解析字符串
     *
     * @inner
     * @param {string} str uri字符串
     * @return {Object}
     */
    function parse(str) {
        var res = {};

        // 提取fragment
        var i = str.indexOf('#');
        if (i >= 0) {
            res.fragment = str.substring(i + 1);
            str = str.substring(0, i);
        }

        // 提取query
        i = str.indexOf('?');
        if (i >= 0) {
            res.query = str.substring(i + 1);
            str = str.substring(0, i);
        }

        // 检测是否同时有scheme与authority
        i = str.indexOf('://');
        if (i >= 0) {
            res.scheme = str.substring(0, i);
            str = str.substring(i + 3);
            // 特例 `file` 不存在 authority
            if (res.scheme === 'file') {
                res.path = str;
            }
            else {
                str = str.split('/');
                extend(res, parseAuthority(str.shift()));
                if (str.length > 0) {
                    res.path = '/' + str.join('/');
                }
            }
            return res;
        }

        // 检测是否含有port
        // 如果有必定不存在scheme
        if (detectPort(str, res)) {
            return res;
        }

        // 检测是否含有scheme
        // 如果有必定不存在authority
        if (detectScheme(str, res)) {
            return res;
        }

        // 只有host与path
        str = str.split('/');
        res.host = str.shift();
        if (str.length > 0) {
            res.path = '/' + str.join('/');
        }

        return res;
    }

    /**
     * 解析URI
     *
     * @public
     * @param {string|Object} data uri
     * @return {Object}
     */
    return function (data) {

        if (typeof data === 'string'
            || data instanceof String
        ) {
            data = parse(data);
        }

        return normalize(data);
    };

});
;

/*utils*/
define('utils/http', ['utils/promise', 'utils/underscore', 'utils/dom'], function(Promise, _, $) {
    var exports = {};

    /*
     * @param url
     * @param settings
     * @return a promise.
     *   .then(function( data, textStatus, xhr ) {});
     *   .catch(function( xhr, textStatus, errorThrown ) {});
     *   .finally(function( data|xhr, textStatus, xhr|errorThrown ) { });
     */
    exports.ajax = function(url, settings) {
        //console.log('ajax with', url, settings);
        if (typeof url === 'object') {
            settings = url;
            url = "";
        }
        // normalize settings
        settings = _.defaultsDeep(settings, {
            url: url,
            method: settings && settings.type || 'GET',
            headers: {},
            data: null,
            jsonp: false,
            jsonpCallback: 'cb'
        });
        _.forOwn(settings.headers, function(v, k) {
            settings.headers[k] = v.toLowerCase(v);
        });

        settings.headers['content-type'] = settings.headers['content-type'] ||
            _guessContentType(settings.data);

        //console.log('before parse data', settings);
        if (/application\/json/.test(settings.headers['content-type'])) {
            settings.data = JSON.stringify(settings.data);
        } else if (/form-urlencoded/.test(settings.headers['content-type'])) {
            settings.data = $.param(settings.data);
        }
        //console.log('after parse data', settings);
        return _doAjax(settings);
    };

    function _guessContentType(data) {
        if (data instanceof FormData) {
            return 'multipart/form-data';
        }
        return 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    exports.get = function(url, data) {
        return exports.ajax(url, {
            data: data
        });
    };

    exports.post = function(url, data) {
        return exports.ajax(url, {
            method: 'POST',
            data: data
        });
    };

    exports.put = function(url, data) {
        return exports.ajax(url, {
            method: 'PUT',
            data: data
        });
    };

    exports.delete = function(url, data) {
        return exports.ajax(url, {
            method: 'DELETE',
            data: data
        });
    };

    function _doAjax(settings) {
        //console.log('_doAjax with', settings);
        var xhr;
        try {
            xhr = _createXHR();
        } catch (e) {
            return Promise.reject(null, '', e);
        }
        //console.log('open xhr');
        xhr.open(settings.method, settings.url, true);

        _.forOwn(settings.headers, function(v, k) {
            xhr.setRequestHeader(k, v);
        });

        return new Promise(function(resolve, reject) {
            xhr.onreadystatechange = function() {
                //console.log('onreadystatechange', xhr.readyState, xhr.status);
                if (xhr.readyState == 4) {
                    xhr = _resolveXHR(xhr);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseBody, xhr.status, xhr);
                    } else {
                        reject(xhr, xhr.status, null);
                    }
                }
            };
            //console.log('doajax sending:', settings.data);
            xhr.send(settings.data);
        });
    }

    function _resolveXHR(xhr) {
        /*
         * parse response headers
         */
        var headers = xhr.getAllResponseHeaders()
            // Spec: https://developer.mozilla.org/en-US/docs/Glossary/CRLF
            .split('\r\n')
            .filter(_.negate(_.isEmpty))
            .map(function(str) {
                return _.split(str, /\s*:\s*/);
            });
        xhr.responseHeaders = _.fromPairs(headers);

        /*
         * parse response body
         */
        xhr.responseBody = xhr.responseText;
        if (xhr.responseHeaders['Content-Type'] === 'application/json') {
            try {
                xhr.responseBody = JSON.parse(xhr.responseText);
            } catch (e) {
                console.warn('Invalid JSON content with Content-Type: application/json');
            }
        }
        return xhr;
    }

    function _createXHR() {
        //console.log('create xhr');
        var xhr = false;

        if (window.XMLHttpRequest) { // Mozilla, Safari,...
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) { // IE
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
        if (!xhr) {
            throw 'Cannot create an XHR instance';
        }
        return xhr;
    }

    return exports;
});
;
/*
 * @author harttle(yangjvn@126.com)
 * @file dom DOM, BOM工具集
 *      设计原则：
 *          1. 与jQuery兼容
 */
define('utils/dom', ['utils/underscore'], function(_) {
    function param(obj) {
        if (!_.isObject(obj)) return obj;
        return _.map(obj, function(v, k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(v);
            })
            .join('&');
    }
    return {
        param: param
    };
});
;
/*
 * @author harttle(yangjvn@126.com)
 * @file 通用工具：包括字符串工具、对象工具、函数工具、语言增强等。
 *      设计原则：
 *          1. 与 Lodash 重合的功能与其保持接口一致，
 *             文档: https://github.com/exports/exports
 *          2. Lodash 中不包含的部分，如有需要可联系 yangjvn14 (Hi)
 *             文档：本文件中函数注释。
 */

define('utils/underscore', ['require'], function(require) {
    /*
     * 变量定义
     */
    var exports = {};
    var _arrayProto = Array.prototype;
    var _objectProto = Object.prototype;
    var _stringProto = String.prototype;

    /*
     * 私有函数
     */
    function _getArgs(args) {
        args = toArray(args);
        args.shift();
        return args;
    }

    /*
     * 公有函数
     */
    function keysIn(obj) {
        return Object.keys(obj);
    }

    function forOwn(obj, cb) {
        obj = obj || {};
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                cb(obj[k], k);
            }
        }
        return obj;
    }

    function toArray(obj) {
        if (!obj) return [];
        return _arrayProto.slice.call(obj);
    }

    function forEach(arr) {
        var args = _getArgs(arguments);
        return _arrayProto.forEach.apply(arr || [], args);
    }

    function map(arr, cb) {
        if(isObject(arr)){
            var ret = [];
            forOwn(arr, function(v, k){
                ret.push(cb.apply(null, arguments));
            });
            return ret;
        }
        var args = _getArgs(arguments);
        return _arrayProto.map.apply(arr || [], args);
    }

    function slice(arr) {
        var args = _getArgs(arguments);
        return _arrayProto.slice.apply(arr || [], args);
    }

    function splice(arr) {
        var args = _getArgs(arguments);
        return _arrayProto.splice.apply(arr || [], args);
    }

    function split(str) {
        var args = _getArgs(arguments);
        return _stringProto.split.apply(str || '', args);
    }

    function format(fmt) {
        return _getArgs(arguments).reduce(function(prev, cur) {
            return prev.replace('%s', cur);
        }, fmt);
    }

    function defaults() {
        var ret = {};
        var srcs = slice(arguments, 0);
        forEach(srcs, function(src) {
            forOwn(src, function(v, k) {
                if (!ret.hasOwnProperty(k)) {
                    ret[k] = v;
                }
            });
        });
        return ret;
    }

    function isObject(obj){
        return obj !== null && typeof obj === 'object';
    }

    function isString(obj){
        return obj instanceof String || typeof obj === 'string';
    }

    function _assignBinaryDeep(dst, src){
        if(!dst) return dst;
        forOwn(src, function(v, k){
            if(isObject(v) && isObject(dst[k])){
                return _assignBinaryDeep(dst[k], v);
            }
            dst[k] = v;
        });
    }

    function _assignBinary(dst, src){
        if(!dst) return dst;
        forOwn(src, function(v, k){
            dst[k] = v;
        });
        return dst;
    }

    function defaultsDeep(){
        var ret = {};
        var srcs = slice(arguments, 0).reverse();
        forEach(srcs, function(src) {
            _assignBinaryDeep(ret, src);
        });
        return ret;
    }

    function fromPairs(propertyArr) {
        var obj = {};
        map(propertyArr, function(arr) {
            var k = arr[0],
                v = arr[1];
            obj[k] = v;
        });
        return obj;
    }

    function isArray(obj) {
        return obj instanceof Array;
    }

    function isEmpty(obj) {
        return isArray(obj) ? obj.length === 0 : !obj;
    }

    function negate(func) {
        return function() {
            return !func.apply(null, arguments);
        };
    }

    function partial(func) {
        var placeholders = slice(arguments);
        return function() {
            var spliceArgs = [0, 0];
            spliceArgs.push(placeholders);
            var args = _arrayProto.splice.apply(arguments, spliceArgs);
            return func.apply(null, args);
        };
    }

    function partialRight(func) {
        var placeholders = slice(arguments);
        placeholders.shift();
        return function() {
            var args = slice(arguments);
            var spliceArgs = [args, arguments.length, 0].concat(placeholders);
            splice.apply(null, spliceArgs);
            return func.apply(null, args);
        };
    }

    /* 
     * Object Related
     */
    exports.keysIn = keysIn;
    exports.forOwn = forOwn;
    exports.defaults = defaults;
    exports.defaultsDeep = defaultsDeep;
    exports.fromPairs = fromPairs;

    /*
     * Array Related
     */
    exports.slice = slice;
    exports.splice = splice;
    exports.forEach = forEach;
    exports.map = map;
    exports.toArray = toArray;

    /*
     * String Related
     */
    exports.split = split;
    exports.format = format;

    /*
     * Lang Related
     */
    exports.isArray = isArray;
    exports.isEmpty = isEmpty;
    exports.isString = isString;
    exports.isObject = isObject;

    /*
     * Function Related
     */
    exports.partial = partial;
    exports.partialRight = partialRight;
    exports.negate = negate;

    return exports;
});
;
/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 标准： Promises/A+ https://promisesaplus.com/
 */

define('utils/promise', ['require'], function(require) {
    function Promise(cb) {
        if (!(this instanceof Promise)) {
            throw 'Promise must be called with new operator';
        }
        if (typeof cb !== 'function') {
            throw 'callback not defined';
        }

        this._handlers = [];
        this._state = 'init'; // Enum: init, fulfilled, rejected
        this._errors = [];
        this._results = [];

        // 标准：Promises/A+ 2.2.4, see https://promisesaplus.com/ 
        // In practice, this requirement ensures that 
        //   onFulfilled and onRejected execute asynchronously, 
        //   after the event loop turn in which then is called, 
        //   and with a fresh stack.
        setTimeout(function() {
            cb(this._onFulfilled.bind(this), this._onRejected.bind(this));
        }.bind(this));
    }

    /*
     * 注册Promise成功的回调
     * @param cb 回调函数
     */
    Promise.prototype.then = function(cb) {
        //console.log('calling then', this._state);
        if (this._state === 'fulfilled') {
            //console.log(this._state);
            this._callHandler(cb, this._results);
        } else {
            this._handlers.push({
                type: 'then',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 注册Promise失败的回调
     * @param cb 回调函数
     */
    Promise.prototype.catch = function(cb) {
        if (this._state === 'rejected') {
            this._callHandler(cb, this._errors);
        } else {
            this._handlers.push({
                type: 'catch',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 注册Promise最终的回调
     * @param cb 回调函数
     */
    Promise.prototype.finally = function(cb) {
        if (this._state === 'fulfilled') {
            this._callHandler(cb, this._results);
        } else if (this._state === 'rejected') {
            this._callHandler(cb, this._errors);
        } else {
            this._handlers.push({
                type: 'finally',
                cb: cb
            });
        }
    };
    /*
     * 返回一个成功的Promise
     * @param obj 被解析的对象
     */
    Promise.resolve = function(obj) {
        var args = arguments;
        return _isThenable(obj) ? obj :
            new Promise(function(resolve, reject) {
                return resolve.apply(null, args);
            });
    };
    /*
     * 返回一个失败的Promise
     * @param obj 被解析的对象
     */
    Promise.reject = function(obj) {
        var args = arguments;
        return new Promise(function(resolve, reject) {
            return reject.apply(null, args);
        });
    };
    /*
     * 返回一个Promise，当数组中所有Promise都成功时resolve，
     * 数组中任何一个失败都reject。
     * @param promises Thenable数组，可以包含Promise，也可以包含非Thenable
     */
    Promise.all = function(promises) {
        var results = promises.map(function() {
            return undefined;
        });
        var count = 0;
        var state = 'pending';
        return new Promise(function(res, rej) {
            function resolve() {
                if (state !== 'pending') return;
                state = 'fulfilled';
                res(results);
            }

            function reject() {
                if (state !== 'pending') return;
                state = 'rejected';
                rej.apply(null, arguments);
            }
            promises
                .map(Promise.resolve)
                .forEach(function(promise, idx) {
                    promise
                        .then(function(result) {
                            results[idx] = result;
                            count++;
                            if (count === promises.length) resolve();
                        })
                        .catch(reject);
                });
        });
    };

    Promise.prototype._onFulfilled = function(obj) {
        //console.log('_onFulfilled', obj);
        if (_isThenable(obj)) {
            return obj
                .then(this._onFulfilled.bind(this))
                .catch(this._onRejected.bind(this));
        }

        this._results = arguments;
        var handler = this._getNextHandler('then');
        if (handler) {
            return this._callHandler(handler, this._results);
        }
        handler = this._getNextHandler('finally');
        if (handler) {
            return this._callHandler(handler, this._results);
        }
        this._state = 'fulfilled';
    };
    Promise.prototype._onRejected = function(err) {
        //console.log('_onRejected', err);
        this._errors = arguments;
        var handler = this._getNextHandler('catch');
        if (handler) {
            return this._callHandler(handler, this._errors);
        }
        handler = this._getNextHandler('finally');
        if (handler) {
            return this._callHandler(handler, this._errors);
        }
        this._state = 'rejected';
    };
    Promise.prototype._callHandler = function(handler, args) {
        //console.log('calling handler', handler, args);
        var result, err = null;
        try {
            result = handler.apply(null, args);
        } catch (e) {
            err = e;
        }
        if (err) {
            this._onRejected(err);
        } else {
            this._onFulfilled(result);
        }
    };
    Promise.prototype._getNextHandler = function(type) {
        var obj;
        while (obj = this._handlers.shift()) {
            if (obj.type === type) break;
        }
        return obj ? obj.cb : null;
    };

    function _isThenable(obj) {
        return obj && typeof obj.then === 'function';
    }

    return Promise;
});
;

/*action*/
define('action', ['require', 'router/router'], function(require) {

    var router = require('router/router');
    var exports = {};
    var serviceMap = {};
    var _options = {};
    var indexUrl;

    /**
     *  regist service,a service will work when it is registed
     *  @params name, service
     *  @return null
     * */
    exports.regist = function(name, service) {
        if(!name){
            throw new Error('illegal action name');
        } 
        if(!service){
            throw new Error('illegal action option');
        }
        if(!serviceMap.hasOwnProperty(name) && isService(service)) {
            //set service name as a router path.
            router.add(name, this.dispatch);
            serviceMap[name] = service;
        }
    };

    /**
     *  judge service
     *  @params service
     *  @return boolean
     * */
    function isService(service) {
        //todo check service api
        if(typeof service === 'object' 
                && service.create 
                && service.attach 
                && service.detach 
                && service.destroy 
                && service.update) {
            return true;
        } else {
            return false;
        }

    }

    /**
     *  dispatch service
     *  if current and prev is the same service,prev service will not excute destroy function.
     *  @params current scope,prev scope
     *  @return null
     * */
    exports.dispatch = function(current, prev) {
        var proxyList = [];
        var methodProxy = new _MethodProxy();
        var currentService = serviceMap[current.path];
        var prevService = serviceMap[prev.path];

        current.options = current.options || {};

        //container init,nothing to do
        if(current.options.src === 'sync') {
            indexUrl = current.url;
            return;
        }
        
        //set src to current scope
        if(_options.src) {
            current.options.src = _options.src;
        }

        prevService && methodProxy.push(prevService.detach, prevService, current, prev);
        currentService && methodProxy.push(currentService.create, currentService, current, prev);
        //container will not be destroyed
        if(!(prev.url === indexUrl)) {
            prevService && methodProxy.push(prevService.destroy, prevService, current, prev);
        }
        currentService && methodProxy.push(currentService.attach, currentService, current, prev);
        
        //clean options.src
        methodProxy.push(function() {
            _options.src = undefined;
        });

        return methodProxy.excute();
    };

    /**
     *  proxy deferred function,return a deferred object if function no a deferred 
     *  @return object{push,excute}
     * */
    function _MethodProxy() {
        var list = [];

        function excute() {
            deferred = $.Deferred();
            deferred.resolve();
            $.each(list, function() {
                var callback = this;
                deferred = deferred.then(function() {
                    return callback();
                });
            });
            list = [];
            return deferred;
        }

        function push(fn, context) {
            var args = (2 in arguments) && (Array.prototype.slice.call(arguments, 2));
            if(typeof fn === 'function') {
                list.push(function() {return fn.apply(context, args ? args : []) });
            }
        }

        return {
            push : push,
            excute : excute
        };
    }

    /**
     *  remove service
     *  @params name
     * */
    exports.remove = function(name) {
        if(serviceMap.hasOwnProperty(name)) {
            delete serviceMap[name];
        }
    };

    /**
     *  is service regist
     * */
    exports.exist = function(name) {
        return serviceMap.hasOwnProperty(name);
    };

    /**
     *  clear all service
     * */
    exports.clear = function(){
        serviceMap = {};
        router.clear();
    };

    /**
     *  redirect page to another, change to next state
     *  @params url,query,options
     *  @return null
     * */
    exports.redirect = function(url, query, options) {
        router.redirect(url, query, options);
    };

    /**
     *  back to last state
     *  @params url,query,options
     *  @return null
     * */
    exports.back = function(options) {
        _options.src = 'back';
        history.back(); 
    };

    /**
     *  reset/replace now state
     *  @params url,query,options
     *  @return null
     * */
    exports.reset = function(url, query, options) {
        router.reset(url, query, options);
    };

    /**
     *  hijack global link href
     *  @inner
     *  @params {Event} 
     * */
    function _delegateClick(e) {
        
        var $target = $(this);

        var link = $target.attr('data-sf-href');

        if(link) {
            //link href only support url like pathname,e.g:/sf?params=
            var options = $target.attr('data-sf-options');

            try {
                options = $.parseJSON(options) ? $.parseJSON(options) : {};
            } catch(err) {
                options = {};
            }

            options = $.extend(options, {"src": "hijack"});

            exports.redirect(link, null, options);

            e.preventDefault();
        }
    }

    /**
     *  action init
     * */
    exports.start = function() {
        $(document).delegate('a', 'click', _delegateClick);
    } ;

    /**
     *  config action options
     * */
    exports.config = function(options) {
        $.extend(_options, options);
        return _options;
    };

    /**
     *  update page, reset/replace now state
     * */
    exports.update = function(url, query, options, extend) {
        
        options = options ? options : {};
        
        //use silent mode
        if(!options.hasOwnProperty('silent')) {
            options.silent = true;
        }

        var prevUrl = location.href.replace(/.*\/([^/]+$)/,'/$1');

        var name = location.pathname.replace(/.*\/([^/]+$)/,'/$1');

        if(serviceMap.hasOwnProperty(name)) {
            var service = serviceMap[name];
            service.update({
                path: name,
                url: url,
                prevUrl: prevUrl,
                query: query,
                options: options,
                container: extend.container,
                view: extend.view
            });
        }
        
        router.reset(url, query, options);
    };
    
    return exports;
});
;
/*
 * service base class
 * service base lifecycle
 * create by taoqingqian01
 */

define('service', ['require'], function(require) {

    var exports = {};

    var service = function(options) {
        var me = this;
        me.options = options;
    };
    
    service.prototype.create = function() {};
    service.prototype.attach = function() {};
    service.prototype.detach = function() {};
    service.prototype.destroy = function() {};
    service.prototype.update = function() {};
    
    /**
     *  create a new service class
     *  @params null
     *  @return service class
     * */
    exports.create = function() {
        var _class = function() {
            //nothing todo now
        }
        _class.prototype = Object.create(service.prototype);
        return _class;
    };

    return exports;

});
;

/*resource*/
define('resource', ['utils/http', 'utils/underscore'], function(http, _) {
    function Resource(url) {
        this.url = url;
    }
    Resource.prototype = {
        getUrl: function(opt){
            var url = this.url;
            // replace slugs with properties
            _.forOwn(opt, function(v, k) {
                url = url.replace(':' + k, v);
            });
            // remove remaining slugs
            url = url.replace(/:\w+/g, '');
            return url;
        },
        create: function(obj, opt) {
            var url = this.getUrl(opt);
            return http.post(url, obj);
        },
        query: function(opt) {
            var url = this.getUrl(opt);
            return http.get(url);
        },
        update: function(obj, opt) {
            var url = this.getUrl(opt);
            return http.put(url, obj);
        },
        delete: function(opt) {
            var url = this.getUrl(opt);
            return http.delete(url);
        },
    };
    return Resource;
});
;

/*view*/
define('view', ['require'], function(require) {

    var View = function (opt) {
        this._init();
    };

    View.prototype = {

        _init: function() {},

        /**
         * 设置 view 初始参数
         * */
        set: function() {},

        get: function() {},

        create: function() {},

        /**
         *  DOM 渲染，核心 override 方法
         * */
        render: function() {},

        /**
         *  更新 View 并重新渲染
         * */
        update : function() {},

        attach: function() {},

        detach : function() {},

        /**
         * 销毁 View
         * */
        destroy: function() {},

        /**
         * 事件绑定
         * */
        on: function() {},

        /**
         * 事件解绑
         * */
        off: function() {}
    };

    return View;
});;
