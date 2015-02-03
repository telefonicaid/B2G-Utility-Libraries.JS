/*
 *  Module: Templates
 *
 *  Product: Utility Libraries for Web front-end development
 *
 *  Copyright(c) 2015 Telefónica I+D S.A.U.
 *
 *  LICENSE: Apache 2.0
 *
 *  @author Web Browser Community @ Telefónica I+D
 *
 *  The module allows to work with HTML templates in client-side JS environments
 *
 *  @example
 *
 *   <ul id="theList">
 *    <template is="x-template">
 *     <li>
 *      <dl>
 *         <dt>${name}</dt>
 *         <dd class="img"><img src="${contactImg}"></dd>
 *      </dl>
 *     </li>
 *    </template>
 *   </ul>
 *
 *   var myObj = { name: 'Nice Name!', contactImg: 'myImg.jpg' };
 *   utils.templates.append('#theList',myObj);
 *
 *   DISCLAIMERS:
 *
 *   The <template> element will be the first child element of the container
 *   in the following situations:
 *
 *     A/ in browsers which do not implement Web Components
 *
 *     B/ If the template is not tagged as an 'x-template'
 *
 *     C/ If this library is loaded with <script defer>
 *
 */


var utils = window.utils || {};

if (!utils.templates) {
  (function() {
    var Templates = utils.templates = {};

    // Template selector
    const TEMPLATE_SELECTOR = 'template';

    /**
     *  Registers the x-template Web Component if Web Components if they are
     *  available
     *
     */
    function registerComponent() {
      if (!HTMLTemplateElement || !document.registerElement) {
        console.warn('Web Components not available. Templates consume DOM');
        return;
      }

      var xTemplateProto = Object.create(HTMLTemplateElement.prototype);

      // When an 'x-template' is attached the element in the DOM is destroyed
      // and moved to the Shadow DOM
      xTemplateProto.attachedCallback = function() {
        var parent = this.parentElement;

        if (!parent) {
          console.warn('Parent Element not avilable for: ', this);
          return;
        }

        // We reuse an existing shadowRoot if it already contains a template
        var shadow = parent.shadowRoot;
        if (!shadow || !shadow.querySelector(TEMPLATE_SELECTOR)) {
          shadow = parent.createShadowRoot();
        }

        var internalTemplate = document.createElement(TEMPLATE_SELECTOR);
        internalTemplate.content.appendChild(document.importNode(
                                      this.content.firstElementChild, true));
        // We need to copy all the data attributes to the internal template
        for (var prop in this.dataset) {
          internalTemplate.dataset[prop] = this.dataset[prop];
        }

        shadow.appendChild(internalTemplate);

        parent.removeChild(this);
      }

      document.registerElement('x-template', {
        prototype: xTemplateProto,
        extends: 'template'
      });
    }

    /**
     *  Returns a target HTMLElement from a selector or HTMLElement itself
     *
     *  @param {HTMLElement or Selector} element target element.
     *
     *  @return {HTMLElement} HTMLElement according to the selector or itself.
     *
     *
     */
    function getTarget(element) {
      var target = element;
      if (!element.tagName) {
        target = document.querySelector(element);
      }

      return target;
    }

    /**
    *    Given a target HTML element which contains a template set
    *    returns the template that will have to be applied over the data
    *
    *    @param {HTMLElement} target which contains the template.
    *    @param {Object} data to be used on the template.
    *
    *    @return {HTMLElement} HTMLElement with the template.
    *
    */
    function getTemplate(target, data) {
      var template;

      var templates = target.querySelectorAll(TEMPLATE_SELECTOR);

      // If there are no templates in the regular DOM let's try to find them
      // in the shadowRoot
      if (templates.length === 0 && target.shadowRoot) {
        templates = target.shadowRoot.querySelectorAll(TEMPLATE_SELECTOR);
      }

      var total = templates.length;

      var multi = false;
      if (total > 1) {
        multi = true;
      }

      var evaluation;

      for (var c = 0; c < total; c++) {
        var condition = templates.item(c).dataset.condition;

        if (condition) {
          evaluation = get(data, condition);
          if (evaluation) {
            template = templates.item(c);
            break;
          }
        } else {
          // Just to be sure that if there is no a condition
          // something will be selected
          template = templates.item(c);
        }
      } // Iteration trying to find a template

      return {template: template, isMulti: multi};
    }

    /**
     *   Returns a function used to replace data on a template
     *
     *   @param {Object} data the data to be used on the template.
     *
     *   @return {function} to be used.
     *
     */
    function templateReplace(data) {
      return function(text, property) {
        var out = get(data, property);
        if (typeof out === 'undefined') {
          out = text;
        }
        return out;
      }
    }

    /**
     *   Look recursively for an object field or subfield.
     *
     *   @param {Object} data the object where looking into.
     *
     *   @param {String} path dotted (Java-package-like) path to the field
     *   to be retrieved.
     *
     *   @return {AnyType} data into the given field.
     *
     */
    function get(data, path) {

      function doGet(pdata, fields) {
        var out;
        var data = pdata;
        if (typeof pdata === 'function') {
          data = pdata();
        }

        // Base case: goal reached
        if (fields.length === 0) {
          out = data;
        // Recursive case: access the field and look into
        } else if (data !== null && typeof data !== 'undefined') {
          var field = fields.shift();
          if (typeof data[field] === 'function') {
            out = doGet(data[field](), fields);
          }
          else {
            out = doGet(data[field], fields);
          }
        }
        return out;
      }

      var fieldList = path.split('.');
      return doGet(data, fieldList);
    }

    /**
     *  Adds (append or prepend) a new instance HTMLElement (or array of)
     *  of a template
     *  The template is assumed to be a child of the element
     *  passed as parameter
     *  The new element will be appended as a child
     *
     *  @param {HTMLElement} ele container lement that contains the template
     *  and which will contain the new instance. Can be an HTMLElement
     *  or a CSS selector.
     *
     *  @param {object or array} data with the data displayed by the template.
     *
     *  @param {String} mode oneOf ('A','P').
     *
     *  @return {HTMLElement} (or last element if data is an array).
     *
     *
     */
    function add(element, data, mode) {
      // It is supported both the element itself or a selector
      var target = getTarget(element);
      var newElem;

      var theData = [data];
      if (data instanceof Array) {
        theData = data;
      }

      // Optimization to avoid trying to find a template when
      // only one is needed
      var multiTemplate = true;
      var template;
      var idx = 0;
      theData.forEach(function(oneData) {
        // Pseudo-field with the index
        oneData._idx_ = idx++;
        // A suitable template for the data is firstly found
         if (multiTemplate === true) {
         var tresult = getTemplate(target, oneData);
          template = tresult.template;
          if (tresult.isMulti === false) {
            multiTemplate = false;
          }
        }

        if (template) {
          newElem = this.render(template, oneData);

          if (mode === 'A') {
             target.appendChild(newElem);
          } else if (mode === 'P') { // Append mode
            if (target.firstChild) {
              target.insertBefore(newElem, target.firstChild);
            } else {
              target.appendChild(newElem);
            }
          } // prepend mode

        } // if template

      }.bind(this)); // forEach data

      return newElem;
    }


    /**
     *  Appends a new instance HTMLElement (or array of) of a template
     *
     *  The template is assumed to be a child of the element passed
     *  as parameter
     *  The new element will be appended as a child
     *
     *  @param {HTMLElement or String} ele container element that
     *  contains the template and which will contain the new instance.
     *  Can be an HTMLElement or a CSS selector.
     *
     *  @param {object or array} data with the data displayed by the template.
     *
     *  @return {HTMLelement} (or last element if data is an array).
     *
     *
     */
    Templates.append = function(element, data) {
      var f = add.bind(this);

      return f(element, data, 'A');
    };


    /**
     *   Prepends a new instance (or array of) of a template
     *
     *   The template is assumed to be a child of the element passed
     *   as parameter
     *
     *   @param {HTMLElement or String} ele container element that
     *   contains the template and which will contain the new instance.
     *   Can be an HTMLElement or a CSS selector.
     *
     *   @param {Object or Array} data with the data displayed.
     *
     *   @return {HTMLElement} added.
     *
     *
     */
    Templates.prepend = function(element, data) {
       var f = add.bind(this);

      return f(element, data, 'P');
    };


    /**
     *  Renders the content specified by a template with object data
     *
     *  @param {HTMLElement} eleTemplate the template itself.
     *  @param {Object} data the data to be used.
     *
     *  @return {HTMLElement} according to the template and with the data.
     *
     *
     */
    Templates.render = function(eleTemplate, data) {
      var newElem = document.importNode(eleTemplate.content.firstElementChild,
                                        true);
      var inner = newElem.innerHTML;

      // Replace function
      var replaceFunction = templateReplace(data);

      var pattern = /\$\{([^}]+)\}/g;
      var ninner = inner.replace(pattern, replaceFunction);

      newElem.innerHTML = ninner;

      var attrs = newElem.attributes;

      var total = attrs.length;
      for (var c = 0; c < total; c++) {
        var val = attrs[c].value;
        var nval = val.replace(pattern, replaceFunction);

        newElem.setAttribute(attrs[c].name, nval);
      }

      if (!newElem.id) {
        if (data.id) {
          newElem.id = data.id;
        }
      }

      return newElem;
    };

    /**
     *  Clears a container element
     *
     *  @param {HTMLElement or String} element (selector or HTML element).
     *
     *
     */
    Templates.clear = function(element) {
      var target = getTarget(element);
      var templates = target.querySelectorAll(TEMPLATE_SELECTOR);

      target.innerHTML = '';

      var total = templates.length;
      for (var c = 0; c < total; c++) {
        target.appendChild(templates.item(c));
      }
    };

    // The x-template Web Component is registered
    registerComponent();

  }) ();
} // window.templates
