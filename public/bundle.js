
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Get the current value from a store by subscribing and immediately unsubscribing.
     * @param store readable
     */
    function get(store) {
        let value;
        store.subscribe((_) => value = _)();
        return value;
    }

    const getStore = () => {
      const state = {
        selectedRows: writable([]),
        selectionMode: writable("single"),
        customSelection: writable(null),
        selectedClass: writable(null),
        hideSortIcons: writable(null),
        sortId: writable(null),
        sortKey: writable(null),
        customSort: writable(null),
        sortOrder: writable(null),
        currentPage: writable(-1),
        totalPages: writable(-1)
      };

      const actions = {
        selectRow(row) {
          if (get(state.selectionMode) === "single") {
            state.selectedRows.set([row]);
          }

          let selected = get(state.selectedRows);
          const index = selected.indexOf(row);
          if (index === -1) {
            state.selectedRows.set([...selected, row]);
          }
        },
        selectRows(rows) {
          for (let row of rows) {
            actions.selectRow(row);
          }
        },
        deselectRow(row) {
          let selected = get(state.selectedRows);
          const index = selected.indexOf(row);

          if (index > -1) {
            selected = selected.splice(index, 1);
            state.selectedRows.set(selected);
          }
        },
        deselectRows(rows) {
          for (let row of rows) {
            actions.deselectRow(row);
          }
        },
        selectAll(all) {
          state.selectedRows.set(all);
        },
        deselectAll() {
          state.selectedRows.set([]);
        },
        setSort({ sortKey, customSort, sortOrder, sortId }) {
          state.sortKey.set(sortKey);
          state.customSort.set(customSort);
          state.sortOrder.set(sortOrder);
          state.sortId.set(sortId);
        }
      };

      return {
        ...state,
        ...actions
      };
    };

    function doSort(toSort, sortKey, customSort, sortOrder) {
      let local = [...toSort];

      return local.sort((a, b) => {
        if (typeof customSort === "function") {
          return customSort(a, b) * sortOrder;
        }

        let val1;
        let val2;

        if (typeof sortKey === "function") {
          val1 = sortKey(a, sortOrder);
          val2 = sortKey(b, sortOrder);
        } else {
          val1 = getPropertyValue(a, sortKey);
          val2 = getPropertyValue(b, sortKey);
        }

        if (val1 === null || val1 === undefined) val1 = "";
        if (val2 === null || val2 === undefined) val2 = "";

        if (isNumeric(val1) && isNumeric(val2)) {
          return (val1 - val2) * sortOrder;
        }

        const str1 = val1.toString();
        const str2 = val2.toString();

        return str1.localeCompare(str2) * sortOrder;
      });
    }

    function doFilter(toFilter, filters) {
      let filteredData = [];

      for (let item of toFilter) {
        let passed = true;

        for (let filterName in filters) {
          if (!filters.hasOwnProperty(filterName)) {
            continue;
          }

          let filter = filters[filterName];

          if (!passFilter(item, filter)) {
            passed = false;
            break;
          }
        }

        if (passed) {
          filteredData.push(item);
        }
      }

      return filteredData;
    }

    function doPaginate(toPaginate, pageSize, currentPage) {
      if (toPaginate.length <= pageSize || pageSize <= 0 || currentPage <= 0) {
        return toPaginate;
      }

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;

      return [...toPaginate].slice(start, end);
    }

    function calculateTotalPages(totalItems, pageSize) {
      return totalItems <= pageSize ? 1 : Math.ceil(totalItems / pageSize);
    }

    function passFilter(item, filter) {
      if (
        typeof filter.custom === "function" &&
        !filter.custom(filter.value, item)
      ) {
        return false;
      }

      if (
        filter.value === null ||
        filter.value === undefined ||
        filter.value.length === 0 ||
        !Array.isArray(filter.keys)
      ) {
        return true;
      }

      for (let key of filter.keys) {
        const value = getPropertyValue(item, key);

        if (value !== null && value !== undefined) {
          const filterStrings = Array.isArray(filter.value)
            ? filter.value
            : [filter.value];

          for (const filterString of filterStrings) {
            if (filter.exact) {
              if (value.toString() === filterString.toString()) {
                return true;
              }
            } else {
              if (
                value
                  .toString()
                  .toLowerCase()
                  .includes(filterString.toString().toLowerCase())
              ) {
                return true;
              }
            }
          }
        }
      }
      return false;
    }

    function getPropertyValue(object, keyPath) {
      keyPath = keyPath.replace(/\[(\w+)\]/g, ".$1");
      keyPath = keyPath.replace(/^\./, "");
      const a = keyPath.split(".");
      for (let i = 0, n = a.length; i < n; ++i) {
        let k = a[i];
        if (k in object) {
          object = object[k];
        } else {
          return;
        }
      }
      return object;
    }

    function isNumeric(toCheck) {
      return (
        !Array.isArray(toCheck) && !isNaN(parseFloat(toCheck)) && isFinite(toCheck)
      );
    }

    function uuid() {
      return (
        "_" +
        Math.random()
          .toString(36)
          .substr(2, 9)
      );
    }

    /* src/STable.svelte generated by Svelte v3.6.4 */

    const file = "src/STable.svelte";

    const get_body_slot_changes = ({ displayData }) => ({ displayData: displayData });
    const get_body_slot_context = ({ displayData }) => ({ displayData: displayData });

    const get_head_slot_changes = () => ({});
    const get_head_slot_context = () => ({});

    function create_fragment(ctx) {
    	var table, t, table_class_value, current;

    	const head_slot_1 = ctx.$$slots.head;
    	const head_slot = create_slot(head_slot_1, ctx, get_head_slot_context);

    	const body_slot_1 = ctx.$$slots.body;
    	const body_slot = create_slot(body_slot_1, ctx, get_body_slot_context);

    	return {
    		c: function create() {
    			table = element("table");

    			if (head_slot) head_slot.c();
    			t = space();

    			if (body_slot) body_slot.c();

    			attr(table, "class", table_class_value = "" + ctx.$$props.class + " text-xs my-4 table-striped");
    			add_location(table, file, 82, 0, 2087);
    		},

    		l: function claim(nodes) {
    			if (head_slot) head_slot.l(table_nodes);

    			if (body_slot) body_slot.l(table_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, table, anchor);

    			if (head_slot) {
    				head_slot.m(table, null);
    			}

    			append(table, t);

    			if (body_slot) {
    				body_slot.m(table, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (head_slot && head_slot.p && changed.$$scope) {
    				head_slot.p(get_slot_changes(head_slot_1, ctx, changed, get_head_slot_changes), get_slot_context(head_slot_1, ctx, get_head_slot_context));
    			}

    			if (body_slot && body_slot.p && (changed.$$scope || changed.displayData)) {
    				body_slot.p(get_slot_changes(body_slot_1, ctx, changed, get_body_slot_changes), get_slot_context(body_slot_1, ctx, get_body_slot_context));
    			}

    			if ((!current || changed.$$props) && table_class_value !== (table_class_value = "" + ctx.$$props.class + " text-xs my-4 table-striped")) {
    				attr(table, "class", table_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(head_slot, local);
    			transition_in(body_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(head_slot, local);
    			transition_out(body_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(table);
    			}

    			if (head_slot) head_slot.d(detaching);

    			if (body_slot) body_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $sortKey, $customSort, $sortOrder, $selectedRows;

    	

      let { data, filters = null, currentPage = null, pageSize = null, allowSelection = false, selectionMode = "single", selectedClass = "st-selected", customSelection = false, hideSortIcons = false } = $$props;

      const dispatch = createEventDispatcher();

      let initialLoad = false;

      const store = getStore();
      setContext("store", store);
      let customSort = store.customSort; validate_store(customSort, 'customSort'); subscribe($$self, customSort, $$value => { $customSort = $$value; $$invalidate('$customSort', $customSort); });
      let sortKey = store.sortKey; validate_store(sortKey, 'sortKey'); subscribe($$self, sortKey, $$value => { $sortKey = $$value; $$invalidate('$sortKey', $sortKey); });
      let sortOrder = store.sortOrder; validate_store(sortOrder, 'sortOrder'); subscribe($$self, sortOrder, $$value => { $sortOrder = $$value; $$invalidate('$sortOrder', $sortOrder); });
      let selectedRows = store.selectedRows; validate_store(selectedRows, 'selectedRows'); subscribe($$self, selectedRows, $$value => { $selectedRows = $$value; $$invalidate('$selectedRows', $selectedRows); });

      onMount(() => {
        dispatch("totalPagesChanged", totalPages);
        dispatch("totalItemsChanged", totalItems);
        dispatch("selectionChanged", $selectedRows);
      });

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('data' in $$new_props) $$invalidate('data', data = $$new_props.data);
    		if ('filters' in $$new_props) $$invalidate('filters', filters = $$new_props.filters);
    		if ('currentPage' in $$new_props) $$invalidate('currentPage', currentPage = $$new_props.currentPage);
    		if ('pageSize' in $$new_props) $$invalidate('pageSize', pageSize = $$new_props.pageSize);
    		if ('allowSelection' in $$new_props) $$invalidate('allowSelection', allowSelection = $$new_props.allowSelection);
    		if ('selectionMode' in $$new_props) $$invalidate('selectionMode', selectionMode = $$new_props.selectionMode);
    		if ('selectedClass' in $$new_props) $$invalidate('selectedClass', selectedClass = $$new_props.selectedClass);
    		if ('customSelection' in $$new_props) $$invalidate('customSelection', customSelection = $$new_props.customSelection);
    		if ('hideSortIcons' in $$new_props) $$invalidate('hideSortIcons', hideSortIcons = $$new_props.hideSortIcons);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	let filteredData, totalItems, totalPages, sortedData, displayData;

    	$$self.$$.update = ($$dirty = { data: 1, filters: 1, filteredData: 1, pageSize: 1, totalItems: 1, currentPage: 1, totalPages: 1, $sortKey: 1, $customSort: 1, $sortOrder: 1, sortedData: 1, initialLoad: 1, selectionMode: 1, selectedClass: 1, customSelection: 1, hideSortIcons: 1, $selectedRows: 1 }) => {
    		if ($$dirty.data || $$dirty.filters) { $$invalidate('filteredData', filteredData =
            data.length === 0
              ? []
              : typeof filters !== "object"
              ? data
              : doFilter(data, filters)); }
    		if ($$dirty.filteredData) { $$invalidate('totalItems', totalItems = filteredData.length); }
    		if ($$dirty.pageSize || $$dirty.totalItems) { $$invalidate('totalPages', totalPages = !pageSize ? 0 : calculateTotalPages(totalItems, pageSize)); }
    		if ($$dirty.currentPage || $$dirty.totalPages) { if (currentPage > totalPages) {
            $$invalidate('currentPage', currentPage = 1);
          } }
    		if ($$dirty.currentPage || $$dirty.totalPages) ;
    		if ($$dirty.$sortKey || $$dirty.$customSort || $$dirty.$sortOrder || $$dirty.filteredData) { $$invalidate('sortedData', sortedData = (() => {
            if (($sortKey || $customSort) && $sortOrder !== 0) {
              return doSort(filteredData, $sortKey, $customSort, $sortOrder);
            } else {
              return filteredData;
            }
          })()); }
    		if ($$dirty.pageSize || $$dirty.sortedData || $$dirty.currentPage) { $$invalidate('displayData', displayData = pageSize
            ? doPaginate(sortedData, pageSize, currentPage)
            : sortedData); }
    		if ($$dirty.initialLoad) { {
            if (!initialLoad) {
              $$invalidate('initialLoad', initialLoad = true);
              dispatch("loaded");
            }
          } }
    		if ($$dirty.selectionMode) { store.selectionMode.set(selectionMode); }
    		if ($$dirty.selectedClass) { store.selectedClass.set(selectedClass); }
    		if ($$dirty.customSelection) { store.customSelection.set(customSelection); }
    		if ($$dirty.hideSortIcons) { store.hideSortIcons.set(hideSortIcons); }
    		if ($$dirty.totalPages) { dispatch("totalPagesChanged", totalPages); }
    		if ($$dirty.totalItems) { dispatch("totalItemsChanged", totalItems); }
    		if ($$dirty.$selectedRows) { dispatch("selectionChanged", $selectedRows); }
    	};

    	return {
    		data,
    		filters,
    		currentPage,
    		pageSize,
    		allowSelection,
    		selectionMode,
    		selectedClass,
    		customSelection,
    		hideSortIcons,
    		customSort,
    		sortKey,
    		sortOrder,
    		selectedRows,
    		displayData,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class STable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["data", "filters", "currentPage", "pageSize", "allowSelection", "selectionMode", "selectedClass", "customSelection", "hideSortIcons"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.data === undefined && !('data' in props)) {
    			console.warn("<STable> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filters() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filters(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentPage() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentPage(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pageSize() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pageSize(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowSelection() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowSelection(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectionMode() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectionMode(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedClass() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedClass(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customSelection() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customSelection(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideSortIcons() {
    		throw new Error("<STable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideSortIcons(value) {
    		throw new Error("<STable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/STh.svelte generated by Svelte v3.6.4 */
    const { Error: Error_1 } = globals;

    const file$1 = "src/STh.svelte";

    const get_descIcon_slot_changes = () => ({});
    const get_descIcon_slot_context = () => ({});

    const get_sortIcon_slot_changes = () => ({});
    const get_sortIcon_slot_context = () => ({});

    const get_ascIcon_slot_changes = () => ({});
    const get_ascIcon_slot_context = () => ({});

    // (69:2) {#if !$hideSortIcons}
    function create_if_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.sortOrder === -1) return 0;
    		if (ctx.sortOrder === 0) return 1;
    		if (ctx.sortOrder === 1) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (98:30) 
    function create_if_block_3(ctx) {
    	var svg, path, current;

    	const descIcon_slot_1 = ctx.$$slots.descIcon;
    	const descIcon_slot = create_slot(descIcon_slot_1, ctx, get_descIcon_slot_context);

    	return {
    		c: function create() {
    			if (!descIcon_slot) {
    				svg = svg_element("svg");
    				path = svg_element("path");
    			}

    			if (descIcon_slot) descIcon_slot.c();
    			if (!descIcon_slot) {
    				attr(path, "fill", "currentColor");
    				attr(path, "d", "M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9\n            0L24 329c-15.1-15.1-4.4-41 17-41z");
    				add_location(path, file$1, 104, 10, 2626);
    				attr(svg, "width", "16");
    				attr(svg, "height", "16");
    				attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    				attr(svg, "viewBox", "0 0 320 512");
    				add_location(svg, file$1, 99, 8, 2490);
    			}
    		},

    		l: function claim(nodes) {
    			if (descIcon_slot) descIcon_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (!descIcon_slot) {
    				insert(target, svg, anchor);
    				append(svg, path);
    			}

    			else {
    				descIcon_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (descIcon_slot && descIcon_slot.p && changed.$$scope) {
    				descIcon_slot.p(get_slot_changes(descIcon_slot_1, ctx, changed, get_descIcon_slot_changes), get_slot_context(descIcon_slot_1, ctx, get_descIcon_slot_context));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(descIcon_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(descIcon_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (!descIcon_slot) {
    				if (detaching) {
    					detach(svg);
    				}
    			}

    			if (descIcon_slot) descIcon_slot.d(detaching);
    		}
    	};
    }

    // (83:30) 
    function create_if_block_2(ctx) {
    	var svg, path, current;

    	const sortIcon_slot_1 = ctx.$$slots.sortIcon;
    	const sortIcon_slot = create_slot(sortIcon_slot_1, ctx, get_sortIcon_slot_context);

    	return {
    		c: function create() {
    			if (!sortIcon_slot) {
    				svg = svg_element("svg");
    				path = svg_element("path");
    			}

    			if (sortIcon_slot) sortIcon_slot.c();
    			if (!sortIcon_slot) {
    				attr(path, "fill", "currentColor");
    				attr(path, "d", "M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9\n            0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177\n            64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4\n            0 32.1-25.9 17-41z");
    				add_location(path, file$1, 89, 10, 2101);
    				attr(svg, "width", "16");
    				attr(svg, "height", "16");
    				attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    				attr(svg, "viewBox", "0 0 320 512");
    				add_location(svg, file$1, 84, 8, 1965);
    			}
    		},

    		l: function claim(nodes) {
    			if (sortIcon_slot) sortIcon_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (!sortIcon_slot) {
    				insert(target, svg, anchor);
    				append(svg, path);
    			}

    			else {
    				sortIcon_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (sortIcon_slot && sortIcon_slot.p && changed.$$scope) {
    				sortIcon_slot.p(get_slot_changes(sortIcon_slot_1, ctx, changed, get_sortIcon_slot_changes), get_slot_context(sortIcon_slot_1, ctx, get_sortIcon_slot_context));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(sortIcon_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(sortIcon_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (!sortIcon_slot) {
    				if (detaching) {
    					detach(svg);
    				}
    			}

    			if (sortIcon_slot) sortIcon_slot.d(detaching);
    		}
    	};
    }

    // (70:4) {#if sortOrder === -1}
    function create_if_block_1(ctx) {
    	var svg, path, current;

    	const ascIcon_slot_1 = ctx.$$slots.ascIcon;
    	const ascIcon_slot = create_slot(ascIcon_slot_1, ctx, get_ascIcon_slot_context);

    	return {
    		c: function create() {
    			if (!ascIcon_slot) {
    				svg = svg_element("svg");
    				path = svg_element("path");
    			}

    			if (ascIcon_slot) ascIcon_slot.c();
    			if (!ascIcon_slot) {
    				attr(path, "fill", "currentColor");
    				attr(path, "d", "M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9\n            0l119 119c15.2 15.1 4.5 41-16.9 41z");
    				add_location(path, file$1, 76, 10, 1698);
    				attr(svg, "width", "16");
    				attr(svg, "height", "16");
    				attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    				attr(svg, "viewBox", "0 0 320 512");
    				add_location(svg, file$1, 71, 8, 1562);
    			}
    		},

    		l: function claim(nodes) {
    			if (ascIcon_slot) ascIcon_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (!ascIcon_slot) {
    				insert(target, svg, anchor);
    				append(svg, path);
    			}

    			else {
    				ascIcon_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ascIcon_slot && ascIcon_slot.p && changed.$$scope) {
    				ascIcon_slot.p(get_slot_changes(ascIcon_slot_1, ctx, changed, get_ascIcon_slot_changes), get_slot_context(ascIcon_slot_1, ctx, get_ascIcon_slot_context));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ascIcon_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ascIcon_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (!ascIcon_slot) {
    				if (detaching) {
    					detach(svg);
    				}
    			}

    			if (ascIcon_slot) ascIcon_slot.d(detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var th, t, th_class_value, current, dispose;

    	var if_block = (!ctx.$hideSortIcons) && create_if_block(ctx);

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			th = element("th");
    			if (if_block) if_block.c();
    			t = space();

    			if (default_slot) default_slot.c();

    			attr(th, "class", th_class_value = "" + (ctx.sortClass.join(' ') + ' ' + ctx.$$props.class) + " svelte-1jbn1kh");
    			add_location(th, file$1, 67, 0, 1404);
    			dispose = listen(th, "click", ctx.sort);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(th_nodes);
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, th, anchor);
    			if (if_block) if_block.m(th, null);
    			append(th, t);

    			if (default_slot) {
    				default_slot.m(th, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!ctx.$hideSortIcons) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(th, t);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if ((!current || changed.sortClass || changed.$$props) && th_class_value !== (th_class_value = "" + (ctx.sortClass.join(' ') + ' ' + ctx.$$props.class) + " svelte-1jbn1kh")) {
    				attr(th, "class", th_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(th);
    			}

    			if (if_block) if_block.d();

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $hideSortIcons, $sortId;

    	

      let { sortKey, customSort = null, defaultSort = null } = $$props;

      const dispatch = createEventDispatcher();

      const store = getContext("store");

      let hideSortIcons = store.hideSortIcons; validate_store(hideSortIcons, 'hideSortIcons'); subscribe($$self, hideSortIcons, $$value => { $hideSortIcons = $$value; $$invalidate('$hideSortIcons', $hideSortIcons); });
      let sortId = store.sortId; validate_store(sortId, 'sortId'); subscribe($$self, sortId, $$value => { $sortId = $$value; $$invalidate('$sortId', $sortId); });

      let id = uuid();
      let sortOrder = 0;
      let orderClasses = ["vt-desc", "vt-sortable", "vt-asc"];

      onMount(async () => {
        if (!sortKey && !customSort) {
          throw new Error(
            "Must provide the Sort Key value or a Custom Sort function."
          );
        }

        if (defaultSort) {
          $$invalidate('sortOrder', sortOrder = defaultSort === "desc" ? -1 : 1);
          store.setSort({
            sortOrder,
            sortKey,
            customSort,
            sortId: id
          });

          await tick();
          dispatch("defaultSort");
        }
      });

      function sort() {
        if (sortEnabled) {
          $$invalidate('sortOrder', sortOrder = sortOrder === 0 || sortOrder === -1 ? sortOrder + 1 : -1);
          store.setSort({
            sortOrder,
            sortKey,
            customSort,
            sortId: id
          });
        }
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('sortKey' in $$new_props) $$invalidate('sortKey', sortKey = $$new_props.sortKey);
    		if ('customSort' in $$new_props) $$invalidate('customSort', customSort = $$new_props.customSort);
    		if ('defaultSort' in $$new_props) $$invalidate('defaultSort', defaultSort = $$new_props.defaultSort);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	let sortEnabled, sortClass;

    	$$self.$$.update = ($$dirty = { sortKey: 1, customSort: 1, $sortId: 1, id: 1, sortOrder: 1, $hideSortIcons: 1, orderClasses: 1 }) => {
    		if ($$dirty.sortKey || $$dirty.customSort) { sortEnabled = sortKey || typeof customSort === "function"; }
    		if ($$dirty.$sortId || $$dirty.id || $$dirty.sortOrder) { if ($sortId !== id && sortOrder !== 0) {
            $$invalidate('sortOrder', sortOrder = 0);
          } }
    		if ($$dirty.$hideSortIcons || $$dirty.orderClasses || $$dirty.sortOrder) { $$invalidate('sortClass', sortClass = $hideSortIcons ? [orderClasses[sortOrder + 1], "st-sort"] : []); }
    	};

    	return {
    		sortKey,
    		customSort,
    		defaultSort,
    		hideSortIcons,
    		sortId,
    		sortOrder,
    		sort,
    		sortClass,
    		$hideSortIcons,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class STh extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["sortKey", "customSort", "defaultSort"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.sortKey === undefined && !('sortKey' in props)) {
    			console.warn("<STh> was created without expected prop 'sortKey'");
    		}
    	}

    	get sortKey() {
    		throw new Error_1("<STh>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortKey(value) {
    		throw new Error_1("<STh>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customSort() {
    		throw new Error_1("<STh>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customSort(value) {
    		throw new Error_1("<STh>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultSort() {
    		throw new Error_1("<STh>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultSort(value) {
    		throw new Error_1("<STh>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/STr.svelte generated by Svelte v3.6.4 */

    const file$2 = "src/STr.svelte";

    function create_fragment$2(ctx) {
    	var tr_1, tr_1_class_value, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			tr_1 = element("tr");

    			if (default_slot) default_slot.c();

    			attr(tr_1, "class", tr_1_class_value = "" + (ctx.rowClass + ' ' + ctx.$$props.class) + " svelte-1anyt7u");
    			add_location(tr_1, file$2, 51, 0, 913);
    			dispose = listen(tr_1, "click", ctx.handleRowSelected);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(tr_1_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr_1, anchor);

    			if (default_slot) {
    				default_slot.m(tr_1, null);
    			}

    			ctx.tr_1_binding(tr_1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if ((!current || changed.rowClass || changed.$$props) && tr_1_class_value !== (tr_1_class_value = "" + (ctx.rowClass + ' ' + ctx.$$props.class) + " svelte-1anyt7u")) {
    				attr(tr_1, "class", tr_1_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr_1);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.tr_1_binding(null);
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $selectedRows, $selectedClass, $customSelection;

    	let { row } = $$props;

    let tr;

    const store = getContext('store');
    let customSelection = store.customSelection; validate_store(customSelection, 'customSelection'); subscribe($$self, customSelection, $$value => { $customSelection = $$value; $$invalidate('$customSelection', $customSelection); });
    let selectedRows = store.selectedRows; validate_store(selectedRows, 'selectedRows'); subscribe($$self, selectedRows, $$value => { $selectedRows = $$value; $$invalidate('$selectedRows', $selectedRows); });
    let selectedClass = store.selectedClass; validate_store(selectedClass, 'selectedClass'); subscribe($$self, selectedClass, $$value => { $selectedClass = $$value; $$invalidate('$selectedClass', $selectedClass); });

    function handleRowSelected (event) {
        if ($customSelection) {
            return
        }

        let source = event.target || event.srcElement;
        if (source.tagName.toLowerCase() === 'td') {
            if (isSelected) {
                store.deselectRow(row);
            } else {
                store.selectRow(row);
            }
        }

    }

    	let { $$slots = {}, $$scope } = $$props;

    	function tr_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('tr', tr = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('row' in $$new_props) $$invalidate('row', row = $$new_props.row);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	let isSelected, rowClass;

    	$$self.$$.update = ($$dirty = { $selectedRows: 1, row: 1, isSelected: 1, $selectedClass: 1, $customSelection: 1 }) => {
    		if ($$dirty.$selectedRows || $$dirty.row) { $$invalidate('isSelected', isSelected = $selectedRows.find(it => it === row) !== undefined); }
    		if ($$dirty.isSelected || $$dirty.$selectedClass || $$dirty.$customSelection) { $$invalidate('rowClass', rowClass = (() => {
                let classes = [];
            
                if (isSelected) {
                    classes.push($selectedClass);
                }
            
                if (!$customSelection) {
                    classes.push('st-selectable');
                }
            
                return classes.join(' ')
            })()); }
    	};

    	return {
    		row,
    		tr,
    		customSelection,
    		selectedRows,
    		selectedClass,
    		handleRowSelected,
    		rowClass,
    		$$props,
    		tr_1_binding,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class STr extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["row"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.row === undefined && !('row' in props)) {
    			console.warn("<STr> was created without expected prop 'row'");
    		}
    	}

    	get row() {
    		throw new Error("<STr>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set row(value) {
    		throw new Error("<STr>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SPagination.svelte generated by Svelte v3.6.4 */

    const file$3 = "src/SPagination.svelte";

    const get_nextIcon_slot_changes = ({ currentPage, totalPages }) => ({ disabled: currentPage || totalPages });
    const get_nextIcon_slot_context = ({ currentPage, totalPages }) => ({ disabled: currentPage === totalPages });

    const get_firstPageIcon_slot_changes_1 = ({ currentPage }) => ({ disabled: currentPage });
    const get_firstPageIcon_slot_context_1 = ({ currentPage }) => ({ disabled: currentPage === 1 });

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.page = list[i];
    	return child_ctx;
    }

    const get_firstPageIcon_slot_changes = ({ currentPage }) => ({ disabled: currentPage });
    const get_firstPageIcon_slot_context = ({ currentPage }) => ({ disabled: currentPage === 1 });

    const get_previousIcon_slot_changes = ({ currentPage }) => ({ disabled: currentPage });
    const get_previousIcon_slot_context = ({ currentPage }) => ({ disabled: currentPage === 1 });

    // (113:2) {#if !(hideSinglePage && totalPages === 1)}
    function create_if_block$1(ctx) {
    	var nav, ul, t0, t1, t2, each_blocks = [], each_1_lookup = new Map(), t3, li, a, t4, t5, t6, current, dispose;

    	var if_block0 = (ctx.boundaryLinks) && create_if_block_5(ctx);

    	var if_block1 = (ctx.directionLinks) && create_if_block_4(ctx);

    	var if_block2 = (ctx.currentPage !== 1) && create_if_block_3$1(ctx);

    	var each_value = ctx.displayPages;

    	const get_key = ctx => ctx.page.value;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const firstPageIcon_slot_1 = ctx.$$slots.firstPageIcon;
    	const firstPageIcon_slot = create_slot(firstPageIcon_slot_1, ctx, get_firstPageIcon_slot_context_1);

    	var if_block3 = (ctx.directionLinks) && create_if_block_2$1(ctx);

    	var if_block4 = (ctx.boundaryLinks) && create_if_block_1$1(ctx);

    	return {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();

    			t3 = space();
    			li = element("li");
    			a = element("a");

    			if (!firstPageIcon_slot) {
    				t4 = text("Last");
    			}

    			if (firstPageIcon_slot) firstPageIcon_slot.c();
    			t5 = space();
    			if (if_block3) if_block3.c();
    			t6 = space();
    			if (if_block4) if_block4.c();

    			attr(a, "href", "javascript:void(0)");
    			attr(a, "aria-label", "Previous");
    			attr(a, "class", "page-link");
    			add_location(a, file$3, 181, 10, 4518);
    			attr(li, "class", "page-item");
    			add_location(li, file$3, 180, 8, 4485);
    			attr(ul, "class", "pagination");
    			add_location(ul, file$3, 114, 6, 2282);
    			attr(nav, "class", "smart-pagination");
    			add_location(nav, file$3, 113, 4, 2245);
    			dispose = listen(a, "click", ctx.lastPage);
    		},

    		l: function claim(nodes) {
    			if (firstPageIcon_slot) firstPageIcon_slot.l(a_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append(ul, t0);
    			if (if_block1) if_block1.m(ul, null);
    			append(ul, t1);
    			if (if_block2) if_block2.m(ul, null);
    			append(ul, t2);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(ul, null);

    			append(ul, t3);
    			append(ul, li);
    			append(li, a);

    			if (!firstPageIcon_slot) {
    				append(a, t4);
    			}

    			else {
    				firstPageIcon_slot.m(a, null);
    			}

    			append(ul, t5);
    			if (if_block3) if_block3.m(ul, null);
    			append(ul, t6);
    			if (if_block4) if_block4.m(ul, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.boundaryLinks) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(ul, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.directionLinks) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(ul, t1);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (ctx.currentPage !== 1) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block_3$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(ul, t2);
    				}
    			} else if (if_block2) {
    				group_outros();
    				transition_out(if_block2, 1, () => {
    					if_block2 = null;
    				});
    				check_outros();
    			}

    			const each_value = ctx.displayPages;
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block, t3, get_each_context);

    			if (firstPageIcon_slot && firstPageIcon_slot.p && (changed.$$scope || changed.currentPage)) {
    				firstPageIcon_slot.p(get_slot_changes(firstPageIcon_slot_1, ctx, changed, get_firstPageIcon_slot_changes_1), get_slot_context(firstPageIcon_slot_1, ctx, get_firstPageIcon_slot_context_1));
    			}

    			if (ctx.directionLinks) {
    				if (if_block3) {
    					if_block3.p(changed, ctx);
    					transition_in(if_block3, 1);
    				} else {
    					if_block3 = create_if_block_2$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(ul, t6);
    				}
    			} else if (if_block3) {
    				group_outros();
    				transition_out(if_block3, 1, () => {
    					if_block3 = null;
    				});
    				check_outros();
    			}

    			if (ctx.boundaryLinks) {
    				if (if_block4) {
    					if_block4.p(changed, ctx);
    				} else {
    					if_block4 = create_if_block_1$1(ctx);
    					if_block4.c();
    					if_block4.m(ul, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(firstPageIcon_slot, local);
    			transition_in(if_block3);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(firstPageIcon_slot, local);
    			transition_out(if_block3);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			if (firstPageIcon_slot) firstPageIcon_slot.d(detaching);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			dispose();
    		}
    	};
    }

    // (116:8) {#if boundaryLinks}
    function create_if_block_5(ctx) {
    	var li, a, span, dispose;

    	return {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			span = element("span");
    			attr(span, "aria-hidden", "true");
    			add_location(span, file$3, 122, 14, 2575);
    			attr(a, "href", "javascript:void(0)");
    			attr(a, "aria-label", "Previous");
    			attr(a, "class", "page-link svelte-1rbpira");
    			add_location(a, file$3, 117, 12, 2414);
    			attr(li, "class", "page-item svelte-1rbpira");
    			toggle_class(li, "disabled", ctx.currentPage === 1);
    			add_location(li, file$3, 116, 10, 2344);
    			dispose = listen(a, "click", ctx.firstPage);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, span);
    			span.innerHTML = ctx.firstText;
    		},

    		p: function update(changed, ctx) {
    			if (changed.firstText) {
    				span.innerHTML = ctx.firstText;
    			}

    			if (changed.currentPage) {
    				toggle_class(li, "disabled", ctx.currentPage === 1);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			dispose();
    		}
    	};
    }

    // (130:8) {#if directionLinks}
    function create_if_block_4(ctx) {
    	var li, a, svg, path, current, dispose;

    	const previousIcon_slot_1 = ctx.$$slots.previousIcon;
    	const previousIcon_slot = create_slot(previousIcon_slot_1, ctx, get_previousIcon_slot_context);

    	return {
    		c: function create() {
    			li = element("li");
    			a = element("a");

    			if (!previousIcon_slot) {
    				svg = svg_element("svg");
    				path = svg_element("path");
    			}

    			if (previousIcon_slot) previousIcon_slot.c();
    			if (!previousIcon_slot) {
    				attr(path, "fill", "currentColor");
    				attr(path, "d", "M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94\n                    0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02\n                    154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37\n                    9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57\n                    0-33.94z");
    				add_location(path, file$3, 142, 18, 3226);
    				attr(svg, "width", "16");
    				attr(svg, "height", "16");
    				attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    				attr(svg, "viewBox", "0 0 320 512");
    				attr(svg, "class", "svelte-1rbpira");
    				add_location(svg, file$3, 137, 16, 3050);
    			}

    			attr(a, "href", "javascript:void(0)");
    			attr(a, "aria-label", "Previous");
    			attr(a, "class", "page-link svelte-1rbpira");
    			add_location(a, file$3, 131, 12, 2814);
    			attr(li, "class", "page-item svelte-1rbpira");
    			toggle_class(li, "disabled", ctx.currentPage === 1);
    			add_location(li, file$3, 130, 10, 2744);
    			dispose = listen(a, "click", ctx.previousPage);
    		},

    		l: function claim(nodes) {
    			if (previousIcon_slot) previousIcon_slot.l(a_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);

    			if (!previousIcon_slot) {
    				append(a, svg);
    				append(svg, path);
    			}

    			else {
    				previousIcon_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (previousIcon_slot && previousIcon_slot.p && (changed.$$scope || changed.currentPage)) {
    				previousIcon_slot.p(get_slot_changes(previousIcon_slot_1, ctx, changed, get_previousIcon_slot_changes), get_slot_context(previousIcon_slot_1, ctx, get_previousIcon_slot_context));
    			}

    			if (changed.currentPage) {
    				toggle_class(li, "disabled", ctx.currentPage === 1);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(previousIcon_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(previousIcon_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			if (previousIcon_slot) previousIcon_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    // (156:8) {#if currentPage !== 1}
    function create_if_block_3$1(ctx) {
    	var li, a, t, current, dispose;

    	const firstPageIcon_slot_1 = ctx.$$slots.firstPageIcon;
    	const firstPageIcon_slot = create_slot(firstPageIcon_slot_1, ctx, get_firstPageIcon_slot_context);

    	return {
    		c: function create() {
    			li = element("li");
    			a = element("a");

    			if (!firstPageIcon_slot) {
    				t = text("First");
    			}

    			if (firstPageIcon_slot) firstPageIcon_slot.c();

    			attr(a, "href", "javascript:void(0)");
    			attr(a, "aria-label", "Previous");
    			attr(a, "class", "page-link svelte-1rbpira");
    			add_location(a, file$3, 157, 12, 3823);
    			attr(li, "class", "page-item svelte-1rbpira");
    			toggle_class(li, "disabled", ctx.currentPage === 1);
    			add_location(li, file$3, 156, 10, 3753);
    			dispose = listen(a, "click", ctx.firstPage);
    		},

    		l: function claim(nodes) {
    			if (firstPageIcon_slot) firstPageIcon_slot.l(a_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);

    			if (!firstPageIcon_slot) {
    				append(a, t);
    			}

    			else {
    				firstPageIcon_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (firstPageIcon_slot && firstPageIcon_slot.p && (changed.$$scope || changed.currentPage)) {
    				firstPageIcon_slot.p(get_slot_changes(firstPageIcon_slot_1, ctx, changed, get_firstPageIcon_slot_changes), get_slot_context(firstPageIcon_slot_1, ctx, get_firstPageIcon_slot_context));
    			}

    			if (changed.currentPage) {
    				toggle_class(li, "disabled", ctx.currentPage === 1);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(firstPageIcon_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(firstPageIcon_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			if (firstPageIcon_slot) firstPageIcon_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    // (170:8) {#each displayPages as page (page.value)}
    function create_each_block(key_1, ctx) {
    	var li, a, t_value = ctx.page.title, t, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", "javascript:void(0)");
    			attr(a, "class", "page-link");
    			add_location(a, file$3, 171, 12, 4270);
    			attr(li, "class", "page-item");
    			toggle_class(li, "active", ctx.currentPage === ctx.page.value);
    			add_location(li, file$3, 170, 10, 4193);
    			dispose = listen(a, "click", click_handler);
    			this.first = li;
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.displayPages) && t_value !== (t_value = ctx.page.title)) {
    				set_data(t, t_value);
    			}

    			if ((changed.currentPage || changed.displayPages)) {
    				toggle_class(li, "active", ctx.currentPage === ctx.page.value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			dispose();
    		}
    	};
    }

    // (191:8) {#if directionLinks}
    function create_if_block_2$1(ctx) {
    	var li, a, svg, path, current, dispose;

    	const nextIcon_slot_1 = ctx.$$slots.nextIcon;
    	const nextIcon_slot = create_slot(nextIcon_slot_1, ctx, get_nextIcon_slot_context);

    	return {
    		c: function create() {
    			li = element("li");
    			a = element("a");

    			if (!nextIcon_slot) {
    				svg = svg_element("svg");
    				path = svg_element("path");
    			}

    			if (nextIcon_slot) nextIcon_slot.c();
    			if (!nextIcon_slot) {
    				attr(path, "fill", "currentColor");
    				attr(path, "d", "M285.476 272.971L91.132 467.314c-9.373 9.373-24.569\n                    9.373-33.941\n                    0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505\n                    256 34.484\n                    101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373\n                    24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373\n                    24.568.001 33.941z");
    				add_location(path, file$3, 204, 18, 5322);
    				attr(svg, "width", "16");
    				attr(svg, "height", "16");
    				attr(svg, "role", "img");
    				attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    				attr(svg, "viewBox", "0 0 320 512");
    				attr(svg, "class", "svelte-1rbpira");
    				add_location(svg, file$3, 198, 16, 5117);
    			}

    			attr(a, "href", "javascript:void(0)");
    			attr(a, "aria-label", "Next");
    			attr(a, "class", "page-link svelte-1rbpira");
    			add_location(a, file$3, 192, 12, 4884);
    			attr(li, "class", "page-item svelte-1rbpira");
    			toggle_class(li, "disabled", ctx.currentPage === ctx.totalPages);
    			add_location(li, file$3, 191, 10, 4805);
    			dispose = listen(a, "click", ctx.nextPage);
    		},

    		l: function claim(nodes) {
    			if (nextIcon_slot) nextIcon_slot.l(a_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);

    			if (!nextIcon_slot) {
    				append(a, svg);
    				append(svg, path);
    			}

    			else {
    				nextIcon_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (nextIcon_slot && nextIcon_slot.p && (changed.$$scope || changed.currentPage || changed.totalPages)) {
    				nextIcon_slot.p(get_slot_changes(nextIcon_slot_1, ctx, changed, get_nextIcon_slot_changes), get_slot_context(nextIcon_slot_1, ctx, get_nextIcon_slot_context));
    			}

    			if ((changed.currentPage || changed.totalPages)) {
    				toggle_class(li, "disabled", ctx.currentPage === ctx.totalPages);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(nextIcon_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(nextIcon_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			if (nextIcon_slot) nextIcon_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    // (220:8) {#if boundaryLinks}
    function create_if_block_1$1(ctx) {
    	var li, a, span, dispose;

    	return {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			span = element("span");
    			attr(span, "aria-hidden", "true");
    			attr(span, "v-html", "lastText");
    			add_location(span, file$3, 226, 14, 6167);
    			attr(a, "href", "javascript:void(0)");
    			attr(a, "aria-label", "Previous");
    			attr(a, "class", "page-link svelte-1rbpira");
    			add_location(a, file$3, 221, 12, 6007);
    			attr(li, "class", "page-item svelte-1rbpira");
    			toggle_class(li, "disabled", ctx.currentPage === ctx.totalPages);
    			add_location(li, file$3, 220, 10, 5928);
    			dispose = listen(a, "click", ctx.lastPage);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, span);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.currentPage || changed.totalPages)) {
    				toggle_class(li, "disabled", ctx.currentPage === ctx.totalPages);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var div, current;

    	var if_block = (!(ctx.hideSinglePage && ctx.totalPages === 1)) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr(div, "class", "text-center align-center bg-gray-100 flex flex-wrap justify-center");
    			add_location(div, file$3, 111, 0, 2114);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!(ctx.hideSinglePage && ctx.totalPages === 1)) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { currentPage, totalPages, hideSinglePage = true, maxPageLinks = NaN, boundaryLinks = false, firstText = "First", lastText = "Last", directionLinks = true } = $$props;

      function selectPage(page) {
        if (page < 1 || page > totalPages || page === currentPage) {
          return;
        }

        $$invalidate('currentPage', currentPage = page);
      }

      function nextPage() {
        if (currentPage < totalPages) {
          currentPage++; $$invalidate('currentPage', currentPage);
        }
      }

      function previousPage() {
        if (currentPage > 1) {
          currentPage--; $$invalidate('currentPage', currentPage);
        }
      }

      function firstPage() {
        $$invalidate('currentPage', currentPage = 1);
      }

      function lastPage() {
        $$invalidate('currentPage', currentPage = totalPages);
      }

    	const writable_props = ['currentPage', 'totalPages', 'hideSinglePage', 'maxPageLinks', 'boundaryLinks', 'firstText', 'lastText', 'directionLinks'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SPagination> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler({ page }) {
    		return selectPage(page.value);
    	}

    	$$self.$set = $$props => {
    		if ('currentPage' in $$props) $$invalidate('currentPage', currentPage = $$props.currentPage);
    		if ('totalPages' in $$props) $$invalidate('totalPages', totalPages = $$props.totalPages);
    		if ('hideSinglePage' in $$props) $$invalidate('hideSinglePage', hideSinglePage = $$props.hideSinglePage);
    		if ('maxPageLinks' in $$props) $$invalidate('maxPageLinks', maxPageLinks = $$props.maxPageLinks);
    		if ('boundaryLinks' in $$props) $$invalidate('boundaryLinks', boundaryLinks = $$props.boundaryLinks);
    		if ('firstText' in $$props) $$invalidate('firstText', firstText = $$props.firstText);
    		if ('lastText' in $$props) $$invalidate('lastText', lastText = $$props.lastText);
    		if ('directionLinks' in $$props) $$invalidate('directionLinks', directionLinks = $$props.directionLinks);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let displayPages;

    	$$self.$$.update = ($$dirty = { currentPage: 1, totalPages: 1, maxPageLinks: 1 }) => {
    		if ($$dirty.currentPage || $$dirty.totalPages || $$dirty.maxPageLinks) { $$invalidate('displayPages', displayPages = (() => {
            function displayAllPages() {
              const displayPages = [];
        
              for (
                let i = currentPage > 5 ? currentPage - 5 : 1;
                i <= currentPage + 5;
                i++
              ) {
                displayPages.push({
                  title: i.toString(),
                  value: i
                });
              }
              return displayPages;
            }
        
            function limitVisiblePages() {
              const displayPages = [];
        
              const totalTiers = Math.ceil(totalPages / maxPageLinks);
        
              const activeTier = Math.ceil(currentPage / maxPageLinks);
        
              const start = (activeTier - 1) * maxPageLinks + 1;
              const end = start + maxPageLinks;
        
              if (activeTier > 1) {
                displayPages.push({
                  title: "...",
                  value: start - 1
                });
              }
        
              for (let i = currentPage - 5; i < currentPage + 5; i++) {
                if (i > totalPages) {
                  break;
                }
        
                displayPages.push({
                  title: i.toString(),
                  value: i
                });
              }
        
              if (activeTier < totalTiers) {
                displayPages.push({
                  title: "...",
                  value: end
                });
              }
        
              return displayPages;
            }
        
            if (isNaN(maxPageLinks) || maxPageLinks <= 0) {
              return displayAllPages();
            } else {
              return limitVisiblePages();
            }
          })()); }
    	};

    	return {
    		currentPage,
    		totalPages,
    		hideSinglePage,
    		maxPageLinks,
    		boundaryLinks,
    		firstText,
    		lastText,
    		directionLinks,
    		selectPage,
    		nextPage,
    		previousPage,
    		firstPage,
    		lastPage,
    		displayPages,
    		click_handler,
    		$$slots,
    		$$scope
    	};
    }

    class SPagination extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["currentPage", "totalPages", "hideSinglePage", "maxPageLinks", "boundaryLinks", "firstText", "lastText", "directionLinks"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.currentPage === undefined && !('currentPage' in props)) {
    			console.warn("<SPagination> was created without expected prop 'currentPage'");
    		}
    		if (ctx.totalPages === undefined && !('totalPages' in props)) {
    			console.warn("<SPagination> was created without expected prop 'totalPages'");
    		}
    	}

    	get currentPage() {
    		throw new Error("<SPagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentPage(value) {
    		throw new Error("<SPagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get totalPages() {
    		throw new Error("<SPagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalPages(value) {
    		throw new Error("<SPagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideSinglePage() {
    		throw new Error("<SPagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideSinglePage(value) {
    		throw new Error("<SPagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxPageLinks() {
    		throw new Error("<SPagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxPageLinks(value) {
    		throw new Error("<SPagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get boundaryLinks() {
    		throw new Error("<SPagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set boundaryLinks(value) {
    		throw new Error("<SPagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get firstText() {
    		throw new Error("<SPagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstText(value) {
    		throw new Error("<SPagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lastText() {
    		throw new Error("<SPagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lastText(value) {
    		throw new Error("<SPagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get directionLinks() {
    		throw new Error("<SPagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set directionLinks(value) {
    		throw new Error("<SPagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.6.4 */
    const { console: console_1 } = globals;

    const file$4 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	return child_ctx;
    }

    // (1231:0) {#if displayStore}
    function create_if_block_3$2(ctx) {
    	var current;

    	var stable = new STable({
    		props: {
    		data: ctx.data,
    		filters: ctx.filters,
    		pageSize: ctx.pageSize,
    		currentPage: ctx.currentPage,
    		class: "table",
    		selectedClass: "table-info",
    		$$slots: {
    		default: [create_default_slot_46],
    		body: [create_body_slot_3, ({ displayData }) => ({ displayData })],
    		head: [create_head_slot_3]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	stable.$on("totalPagesChanged", ctx.totalPagesChanged);

    	return {
    		c: function create() {
    			stable.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(stable, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var stable_changes = {};
    			if (changed.data) stable_changes.data = ctx.data;
    			if (changed.filters) stable_changes.filters = ctx.filters;
    			if (changed.pageSize) stable_changes.pageSize = ctx.pageSize;
    			if (changed.currentPage) stable_changes.currentPage = ctx.currentPage;
    			if (changed.$$scope || changed.displayData) stable_changes.$$scope = { changed, ctx };
    			stable.$set(stable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(stable.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(stable.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(stable, detaching);
    		}
    	};
    }

    // (1241:6) <STh sortKey="sample_id" defaultSort="asc">
    function create_default_slot_63(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("样本ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1242:6) <STh sortKey="head_chest_id" defaultSort="asc">
    function create_default_slot_62(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("头胸部ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1243:6) <STh sortKey="head_chest_perserve_way" defaultSort="asc">
    function create_default_slot_61(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("头胸部保存");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1244:6) <STh sortKey="abdomen_id" defaultSort="asc">
    function create_default_slot_60(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("腹部ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1245:6) <STh sortKey="abdomen_preserve_way" defaultSort="asc">
    function create_default_slot_59(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("腹部保存");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1246:6) <STh sortKey="gut_id" defaultSort="asc">
    function create_default_slot_58(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("肠道ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1247:6) <STh sortKey="gut_id_preserve_way" defaultSort="asc">
    function create_default_slot_57(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("肠道保存");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1248:6) <STh sortKey="isolated_strain_or_not" defaultSort="asc">
    function create_default_slot_56(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("是否分菌");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1249:6) <STh sortKey="leg_id" defaultSort="asc">
    function create_default_slot_55(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("腿部ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1250:6) <STh sortKey="leg_id_preserve_way" defaultSort="asc">
    function create_default_slot_54(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("腿部保存");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1251:6) <STh sortKey="used_or_not" defaultSort="asc">
    function create_default_slot_53(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("是否已使用");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1252:6) <STh sortKey="dissection_state" defaultSort="asc">
    function create_default_slot_52(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("解剖前状态");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1253:6) <STh sortKey="multi_sample_one_tube_or_not" defaultSort="asc">
    function create_default_slot_51(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("是否多只同管");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1256:6) <STh sortKey="sample_barcode" defaultSort="asc">
    function create_default_slot_50(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("条形码");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1257:6) <STh sortKey="box_id" defaultSort="asc">
    function create_default_slot_49(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("盒子ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1259:6) <STh sortKey="sample_notes" defaultSort="asc">
    function create_default_slot_48(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("样本备注信息");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1240:4) <thead slot="head" class="text-teal-500 bg-teal-100">
    function create_head_slot_3(ctx) {
    	var thead, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, current;

    	var sth0 = new STh({
    		props: {
    		sortKey: "sample_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_63] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth1 = new STh({
    		props: {
    		sortKey: "head_chest_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_62] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth2 = new STh({
    		props: {
    		sortKey: "head_chest_perserve_way",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_61] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth3 = new STh({
    		props: {
    		sortKey: "abdomen_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_60] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth4 = new STh({
    		props: {
    		sortKey: "abdomen_preserve_way",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_59] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth5 = new STh({
    		props: {
    		sortKey: "gut_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_58] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth6 = new STh({
    		props: {
    		sortKey: "gut_id_preserve_way",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_57] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth7 = new STh({
    		props: {
    		sortKey: "isolated_strain_or_not",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_56] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth8 = new STh({
    		props: {
    		sortKey: "leg_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_55] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth9 = new STh({
    		props: {
    		sortKey: "leg_id_preserve_way",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_54] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth10 = new STh({
    		props: {
    		sortKey: "used_or_not",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_53] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth11 = new STh({
    		props: {
    		sortKey: "dissection_state",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_52] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth12 = new STh({
    		props: {
    		sortKey: "multi_sample_one_tube_or_not",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_51] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth13 = new STh({
    		props: {
    		sortKey: "sample_barcode",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_50] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth14 = new STh({
    		props: {
    		sortKey: "box_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_49] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth15 = new STh({
    		props: {
    		sortKey: "sample_notes",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_48] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			thead = element("thead");
    			sth0.$$.fragment.c();
    			t0 = space();
    			sth1.$$.fragment.c();
    			t1 = space();
    			sth2.$$.fragment.c();
    			t2 = space();
    			sth3.$$.fragment.c();
    			t3 = space();
    			sth4.$$.fragment.c();
    			t4 = space();
    			sth5.$$.fragment.c();
    			t5 = space();
    			sth6.$$.fragment.c();
    			t6 = space();
    			sth7.$$.fragment.c();
    			t7 = space();
    			sth8.$$.fragment.c();
    			t8 = space();
    			sth9.$$.fragment.c();
    			t9 = space();
    			sth10.$$.fragment.c();
    			t10 = space();
    			sth11.$$.fragment.c();
    			t11 = space();
    			sth12.$$.fragment.c();
    			t12 = space();
    			sth13.$$.fragment.c();
    			t13 = space();
    			sth14.$$.fragment.c();
    			t14 = space();
    			sth15.$$.fragment.c();
    			attr(thead, "slot", "head");
    			attr(thead, "class", "text-teal-500 bg-teal-100");
    			add_location(thead, file$4, 1239, 4, 42687);
    		},

    		m: function mount(target, anchor) {
    			insert(target, thead, anchor);
    			mount_component(sth0, thead, null);
    			append(thead, t0);
    			mount_component(sth1, thead, null);
    			append(thead, t1);
    			mount_component(sth2, thead, null);
    			append(thead, t2);
    			mount_component(sth3, thead, null);
    			append(thead, t3);
    			mount_component(sth4, thead, null);
    			append(thead, t4);
    			mount_component(sth5, thead, null);
    			append(thead, t5);
    			mount_component(sth6, thead, null);
    			append(thead, t6);
    			mount_component(sth7, thead, null);
    			append(thead, t7);
    			mount_component(sth8, thead, null);
    			append(thead, t8);
    			mount_component(sth9, thead, null);
    			append(thead, t9);
    			mount_component(sth10, thead, null);
    			append(thead, t10);
    			mount_component(sth11, thead, null);
    			append(thead, t11);
    			mount_component(sth12, thead, null);
    			append(thead, t12);
    			mount_component(sth13, thead, null);
    			append(thead, t13);
    			mount_component(sth14, thead, null);
    			append(thead, t14);
    			mount_component(sth15, thead, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var sth0_changes = {};
    			if (changed.$$scope) sth0_changes.$$scope = { changed, ctx };
    			sth0.$set(sth0_changes);

    			var sth1_changes = {};
    			if (changed.$$scope) sth1_changes.$$scope = { changed, ctx };
    			sth1.$set(sth1_changes);

    			var sth2_changes = {};
    			if (changed.$$scope) sth2_changes.$$scope = { changed, ctx };
    			sth2.$set(sth2_changes);

    			var sth3_changes = {};
    			if (changed.$$scope) sth3_changes.$$scope = { changed, ctx };
    			sth3.$set(sth3_changes);

    			var sth4_changes = {};
    			if (changed.$$scope) sth4_changes.$$scope = { changed, ctx };
    			sth4.$set(sth4_changes);

    			var sth5_changes = {};
    			if (changed.$$scope) sth5_changes.$$scope = { changed, ctx };
    			sth5.$set(sth5_changes);

    			var sth6_changes = {};
    			if (changed.$$scope) sth6_changes.$$scope = { changed, ctx };
    			sth6.$set(sth6_changes);

    			var sth7_changes = {};
    			if (changed.$$scope) sth7_changes.$$scope = { changed, ctx };
    			sth7.$set(sth7_changes);

    			var sth8_changes = {};
    			if (changed.$$scope) sth8_changes.$$scope = { changed, ctx };
    			sth8.$set(sth8_changes);

    			var sth9_changes = {};
    			if (changed.$$scope) sth9_changes.$$scope = { changed, ctx };
    			sth9.$set(sth9_changes);

    			var sth10_changes = {};
    			if (changed.$$scope) sth10_changes.$$scope = { changed, ctx };
    			sth10.$set(sth10_changes);

    			var sth11_changes = {};
    			if (changed.$$scope) sth11_changes.$$scope = { changed, ctx };
    			sth11.$set(sth11_changes);

    			var sth12_changes = {};
    			if (changed.$$scope) sth12_changes.$$scope = { changed, ctx };
    			sth12.$set(sth12_changes);

    			var sth13_changes = {};
    			if (changed.$$scope) sth13_changes.$$scope = { changed, ctx };
    			sth13.$set(sth13_changes);

    			var sth14_changes = {};
    			if (changed.$$scope) sth14_changes.$$scope = { changed, ctx };
    			sth14.$set(sth14_changes);

    			var sth15_changes = {};
    			if (changed.$$scope) sth15_changes.$$scope = { changed, ctx };
    			sth15.$set(sth15_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(sth0.$$.fragment, local);

    			transition_in(sth1.$$.fragment, local);

    			transition_in(sth2.$$.fragment, local);

    			transition_in(sth3.$$.fragment, local);

    			transition_in(sth4.$$.fragment, local);

    			transition_in(sth5.$$.fragment, local);

    			transition_in(sth6.$$.fragment, local);

    			transition_in(sth7.$$.fragment, local);

    			transition_in(sth8.$$.fragment, local);

    			transition_in(sth9.$$.fragment, local);

    			transition_in(sth10.$$.fragment, local);

    			transition_in(sth11.$$.fragment, local);

    			transition_in(sth12.$$.fragment, local);

    			transition_in(sth13.$$.fragment, local);

    			transition_in(sth14.$$.fragment, local);

    			transition_in(sth15.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(sth0.$$.fragment, local);
    			transition_out(sth1.$$.fragment, local);
    			transition_out(sth2.$$.fragment, local);
    			transition_out(sth3.$$.fragment, local);
    			transition_out(sth4.$$.fragment, local);
    			transition_out(sth5.$$.fragment, local);
    			transition_out(sth6.$$.fragment, local);
    			transition_out(sth7.$$.fragment, local);
    			transition_out(sth8.$$.fragment, local);
    			transition_out(sth9.$$.fragment, local);
    			transition_out(sth10.$$.fragment, local);
    			transition_out(sth11.$$.fragment, local);
    			transition_out(sth12.$$.fragment, local);
    			transition_out(sth13.$$.fragment, local);
    			transition_out(sth14.$$.fragment, local);
    			transition_out(sth15.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(thead);
    			}

    			destroy_component(sth0, );

    			destroy_component(sth1, );

    			destroy_component(sth2, );

    			destroy_component(sth3, );

    			destroy_component(sth4, );

    			destroy_component(sth5, );

    			destroy_component(sth6, );

    			destroy_component(sth7, );

    			destroy_component(sth8, );

    			destroy_component(sth9, );

    			destroy_component(sth10, );

    			destroy_component(sth11, );

    			destroy_component(sth12, );

    			destroy_component(sth13, );

    			destroy_component(sth14, );

    			destroy_component(sth15, );
    		}
    	};
    }

    // (1264:8) <STr {row}>
    function create_default_slot_47(ctx) {
    	var td0, t0_value = ctx.row.sample_id, t0, t1, td1, t2_value = ctx.row.head_chest_id, t2, t3, td2, t4_value = ctx.row.head_chest_perserve_way, t4, t5, td3, t6_value = ctx.row.abdomen_id, t6, t7, td4, t8_value = ctx.row.abdomen_preserve_way, t8, t9, td5, t10_value = ctx.row.gut_id, t10, t11, td6, t12_value = ctx.row.gut_id_preserve_way, t12, t13, td7, t14_value = ctx.row.isolated_strain_or_not, t14, t15, td8, t16_value = ctx.row.leg_id, t16, t17, td9, t18_value = ctx.row.leg_id_preserve_way, t18, t19, td10, t20_value = ctx.row.used_or_not, t20, t21, td11, t22_value = ctx.row.dissection_state, t22, t23, td12, t24_value = ctx.row.multi_sample_one_tube_or_not, t24, t25, td13, t26_value = ctx.row.sample_barcode, t26, t27, td14, t28_value = ctx.row.box_id, t28, t29, td15, t30_value = ctx.row.sample_notes, t30, t31;

    	return {
    		c: function create() {
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td8 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td9 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td10 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td11 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			td12 = element("td");
    			t24 = text(t24_value);
    			t25 = space();
    			td13 = element("td");
    			t26 = text(t26_value);
    			t27 = space();
    			td14 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td15 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			add_location(td0, file$4, 1264, 10, 43948);
    			add_location(td1, file$4, 1265, 10, 43983);
    			add_location(td2, file$4, 1266, 10, 44022);
    			add_location(td3, file$4, 1267, 10, 44071);
    			add_location(td4, file$4, 1268, 10, 44107);
    			add_location(td5, file$4, 1269, 10, 44153);
    			add_location(td6, file$4, 1270, 10, 44185);
    			add_location(td7, file$4, 1271, 10, 44230);
    			add_location(td8, file$4, 1272, 10, 44278);
    			add_location(td9, file$4, 1273, 10, 44310);
    			add_location(td10, file$4, 1274, 10, 44355);
    			add_location(td11, file$4, 1275, 10, 44392);
    			add_location(td12, file$4, 1276, 10, 44434);
    			add_location(td13, file$4, 1277, 10, 44488);
    			add_location(td14, file$4, 1278, 10, 44528);
    			add_location(td15, file$4, 1279, 10, 44560);
    		},

    		m: function mount(target, anchor) {
    			insert(target, td0, anchor);
    			append(td0, t0);
    			insert(target, t1, anchor);
    			insert(target, td1, anchor);
    			append(td1, t2);
    			insert(target, t3, anchor);
    			insert(target, td2, anchor);
    			append(td2, t4);
    			insert(target, t5, anchor);
    			insert(target, td3, anchor);
    			append(td3, t6);
    			insert(target, t7, anchor);
    			insert(target, td4, anchor);
    			append(td4, t8);
    			insert(target, t9, anchor);
    			insert(target, td5, anchor);
    			append(td5, t10);
    			insert(target, t11, anchor);
    			insert(target, td6, anchor);
    			append(td6, t12);
    			insert(target, t13, anchor);
    			insert(target, td7, anchor);
    			append(td7, t14);
    			insert(target, t15, anchor);
    			insert(target, td8, anchor);
    			append(td8, t16);
    			insert(target, t17, anchor);
    			insert(target, td9, anchor);
    			append(td9, t18);
    			insert(target, t19, anchor);
    			insert(target, td10, anchor);
    			append(td10, t20);
    			insert(target, t21, anchor);
    			insert(target, td11, anchor);
    			append(td11, t22);
    			insert(target, t23, anchor);
    			insert(target, td12, anchor);
    			append(td12, t24);
    			insert(target, t25, anchor);
    			insert(target, td13, anchor);
    			append(td13, t26);
    			insert(target, t27, anchor);
    			insert(target, td14, anchor);
    			append(td14, t28);
    			insert(target, t29, anchor);
    			insert(target, td15, anchor);
    			append(td15, t30);
    			insert(target, t31, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.displayData) && t0_value !== (t0_value = ctx.row.sample_id)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.displayData) && t2_value !== (t2_value = ctx.row.head_chest_id)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.displayData) && t4_value !== (t4_value = ctx.row.head_chest_perserve_way)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.displayData) && t6_value !== (t6_value = ctx.row.abdomen_id)) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.displayData) && t8_value !== (t8_value = ctx.row.abdomen_preserve_way)) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.displayData) && t10_value !== (t10_value = ctx.row.gut_id)) {
    				set_data(t10, t10_value);
    			}

    			if ((changed.displayData) && t12_value !== (t12_value = ctx.row.gut_id_preserve_way)) {
    				set_data(t12, t12_value);
    			}

    			if ((changed.displayData) && t14_value !== (t14_value = ctx.row.isolated_strain_or_not)) {
    				set_data(t14, t14_value);
    			}

    			if ((changed.displayData) && t16_value !== (t16_value = ctx.row.leg_id)) {
    				set_data(t16, t16_value);
    			}

    			if ((changed.displayData) && t18_value !== (t18_value = ctx.row.leg_id_preserve_way)) {
    				set_data(t18, t18_value);
    			}

    			if ((changed.displayData) && t20_value !== (t20_value = ctx.row.used_or_not)) {
    				set_data(t20, t20_value);
    			}

    			if ((changed.displayData) && t22_value !== (t22_value = ctx.row.dissection_state)) {
    				set_data(t22, t22_value);
    			}

    			if ((changed.displayData) && t24_value !== (t24_value = ctx.row.multi_sample_one_tube_or_not)) {
    				set_data(t24, t24_value);
    			}

    			if ((changed.displayData) && t26_value !== (t26_value = ctx.row.sample_barcode)) {
    				set_data(t26, t26_value);
    			}

    			if ((changed.displayData) && t28_value !== (t28_value = ctx.row.box_id)) {
    				set_data(t28, t28_value);
    			}

    			if ((changed.displayData) && t30_value !== (t30_value = ctx.row.sample_notes)) {
    				set_data(t30, t30_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(td0);
    				detach(t1);
    				detach(td1);
    				detach(t3);
    				detach(td2);
    				detach(t5);
    				detach(td3);
    				detach(t7);
    				detach(td4);
    				detach(t9);
    				detach(td5);
    				detach(t11);
    				detach(td6);
    				detach(t13);
    				detach(td7);
    				detach(t15);
    				detach(td8);
    				detach(t17);
    				detach(td9);
    				detach(t19);
    				detach(td10);
    				detach(t21);
    				detach(td11);
    				detach(t23);
    				detach(td12);
    				detach(t25);
    				detach(td13);
    				detach(t27);
    				detach(td14);
    				detach(t29);
    				detach(td15);
    				detach(t31);
    			}
    		}
    	};
    }

    // (1263:6) {#each displayData as row (row.sample_id)}
    function create_each_block_3(key_1, ctx) {
    	var first, current;

    	var str = new STr({
    		props: {
    		row: ctx.row,
    		$$slots: { default: [create_default_slot_47] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			str.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(str, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var str_changes = {};
    			if (changed.displayData) str_changes.row = ctx.row;
    			if (changed.$$scope) str_changes.$$scope = { changed, ctx };
    			str.$set(str_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(str.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(str.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			destroy_component(str, detaching);
    		}
    	};
    }

    // (1262:4) <tbody slot="body" let:displayData>
    function create_body_slot_3(ctx) {
    	var tbody, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value_3 = ctx.displayData;

    	const get_key = ctx => ctx.row.sample_id;

    	for (var i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_3(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			tbody = element("tbody");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(tbody, "slot", "body");
    			add_location(tbody, file$4, 1261, 4, 43833);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tbody, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tbody, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value_3 = ctx.displayData;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_3, each_1_lookup, tbody, outro_and_destroy_block, create_each_block_3, null, get_each_context_3);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_3.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tbody);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    // (1232:2) <STable     {data}     {filters}     {pageSize}     {currentPage}     class="table"     selectedClass="table-info"     on:totalPagesChanged={totalPagesChanged}>
    function create_default_slot_46(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1287:0) {#if displayBackground}
    function create_if_block_2$2(ctx) {
    	var current;

    	var stable = new STable({
    		props: {
    		data: ctx.data,
    		filters: ctx.filters,
    		pageSize: ctx.pageSize,
    		currentPage: ctx.currentPage,
    		class: "table",
    		selectedClass: "table-info",
    		$$slots: {
    		default: [create_default_slot_29],
    		body: [create_body_slot_2, ({ displayData }) => ({ displayData })],
    		head: [create_head_slot_2]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	stable.$on("totalPagesChanged", ctx.totalPagesChanged);

    	return {
    		c: function create() {
    			stable.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(stable, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var stable_changes = {};
    			if (changed.data) stable_changes.data = ctx.data;
    			if (changed.filters) stable_changes.filters = ctx.filters;
    			if (changed.pageSize) stable_changes.pageSize = ctx.pageSize;
    			if (changed.currentPage) stable_changes.currentPage = ctx.currentPage;
    			if (changed.$$scope || changed.displayData) stable_changes.$$scope = { changed, ctx };
    			stable.$set(stable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(stable.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(stable.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(stable, detaching);
    		}
    	};
    }

    // (1297:6) <STh sortKey="sample_id" defaultSort="asc">
    function create_default_slot_45(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("样本ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1298:6) <STh sortKey="bee_type" defaultSort="asc">
    function create_default_slot_44(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("蜜蜂类型");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1299:6) <STh sortKey="life_style" defaultSort="asc">
    function create_default_slot_43(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("饲养方式");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1300:6) <STh sortKey="life_stage" defaultSort="asc">
    function create_default_slot_42(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("个体阶段");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1301:6) <STh sortKey="beekeepers" defaultSort="asc">
    function create_default_slot_41(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("养蜂人");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1302:6) <STh sortKey="filed_id" defaultSort="asc">
    function create_default_slot_40(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("蜂场ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1303:6) <STh sortKey="field_box_id" defaultSort="asc">
    function create_default_slot_39(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("蜂箱ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1304:6) <STh sortKey="bost_origin" defaultSort="asc">
    function create_default_slot_38(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("蜜蜂来源");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1305:6) <STh sortKey="frame_year" defaultSort="asc">
    function create_default_slot_37(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("蜂箱年数");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1306:6) <STh sortKey="decapping_frequency" defaultSort="asc">
    function create_default_slot_36(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("取蜜频率");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1307:6) <STh sortKey="sucrose_or_not" defaultSort="asc">
    function create_default_slot_35(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("是否喂糖水");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1308:6) <STh sortKey="sucroese_notes" defaultSort="asc">
    function create_default_slot_34(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("糖水频率及浓度");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1309:6) <STh sortKey="habitat" defaultSort="asc">
    function create_default_slot_33(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("生境");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1310:6) <STh sortKey="presticide_or_not" defaultSort="asc">
    function create_default_slot_32(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("有无农药");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1311:6) <STh sortKey="flower_species" defaultSort="asc">
    function create_default_slot_31(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("访花种类");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1296:4) <thead slot="head" class="text-purple-500 bg-purple-100">
    function create_head_slot_2(ctx) {
    	var thead, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, current;

    	var sth0 = new STh({
    		props: {
    		sortKey: "sample_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_45] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth1 = new STh({
    		props: {
    		sortKey: "bee_type",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_44] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth2 = new STh({
    		props: {
    		sortKey: "life_style",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_43] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth3 = new STh({
    		props: {
    		sortKey: "life_stage",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_42] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth4 = new STh({
    		props: {
    		sortKey: "beekeepers",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_41] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth5 = new STh({
    		props: {
    		sortKey: "filed_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_40] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth6 = new STh({
    		props: {
    		sortKey: "field_box_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_39] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth7 = new STh({
    		props: {
    		sortKey: "bost_origin",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_38] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth8 = new STh({
    		props: {
    		sortKey: "frame_year",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_37] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth9 = new STh({
    		props: {
    		sortKey: "decapping_frequency",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_36] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth10 = new STh({
    		props: {
    		sortKey: "sucrose_or_not",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_35] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth11 = new STh({
    		props: {
    		sortKey: "sucroese_notes",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_34] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth12 = new STh({
    		props: {
    		sortKey: "habitat",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_33] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth13 = new STh({
    		props: {
    		sortKey: "presticide_or_not",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_32] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth14 = new STh({
    		props: {
    		sortKey: "flower_species",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_31] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			thead = element("thead");
    			sth0.$$.fragment.c();
    			t0 = space();
    			sth1.$$.fragment.c();
    			t1 = space();
    			sth2.$$.fragment.c();
    			t2 = space();
    			sth3.$$.fragment.c();
    			t3 = space();
    			sth4.$$.fragment.c();
    			t4 = space();
    			sth5.$$.fragment.c();
    			t5 = space();
    			sth6.$$.fragment.c();
    			t6 = space();
    			sth7.$$.fragment.c();
    			t7 = space();
    			sth8.$$.fragment.c();
    			t8 = space();
    			sth9.$$.fragment.c();
    			t9 = space();
    			sth10.$$.fragment.c();
    			t10 = space();
    			sth11.$$.fragment.c();
    			t11 = space();
    			sth12.$$.fragment.c();
    			t12 = space();
    			sth13.$$.fragment.c();
    			t13 = space();
    			sth14.$$.fragment.c();
    			attr(thead, "slot", "head");
    			attr(thead, "class", "text-purple-500 bg-purple-100");
    			add_location(thead, file$4, 1295, 4, 44840);
    		},

    		m: function mount(target, anchor) {
    			insert(target, thead, anchor);
    			mount_component(sth0, thead, null);
    			append(thead, t0);
    			mount_component(sth1, thead, null);
    			append(thead, t1);
    			mount_component(sth2, thead, null);
    			append(thead, t2);
    			mount_component(sth3, thead, null);
    			append(thead, t3);
    			mount_component(sth4, thead, null);
    			append(thead, t4);
    			mount_component(sth5, thead, null);
    			append(thead, t5);
    			mount_component(sth6, thead, null);
    			append(thead, t6);
    			mount_component(sth7, thead, null);
    			append(thead, t7);
    			mount_component(sth8, thead, null);
    			append(thead, t8);
    			mount_component(sth9, thead, null);
    			append(thead, t9);
    			mount_component(sth10, thead, null);
    			append(thead, t10);
    			mount_component(sth11, thead, null);
    			append(thead, t11);
    			mount_component(sth12, thead, null);
    			append(thead, t12);
    			mount_component(sth13, thead, null);
    			append(thead, t13);
    			mount_component(sth14, thead, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var sth0_changes = {};
    			if (changed.$$scope) sth0_changes.$$scope = { changed, ctx };
    			sth0.$set(sth0_changes);

    			var sth1_changes = {};
    			if (changed.$$scope) sth1_changes.$$scope = { changed, ctx };
    			sth1.$set(sth1_changes);

    			var sth2_changes = {};
    			if (changed.$$scope) sth2_changes.$$scope = { changed, ctx };
    			sth2.$set(sth2_changes);

    			var sth3_changes = {};
    			if (changed.$$scope) sth3_changes.$$scope = { changed, ctx };
    			sth3.$set(sth3_changes);

    			var sth4_changes = {};
    			if (changed.$$scope) sth4_changes.$$scope = { changed, ctx };
    			sth4.$set(sth4_changes);

    			var sth5_changes = {};
    			if (changed.$$scope) sth5_changes.$$scope = { changed, ctx };
    			sth5.$set(sth5_changes);

    			var sth6_changes = {};
    			if (changed.$$scope) sth6_changes.$$scope = { changed, ctx };
    			sth6.$set(sth6_changes);

    			var sth7_changes = {};
    			if (changed.$$scope) sth7_changes.$$scope = { changed, ctx };
    			sth7.$set(sth7_changes);

    			var sth8_changes = {};
    			if (changed.$$scope) sth8_changes.$$scope = { changed, ctx };
    			sth8.$set(sth8_changes);

    			var sth9_changes = {};
    			if (changed.$$scope) sth9_changes.$$scope = { changed, ctx };
    			sth9.$set(sth9_changes);

    			var sth10_changes = {};
    			if (changed.$$scope) sth10_changes.$$scope = { changed, ctx };
    			sth10.$set(sth10_changes);

    			var sth11_changes = {};
    			if (changed.$$scope) sth11_changes.$$scope = { changed, ctx };
    			sth11.$set(sth11_changes);

    			var sth12_changes = {};
    			if (changed.$$scope) sth12_changes.$$scope = { changed, ctx };
    			sth12.$set(sth12_changes);

    			var sth13_changes = {};
    			if (changed.$$scope) sth13_changes.$$scope = { changed, ctx };
    			sth13.$set(sth13_changes);

    			var sth14_changes = {};
    			if (changed.$$scope) sth14_changes.$$scope = { changed, ctx };
    			sth14.$set(sth14_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(sth0.$$.fragment, local);

    			transition_in(sth1.$$.fragment, local);

    			transition_in(sth2.$$.fragment, local);

    			transition_in(sth3.$$.fragment, local);

    			transition_in(sth4.$$.fragment, local);

    			transition_in(sth5.$$.fragment, local);

    			transition_in(sth6.$$.fragment, local);

    			transition_in(sth7.$$.fragment, local);

    			transition_in(sth8.$$.fragment, local);

    			transition_in(sth9.$$.fragment, local);

    			transition_in(sth10.$$.fragment, local);

    			transition_in(sth11.$$.fragment, local);

    			transition_in(sth12.$$.fragment, local);

    			transition_in(sth13.$$.fragment, local);

    			transition_in(sth14.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(sth0.$$.fragment, local);
    			transition_out(sth1.$$.fragment, local);
    			transition_out(sth2.$$.fragment, local);
    			transition_out(sth3.$$.fragment, local);
    			transition_out(sth4.$$.fragment, local);
    			transition_out(sth5.$$.fragment, local);
    			transition_out(sth6.$$.fragment, local);
    			transition_out(sth7.$$.fragment, local);
    			transition_out(sth8.$$.fragment, local);
    			transition_out(sth9.$$.fragment, local);
    			transition_out(sth10.$$.fragment, local);
    			transition_out(sth11.$$.fragment, local);
    			transition_out(sth12.$$.fragment, local);
    			transition_out(sth13.$$.fragment, local);
    			transition_out(sth14.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(thead);
    			}

    			destroy_component(sth0, );

    			destroy_component(sth1, );

    			destroy_component(sth2, );

    			destroy_component(sth3, );

    			destroy_component(sth4, );

    			destroy_component(sth5, );

    			destroy_component(sth6, );

    			destroy_component(sth7, );

    			destroy_component(sth8, );

    			destroy_component(sth9, );

    			destroy_component(sth10, );

    			destroy_component(sth11, );

    			destroy_component(sth12, );

    			destroy_component(sth13, );

    			destroy_component(sth14, );
    		}
    	};
    }

    // (1316:8) <STr {row}>
    function create_default_slot_30(ctx) {
    	var td0, t0_value = ctx.row.sample_id, t0, t1, td1, t2_value = ctx.row.bee_type, t2, t3, td2, t4_value = ctx.row.life_style, t4, t5, td3, t6_value = ctx.row.life_stage, t6, t7, td4, t8_value = ctx.row.beekeepers, t8, t9, td5, t10_value = ctx.row.filed_id, t10, t11, td6, t12_value = ctx.row.field_box_id, t12, t13, td7, t14_value = ctx.row.bost_origin, t14, t15, td8, t16_value = ctx.row.frame_year, t16, t17, td9, t18_value = ctx.row.decapping_frequency, t18, t19, td10, t20_value = ctx.row.sucrose_or_not, t20, t21, td11, t22_value = ctx.row.sucroese_notes, t22, t23, td12, t24_value = ctx.row.habitat, t24, t25, td13, t26_value = ctx.row.presticide_or_not, t26, t27, td14, t28_value = ctx.row.flower_species, t28, t29;

    	return {
    		c: function create() {
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td8 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td9 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td10 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td11 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			td12 = element("td");
    			t24 = text(t24_value);
    			t25 = space();
    			td13 = element("td");
    			t26 = text(t26_value);
    			t27 = space();
    			td14 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			add_location(td0, file$4, 1316, 10, 45970);
    			add_location(td1, file$4, 1317, 10, 46005);
    			add_location(td2, file$4, 1318, 10, 46039);
    			add_location(td3, file$4, 1319, 10, 46075);
    			add_location(td4, file$4, 1320, 10, 46111);
    			add_location(td5, file$4, 1321, 10, 46147);
    			add_location(td6, file$4, 1322, 10, 46181);
    			add_location(td7, file$4, 1323, 10, 46219);
    			add_location(td8, file$4, 1324, 10, 46256);
    			add_location(td9, file$4, 1325, 10, 46292);
    			add_location(td10, file$4, 1326, 10, 46337);
    			add_location(td11, file$4, 1327, 10, 46377);
    			add_location(td12, file$4, 1328, 10, 46417);
    			add_location(td13, file$4, 1329, 10, 46450);
    			add_location(td14, file$4, 1330, 10, 46493);
    		},

    		m: function mount(target, anchor) {
    			insert(target, td0, anchor);
    			append(td0, t0);
    			insert(target, t1, anchor);
    			insert(target, td1, anchor);
    			append(td1, t2);
    			insert(target, t3, anchor);
    			insert(target, td2, anchor);
    			append(td2, t4);
    			insert(target, t5, anchor);
    			insert(target, td3, anchor);
    			append(td3, t6);
    			insert(target, t7, anchor);
    			insert(target, td4, anchor);
    			append(td4, t8);
    			insert(target, t9, anchor);
    			insert(target, td5, anchor);
    			append(td5, t10);
    			insert(target, t11, anchor);
    			insert(target, td6, anchor);
    			append(td6, t12);
    			insert(target, t13, anchor);
    			insert(target, td7, anchor);
    			append(td7, t14);
    			insert(target, t15, anchor);
    			insert(target, td8, anchor);
    			append(td8, t16);
    			insert(target, t17, anchor);
    			insert(target, td9, anchor);
    			append(td9, t18);
    			insert(target, t19, anchor);
    			insert(target, td10, anchor);
    			append(td10, t20);
    			insert(target, t21, anchor);
    			insert(target, td11, anchor);
    			append(td11, t22);
    			insert(target, t23, anchor);
    			insert(target, td12, anchor);
    			append(td12, t24);
    			insert(target, t25, anchor);
    			insert(target, td13, anchor);
    			append(td13, t26);
    			insert(target, t27, anchor);
    			insert(target, td14, anchor);
    			append(td14, t28);
    			insert(target, t29, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.displayData) && t0_value !== (t0_value = ctx.row.sample_id)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.displayData) && t2_value !== (t2_value = ctx.row.bee_type)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.displayData) && t4_value !== (t4_value = ctx.row.life_style)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.displayData) && t6_value !== (t6_value = ctx.row.life_stage)) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.displayData) && t8_value !== (t8_value = ctx.row.beekeepers)) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.displayData) && t10_value !== (t10_value = ctx.row.filed_id)) {
    				set_data(t10, t10_value);
    			}

    			if ((changed.displayData) && t12_value !== (t12_value = ctx.row.field_box_id)) {
    				set_data(t12, t12_value);
    			}

    			if ((changed.displayData) && t14_value !== (t14_value = ctx.row.bost_origin)) {
    				set_data(t14, t14_value);
    			}

    			if ((changed.displayData) && t16_value !== (t16_value = ctx.row.frame_year)) {
    				set_data(t16, t16_value);
    			}

    			if ((changed.displayData) && t18_value !== (t18_value = ctx.row.decapping_frequency)) {
    				set_data(t18, t18_value);
    			}

    			if ((changed.displayData) && t20_value !== (t20_value = ctx.row.sucrose_or_not)) {
    				set_data(t20, t20_value);
    			}

    			if ((changed.displayData) && t22_value !== (t22_value = ctx.row.sucroese_notes)) {
    				set_data(t22, t22_value);
    			}

    			if ((changed.displayData) && t24_value !== (t24_value = ctx.row.habitat)) {
    				set_data(t24, t24_value);
    			}

    			if ((changed.displayData) && t26_value !== (t26_value = ctx.row.presticide_or_not)) {
    				set_data(t26, t26_value);
    			}

    			if ((changed.displayData) && t28_value !== (t28_value = ctx.row.flower_species)) {
    				set_data(t28, t28_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(td0);
    				detach(t1);
    				detach(td1);
    				detach(t3);
    				detach(td2);
    				detach(t5);
    				detach(td3);
    				detach(t7);
    				detach(td4);
    				detach(t9);
    				detach(td5);
    				detach(t11);
    				detach(td6);
    				detach(t13);
    				detach(td7);
    				detach(t15);
    				detach(td8);
    				detach(t17);
    				detach(td9);
    				detach(t19);
    				detach(td10);
    				detach(t21);
    				detach(td11);
    				detach(t23);
    				detach(td12);
    				detach(t25);
    				detach(td13);
    				detach(t27);
    				detach(td14);
    				detach(t29);
    			}
    		}
    	};
    }

    // (1315:6) {#each displayData as row (row.sample_id)}
    function create_each_block_2(key_1, ctx) {
    	var first, current;

    	var str = new STr({
    		props: {
    		row: ctx.row,
    		$$slots: { default: [create_default_slot_30] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			str.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(str, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var str_changes = {};
    			if (changed.displayData) str_changes.row = ctx.row;
    			if (changed.$$scope) str_changes.$$scope = { changed, ctx };
    			str.$set(str_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(str.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(str.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			destroy_component(str, detaching);
    		}
    	};
    }

    // (1314:4) <tbody slot="body" let:displayData>
    function create_body_slot_2(ctx) {
    	var tbody, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value_2 = ctx.displayData;

    	const get_key = ctx => ctx.row.sample_id;

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			tbody = element("tbody");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(tbody, "slot", "body");
    			add_location(tbody, file$4, 1313, 4, 45855);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tbody, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tbody, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value_2 = ctx.displayData;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_2, each_1_lookup, tbody, outro_and_destroy_block, create_each_block_2, null, get_each_context_2);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_2.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tbody);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    // (1288:2) <STable     {data}     {filters}     {pageSize}     {currentPage}     class="table"     selectedClass="table-info"     on:totalPagesChanged={totalPagesChanged}>
    function create_default_slot_29(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1338:0) {#if displayEvo}
    function create_if_block_1$2(ctx) {
    	var current;

    	var stable = new STable({
    		props: {
    		data: ctx.data,
    		filters: ctx.filters,
    		pageSize: ctx.pageSize,
    		currentPage: ctx.currentPage,
    		class: "table",
    		selectedClass: "table-info",
    		$$slots: {
    		default: [create_default_slot_12],
    		body: [create_body_slot_1, ({ displayData }) => ({ displayData })],
    		head: [create_head_slot_1]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	stable.$on("totalPagesChanged", ctx.totalPagesChanged);

    	return {
    		c: function create() {
    			stable.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(stable, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var stable_changes = {};
    			if (changed.data) stable_changes.data = ctx.data;
    			if (changed.filters) stable_changes.filters = ctx.filters;
    			if (changed.pageSize) stable_changes.pageSize = ctx.pageSize;
    			if (changed.currentPage) stable_changes.currentPage = ctx.currentPage;
    			if (changed.$$scope || changed.displayData) stable_changes.$$scope = { changed, ctx };
    			stable.$set(stable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(stable.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(stable.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(stable, detaching);
    		}
    	};
    }

    // (1348:6) <STh sortKey="sample_id" defaultSort="asc">
    function create_default_slot_28(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("样本ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1350:6) <STh sortKey="sample_collector" defaultSort="asc">
    function create_default_slot_27(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("采集人");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1351:6) <STh sortKey="sample_collection_date" defaultSort="asc">
    function create_default_slot_26(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("采集时间");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1353:6) <STh sortKey="identifier_name" defaultSort="asc">
    function create_default_slot_25(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("鉴定人");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1354:6) <STh sortKey="identifier_email" defaultSort="asc">
    function create_default_slot_24(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("鉴定人邮箱");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1355:6) <STh sortKey="identifier_institution" defaultSort="asc">
    function create_default_slot_23(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("鉴定人单位");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1356:6) <STh sortKey="phylum" defaultSort="asc">
    function create_default_slot_22(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("门");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1357:6) <STh sortKey="class_evolution" defaultSort="asc">
    function create_default_slot_21(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("纲");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1358:6) <STh sortKey="order" defaultSort="asc">
    function create_default_slot_20(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("目");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1359:6) <STh sortKey="family" defaultSort="asc">
    function create_default_slot_19(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("科");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1360:6) <STh sortKey="subfamily" defaultSort="asc">
    function create_default_slot_18(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("亚科");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1361:6) <STh sortKey="genus" defaultSort="asc">
    function create_default_slot_17(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("属");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1362:6) <STh sortKey="species" defaultSort="asc">
    function create_default_slot_16(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("种");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1363:6) <STh sortKey="subspecies" defaultSort="asc">
    function create_default_slot_15(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("亚种");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1364:6) <STh sortKey="breed" defaultSort="asc">
    function create_default_slot_14(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("品种");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1347:4) <thead slot="head" class="text-green-500 bg-green-100">
    function create_head_slot_1(ctx) {
    	var thead, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, current;

    	var sth0 = new STh({
    		props: {
    		sortKey: "sample_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_28] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth1 = new STh({
    		props: {
    		sortKey: "sample_collector",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_27] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth2 = new STh({
    		props: {
    		sortKey: "sample_collection_date",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_26] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth3 = new STh({
    		props: {
    		sortKey: "identifier_name",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_25] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth4 = new STh({
    		props: {
    		sortKey: "identifier_email",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_24] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth5 = new STh({
    		props: {
    		sortKey: "identifier_institution",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_23] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth6 = new STh({
    		props: {
    		sortKey: "phylum",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_22] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth7 = new STh({
    		props: {
    		sortKey: "class_evolution",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_21] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth8 = new STh({
    		props: {
    		sortKey: "order",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_20] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth9 = new STh({
    		props: {
    		sortKey: "family",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_19] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth10 = new STh({
    		props: {
    		sortKey: "subfamily",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_18] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth11 = new STh({
    		props: {
    		sortKey: "genus",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_17] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth12 = new STh({
    		props: {
    		sortKey: "species",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_16] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth13 = new STh({
    		props: {
    		sortKey: "subspecies",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_15] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth14 = new STh({
    		props: {
    		sortKey: "breed",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_14] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			thead = element("thead");
    			sth0.$$.fragment.c();
    			t0 = space();
    			sth1.$$.fragment.c();
    			t1 = space();
    			sth2.$$.fragment.c();
    			t2 = space();
    			sth3.$$.fragment.c();
    			t3 = space();
    			sth4.$$.fragment.c();
    			t4 = space();
    			sth5.$$.fragment.c();
    			t5 = space();
    			sth6.$$.fragment.c();
    			t6 = space();
    			sth7.$$.fragment.c();
    			t7 = space();
    			sth8.$$.fragment.c();
    			t8 = space();
    			sth9.$$.fragment.c();
    			t9 = space();
    			sth10.$$.fragment.c();
    			t10 = space();
    			sth11.$$.fragment.c();
    			t11 = space();
    			sth12.$$.fragment.c();
    			t12 = space();
    			sth13.$$.fragment.c();
    			t13 = space();
    			sth14.$$.fragment.c();
    			attr(thead, "slot", "head");
    			attr(thead, "class", "text-green-500 bg-green-100");
    			add_location(thead, file$4, 1346, 4, 46768);
    		},

    		m: function mount(target, anchor) {
    			insert(target, thead, anchor);
    			mount_component(sth0, thead, null);
    			append(thead, t0);
    			mount_component(sth1, thead, null);
    			append(thead, t1);
    			mount_component(sth2, thead, null);
    			append(thead, t2);
    			mount_component(sth3, thead, null);
    			append(thead, t3);
    			mount_component(sth4, thead, null);
    			append(thead, t4);
    			mount_component(sth5, thead, null);
    			append(thead, t5);
    			mount_component(sth6, thead, null);
    			append(thead, t6);
    			mount_component(sth7, thead, null);
    			append(thead, t7);
    			mount_component(sth8, thead, null);
    			append(thead, t8);
    			mount_component(sth9, thead, null);
    			append(thead, t9);
    			mount_component(sth10, thead, null);
    			append(thead, t10);
    			mount_component(sth11, thead, null);
    			append(thead, t11);
    			mount_component(sth12, thead, null);
    			append(thead, t12);
    			mount_component(sth13, thead, null);
    			append(thead, t13);
    			mount_component(sth14, thead, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var sth0_changes = {};
    			if (changed.$$scope) sth0_changes.$$scope = { changed, ctx };
    			sth0.$set(sth0_changes);

    			var sth1_changes = {};
    			if (changed.$$scope) sth1_changes.$$scope = { changed, ctx };
    			sth1.$set(sth1_changes);

    			var sth2_changes = {};
    			if (changed.$$scope) sth2_changes.$$scope = { changed, ctx };
    			sth2.$set(sth2_changes);

    			var sth3_changes = {};
    			if (changed.$$scope) sth3_changes.$$scope = { changed, ctx };
    			sth3.$set(sth3_changes);

    			var sth4_changes = {};
    			if (changed.$$scope) sth4_changes.$$scope = { changed, ctx };
    			sth4.$set(sth4_changes);

    			var sth5_changes = {};
    			if (changed.$$scope) sth5_changes.$$scope = { changed, ctx };
    			sth5.$set(sth5_changes);

    			var sth6_changes = {};
    			if (changed.$$scope) sth6_changes.$$scope = { changed, ctx };
    			sth6.$set(sth6_changes);

    			var sth7_changes = {};
    			if (changed.$$scope) sth7_changes.$$scope = { changed, ctx };
    			sth7.$set(sth7_changes);

    			var sth8_changes = {};
    			if (changed.$$scope) sth8_changes.$$scope = { changed, ctx };
    			sth8.$set(sth8_changes);

    			var sth9_changes = {};
    			if (changed.$$scope) sth9_changes.$$scope = { changed, ctx };
    			sth9.$set(sth9_changes);

    			var sth10_changes = {};
    			if (changed.$$scope) sth10_changes.$$scope = { changed, ctx };
    			sth10.$set(sth10_changes);

    			var sth11_changes = {};
    			if (changed.$$scope) sth11_changes.$$scope = { changed, ctx };
    			sth11.$set(sth11_changes);

    			var sth12_changes = {};
    			if (changed.$$scope) sth12_changes.$$scope = { changed, ctx };
    			sth12.$set(sth12_changes);

    			var sth13_changes = {};
    			if (changed.$$scope) sth13_changes.$$scope = { changed, ctx };
    			sth13.$set(sth13_changes);

    			var sth14_changes = {};
    			if (changed.$$scope) sth14_changes.$$scope = { changed, ctx };
    			sth14.$set(sth14_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(sth0.$$.fragment, local);

    			transition_in(sth1.$$.fragment, local);

    			transition_in(sth2.$$.fragment, local);

    			transition_in(sth3.$$.fragment, local);

    			transition_in(sth4.$$.fragment, local);

    			transition_in(sth5.$$.fragment, local);

    			transition_in(sth6.$$.fragment, local);

    			transition_in(sth7.$$.fragment, local);

    			transition_in(sth8.$$.fragment, local);

    			transition_in(sth9.$$.fragment, local);

    			transition_in(sth10.$$.fragment, local);

    			transition_in(sth11.$$.fragment, local);

    			transition_in(sth12.$$.fragment, local);

    			transition_in(sth13.$$.fragment, local);

    			transition_in(sth14.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(sth0.$$.fragment, local);
    			transition_out(sth1.$$.fragment, local);
    			transition_out(sth2.$$.fragment, local);
    			transition_out(sth3.$$.fragment, local);
    			transition_out(sth4.$$.fragment, local);
    			transition_out(sth5.$$.fragment, local);
    			transition_out(sth6.$$.fragment, local);
    			transition_out(sth7.$$.fragment, local);
    			transition_out(sth8.$$.fragment, local);
    			transition_out(sth9.$$.fragment, local);
    			transition_out(sth10.$$.fragment, local);
    			transition_out(sth11.$$.fragment, local);
    			transition_out(sth12.$$.fragment, local);
    			transition_out(sth13.$$.fragment, local);
    			transition_out(sth14.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(thead);
    			}

    			destroy_component(sth0, );

    			destroy_component(sth1, );

    			destroy_component(sth2, );

    			destroy_component(sth3, );

    			destroy_component(sth4, );

    			destroy_component(sth5, );

    			destroy_component(sth6, );

    			destroy_component(sth7, );

    			destroy_component(sth8, );

    			destroy_component(sth9, );

    			destroy_component(sth10, );

    			destroy_component(sth11, );

    			destroy_component(sth12, );

    			destroy_component(sth13, );

    			destroy_component(sth14, );
    		}
    	};
    }

    // (1369:8) <STr {row}>
    function create_default_slot_13(ctx) {
    	var td0, t0_value = ctx.row.sample_id, t0, t1, td1, t2_value = ctx.row.sample_collector, t2, t3, td2, t4_value = ctx.row.sample_collection_date, t4, t5, td3, t6_value = ctx.row.identifier_name, t6, t7, td4, t8_value = ctx.row.identifier_email, t8, t9, td5, t10_value = ctx.row.identifier_institution, t10, t11, td6, t12_value = ctx.row.phylum, t12, t13, td7, t14_value = ctx.row.class_evolution, t14, t15, td8, t16_value = ctx.row.order, t16, t17, td9, t18_value = ctx.row.family, t18, t19, td10, t20_value = ctx.row.subfamily, t20, t21, td11, t22_value = ctx.row.genus, t22, t23, td12, t24_value = ctx.row.species, t24, t25, td13, t26_value = ctx.row.subspecies, t26, t27, td14, t28_value = ctx.row.breed, t28, t29;

    	return {
    		c: function create() {
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td8 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td9 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td10 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td11 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			td12 = element("td");
    			t24 = text(t24_value);
    			t25 = space();
    			td13 = element("td");
    			t26 = text(t26_value);
    			t27 = space();
    			td14 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			add_location(td0, file$4, 1369, 10, 47868);
    			add_location(td1, file$4, 1370, 10, 47903);
    			add_location(td2, file$4, 1371, 10, 47945);
    			add_location(td3, file$4, 1372, 10, 47993);
    			add_location(td4, file$4, 1373, 10, 48034);
    			add_location(td5, file$4, 1374, 10, 48076);
    			add_location(td6, file$4, 1375, 10, 48124);
    			add_location(td7, file$4, 1376, 10, 48156);
    			add_location(td8, file$4, 1377, 10, 48197);
    			add_location(td9, file$4, 1378, 10, 48228);
    			add_location(td10, file$4, 1379, 10, 48260);
    			add_location(td11, file$4, 1380, 10, 48295);
    			add_location(td12, file$4, 1381, 10, 48326);
    			add_location(td13, file$4, 1382, 10, 48359);
    			add_location(td14, file$4, 1383, 10, 48395);
    		},

    		m: function mount(target, anchor) {
    			insert(target, td0, anchor);
    			append(td0, t0);
    			insert(target, t1, anchor);
    			insert(target, td1, anchor);
    			append(td1, t2);
    			insert(target, t3, anchor);
    			insert(target, td2, anchor);
    			append(td2, t4);
    			insert(target, t5, anchor);
    			insert(target, td3, anchor);
    			append(td3, t6);
    			insert(target, t7, anchor);
    			insert(target, td4, anchor);
    			append(td4, t8);
    			insert(target, t9, anchor);
    			insert(target, td5, anchor);
    			append(td5, t10);
    			insert(target, t11, anchor);
    			insert(target, td6, anchor);
    			append(td6, t12);
    			insert(target, t13, anchor);
    			insert(target, td7, anchor);
    			append(td7, t14);
    			insert(target, t15, anchor);
    			insert(target, td8, anchor);
    			append(td8, t16);
    			insert(target, t17, anchor);
    			insert(target, td9, anchor);
    			append(td9, t18);
    			insert(target, t19, anchor);
    			insert(target, td10, anchor);
    			append(td10, t20);
    			insert(target, t21, anchor);
    			insert(target, td11, anchor);
    			append(td11, t22);
    			insert(target, t23, anchor);
    			insert(target, td12, anchor);
    			append(td12, t24);
    			insert(target, t25, anchor);
    			insert(target, td13, anchor);
    			append(td13, t26);
    			insert(target, t27, anchor);
    			insert(target, td14, anchor);
    			append(td14, t28);
    			insert(target, t29, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.displayData) && t0_value !== (t0_value = ctx.row.sample_id)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.displayData) && t2_value !== (t2_value = ctx.row.sample_collector)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.displayData) && t4_value !== (t4_value = ctx.row.sample_collection_date)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.displayData) && t6_value !== (t6_value = ctx.row.identifier_name)) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.displayData) && t8_value !== (t8_value = ctx.row.identifier_email)) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.displayData) && t10_value !== (t10_value = ctx.row.identifier_institution)) {
    				set_data(t10, t10_value);
    			}

    			if ((changed.displayData) && t12_value !== (t12_value = ctx.row.phylum)) {
    				set_data(t12, t12_value);
    			}

    			if ((changed.displayData) && t14_value !== (t14_value = ctx.row.class_evolution)) {
    				set_data(t14, t14_value);
    			}

    			if ((changed.displayData) && t16_value !== (t16_value = ctx.row.order)) {
    				set_data(t16, t16_value);
    			}

    			if ((changed.displayData) && t18_value !== (t18_value = ctx.row.family)) {
    				set_data(t18, t18_value);
    			}

    			if ((changed.displayData) && t20_value !== (t20_value = ctx.row.subfamily)) {
    				set_data(t20, t20_value);
    			}

    			if ((changed.displayData) && t22_value !== (t22_value = ctx.row.genus)) {
    				set_data(t22, t22_value);
    			}

    			if ((changed.displayData) && t24_value !== (t24_value = ctx.row.species)) {
    				set_data(t24, t24_value);
    			}

    			if ((changed.displayData) && t26_value !== (t26_value = ctx.row.subspecies)) {
    				set_data(t26, t26_value);
    			}

    			if ((changed.displayData) && t28_value !== (t28_value = ctx.row.breed)) {
    				set_data(t28, t28_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(td0);
    				detach(t1);
    				detach(td1);
    				detach(t3);
    				detach(td2);
    				detach(t5);
    				detach(td3);
    				detach(t7);
    				detach(td4);
    				detach(t9);
    				detach(td5);
    				detach(t11);
    				detach(td6);
    				detach(t13);
    				detach(td7);
    				detach(t15);
    				detach(td8);
    				detach(t17);
    				detach(td9);
    				detach(t19);
    				detach(td10);
    				detach(t21);
    				detach(td11);
    				detach(t23);
    				detach(td12);
    				detach(t25);
    				detach(td13);
    				detach(t27);
    				detach(td14);
    				detach(t29);
    			}
    		}
    	};
    }

    // (1368:6) {#each displayData as row (row.sample_id)}
    function create_each_block_1(key_1, ctx) {
    	var first, current;

    	var str = new STr({
    		props: {
    		row: ctx.row,
    		$$slots: { default: [create_default_slot_13] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			str.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(str, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var str_changes = {};
    			if (changed.displayData) str_changes.row = ctx.row;
    			if (changed.$$scope) str_changes.$$scope = { changed, ctx };
    			str.$set(str_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(str.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(str.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			destroy_component(str, detaching);
    		}
    	};
    }

    // (1367:4) <tbody slot="body" let:displayData>
    function create_body_slot_1(ctx) {
    	var tbody, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value_1 = ctx.displayData;

    	const get_key = ctx => ctx.row.sample_id;

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			tbody = element("tbody");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(tbody, "slot", "body");
    			add_location(tbody, file$4, 1366, 4, 47753);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tbody, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tbody, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value_1 = ctx.displayData;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_1, each_1_lookup, tbody, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_1.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tbody);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    // (1339:2) <STable     {data}     {filters}     {pageSize}     {currentPage}     class="table"     selectedClass="table-info"     on:totalPagesChanged={totalPagesChanged}>
    function create_default_slot_12(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1391:0) {#if displayGeo}
    function create_if_block$2(ctx) {
    	var current;

    	var stable = new STable({
    		props: {
    		data: ctx.data,
    		filters: ctx.filters,
    		pageSize: ctx.pageSize,
    		currentPage: ctx.currentPage,
    		class: "table",
    		selectedClass: "table-info",
    		$$slots: {
    		default: [create_default_slot],
    		body: [create_body_slot, ({ displayData }) => ({ displayData })],
    		head: [create_head_slot]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	stable.$on("totalPagesChanged", ctx.totalPagesChanged);

    	return {
    		c: function create() {
    			stable.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(stable, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var stable_changes = {};
    			if (changed.data) stable_changes.data = ctx.data;
    			if (changed.filters) stable_changes.filters = ctx.filters;
    			if (changed.pageSize) stable_changes.pageSize = ctx.pageSize;
    			if (changed.currentPage) stable_changes.currentPage = ctx.currentPage;
    			if (changed.$$scope || changed.displayData) stable_changes.$$scope = { changed, ctx };
    			stable.$set(stable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(stable.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(stable.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(stable, detaching);
    		}
    	};
    }

    // (1401:6) <STh sortKey="sample_id" defaultSort="asc">
    function create_default_slot_11(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("样本ID");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1402:6) <STh sortKey="continent_or_ocean" defaultSort="asc">
    function create_default_slot_10(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("大陆或大洋");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1403:6) <STh sortKey="country" defaultSort="asc">
    function create_default_slot_9(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("国家");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1404:6) <STh sortKey="state_or_province" defaultSort="asc">
    function create_default_slot_8(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("州或省份");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1405:6) <STh sortKey="city" defaultSort="asc">
    function create_default_slot_7(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("城市");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1406:6) <STh sortKey="county" defaultSort="asc">
    function create_default_slot_6(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("县");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1407:6) <STh sortKey="exact_site" defaultSort="asc">
    function create_default_slot_5(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("详细地址");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1408:6) <STh sortKey="latitude" defaultSort="asc">
    function create_default_slot_4(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("纬度");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1409:6) <STh sortKey="longitude" defaultSort="asc">
    function create_default_slot_3(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("经度");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1410:6) <STh sortKey="elevation" defaultSort="asc">
    function create_default_slot_2(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("海拔");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1400:4) <thead slot="head" class="text-indigo-500 bg-indigo-100">
    function create_head_slot(ctx) {
    	var thead, t0, t1, t2, t3, t4, t5, t6, t7, t8, current;

    	var sth0 = new STh({
    		props: {
    		sortKey: "sample_id",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth1 = new STh({
    		props: {
    		sortKey: "continent_or_ocean",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_10] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth2 = new STh({
    		props: {
    		sortKey: "country",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_9] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth3 = new STh({
    		props: {
    		sortKey: "state_or_province",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_8] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth4 = new STh({
    		props: {
    		sortKey: "city",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth5 = new STh({
    		props: {
    		sortKey: "county",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth6 = new STh({
    		props: {
    		sortKey: "exact_site",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth7 = new STh({
    		props: {
    		sortKey: "latitude",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth8 = new STh({
    		props: {
    		sortKey: "longitude",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var sth9 = new STh({
    		props: {
    		sortKey: "elevation",
    		defaultSort: "asc",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			thead = element("thead");
    			sth0.$$.fragment.c();
    			t0 = space();
    			sth1.$$.fragment.c();
    			t1 = space();
    			sth2.$$.fragment.c();
    			t2 = space();
    			sth3.$$.fragment.c();
    			t3 = space();
    			sth4.$$.fragment.c();
    			t4 = space();
    			sth5.$$.fragment.c();
    			t5 = space();
    			sth6.$$.fragment.c();
    			t6 = space();
    			sth7.$$.fragment.c();
    			t7 = space();
    			sth8.$$.fragment.c();
    			t8 = space();
    			sth9.$$.fragment.c();
    			attr(thead, "slot", "head");
    			attr(thead, "class", "text-indigo-500 bg-indigo-100");
    			add_location(thead, file$4, 1399, 4, 48661);
    		},

    		m: function mount(target, anchor) {
    			insert(target, thead, anchor);
    			mount_component(sth0, thead, null);
    			append(thead, t0);
    			mount_component(sth1, thead, null);
    			append(thead, t1);
    			mount_component(sth2, thead, null);
    			append(thead, t2);
    			mount_component(sth3, thead, null);
    			append(thead, t3);
    			mount_component(sth4, thead, null);
    			append(thead, t4);
    			mount_component(sth5, thead, null);
    			append(thead, t5);
    			mount_component(sth6, thead, null);
    			append(thead, t6);
    			mount_component(sth7, thead, null);
    			append(thead, t7);
    			mount_component(sth8, thead, null);
    			append(thead, t8);
    			mount_component(sth9, thead, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var sth0_changes = {};
    			if (changed.$$scope) sth0_changes.$$scope = { changed, ctx };
    			sth0.$set(sth0_changes);

    			var sth1_changes = {};
    			if (changed.$$scope) sth1_changes.$$scope = { changed, ctx };
    			sth1.$set(sth1_changes);

    			var sth2_changes = {};
    			if (changed.$$scope) sth2_changes.$$scope = { changed, ctx };
    			sth2.$set(sth2_changes);

    			var sth3_changes = {};
    			if (changed.$$scope) sth3_changes.$$scope = { changed, ctx };
    			sth3.$set(sth3_changes);

    			var sth4_changes = {};
    			if (changed.$$scope) sth4_changes.$$scope = { changed, ctx };
    			sth4.$set(sth4_changes);

    			var sth5_changes = {};
    			if (changed.$$scope) sth5_changes.$$scope = { changed, ctx };
    			sth5.$set(sth5_changes);

    			var sth6_changes = {};
    			if (changed.$$scope) sth6_changes.$$scope = { changed, ctx };
    			sth6.$set(sth6_changes);

    			var sth7_changes = {};
    			if (changed.$$scope) sth7_changes.$$scope = { changed, ctx };
    			sth7.$set(sth7_changes);

    			var sth8_changes = {};
    			if (changed.$$scope) sth8_changes.$$scope = { changed, ctx };
    			sth8.$set(sth8_changes);

    			var sth9_changes = {};
    			if (changed.$$scope) sth9_changes.$$scope = { changed, ctx };
    			sth9.$set(sth9_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(sth0.$$.fragment, local);

    			transition_in(sth1.$$.fragment, local);

    			transition_in(sth2.$$.fragment, local);

    			transition_in(sth3.$$.fragment, local);

    			transition_in(sth4.$$.fragment, local);

    			transition_in(sth5.$$.fragment, local);

    			transition_in(sth6.$$.fragment, local);

    			transition_in(sth7.$$.fragment, local);

    			transition_in(sth8.$$.fragment, local);

    			transition_in(sth9.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(sth0.$$.fragment, local);
    			transition_out(sth1.$$.fragment, local);
    			transition_out(sth2.$$.fragment, local);
    			transition_out(sth3.$$.fragment, local);
    			transition_out(sth4.$$.fragment, local);
    			transition_out(sth5.$$.fragment, local);
    			transition_out(sth6.$$.fragment, local);
    			transition_out(sth7.$$.fragment, local);
    			transition_out(sth8.$$.fragment, local);
    			transition_out(sth9.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(thead);
    			}

    			destroy_component(sth0, );

    			destroy_component(sth1, );

    			destroy_component(sth2, );

    			destroy_component(sth3, );

    			destroy_component(sth4, );

    			destroy_component(sth5, );

    			destroy_component(sth6, );

    			destroy_component(sth7, );

    			destroy_component(sth8, );

    			destroy_component(sth9, );
    		}
    	};
    }

    // (1414:8) <STr {row}>
    function create_default_slot_1(ctx) {
    	var td0, t0_value = ctx.row.sample_id, t0, t1, td1, t2_value = ctx.row.continent_or_ocean, t2, t3, td2, t4_value = ctx.row.country, t4, t5, td3, t6_value = ctx.row.state_or_province, t6, t7, td4, t8_value = ctx.row.city, t8, t9, td5, t10_value = ctx.row.county, t10, t11, td6, t12_value = ctx.row.exact_site, t12, t13, td7, t14_value = ctx.row.latitude, t14, t15, td8, t16_value = ctx.row.longitude, t16, t17, td9, t18_value = ctx.row.elevation, t18, t19;

    	return {
    		c: function create() {
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td8 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td9 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			add_location(td0, file$4, 1414, 10, 49446);
    			add_location(td1, file$4, 1415, 10, 49481);
    			add_location(td2, file$4, 1416, 10, 49525);
    			add_location(td3, file$4, 1417, 10, 49558);
    			add_location(td4, file$4, 1418, 10, 49601);
    			add_location(td5, file$4, 1419, 10, 49631);
    			add_location(td6, file$4, 1420, 10, 49663);
    			add_location(td7, file$4, 1421, 10, 49699);
    			add_location(td8, file$4, 1422, 10, 49733);
    			add_location(td9, file$4, 1423, 10, 49768);
    		},

    		m: function mount(target, anchor) {
    			insert(target, td0, anchor);
    			append(td0, t0);
    			insert(target, t1, anchor);
    			insert(target, td1, anchor);
    			append(td1, t2);
    			insert(target, t3, anchor);
    			insert(target, td2, anchor);
    			append(td2, t4);
    			insert(target, t5, anchor);
    			insert(target, td3, anchor);
    			append(td3, t6);
    			insert(target, t7, anchor);
    			insert(target, td4, anchor);
    			append(td4, t8);
    			insert(target, t9, anchor);
    			insert(target, td5, anchor);
    			append(td5, t10);
    			insert(target, t11, anchor);
    			insert(target, td6, anchor);
    			append(td6, t12);
    			insert(target, t13, anchor);
    			insert(target, td7, anchor);
    			append(td7, t14);
    			insert(target, t15, anchor);
    			insert(target, td8, anchor);
    			append(td8, t16);
    			insert(target, t17, anchor);
    			insert(target, td9, anchor);
    			append(td9, t18);
    			insert(target, t19, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.displayData) && t0_value !== (t0_value = ctx.row.sample_id)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.displayData) && t2_value !== (t2_value = ctx.row.continent_or_ocean)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.displayData) && t4_value !== (t4_value = ctx.row.country)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.displayData) && t6_value !== (t6_value = ctx.row.state_or_province)) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.displayData) && t8_value !== (t8_value = ctx.row.city)) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.displayData) && t10_value !== (t10_value = ctx.row.county)) {
    				set_data(t10, t10_value);
    			}

    			if ((changed.displayData) && t12_value !== (t12_value = ctx.row.exact_site)) {
    				set_data(t12, t12_value);
    			}

    			if ((changed.displayData) && t14_value !== (t14_value = ctx.row.latitude)) {
    				set_data(t14, t14_value);
    			}

    			if ((changed.displayData) && t16_value !== (t16_value = ctx.row.longitude)) {
    				set_data(t16, t16_value);
    			}

    			if ((changed.displayData) && t18_value !== (t18_value = ctx.row.elevation)) {
    				set_data(t18, t18_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(td0);
    				detach(t1);
    				detach(td1);
    				detach(t3);
    				detach(td2);
    				detach(t5);
    				detach(td3);
    				detach(t7);
    				detach(td4);
    				detach(t9);
    				detach(td5);
    				detach(t11);
    				detach(td6);
    				detach(t13);
    				detach(td7);
    				detach(t15);
    				detach(td8);
    				detach(t17);
    				detach(td9);
    				detach(t19);
    			}
    		}
    	};
    }

    // (1413:6) {#each displayData as row (row.sample_id)}
    function create_each_block$1(key_1, ctx) {
    	var first, current;

    	var str = new STr({
    		props: {
    		row: ctx.row,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			str.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(str, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var str_changes = {};
    			if (changed.displayData) str_changes.row = ctx.row;
    			if (changed.$$scope) str_changes.$$scope = { changed, ctx };
    			str.$set(str_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(str.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(str.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			destroy_component(str, detaching);
    		}
    	};
    }

    // (1412:4) <tbody slot="body" let:displayData>
    function create_body_slot(ctx) {
    	var tbody, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value = ctx.displayData;

    	const get_key = ctx => ctx.row.sample_id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			tbody = element("tbody");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(tbody, "slot", "body");
    			add_location(tbody, file$4, 1411, 4, 49331);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tbody, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tbody, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.displayData;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, tbody, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tbody);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    // (1392:2) <STable     {data}     {filters}     {pageSize}     {currentPage}     class="table"     selectedClass="table-info"     on:totalPagesChanged={totalPagesChanged}>
    function create_default_slot(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var link0, link1, t0, div0, t1, span0, t2, t3, t4, div168, div50, div1, p0, t6, p1, t8, form0, div4, div2, label0, t10, div3, input0, t11, div7, div5, label1, t13, div6, input1, t14, div10, div8, label2, t16, div9, input2, t17, div13, div11, label3, t19, div12, input3, t20, div16, div14, label4, t22, div15, input4, t23, div19, div17, label5, t25, div18, input5, t26, div22, div20, label6, t28, div21, input6, t29, div25, div23, label7, t31, div24, input7, t32, div28, div26, label8, t34, div27, input8, t35, div31, div29, label9, t37, div30, input9, t38, div34, div32, label10, t40, div33, input10, t41, div37, div35, label11, t43, div36, input11, t44, div40, div38, label12, t46, div39, input12, t47, div43, div41, label13, t49, div42, input13, t50, div46, div44, label14, t52, div45, input14, t53, div49, div47, label15, t55, div48, input15, t56, div94, div51, p2, t58, p3, t60, form1, div54, div52, label16, t62, div53, input16, t63, div57, div55, label17, t65, div56, input17, t66, div60, div58, label18, t68, div59, input18, t69, div63, div61, label19, t71, div62, input19, t72, div66, div64, label20, t74, div65, input20, t75, div69, div67, label21, t77, div68, input21, t78, div72, div70, label22, t80, div71, input22, t81, div75, div73, label23, t83, div74, input23, t84, div78, div76, label24, t86, div77, input24, t87, div81, div79, label25, t89, div80, input25, t90, div84, div82, label26, t92, div83, input26, t93, div87, div85, label27, t95, div86, input27, t96, div90, div88, label28, t98, div89, input28, t99, div93, div91, label29, t101, div92, input29, t102, div138, div95, p4, t104, p5, t106, form2, div98, div96, label30, t108, div97, input30, t109, div101, div99, label31, t111, div100, input31, t112, div104, div102, label32, t114, div103, input32, t115, div107, div105, label33, t117, div106, input33, t118, div110, div108, label34, t120, div109, input34, t121, div113, div111, label35, t123, div112, input35, t124, div116, div114, label36, t126, div115, input36, t127, div119, div117, label37, t129, div118, input37, t130, div122, div120, label38, t132, div121, input38, t133, div125, div123, label39, t135, div124, input39, t136, div128, div126, label40, t138, div127, input40, t139, div131, div129, label41, t141, div130, input41, t142, div134, div132, label42, t144, div133, input42, t145, div137, div135, label43, t147, div136, input43, t148, div167, div139, p6, t150, p7, t152, form3, div142, div140, label44, t154, div141, input44, t155, div145, div143, label45, t157, div144, input45, t158, div148, div146, label46, t160, div147, input46, t161, div151, div149, label47, t163, div150, input47, t164, div154, div152, label48, t166, div153, input48, t167, div157, div155, label49, t169, div156, input49, t170, div160, div158, label50, t172, div159, input50, t173, div163, div161, label51, t175, div162, input51, t176, div166, div164, label52, t178, div165, input52, t179, div169, t180, span1, t181, t182, t183, form4, div176, div170, label53, t185, input53, t186, p8, t188, div171, label54, t190, input54, t191, p9, t193, div172, label55, input55, t194, span2, t196, div173, label56, input56, t197, span3, t199, div174, label57, input57, t200, span4, t202, div175, label58, input58, t203, span5, t205, div177, updating_currentPage, t206, t207, t208, t209, t210, updating_currentPage_1, current, dispose;

    	function spagination0_currentPage_binding(value) {
    		ctx.spagination0_currentPage_binding.call(null, value);
    		updating_currentPage = true;
    		add_flush_callback(() => updating_currentPage = false);
    	}

    	let spagination0_props = { totalPages: ctx.totalPages };
    	if (ctx.currentPage !== void 0) {
    		spagination0_props.currentPage = ctx.currentPage;
    	}
    	var spagination0 = new SPagination({
    		props: spagination0_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(spagination0, 'currentPage', spagination0_currentPage_binding));

    	var if_block0 = (ctx.displayStore) && create_if_block_3$2(ctx);

    	var if_block1 = (ctx.displayBackground) && create_if_block_2$2(ctx);

    	var if_block2 = (ctx.displayEvo) && create_if_block_1$2(ctx);

    	var if_block3 = (ctx.displayGeo) && create_if_block$2(ctx);

    	function spagination1_currentPage_binding(value_1) {
    		ctx.spagination1_currentPage_binding.call(null, value_1);
    		updating_currentPage_1 = true;
    		add_flush_callback(() => updating_currentPage_1 = false);
    	}

    	let spagination1_props = { totalPages: ctx.totalPages };
    	if (ctx.currentPage !== void 0) {
    		spagination1_props.currentPage = ctx.currentPage;
    	}
    	var spagination1 = new SPagination({
    		props: spagination1_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(spagination1, 'currentPage', spagination1_currentPage_binding));

    	return {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			div0 = element("div");
    			t1 = text("符合筛选条件的一共有\n  ");
    			span0 = element("span");
    			t2 = text(ctx.totalNum);
    			t3 = text("\n  条记录");
    			t4 = space();
    			div168 = element("div");
    			div50 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "样本保存条件";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "是否分菌等判断，用true， false筛选";
    			t8 = space();
    			form0 = element("form");
    			div4 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "样本ID";
    			t10 = space();
    			div3 = element("div");
    			input0 = element("input");
    			t11 = space();
    			div7 = element("div");
    			div5 = element("div");
    			label1 = element("label");
    			label1.textContent = "头胸部ID";
    			t13 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t14 = space();
    			div10 = element("div");
    			div8 = element("div");
    			label2 = element("label");
    			label2.textContent = "头胸部保存";
    			t16 = space();
    			div9 = element("div");
    			input2 = element("input");
    			t17 = space();
    			div13 = element("div");
    			div11 = element("div");
    			label3 = element("label");
    			label3.textContent = "腹部ID";
    			t19 = space();
    			div12 = element("div");
    			input3 = element("input");
    			t20 = space();
    			div16 = element("div");
    			div14 = element("div");
    			label4 = element("label");
    			label4.textContent = "腹部保存";
    			t22 = space();
    			div15 = element("div");
    			input4 = element("input");
    			t23 = space();
    			div19 = element("div");
    			div17 = element("div");
    			label5 = element("label");
    			label5.textContent = "肠道ID";
    			t25 = space();
    			div18 = element("div");
    			input5 = element("input");
    			t26 = space();
    			div22 = element("div");
    			div20 = element("div");
    			label6 = element("label");
    			label6.textContent = "肠道保存";
    			t28 = space();
    			div21 = element("div");
    			input6 = element("input");
    			t29 = space();
    			div25 = element("div");
    			div23 = element("div");
    			label7 = element("label");
    			label7.textContent = "腿部ID";
    			t31 = space();
    			div24 = element("div");
    			input7 = element("input");
    			t32 = space();
    			div28 = element("div");
    			div26 = element("div");
    			label8 = element("label");
    			label8.textContent = "腿部保存";
    			t34 = space();
    			div27 = element("div");
    			input8 = element("input");
    			t35 = space();
    			div31 = element("div");
    			div29 = element("div");
    			label9 = element("label");
    			label9.textContent = "解剖前状态";
    			t37 = space();
    			div30 = element("div");
    			input9 = element("input");
    			t38 = space();
    			div34 = element("div");
    			div32 = element("div");
    			label10 = element("label");
    			label10.textContent = "条形码";
    			t40 = space();
    			div33 = element("div");
    			input10 = element("input");
    			t41 = space();
    			div37 = element("div");
    			div35 = element("div");
    			label11 = element("label");
    			label11.textContent = "盒子ID";
    			t43 = space();
    			div36 = element("div");
    			input11 = element("input");
    			t44 = space();
    			div40 = element("div");
    			div38 = element("div");
    			label12 = element("label");
    			label12.textContent = "样本备注信息";
    			t46 = space();
    			div39 = element("div");
    			input12 = element("input");
    			t47 = space();
    			div43 = element("div");
    			div41 = element("div");
    			label13 = element("label");
    			label13.textContent = "是否分菌";
    			t49 = space();
    			div42 = element("div");
    			input13 = element("input");
    			t50 = space();
    			div46 = element("div");
    			div44 = element("div");
    			label14 = element("label");
    			label14.textContent = "是否已使用";
    			t52 = space();
    			div45 = element("div");
    			input14 = element("input");
    			t53 = space();
    			div49 = element("div");
    			div47 = element("div");
    			label15 = element("label");
    			label15.textContent = "是否多只同管";
    			t55 = space();
    			div48 = element("div");
    			input15 = element("input");
    			t56 = space();
    			div94 = element("div");
    			div51 = element("div");
    			p2 = element("p");
    			p2.textContent = "样本背景信息";
    			t58 = space();
    			p3 = element("p");
    			p3.textContent = "是否喂糖水等判断，用true， false筛选";
    			t60 = space();
    			form1 = element("form");
    			div54 = element("div");
    			div52 = element("div");
    			label16 = element("label");
    			label16.textContent = "蜜蜂类型";
    			t62 = space();
    			div53 = element("div");
    			input16 = element("input");
    			t63 = space();
    			div57 = element("div");
    			div55 = element("div");
    			label17 = element("label");
    			label17.textContent = "饲养方式";
    			t65 = space();
    			div56 = element("div");
    			input17 = element("input");
    			t66 = space();
    			div60 = element("div");
    			div58 = element("div");
    			label18 = element("label");
    			label18.textContent = "个体阶段";
    			t68 = space();
    			div59 = element("div");
    			input18 = element("input");
    			t69 = space();
    			div63 = element("div");
    			div61 = element("div");
    			label19 = element("label");
    			label19.textContent = "养蜂人";
    			t71 = space();
    			div62 = element("div");
    			input19 = element("input");
    			t72 = space();
    			div66 = element("div");
    			div64 = element("div");
    			label20 = element("label");
    			label20.textContent = "蜂场ID";
    			t74 = space();
    			div65 = element("div");
    			input20 = element("input");
    			t75 = space();
    			div69 = element("div");
    			div67 = element("div");
    			label21 = element("label");
    			label21.textContent = "蜂箱ID";
    			t77 = space();
    			div68 = element("div");
    			input21 = element("input");
    			t78 = space();
    			div72 = element("div");
    			div70 = element("div");
    			label22 = element("label");
    			label22.textContent = "蜜蜂来源";
    			t80 = space();
    			div71 = element("div");
    			input22 = element("input");
    			t81 = space();
    			div75 = element("div");
    			div73 = element("div");
    			label23 = element("label");
    			label23.textContent = "蜂箱年数";
    			t83 = space();
    			div74 = element("div");
    			input23 = element("input");
    			t84 = space();
    			div78 = element("div");
    			div76 = element("div");
    			label24 = element("label");
    			label24.textContent = "取蜜频率";
    			t86 = space();
    			div77 = element("div");
    			input24 = element("input");
    			t87 = space();
    			div81 = element("div");
    			div79 = element("div");
    			label25 = element("label");
    			label25.textContent = "糖水频率及浓度";
    			t89 = space();
    			div80 = element("div");
    			input25 = element("input");
    			t90 = space();
    			div84 = element("div");
    			div82 = element("div");
    			label26 = element("label");
    			label26.textContent = "生境";
    			t92 = space();
    			div83 = element("div");
    			input26 = element("input");
    			t93 = space();
    			div87 = element("div");
    			div85 = element("div");
    			label27 = element("label");
    			label27.textContent = "访花种类";
    			t95 = space();
    			div86 = element("div");
    			input27 = element("input");
    			t96 = space();
    			div90 = element("div");
    			div88 = element("div");
    			label28 = element("label");
    			label28.textContent = "是否喂糖水";
    			t98 = space();
    			div89 = element("div");
    			input28 = element("input");
    			t99 = space();
    			div93 = element("div");
    			div91 = element("div");
    			label29 = element("label");
    			label29.textContent = "有无农药";
    			t101 = space();
    			div92 = element("div");
    			input29 = element("input");
    			t102 = space();
    			div138 = element("div");
    			div95 = element("div");
    			p4 = element("p");
    			p4.textContent = "样本鉴定信息";
    			t104 = space();
    			p5 = element("p");
    			p5.textContent = "无鉴定人的，以采集人代替";
    			t106 = space();
    			form2 = element("form");
    			div98 = element("div");
    			div96 = element("div");
    			label30 = element("label");
    			label30.textContent = "采集人";
    			t108 = space();
    			div97 = element("div");
    			input30 = element("input");
    			t109 = space();
    			div101 = element("div");
    			div99 = element("div");
    			label31 = element("label");
    			label31.textContent = "采集时间";
    			t111 = space();
    			div100 = element("div");
    			input31 = element("input");
    			t112 = space();
    			div104 = element("div");
    			div102 = element("div");
    			label32 = element("label");
    			label32.textContent = "鉴定人";
    			t114 = space();
    			div103 = element("div");
    			input32 = element("input");
    			t115 = space();
    			div107 = element("div");
    			div105 = element("div");
    			label33 = element("label");
    			label33.textContent = "鉴定人邮箱";
    			t117 = space();
    			div106 = element("div");
    			input33 = element("input");
    			t118 = space();
    			div110 = element("div");
    			div108 = element("div");
    			label34 = element("label");
    			label34.textContent = "鉴定人单位";
    			t120 = space();
    			div109 = element("div");
    			input34 = element("input");
    			t121 = space();
    			div113 = element("div");
    			div111 = element("div");
    			label35 = element("label");
    			label35.textContent = "门";
    			t123 = space();
    			div112 = element("div");
    			input35 = element("input");
    			t124 = space();
    			div116 = element("div");
    			div114 = element("div");
    			label36 = element("label");
    			label36.textContent = "纲";
    			t126 = space();
    			div115 = element("div");
    			input36 = element("input");
    			t127 = space();
    			div119 = element("div");
    			div117 = element("div");
    			label37 = element("label");
    			label37.textContent = "目";
    			t129 = space();
    			div118 = element("div");
    			input37 = element("input");
    			t130 = space();
    			div122 = element("div");
    			div120 = element("div");
    			label38 = element("label");
    			label38.textContent = "科";
    			t132 = space();
    			div121 = element("div");
    			input38 = element("input");
    			t133 = space();
    			div125 = element("div");
    			div123 = element("div");
    			label39 = element("label");
    			label39.textContent = "亚科";
    			t135 = space();
    			div124 = element("div");
    			input39 = element("input");
    			t136 = space();
    			div128 = element("div");
    			div126 = element("div");
    			label40 = element("label");
    			label40.textContent = "属";
    			t138 = space();
    			div127 = element("div");
    			input40 = element("input");
    			t139 = space();
    			div131 = element("div");
    			div129 = element("div");
    			label41 = element("label");
    			label41.textContent = "种";
    			t141 = space();
    			div130 = element("div");
    			input41 = element("input");
    			t142 = space();
    			div134 = element("div");
    			div132 = element("div");
    			label42 = element("label");
    			label42.textContent = "亚种";
    			t144 = space();
    			div133 = element("div");
    			input42 = element("input");
    			t145 = space();
    			div137 = element("div");
    			div135 = element("div");
    			label43 = element("label");
    			label43.textContent = "品种";
    			t147 = space();
    			div136 = element("div");
    			input43 = element("input");
    			t148 = space();
    			div167 = element("div");
    			div139 = element("div");
    			p6 = element("p");
    			p6.textContent = "取样地理位置";
    			t150 = space();
    			p7 = element("p");
    			p7.textContent = "经纬度、海拔录入信息不规范，因此使用字符串查询";
    			t152 = space();
    			form3 = element("form");
    			div142 = element("div");
    			div140 = element("div");
    			label44 = element("label");
    			label44.textContent = "大陆或大洋";
    			t154 = space();
    			div141 = element("div");
    			input44 = element("input");
    			t155 = space();
    			div145 = element("div");
    			div143 = element("div");
    			label45 = element("label");
    			label45.textContent = "国家";
    			t157 = space();
    			div144 = element("div");
    			input45 = element("input");
    			t158 = space();
    			div148 = element("div");
    			div146 = element("div");
    			label46 = element("label");
    			label46.textContent = "州或省份";
    			t160 = space();
    			div147 = element("div");
    			input46 = element("input");
    			t161 = space();
    			div151 = element("div");
    			div149 = element("div");
    			label47 = element("label");
    			label47.textContent = "城市";
    			t163 = space();
    			div150 = element("div");
    			input47 = element("input");
    			t164 = space();
    			div154 = element("div");
    			div152 = element("div");
    			label48 = element("label");
    			label48.textContent = "鉴定人单位";
    			t166 = space();
    			div153 = element("div");
    			input48 = element("input");
    			t167 = space();
    			div157 = element("div");
    			div155 = element("div");
    			label49 = element("label");
    			label49.textContent = "详细地址";
    			t169 = space();
    			div156 = element("div");
    			input49 = element("input");
    			t170 = space();
    			div160 = element("div");
    			div158 = element("div");
    			label50 = element("label");
    			label50.textContent = "纬度";
    			t172 = space();
    			div159 = element("div");
    			input50 = element("input");
    			t173 = space();
    			div163 = element("div");
    			div161 = element("div");
    			label51 = element("label");
    			label51.textContent = "经度";
    			t175 = space();
    			div162 = element("div");
    			input51 = element("input");
    			t176 = space();
    			div166 = element("div");
    			div164 = element("div");
    			label52 = element("label");
    			label52.textContent = "海拔";
    			t178 = space();
    			div165 = element("div");
    			input52 = element("input");
    			t179 = space();
    			div169 = element("div");
    			t180 = text("符合筛选条件的一共有\n  ");
    			span1 = element("span");
    			t181 = text(ctx.totalNum);
    			t182 = text("\n  条记录");
    			t183 = space();
    			form4 = element("form");
    			div176 = element("div");
    			div170 = element("div");
    			label53 = element("label");
    			label53.textContent = "每页显示条数";
    			t185 = space();
    			input53 = element("input");
    			t186 = space();
    			p8 = element("p");
    			p8.textContent = "默认值为5，可以不设置";
    			t188 = space();
    			div171 = element("div");
    			label54 = element("label");
    			label54.textContent = "直接跳转到页面数";
    			t190 = space();
    			input54 = element("input");
    			t191 = space();
    			p9 = element("p");
    			p9.textContent = "默认值为第一页，可以不设置";
    			t193 = space();
    			div172 = element("div");
    			label55 = element("label");
    			input55 = element("input");
    			t194 = space();
    			span2 = element("span");
    			span2.textContent = "显示样本保存表";
    			t196 = space();
    			div173 = element("div");
    			label56 = element("label");
    			input56 = element("input");
    			t197 = space();
    			span3 = element("span");
    			span3.textContent = "显示样本背景信息";
    			t199 = space();
    			div174 = element("div");
    			label57 = element("label");
    			input57 = element("input");
    			t200 = space();
    			span4 = element("span");
    			span4.textContent = "显示样本鉴定信息";
    			t202 = space();
    			div175 = element("div");
    			label58 = element("label");
    			input58 = element("input");
    			t203 = space();
    			span5 = element("span");
    			span5.textContent = "显示取样地理位置";
    			t205 = space();
    			div177 = element("div");
    			spagination0.$$.fragment.c();
    			t206 = space();
    			if (if_block0) if_block0.c();
    			t207 = space();
    			if (if_block1) if_block1.c();
    			t208 = space();
    			if (if_block2) if_block2.c();
    			t209 = space();
    			if (if_block3) if_block3.c();
    			t210 = space();
    			spagination1.$$.fragment.c();
    			attr(link0, "rel", "stylesheet");
    			attr(link0, "href", "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css");
    			add_location(link0, file$4, 169, 2, 5518);
    			attr(link1, "href", "https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css");
    			attr(link1, "rel", "stylesheet");
    			add_location(link1, file$4, 172, 2, 5634);
    			attr(span0, "class", "text-5xl text-purple-500");
    			add_location(span0, file$4, 179, 2, 5826);
    			attr(div0, "class", "bg-yellow-100 text-center font-bold text-xl my-4");
    			add_location(div0, file$4, 177, 0, 5748);
    			attr(p0, "class", "text-sm font-bold");
    			add_location(p0, file$4, 190, 6, 6172);
    			attr(p1, "class", "text-xs");
    			add_location(p1, file$4, 191, 6, 6218);
    			attr(div1, "class", "bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4\n      py-3 shadow-md my-2 ml-2 mr-3 text-center h-24");
    			add_location(div1, file$4, 187, 4, 6025);
    			attr(label0, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label0, file$4, 198, 10, 6415);
    			attr(div2, "class", "md:w-1/3");
    			add_location(div2, file$4, 197, 8, 6382);
    			attr(input0, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input0, "type", "text");
    			attr(input0, "placeholder", "样本ID");
    			add_location(input0, file$4, 203, 10, 6575);
    			attr(div3, "class", "md:w-2/3");
    			add_location(div3, file$4, 202, 8, 6542);
    			attr(div4, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div4, file$4, 196, 6, 6326);
    			attr(label1, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label1, file$4, 215, 10, 7019);
    			attr(div5, "class", "md:w-1/3");
    			add_location(div5, file$4, 214, 8, 6986);
    			attr(input1, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input1, "type", "text");
    			attr(input1, "placeholder", "头胸部ID");
    			add_location(input1, file$4, 220, 10, 7180);
    			attr(div6, "class", "md:w-2/3");
    			add_location(div6, file$4, 219, 8, 7147);
    			attr(div7, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div7, file$4, 213, 6, 6930);
    			attr(label2, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label2, file$4, 232, 10, 7629);
    			attr(div8, "class", "md:w-1/3");
    			add_location(div8, file$4, 231, 8, 7596);
    			attr(input2, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input2, "type", "text");
    			attr(input2, "placeholder", "头胸部保存");
    			add_location(input2, file$4, 237, 10, 7790);
    			attr(div9, "class", "md:w-2/3");
    			add_location(div9, file$4, 236, 8, 7757);
    			attr(div10, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div10, file$4, 230, 6, 7540);
    			attr(label3, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label3, file$4, 249, 10, 8249);
    			attr(div11, "class", "md:w-1/3");
    			add_location(div11, file$4, 248, 8, 8216);
    			attr(input3, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input3, "type", "text");
    			attr(input3, "placeholder", "腹部ID");
    			add_location(input3, file$4, 254, 10, 8409);
    			attr(div12, "class", "md:w-2/3");
    			add_location(div12, file$4, 253, 8, 8376);
    			attr(div13, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div13, file$4, 247, 6, 8160);
    			attr(label4, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label4, file$4, 266, 10, 8854);
    			attr(div14, "class", "md:w-1/3");
    			add_location(div14, file$4, 265, 8, 8821);
    			attr(input4, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input4, "type", "text");
    			attr(input4, "placeholder", "腹部保存");
    			add_location(input4, file$4, 271, 10, 9014);
    			attr(div15, "class", "md:w-2/3");
    			add_location(div15, file$4, 270, 8, 8981);
    			attr(div16, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div16, file$4, 264, 6, 8765);
    			attr(label5, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label5, file$4, 283, 10, 9469);
    			attr(div17, "class", "md:w-1/3");
    			add_location(div17, file$4, 282, 8, 9436);
    			attr(input5, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input5, "type", "text");
    			attr(input5, "placeholder", "肠道ID");
    			add_location(input5, file$4, 288, 10, 9629);
    			attr(div18, "class", "md:w-2/3");
    			add_location(div18, file$4, 287, 8, 9596);
    			attr(div19, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div19, file$4, 281, 6, 9380);
    			attr(label6, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label6, file$4, 300, 10, 10070);
    			attr(div20, "class", "md:w-1/3");
    			add_location(div20, file$4, 299, 8, 10037);
    			attr(input6, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input6, "type", "text");
    			attr(input6, "placeholder", "肠道保存");
    			add_location(input6, file$4, 305, 10, 10230);
    			attr(div21, "class", "md:w-2/3");
    			add_location(div21, file$4, 304, 8, 10197);
    			attr(div22, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div22, file$4, 298, 6, 9981);
    			attr(label7, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label7, file$4, 317, 10, 10684);
    			attr(div23, "class", "md:w-1/3");
    			add_location(div23, file$4, 316, 8, 10651);
    			attr(input7, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input7, "type", "text");
    			attr(input7, "placeholder", "腿部ID");
    			add_location(input7, file$4, 322, 10, 10844);
    			attr(div24, "class", "md:w-2/3");
    			add_location(div24, file$4, 321, 8, 10811);
    			attr(div25, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div25, file$4, 315, 6, 10595);
    			attr(label8, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label8, file$4, 334, 10, 11285);
    			attr(div26, "class", "md:w-1/3");
    			add_location(div26, file$4, 333, 8, 11252);
    			attr(input8, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input8, "type", "text");
    			attr(input8, "placeholder", "腿部保存");
    			add_location(input8, file$4, 339, 10, 11445);
    			attr(div27, "class", "md:w-2/3");
    			add_location(div27, file$4, 338, 8, 11412);
    			attr(div28, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div28, file$4, 332, 6, 11196);
    			attr(label9, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label9, file$4, 351, 10, 11899);
    			attr(div29, "class", "md:w-1/3");
    			add_location(div29, file$4, 350, 8, 11866);
    			attr(input9, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input9, "type", "text");
    			attr(input9, "placeholder", "解剖前状态");
    			add_location(input9, file$4, 356, 10, 12060);
    			attr(div30, "class", "md:w-2/3");
    			add_location(div30, file$4, 355, 8, 12027);
    			attr(div31, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div31, file$4, 349, 6, 11810);
    			attr(label10, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label10, file$4, 368, 10, 12512);
    			attr(div32, "class", "md:w-1/3");
    			add_location(div32, file$4, 367, 8, 12479);
    			attr(input10, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input10, "type", "text");
    			attr(input10, "placeholder", "条形码");
    			add_location(input10, file$4, 373, 10, 12671);
    			attr(div33, "class", "md:w-2/3");
    			add_location(div33, file$4, 372, 8, 12638);
    			attr(div34, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div34, file$4, 366, 6, 12423);
    			attr(label11, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label11, file$4, 385, 10, 13119);
    			attr(div35, "class", "md:w-1/3");
    			add_location(div35, file$4, 384, 8, 13086);
    			attr(input11, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input11, "type", "text");
    			attr(input11, "placeholder", "盒子ID");
    			add_location(input11, file$4, 390, 10, 13279);
    			attr(div36, "class", "md:w-2/3");
    			add_location(div36, file$4, 389, 8, 13246);
    			attr(div37, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div37, file$4, 383, 6, 13030);
    			attr(label12, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label12, file$4, 402, 10, 13720);
    			attr(div38, "class", "md:w-1/3");
    			add_location(div38, file$4, 401, 8, 13687);
    			attr(input12, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input12, "type", "text");
    			attr(input12, "placeholder", "样本备注信息");
    			add_location(input12, file$4, 407, 10, 13882);
    			attr(div39, "class", "md:w-2/3");
    			add_location(div39, file$4, 406, 8, 13849);
    			attr(div40, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div40, file$4, 400, 6, 13631);
    			attr(label13, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label13, file$4, 419, 10, 14331);
    			attr(div41, "class", "md:w-1/3");
    			add_location(div41, file$4, 418, 8, 14298);
    			attr(input13, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input13, "type", "text");
    			attr(input13, "placeholder", "true | false");
    			add_location(input13, file$4, 424, 10, 14491);
    			attr(div42, "class", "md:w-2/3");
    			add_location(div42, file$4, 423, 8, 14458);
    			attr(div43, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div43, file$4, 417, 6, 14242);
    			attr(label14, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label14, file$4, 436, 10, 14956);
    			attr(div44, "class", "md:w-1/3");
    			add_location(div44, file$4, 435, 8, 14923);
    			attr(input14, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input14, "type", "text");
    			attr(input14, "placeholder", "true | false");
    			add_location(input14, file$4, 441, 10, 15117);
    			attr(div45, "class", "md:w-2/3");
    			add_location(div45, file$4, 440, 8, 15084);
    			attr(div46, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div46, file$4, 434, 6, 14867);
    			attr(label15, "class", "block text-teal-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label15, file$4, 453, 10, 15571);
    			attr(div47, "class", "md:w-1/3");
    			add_location(div47, file$4, 452, 8, 15538);
    			attr(input15, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-teal-500");
    			attr(input15, "type", "text");
    			attr(input15, "placeholder", "true | false");
    			add_location(input15, file$4, 458, 10, 15733);
    			attr(div48, "class", "md:w-2/3");
    			add_location(div48, file$4, 457, 8, 15700);
    			attr(div49, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div49, file$4, 451, 6, 15482);
    			attr(form0, "class", "w-full max-w-sm text-xs");
    			add_location(form0, file$4, 194, 4, 6280);
    			attr(div50, "class", "md:w-1/4 max-w-sm");
    			add_location(div50, file$4, 184, 2, 5943);
    			attr(p2, "class", "text-sm font-bold");
    			add_location(p2, file$4, 476, 6, 16373);
    			attr(p3, "class", "text-xs");
    			add_location(p3, file$4, 477, 6, 16419);
    			attr(div51, "class", "bg-purple-100 border-t-4 border-purple-500 rounded-b\n      text-purple-900 px-4 py-3 shadow-md my-2 ml-2 mr-3 text-center h-24");
    			add_location(div51, file$4, 473, 4, 16220);
    			attr(label16, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label16, file$4, 484, 10, 16617);
    			attr(div52, "class", "md:w-1/3");
    			add_location(div52, file$4, 483, 8, 16584);
    			attr(input16, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input16, "type", "text");
    			attr(input16, "placeholder", "蜜蜂类型");
    			add_location(input16, file$4, 489, 10, 16779);
    			attr(div53, "class", "md:w-2/3");
    			add_location(div53, file$4, 488, 8, 16746);
    			attr(div54, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div54, file$4, 482, 6, 16528);
    			attr(label17, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label17, file$4, 501, 10, 17224);
    			attr(div55, "class", "md:w-1/3");
    			add_location(div55, file$4, 500, 8, 17191);
    			attr(input17, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input17, "type", "text");
    			attr(input17, "placeholder", "饲养方式");
    			add_location(input17, file$4, 506, 10, 17386);
    			attr(div56, "class", "md:w-2/3");
    			add_location(div56, file$4, 505, 8, 17353);
    			attr(div57, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div57, file$4, 499, 6, 17135);
    			attr(label18, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label18, file$4, 518, 10, 17833);
    			attr(div58, "class", "md:w-1/3");
    			add_location(div58, file$4, 517, 8, 17800);
    			attr(input18, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input18, "type", "text");
    			attr(input18, "placeholder", "个体阶段");
    			add_location(input18, file$4, 523, 10, 17995);
    			attr(div59, "class", "md:w-2/3");
    			add_location(div59, file$4, 522, 8, 17962);
    			attr(div60, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div60, file$4, 516, 6, 17744);
    			attr(label19, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label19, file$4, 535, 10, 18442);
    			attr(div61, "class", "md:w-1/3");
    			add_location(div61, file$4, 534, 8, 18409);
    			attr(input19, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input19, "type", "text");
    			attr(input19, "placeholder", "养蜂人");
    			add_location(input19, file$4, 540, 10, 18603);
    			attr(div62, "class", "md:w-2/3");
    			add_location(div62, file$4, 539, 8, 18570);
    			attr(div63, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div63, file$4, 533, 6, 18353);
    			attr(label20, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label20, file$4, 552, 10, 19049);
    			attr(div64, "class", "md:w-1/3");
    			add_location(div64, file$4, 551, 8, 19016);
    			attr(input20, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input20, "type", "text");
    			attr(input20, "placeholder", "蜂场ID");
    			add_location(input20, file$4, 557, 10, 19211);
    			attr(div65, "class", "md:w-2/3");
    			add_location(div65, file$4, 556, 8, 19178);
    			attr(div66, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div66, file$4, 550, 6, 18960);
    			attr(label21, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label21, file$4, 569, 10, 19656);
    			attr(div67, "class", "md:w-1/3");
    			add_location(div67, file$4, 568, 8, 19623);
    			attr(input21, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input21, "type", "text");
    			attr(input21, "placeholder", "蜂箱ID");
    			add_location(input21, file$4, 574, 10, 19818);
    			attr(div68, "class", "md:w-2/3");
    			add_location(div68, file$4, 573, 8, 19785);
    			attr(div69, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div69, file$4, 567, 6, 19567);
    			attr(label22, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label22, file$4, 586, 10, 20267);
    			attr(div70, "class", "md:w-1/3");
    			add_location(div70, file$4, 585, 8, 20234);
    			attr(input22, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input22, "type", "text");
    			attr(input22, "placeholder", "蜜蜂来源");
    			add_location(input22, file$4, 591, 10, 20429);
    			attr(div71, "class", "md:w-2/3");
    			add_location(div71, file$4, 590, 8, 20396);
    			attr(div72, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div72, file$4, 584, 6, 20178);
    			attr(label23, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label23, file$4, 603, 10, 20877);
    			attr(div73, "class", "md:w-1/3");
    			add_location(div73, file$4, 602, 8, 20844);
    			attr(input23, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input23, "type", "text");
    			attr(input23, "placeholder", "蜂箱年数");
    			add_location(input23, file$4, 608, 10, 21039);
    			attr(div74, "class", "md:w-2/3");
    			add_location(div74, file$4, 607, 8, 21006);
    			attr(div75, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div75, file$4, 601, 6, 20788);
    			attr(label24, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label24, file$4, 620, 10, 21486);
    			attr(div76, "class", "md:w-1/3");
    			add_location(div76, file$4, 619, 8, 21453);
    			attr(input24, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input24, "type", "text");
    			attr(input24, "placeholder", "取蜜频率");
    			add_location(input24, file$4, 625, 10, 21648);
    			attr(div77, "class", "md:w-2/3");
    			add_location(div77, file$4, 624, 8, 21615);
    			attr(div78, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div78, file$4, 618, 6, 21397);
    			attr(label25, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label25, file$4, 637, 10, 22104);
    			attr(div79, "class", "md:w-1/3");
    			add_location(div79, file$4, 636, 8, 22071);
    			attr(input25, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input25, "type", "text");
    			attr(input25, "placeholder", "糖水频率及浓度");
    			add_location(input25, file$4, 642, 10, 22269);
    			attr(div80, "class", "md:w-2/3");
    			add_location(div80, file$4, 641, 8, 22236);
    			attr(div81, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div81, file$4, 635, 6, 22015);
    			attr(label26, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label26, file$4, 654, 10, 22723);
    			attr(div82, "class", "md:w-1/3");
    			add_location(div82, file$4, 653, 8, 22690);
    			attr(input26, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input26, "type", "text");
    			attr(input26, "placeholder", "生境");
    			add_location(input26, file$4, 659, 10, 22883);
    			attr(div83, "class", "md:w-2/3");
    			add_location(div83, file$4, 658, 8, 22850);
    			attr(div84, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div84, file$4, 652, 6, 22634);
    			attr(label27, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label27, file$4, 671, 10, 23325);
    			attr(div85, "class", "md:w-1/3");
    			add_location(div85, file$4, 670, 8, 23292);
    			attr(input27, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input27, "type", "text");
    			attr(input27, "placeholder", "访花种类");
    			add_location(input27, file$4, 676, 10, 23487);
    			attr(div86, "class", "md:w-2/3");
    			add_location(div86, file$4, 675, 8, 23454);
    			attr(div87, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div87, file$4, 669, 6, 23236);
    			attr(label28, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label28, file$4, 688, 10, 23938);
    			attr(div88, "class", "md:w-1/3");
    			add_location(div88, file$4, 687, 8, 23905);
    			attr(input28, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input28, "type", "text");
    			attr(input28, "placeholder", "true | false");
    			add_location(input28, file$4, 693, 10, 24101);
    			attr(div89, "class", "md:w-2/3");
    			add_location(div89, file$4, 692, 8, 24068);
    			attr(div90, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div90, file$4, 686, 6, 23849);
    			attr(label29, "class", "block text-purple-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label29, file$4, 705, 10, 24560);
    			attr(div91, "class", "md:w-1/3");
    			add_location(div91, file$4, 704, 8, 24527);
    			attr(input29, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-purple-500");
    			attr(input29, "type", "text");
    			attr(input29, "placeholder", "true | false");
    			add_location(input29, file$4, 710, 10, 24722);
    			attr(div92, "class", "md:w-2/3");
    			add_location(div92, file$4, 709, 8, 24689);
    			attr(div93, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div93, file$4, 703, 6, 24471);
    			attr(form1, "class", "w-full max-w-sm text-xs");
    			add_location(form1, file$4, 480, 4, 16482);
    			attr(div94, "class", " md:w-1/4 max-w-sm");
    			add_location(div94, file$4, 470, 2, 16132);
    			attr(p4, "class", "text-sm font-bold");
    			add_location(p4, file$4, 728, 6, 25349);
    			attr(p5, "class", "text-xs");
    			add_location(p5, file$4, 729, 6, 25395);
    			attr(div95, "class", "bg-green-100 border-t-4 border-green-500 rounded-b text-green-900\n      px-4 py-3 shadow-md my-2 ml-2 mr-3 text-center h-24");
    			add_location(div95, file$4, 725, 4, 25199);
    			attr(label30, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label30, file$4, 736, 10, 25582);
    			attr(div96, "class", "md:w-1/3");
    			add_location(div96, file$4, 735, 8, 25549);
    			attr(input30, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input30, "type", "text");
    			attr(input30, "placeholder", "采集人");
    			add_location(input30, file$4, 741, 10, 25742);
    			attr(div97, "class", "md:w-2/3");
    			add_location(div97, file$4, 740, 8, 25709);
    			attr(div98, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div98, file$4, 734, 6, 25493);
    			attr(label31, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label31, file$4, 753, 10, 26193);
    			attr(div99, "class", "md:w-1/3");
    			add_location(div99, file$4, 752, 8, 26160);
    			attr(input31, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input31, "type", "text");
    			attr(input31, "placeholder", "采集时间");
    			add_location(input31, file$4, 758, 10, 26354);
    			attr(div100, "class", "md:w-2/3");
    			add_location(div100, file$4, 757, 8, 26321);
    			attr(div101, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div101, file$4, 751, 6, 26104);
    			attr(label32, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label32, file$4, 770, 10, 26812);
    			attr(div102, "class", "md:w-1/3");
    			add_location(div102, file$4, 769, 8, 26779);
    			attr(input32, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input32, "type", "text");
    			attr(input32, "placeholder", "鉴定人");
    			add_location(input32, file$4, 775, 10, 26972);
    			attr(div103, "class", "md:w-2/3");
    			add_location(div103, file$4, 774, 8, 26939);
    			attr(div104, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div104, file$4, 768, 6, 26723);
    			attr(label33, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label33, file$4, 787, 10, 27422);
    			attr(div105, "class", "md:w-1/3");
    			add_location(div105, file$4, 786, 8, 27389);
    			attr(input33, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input33, "type", "text");
    			attr(input33, "placeholder", "鉴定人邮箱");
    			add_location(input33, file$4, 792, 10, 27584);
    			attr(div106, "class", "md:w-2/3");
    			add_location(div106, file$4, 791, 8, 27551);
    			attr(div107, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div107, file$4, 785, 6, 27333);
    			attr(label34, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label34, file$4, 804, 10, 28037);
    			attr(div108, "class", "md:w-1/3");
    			add_location(div108, file$4, 803, 8, 28004);
    			attr(input34, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input34, "type", "text");
    			attr(input34, "placeholder", "鉴定人单位");
    			add_location(input34, file$4, 809, 10, 28199);
    			attr(div109, "class", "md:w-2/3");
    			add_location(div109, file$4, 808, 8, 28166);
    			attr(div110, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div110, file$4, 802, 6, 27948);
    			attr(label35, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label35, file$4, 821, 10, 28658);
    			attr(div111, "class", "md:w-1/3");
    			add_location(div111, file$4, 820, 8, 28625);
    			attr(input35, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input35, "type", "text");
    			attr(input35, "placeholder", "门");
    			add_location(input35, file$4, 826, 10, 28816);
    			attr(div112, "class", "md:w-2/3");
    			add_location(div112, file$4, 825, 8, 28783);
    			attr(div113, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div113, file$4, 819, 6, 28569);
    			attr(label36, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label36, file$4, 838, 10, 29255);
    			attr(div114, "class", "md:w-1/3");
    			add_location(div114, file$4, 837, 8, 29222);
    			attr(input36, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input36, "type", "text");
    			attr(input36, "placeholder", "纲");
    			add_location(input36, file$4, 843, 10, 29413);
    			attr(div115, "class", "md:w-2/3");
    			add_location(div115, file$4, 842, 8, 29380);
    			attr(div116, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div116, file$4, 836, 6, 29166);
    			attr(label37, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label37, file$4, 855, 10, 29861);
    			attr(div117, "class", "md:w-1/3");
    			add_location(div117, file$4, 854, 8, 29828);
    			attr(input37, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input37, "type", "text");
    			attr(input37, "placeholder", "目");
    			add_location(input37, file$4, 860, 10, 30019);
    			attr(div118, "class", "md:w-2/3");
    			add_location(div118, file$4, 859, 8, 29986);
    			attr(div119, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div119, file$4, 853, 6, 29772);
    			attr(label38, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label38, file$4, 872, 10, 30457);
    			attr(div120, "class", "md:w-1/3");
    			add_location(div120, file$4, 871, 8, 30424);
    			attr(input38, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input38, "type", "text");
    			attr(input38, "placeholder", "科");
    			add_location(input38, file$4, 877, 10, 30615);
    			attr(div121, "class", "md:w-2/3");
    			add_location(div121, file$4, 876, 8, 30582);
    			attr(div122, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div122, file$4, 870, 6, 30368);
    			attr(label39, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label39, file$4, 889, 10, 31054);
    			attr(div123, "class", "md:w-1/3");
    			add_location(div123, file$4, 888, 8, 31021);
    			attr(input39, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input39, "type", "text");
    			attr(input39, "placeholder", "亚科");
    			add_location(input39, file$4, 894, 10, 31213);
    			attr(div124, "class", "md:w-2/3");
    			add_location(div124, file$4, 893, 8, 31180);
    			attr(div125, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div125, file$4, 887, 6, 30965);
    			attr(label40, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label40, file$4, 906, 10, 31656);
    			attr(div126, "class", "md:w-1/3");
    			add_location(div126, file$4, 905, 8, 31623);
    			attr(input40, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input40, "type", "text");
    			attr(input40, "placeholder", "属");
    			add_location(input40, file$4, 911, 10, 31814);
    			attr(div127, "class", "md:w-2/3");
    			add_location(div127, file$4, 910, 8, 31781);
    			attr(div128, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div128, file$4, 904, 6, 31567);
    			attr(label41, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label41, file$4, 923, 10, 32252);
    			attr(div129, "class", "md:w-1/3");
    			add_location(div129, file$4, 922, 8, 32219);
    			attr(input41, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input41, "type", "text");
    			attr(input41, "placeholder", "种");
    			add_location(input41, file$4, 928, 10, 32410);
    			attr(div130, "class", "md:w-2/3");
    			add_location(div130, file$4, 927, 8, 32377);
    			attr(div131, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div131, file$4, 921, 6, 32163);
    			attr(label42, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label42, file$4, 940, 10, 32850);
    			attr(div132, "class", "md:w-1/3");
    			add_location(div132, file$4, 939, 8, 32817);
    			attr(input42, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input42, "type", "text");
    			attr(input42, "placeholder", "亚种");
    			add_location(input42, file$4, 945, 10, 33009);
    			attr(div133, "class", "md:w-2/3");
    			add_location(div133, file$4, 944, 8, 32976);
    			attr(div134, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div134, file$4, 938, 6, 32761);
    			attr(label43, "class", "block text-green-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label43, file$4, 957, 10, 33453);
    			attr(div135, "class", "md:w-1/3");
    			add_location(div135, file$4, 956, 8, 33420);
    			attr(input43, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-green-500");
    			attr(input43, "type", "text");
    			attr(input43, "placeholder", "品种");
    			add_location(input43, file$4, 962, 10, 33612);
    			attr(div136, "class", "md:w-2/3");
    			add_location(div136, file$4, 961, 8, 33579);
    			attr(div137, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div137, file$4, 955, 6, 33364);
    			attr(form2, "class", "w-full max-w-sm text-xs");
    			add_location(form2, file$4, 732, 4, 25447);
    			attr(div138, "class", " md:w-1/4 max-w-sm");
    			add_location(div138, file$4, 722, 2, 25112);
    			attr(p6, "class", "text-sm font-bold");
    			add_location(p6, file$4, 980, 6, 34214);
    			attr(p7, "class", "text-xs");
    			add_location(p7, file$4, 981, 6, 34260);
    			attr(div139, "class", "bg-indigo-100 border-t-4 border-indigo-500 rounded-b\n      text-indigo-900 px-4 py-3 shadow-md my-2 ml-2 mr-3 text-center h-24 ");
    			add_location(div139, file$4, 977, 4, 34060);
    			attr(label44, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label44, file$4, 988, 10, 34458);
    			attr(div140, "class", "md:w-1/3");
    			add_location(div140, file$4, 987, 8, 34425);
    			attr(input44, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input44, "type", "text");
    			attr(input44, "placeholder", "大陆或大洋");
    			add_location(input44, file$4, 993, 10, 34621);
    			attr(div141, "class", "md:w-2/3");
    			add_location(div141, file$4, 992, 8, 34588);
    			attr(div142, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div142, file$4, 986, 6, 34369);
    			attr(label45, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label45, file$4, 1005, 10, 35077);
    			attr(div143, "class", "md:w-1/3");
    			add_location(div143, file$4, 1004, 8, 35044);
    			attr(input45, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input45, "type", "text");
    			attr(input45, "placeholder", "国家");
    			add_location(input45, file$4, 1010, 10, 35237);
    			attr(div144, "class", "md:w-2/3");
    			add_location(div144, file$4, 1009, 8, 35204);
    			attr(div145, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div145, file$4, 1003, 6, 34988);
    			attr(label46, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label46, file$4, 1022, 10, 35679);
    			attr(div146, "class", "md:w-1/3");
    			add_location(div146, file$4, 1021, 8, 35646);
    			attr(input46, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input46, "type", "text");
    			attr(input46, "placeholder", "州或省份");
    			add_location(input46, file$4, 1027, 10, 35841);
    			attr(div147, "class", "md:w-2/3");
    			add_location(div147, file$4, 1026, 8, 35808);
    			attr(div148, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div148, file$4, 1020, 6, 35590);
    			attr(label47, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label47, file$4, 1039, 10, 36295);
    			attr(div149, "class", "md:w-1/3");
    			add_location(div149, file$4, 1038, 8, 36262);
    			attr(input47, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input47, "type", "text");
    			attr(input47, "placeholder", "城市");
    			add_location(input47, file$4, 1044, 10, 36455);
    			attr(div150, "class", "md:w-2/3");
    			add_location(div150, file$4, 1043, 8, 36422);
    			attr(div151, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div151, file$4, 1037, 6, 36206);
    			attr(label48, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label48, file$4, 1056, 10, 36894);
    			attr(div152, "class", "md:w-1/3");
    			add_location(div152, file$4, 1055, 8, 36861);
    			attr(input48, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input48, "type", "text");
    			attr(input48, "placeholder", "鉴定人单位");
    			add_location(input48, file$4, 1061, 10, 37057);
    			attr(div153, "class", "md:w-2/3");
    			add_location(div153, file$4, 1060, 8, 37024);
    			attr(div154, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div154, file$4, 1054, 6, 36805);
    			attr(label49, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label49, file$4, 1073, 10, 37501);
    			attr(div155, "class", "md:w-1/3");
    			add_location(div155, file$4, 1072, 8, 37468);
    			attr(input49, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input49, "type", "text");
    			attr(input49, "placeholder", "详细地址");
    			add_location(input49, file$4, 1078, 10, 37663);
    			attr(div156, "class", "md:w-2/3");
    			add_location(div156, file$4, 1077, 8, 37630);
    			attr(div157, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div157, file$4, 1071, 6, 37412);
    			attr(label50, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label50, file$4, 1090, 10, 38110);
    			attr(div158, "class", "md:w-1/3");
    			add_location(div158, file$4, 1089, 8, 38077);
    			attr(input50, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input50, "type", "text");
    			attr(input50, "placeholder", "纬度");
    			add_location(input50, file$4, 1095, 10, 38270);
    			attr(div159, "class", "md:w-2/3");
    			add_location(div159, file$4, 1094, 8, 38237);
    			attr(div160, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div160, file$4, 1088, 6, 38021);
    			attr(label51, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label51, file$4, 1107, 10, 38713);
    			attr(div161, "class", "md:w-1/3");
    			add_location(div161, file$4, 1106, 8, 38680);
    			attr(input51, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input51, "type", "text");
    			attr(input51, "placeholder", "经度");
    			add_location(input51, file$4, 1112, 10, 38873);
    			attr(div162, "class", "md:w-2/3");
    			add_location(div162, file$4, 1111, 8, 38840);
    			attr(div163, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div163, file$4, 1105, 6, 38624);
    			attr(label52, "class", "block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4");
    			add_location(label52, file$4, 1124, 10, 39317);
    			attr(div164, "class", "md:w-1/3");
    			add_location(div164, file$4, 1123, 8, 39284);
    			attr(input52, "class", "bg-gray-200 appearance-none border-2 border-gray-200 rounded\n            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none\n            focus:bg-white focus:border-indigo-500");
    			attr(input52, "type", "text");
    			attr(input52, "placeholder", "海拔");
    			add_location(input52, file$4, 1129, 10, 39477);
    			attr(div165, "class", "md:w-2/3");
    			add_location(div165, file$4, 1128, 8, 39444);
    			attr(div166, "class", "md:flex md:items-center mr-6 mb-1");
    			add_location(div166, file$4, 1122, 6, 39228);
    			attr(form3, "class", "w-full max-w-sm text-xs");
    			add_location(form3, file$4, 984, 4, 34323);
    			attr(div167, "class", " md:w-1/4 max-w-sm");
    			add_location(div167, file$4, 974, 2, 33979);
    			attr(div168, "class", "flex flex-wrap mx-3 mt-4 mb-2");
    			add_location(div168, file$4, 183, 0, 5897);
    			attr(span1, "class", "text-5xl text-purple-500");
    			add_location(span1, file$4, 1145, 2, 39933);
    			attr(div169, "class", "bg-yellow-100 text-center font-bold text-xl my-2");
    			add_location(div169, file$4, 1143, 0, 39855);
    			attr(label53, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold\n        mb-2");
    			attr(label53, "for", "grid-page-size");
    			add_location(label53, file$4, 1152, 6, 40126);
    			attr(input53, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border\n        border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none\n        focus:bg-white");
    			attr(input53, "id", "grid-page-size");
    			add_location(input53, file$4, 1158, 6, 40290);
    			attr(p8, "class", "text-gray-400 ml-2 text-xs italic");
    			add_location(p8, file$4, 1164, 6, 40544);
    			attr(div170, "class", "w-full md:w-1/6 px-3 mb-6 md:mb-0");
    			add_location(div170, file$4, 1151, 4, 40072);
    			attr(label54, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold\n        mb-2");
    			attr(label54, "for", "grid-page-num");
    			add_location(label54, file$4, 1167, 6, 40661);
    			attr(input54, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border\n        border-gray-200 rounded py-1 px-4 mb-3 leading-tight focus:outline-none\n        focus:bg-white focus:border-gray-500");
    			attr(input54, "id", "grid-page-num");
    			add_location(input54, file$4, 1173, 6, 40826);
    			attr(p9, "class", "text-gray-400 ml-2 text-xs italic");
    			add_location(p9, file$4, 1179, 6, 41105);
    			attr(div171, "class", "w-full md:w-1/6 px-3");
    			add_location(div171, file$4, 1166, 4, 40620);
    			attr(input55, "class", "mr-2 leading-tight");
    			attr(input55, "type", "checkbox");
    			add_location(input55, file$4, 1185, 8, 41308);
    			attr(span2, "class", "text-sm");
    			add_location(span2, file$4, 1189, 8, 41427);
    			attr(label55, "class", "md:w-2/3 block text-gray-500 font-bold");
    			add_location(label55, file$4, 1184, 6, 41245);
    			attr(div172, "class", "w-full md:w-1/6 px-3 pt-6");
    			add_location(div172, file$4, 1183, 4, 41199);
    			attr(input56, "class", "mr-2 leading-tight");
    			attr(input56, "type", "checkbox");
    			add_location(input56, file$4, 1195, 8, 41604);
    			attr(span3, "class", "text-sm");
    			add_location(span3, file$4, 1199, 8, 41728);
    			attr(label56, "class", "md:w-2/3 block text-gray-500 font-bold");
    			add_location(label56, file$4, 1194, 6, 41541);
    			attr(div173, "class", "w-full md:w-1/6 px-3 pt-6");
    			add_location(div173, file$4, 1193, 4, 41495);
    			attr(input57, "class", "mr-2 leading-tight");
    			attr(input57, "type", "checkbox");
    			add_location(input57, file$4, 1205, 8, 41906);
    			attr(span4, "class", "text-sm");
    			add_location(span4, file$4, 1209, 8, 42023);
    			attr(label57, "class", "md:w-2/3 block text-gray-500 font-bold");
    			add_location(label57, file$4, 1204, 6, 41843);
    			attr(div174, "class", "w-full md:w-1/6 px-3 pt-6");
    			add_location(div174, file$4, 1203, 4, 41797);
    			attr(input58, "class", "mr-2 leading-tight");
    			attr(input58, "type", "checkbox");
    			add_location(input58, file$4, 1215, 8, 42201);
    			attr(span5, "class", "text-sm");
    			add_location(span5, file$4, 1219, 8, 42318);
    			attr(label58, "class", "md:w-2/3 block text-gray-500 font-bold");
    			add_location(label58, file$4, 1214, 6, 42138);
    			attr(div175, "class", "w-full md:w-1/6 px-3 pt-6");
    			add_location(div175, file$4, 1213, 4, 42092);
    			attr(div176, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div176, file$4, 1150, 2, 40028);
    			attr(form4, "class", "w-full");
    			add_location(form4, file$4, 1149, 0, 40004);
    			attr(div177, "class", "text-center mb-2 align-center");
    			add_location(div177, file$4, 1226, 0, 42401);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler),
    				listen(input5, "input", ctx.input5_input_handler),
    				listen(input6, "input", ctx.input6_input_handler),
    				listen(input7, "input", ctx.input7_input_handler),
    				listen(input8, "input", ctx.input8_input_handler),
    				listen(input9, "input", ctx.input9_input_handler),
    				listen(input10, "input", ctx.input10_input_handler),
    				listen(input11, "input", ctx.input11_input_handler),
    				listen(input12, "input", ctx.input12_input_handler),
    				listen(input13, "input", ctx.input13_input_handler),
    				listen(input14, "input", ctx.input14_input_handler),
    				listen(input15, "input", ctx.input15_input_handler),
    				listen(input16, "input", ctx.input16_input_handler),
    				listen(input17, "input", ctx.input17_input_handler),
    				listen(input18, "input", ctx.input18_input_handler),
    				listen(input19, "input", ctx.input19_input_handler),
    				listen(input20, "input", ctx.input20_input_handler),
    				listen(input21, "input", ctx.input21_input_handler),
    				listen(input22, "input", ctx.input22_input_handler),
    				listen(input23, "input", ctx.input23_input_handler),
    				listen(input24, "input", ctx.input24_input_handler),
    				listen(input25, "input", ctx.input25_input_handler),
    				listen(input26, "input", ctx.input26_input_handler),
    				listen(input27, "input", ctx.input27_input_handler),
    				listen(input28, "input", ctx.input28_input_handler),
    				listen(input29, "input", ctx.input29_input_handler),
    				listen(input30, "input", ctx.input30_input_handler),
    				listen(input31, "input", ctx.input31_input_handler),
    				listen(input32, "input", ctx.input32_input_handler),
    				listen(input33, "input", ctx.input33_input_handler),
    				listen(input34, "input", ctx.input34_input_handler),
    				listen(input35, "input", ctx.input35_input_handler),
    				listen(input36, "input", ctx.input36_input_handler),
    				listen(input37, "input", ctx.input37_input_handler),
    				listen(input38, "input", ctx.input38_input_handler),
    				listen(input39, "input", ctx.input39_input_handler),
    				listen(input40, "input", ctx.input40_input_handler),
    				listen(input41, "input", ctx.input41_input_handler),
    				listen(input42, "input", ctx.input42_input_handler),
    				listen(input43, "input", ctx.input43_input_handler),
    				listen(input44, "input", ctx.input44_input_handler),
    				listen(input45, "input", ctx.input45_input_handler),
    				listen(input46, "input", ctx.input46_input_handler),
    				listen(input47, "input", ctx.input47_input_handler),
    				listen(input48, "input", ctx.input48_input_handler),
    				listen(input49, "input", ctx.input49_input_handler),
    				listen(input50, "input", ctx.input50_input_handler),
    				listen(input51, "input", ctx.input51_input_handler),
    				listen(input52, "input", ctx.input52_input_handler),
    				listen(input53, "input", ctx.input53_input_handler),
    				listen(input54, "input", ctx.input54_input_handler),
    				listen(input55, "change", ctx.input55_change_handler),
    				listen(input56, "change", ctx.input56_change_handler),
    				listen(input57, "change", ctx.input57_change_handler),
    				listen(input58, "change", ctx.input58_change_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			append(document.head, link0);
    			append(document.head, link1);
    			insert(target, t0, anchor);
    			insert(target, div0, anchor);
    			append(div0, t1);
    			append(div0, span0);
    			append(span0, t2);
    			append(div0, t3);
    			insert(target, t4, anchor);
    			insert(target, div168, anchor);
    			append(div168, div50);
    			append(div50, div1);
    			append(div1, p0);
    			append(div1, t6);
    			append(div1, p1);
    			append(div50, t8);
    			append(div50, form0);
    			append(form0, div4);
    			append(div4, div2);
    			append(div2, label0);
    			append(div4, t10);
    			append(div4, div3);
    			append(div3, input0);

    			input0.value = ctx.filters.sample_id.value;

    			append(form0, t11);
    			append(form0, div7);
    			append(div7, div5);
    			append(div5, label1);
    			append(div7, t13);
    			append(div7, div6);
    			append(div6, input1);

    			input1.value = ctx.filters.head_chest_id.value;

    			append(form0, t14);
    			append(form0, div10);
    			append(div10, div8);
    			append(div8, label2);
    			append(div10, t16);
    			append(div10, div9);
    			append(div9, input2);

    			input2.value = ctx.filters.head_chest_perserve_way.value;

    			append(form0, t17);
    			append(form0, div13);
    			append(div13, div11);
    			append(div11, label3);
    			append(div13, t19);
    			append(div13, div12);
    			append(div12, input3);

    			input3.value = ctx.filters.abdomen_id.value;

    			append(form0, t20);
    			append(form0, div16);
    			append(div16, div14);
    			append(div14, label4);
    			append(div16, t22);
    			append(div16, div15);
    			append(div15, input4);

    			input4.value = ctx.filters.abdomen_preserve_way.value;

    			append(form0, t23);
    			append(form0, div19);
    			append(div19, div17);
    			append(div17, label5);
    			append(div19, t25);
    			append(div19, div18);
    			append(div18, input5);

    			input5.value = ctx.filters.gut_id.value;

    			append(form0, t26);
    			append(form0, div22);
    			append(div22, div20);
    			append(div20, label6);
    			append(div22, t28);
    			append(div22, div21);
    			append(div21, input6);

    			input6.value = ctx.filters.gut_id_preserve_way.value;

    			append(form0, t29);
    			append(form0, div25);
    			append(div25, div23);
    			append(div23, label7);
    			append(div25, t31);
    			append(div25, div24);
    			append(div24, input7);

    			input7.value = ctx.filters.leg_id.value;

    			append(form0, t32);
    			append(form0, div28);
    			append(div28, div26);
    			append(div26, label8);
    			append(div28, t34);
    			append(div28, div27);
    			append(div27, input8);

    			input8.value = ctx.filters.leg_id_preserve_way.value;

    			append(form0, t35);
    			append(form0, div31);
    			append(div31, div29);
    			append(div29, label9);
    			append(div31, t37);
    			append(div31, div30);
    			append(div30, input9);

    			input9.value = ctx.filters.dissection_state.value;

    			append(form0, t38);
    			append(form0, div34);
    			append(div34, div32);
    			append(div32, label10);
    			append(div34, t40);
    			append(div34, div33);
    			append(div33, input10);

    			input10.value = ctx.filters.sample_barcode.value;

    			append(form0, t41);
    			append(form0, div37);
    			append(div37, div35);
    			append(div35, label11);
    			append(div37, t43);
    			append(div37, div36);
    			append(div36, input11);

    			input11.value = ctx.filters.box_id.value;

    			append(form0, t44);
    			append(form0, div40);
    			append(div40, div38);
    			append(div38, label12);
    			append(div40, t46);
    			append(div40, div39);
    			append(div39, input12);

    			input12.value = ctx.filters.sample_notes.value;

    			append(form0, t47);
    			append(form0, div43);
    			append(div43, div41);
    			append(div41, label13);
    			append(div43, t49);
    			append(div43, div42);
    			append(div42, input13);

    			input13.value = ctx.filters.isolated_strain_or_not.value;

    			append(form0, t50);
    			append(form0, div46);
    			append(div46, div44);
    			append(div44, label14);
    			append(div46, t52);
    			append(div46, div45);
    			append(div45, input14);

    			input14.value = ctx.filters.used_or_not.value;

    			append(form0, t53);
    			append(form0, div49);
    			append(div49, div47);
    			append(div47, label15);
    			append(div49, t55);
    			append(div49, div48);
    			append(div48, input15);

    			input15.value = ctx.filters.multi_sample_one_tube_or_not.value;

    			append(div168, t56);
    			append(div168, div94);
    			append(div94, div51);
    			append(div51, p2);
    			append(div51, t58);
    			append(div51, p3);
    			append(div94, t60);
    			append(div94, form1);
    			append(form1, div54);
    			append(div54, div52);
    			append(div52, label16);
    			append(div54, t62);
    			append(div54, div53);
    			append(div53, input16);

    			input16.value = ctx.filters.bee_type.value;

    			append(form1, t63);
    			append(form1, div57);
    			append(div57, div55);
    			append(div55, label17);
    			append(div57, t65);
    			append(div57, div56);
    			append(div56, input17);

    			input17.value = ctx.filters.life_style.value;

    			append(form1, t66);
    			append(form1, div60);
    			append(div60, div58);
    			append(div58, label18);
    			append(div60, t68);
    			append(div60, div59);
    			append(div59, input18);

    			input18.value = ctx.filters.life_stage.value;

    			append(form1, t69);
    			append(form1, div63);
    			append(div63, div61);
    			append(div61, label19);
    			append(div63, t71);
    			append(div63, div62);
    			append(div62, input19);

    			input19.value = ctx.filters.beekeepers.value;

    			append(form1, t72);
    			append(form1, div66);
    			append(div66, div64);
    			append(div64, label20);
    			append(div66, t74);
    			append(div66, div65);
    			append(div65, input20);

    			input20.value = ctx.filters.filed_id.value;

    			append(form1, t75);
    			append(form1, div69);
    			append(div69, div67);
    			append(div67, label21);
    			append(div69, t77);
    			append(div69, div68);
    			append(div68, input21);

    			input21.value = ctx.filters.field_box_id.value;

    			append(form1, t78);
    			append(form1, div72);
    			append(div72, div70);
    			append(div70, label22);
    			append(div72, t80);
    			append(div72, div71);
    			append(div71, input22);

    			input22.value = ctx.filters.bost_origin.value;

    			append(form1, t81);
    			append(form1, div75);
    			append(div75, div73);
    			append(div73, label23);
    			append(div75, t83);
    			append(div75, div74);
    			append(div74, input23);

    			input23.value = ctx.filters.frame_year.value;

    			append(form1, t84);
    			append(form1, div78);
    			append(div78, div76);
    			append(div76, label24);
    			append(div78, t86);
    			append(div78, div77);
    			append(div77, input24);

    			input24.value = ctx.filters.decapping_frequency.value;

    			append(form1, t87);
    			append(form1, div81);
    			append(div81, div79);
    			append(div79, label25);
    			append(div81, t89);
    			append(div81, div80);
    			append(div80, input25);

    			input25.value = ctx.filters.sucroese_notes.value;

    			append(form1, t90);
    			append(form1, div84);
    			append(div84, div82);
    			append(div82, label26);
    			append(div84, t92);
    			append(div84, div83);
    			append(div83, input26);

    			input26.value = ctx.filters.habitat.value;

    			append(form1, t93);
    			append(form1, div87);
    			append(div87, div85);
    			append(div85, label27);
    			append(div87, t95);
    			append(div87, div86);
    			append(div86, input27);

    			input27.value = ctx.filters.flower_species.value;

    			append(form1, t96);
    			append(form1, div90);
    			append(div90, div88);
    			append(div88, label28);
    			append(div90, t98);
    			append(div90, div89);
    			append(div89, input28);

    			input28.value = ctx.filters.sucrose_or_not.value;

    			append(form1, t99);
    			append(form1, div93);
    			append(div93, div91);
    			append(div91, label29);
    			append(div93, t101);
    			append(div93, div92);
    			append(div92, input29);

    			input29.value = ctx.filters.presticide_or_not.value;

    			append(div168, t102);
    			append(div168, div138);
    			append(div138, div95);
    			append(div95, p4);
    			append(div95, t104);
    			append(div95, p5);
    			append(div138, t106);
    			append(div138, form2);
    			append(form2, div98);
    			append(div98, div96);
    			append(div96, label30);
    			append(div98, t108);
    			append(div98, div97);
    			append(div97, input30);

    			input30.value = ctx.filters.sample_collector.value;

    			append(form2, t109);
    			append(form2, div101);
    			append(div101, div99);
    			append(div99, label31);
    			append(div101, t111);
    			append(div101, div100);
    			append(div100, input31);

    			input31.value = ctx.filters.sample_collection_date.value;

    			append(form2, t112);
    			append(form2, div104);
    			append(div104, div102);
    			append(div102, label32);
    			append(div104, t114);
    			append(div104, div103);
    			append(div103, input32);

    			input32.value = ctx.filters.identifier_name.value;

    			append(form2, t115);
    			append(form2, div107);
    			append(div107, div105);
    			append(div105, label33);
    			append(div107, t117);
    			append(div107, div106);
    			append(div106, input33);

    			input33.value = ctx.filters.identifier_email.value;

    			append(form2, t118);
    			append(form2, div110);
    			append(div110, div108);
    			append(div108, label34);
    			append(div110, t120);
    			append(div110, div109);
    			append(div109, input34);

    			input34.value = ctx.filters.identifier_institution.value;

    			append(form2, t121);
    			append(form2, div113);
    			append(div113, div111);
    			append(div111, label35);
    			append(div113, t123);
    			append(div113, div112);
    			append(div112, input35);

    			input35.value = ctx.filters.phylum.value;

    			append(form2, t124);
    			append(form2, div116);
    			append(div116, div114);
    			append(div114, label36);
    			append(div116, t126);
    			append(div116, div115);
    			append(div115, input36);

    			input36.value = ctx.filters.class_evolution.value;

    			append(form2, t127);
    			append(form2, div119);
    			append(div119, div117);
    			append(div117, label37);
    			append(div119, t129);
    			append(div119, div118);
    			append(div118, input37);

    			input37.value = ctx.filters.order.value;

    			append(form2, t130);
    			append(form2, div122);
    			append(div122, div120);
    			append(div120, label38);
    			append(div122, t132);
    			append(div122, div121);
    			append(div121, input38);

    			input38.value = ctx.filters.family.value;

    			append(form2, t133);
    			append(form2, div125);
    			append(div125, div123);
    			append(div123, label39);
    			append(div125, t135);
    			append(div125, div124);
    			append(div124, input39);

    			input39.value = ctx.filters.subfamily.value;

    			append(form2, t136);
    			append(form2, div128);
    			append(div128, div126);
    			append(div126, label40);
    			append(div128, t138);
    			append(div128, div127);
    			append(div127, input40);

    			input40.value = ctx.filters.genus.value;

    			append(form2, t139);
    			append(form2, div131);
    			append(div131, div129);
    			append(div129, label41);
    			append(div131, t141);
    			append(div131, div130);
    			append(div130, input41);

    			input41.value = ctx.filters.species.value;

    			append(form2, t142);
    			append(form2, div134);
    			append(div134, div132);
    			append(div132, label42);
    			append(div134, t144);
    			append(div134, div133);
    			append(div133, input42);

    			input42.value = ctx.filters.subspecies.value;

    			append(form2, t145);
    			append(form2, div137);
    			append(div137, div135);
    			append(div135, label43);
    			append(div137, t147);
    			append(div137, div136);
    			append(div136, input43);

    			input43.value = ctx.filters.breed.value;

    			append(div168, t148);
    			append(div168, div167);
    			append(div167, div139);
    			append(div139, p6);
    			append(div139, t150);
    			append(div139, p7);
    			append(div167, t152);
    			append(div167, form3);
    			append(form3, div142);
    			append(div142, div140);
    			append(div140, label44);
    			append(div142, t154);
    			append(div142, div141);
    			append(div141, input44);

    			input44.value = ctx.filters.continent_or_ocean.value;

    			append(form3, t155);
    			append(form3, div145);
    			append(div145, div143);
    			append(div143, label45);
    			append(div145, t157);
    			append(div145, div144);
    			append(div144, input45);

    			input45.value = ctx.filters.country.value;

    			append(form3, t158);
    			append(form3, div148);
    			append(div148, div146);
    			append(div146, label46);
    			append(div148, t160);
    			append(div148, div147);
    			append(div147, input46);

    			input46.value = ctx.filters.state_or_province.value;

    			append(form3, t161);
    			append(form3, div151);
    			append(div151, div149);
    			append(div149, label47);
    			append(div151, t163);
    			append(div151, div150);
    			append(div150, input47);

    			input47.value = ctx.filters.city.value;

    			append(form3, t164);
    			append(form3, div154);
    			append(div154, div152);
    			append(div152, label48);
    			append(div154, t166);
    			append(div154, div153);
    			append(div153, input48);

    			input48.value = ctx.filters.county.value;

    			append(form3, t167);
    			append(form3, div157);
    			append(div157, div155);
    			append(div155, label49);
    			append(div157, t169);
    			append(div157, div156);
    			append(div156, input49);

    			input49.value = ctx.filters.exact_site.value;

    			append(form3, t170);
    			append(form3, div160);
    			append(div160, div158);
    			append(div158, label50);
    			append(div160, t172);
    			append(div160, div159);
    			append(div159, input50);

    			input50.value = ctx.filters.latitude.value;

    			append(form3, t173);
    			append(form3, div163);
    			append(div163, div161);
    			append(div161, label51);
    			append(div163, t175);
    			append(div163, div162);
    			append(div162, input51);

    			input51.value = ctx.filters.longitude.value;

    			append(form3, t176);
    			append(form3, div166);
    			append(div166, div164);
    			append(div164, label52);
    			append(div166, t178);
    			append(div166, div165);
    			append(div165, input52);

    			input52.value = ctx.filters.elevation.value;

    			insert(target, t179, anchor);
    			insert(target, div169, anchor);
    			append(div169, t180);
    			append(div169, span1);
    			append(span1, t181);
    			append(div169, t182);
    			insert(target, t183, anchor);
    			insert(target, form4, anchor);
    			append(form4, div176);
    			append(div176, div170);
    			append(div170, label53);
    			append(div170, t185);
    			append(div170, input53);

    			input53.value = ctx.pageSize;

    			append(div170, t186);
    			append(div170, p8);
    			append(div176, t188);
    			append(div176, div171);
    			append(div171, label54);
    			append(div171, t190);
    			append(div171, input54);

    			input54.value = ctx.currentPage;

    			append(div171, t191);
    			append(div171, p9);
    			append(div176, t193);
    			append(div176, div172);
    			append(div172, label55);
    			append(label55, input55);

    			input55.checked = ctx.displayStore;

    			append(label55, t194);
    			append(label55, span2);
    			append(div176, t196);
    			append(div176, div173);
    			append(div173, label56);
    			append(label56, input56);

    			input56.checked = ctx.displayBackground;

    			append(label56, t197);
    			append(label56, span3);
    			append(div176, t199);
    			append(div176, div174);
    			append(div174, label57);
    			append(label57, input57);

    			input57.checked = ctx.displayEvo;

    			append(label57, t200);
    			append(label57, span4);
    			append(div176, t202);
    			append(div176, div175);
    			append(div175, label58);
    			append(label58, input58);

    			input58.checked = ctx.displayGeo;

    			append(label58, t203);
    			append(label58, span5);
    			insert(target, t205, anchor);
    			insert(target, div177, anchor);
    			mount_component(spagination0, div177, null);
    			insert(target, t206, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t207, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t208, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t209, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert(target, t210, anchor);
    			mount_component(spagination1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.totalNum) {
    				set_data(t2, ctx.totalNum);
    			}

    			if (changed.filters && (input0.value !== ctx.filters.sample_id.value)) input0.value = ctx.filters.sample_id.value;
    			if (changed.filters && (input1.value !== ctx.filters.head_chest_id.value)) input1.value = ctx.filters.head_chest_id.value;
    			if (changed.filters && (input2.value !== ctx.filters.head_chest_perserve_way.value)) input2.value = ctx.filters.head_chest_perserve_way.value;
    			if (changed.filters && (input3.value !== ctx.filters.abdomen_id.value)) input3.value = ctx.filters.abdomen_id.value;
    			if (changed.filters && (input4.value !== ctx.filters.abdomen_preserve_way.value)) input4.value = ctx.filters.abdomen_preserve_way.value;
    			if (changed.filters && (input5.value !== ctx.filters.gut_id.value)) input5.value = ctx.filters.gut_id.value;
    			if (changed.filters && (input6.value !== ctx.filters.gut_id_preserve_way.value)) input6.value = ctx.filters.gut_id_preserve_way.value;
    			if (changed.filters && (input7.value !== ctx.filters.leg_id.value)) input7.value = ctx.filters.leg_id.value;
    			if (changed.filters && (input8.value !== ctx.filters.leg_id_preserve_way.value)) input8.value = ctx.filters.leg_id_preserve_way.value;
    			if (changed.filters && (input9.value !== ctx.filters.dissection_state.value)) input9.value = ctx.filters.dissection_state.value;
    			if (changed.filters && (input10.value !== ctx.filters.sample_barcode.value)) input10.value = ctx.filters.sample_barcode.value;
    			if (changed.filters && (input11.value !== ctx.filters.box_id.value)) input11.value = ctx.filters.box_id.value;
    			if (changed.filters && (input12.value !== ctx.filters.sample_notes.value)) input12.value = ctx.filters.sample_notes.value;
    			if (changed.filters && (input13.value !== ctx.filters.isolated_strain_or_not.value)) input13.value = ctx.filters.isolated_strain_or_not.value;
    			if (changed.filters && (input14.value !== ctx.filters.used_or_not.value)) input14.value = ctx.filters.used_or_not.value;
    			if (changed.filters && (input15.value !== ctx.filters.multi_sample_one_tube_or_not.value)) input15.value = ctx.filters.multi_sample_one_tube_or_not.value;
    			if (changed.filters && (input16.value !== ctx.filters.bee_type.value)) input16.value = ctx.filters.bee_type.value;
    			if (changed.filters && (input17.value !== ctx.filters.life_style.value)) input17.value = ctx.filters.life_style.value;
    			if (changed.filters && (input18.value !== ctx.filters.life_stage.value)) input18.value = ctx.filters.life_stage.value;
    			if (changed.filters && (input19.value !== ctx.filters.beekeepers.value)) input19.value = ctx.filters.beekeepers.value;
    			if (changed.filters && (input20.value !== ctx.filters.filed_id.value)) input20.value = ctx.filters.filed_id.value;
    			if (changed.filters && (input21.value !== ctx.filters.field_box_id.value)) input21.value = ctx.filters.field_box_id.value;
    			if (changed.filters && (input22.value !== ctx.filters.bost_origin.value)) input22.value = ctx.filters.bost_origin.value;
    			if (changed.filters && (input23.value !== ctx.filters.frame_year.value)) input23.value = ctx.filters.frame_year.value;
    			if (changed.filters && (input24.value !== ctx.filters.decapping_frequency.value)) input24.value = ctx.filters.decapping_frequency.value;
    			if (changed.filters && (input25.value !== ctx.filters.sucroese_notes.value)) input25.value = ctx.filters.sucroese_notes.value;
    			if (changed.filters && (input26.value !== ctx.filters.habitat.value)) input26.value = ctx.filters.habitat.value;
    			if (changed.filters && (input27.value !== ctx.filters.flower_species.value)) input27.value = ctx.filters.flower_species.value;
    			if (changed.filters && (input28.value !== ctx.filters.sucrose_or_not.value)) input28.value = ctx.filters.sucrose_or_not.value;
    			if (changed.filters && (input29.value !== ctx.filters.presticide_or_not.value)) input29.value = ctx.filters.presticide_or_not.value;
    			if (changed.filters && (input30.value !== ctx.filters.sample_collector.value)) input30.value = ctx.filters.sample_collector.value;
    			if (changed.filters && (input31.value !== ctx.filters.sample_collection_date.value)) input31.value = ctx.filters.sample_collection_date.value;
    			if (changed.filters && (input32.value !== ctx.filters.identifier_name.value)) input32.value = ctx.filters.identifier_name.value;
    			if (changed.filters && (input33.value !== ctx.filters.identifier_email.value)) input33.value = ctx.filters.identifier_email.value;
    			if (changed.filters && (input34.value !== ctx.filters.identifier_institution.value)) input34.value = ctx.filters.identifier_institution.value;
    			if (changed.filters && (input35.value !== ctx.filters.phylum.value)) input35.value = ctx.filters.phylum.value;
    			if (changed.filters && (input36.value !== ctx.filters.class_evolution.value)) input36.value = ctx.filters.class_evolution.value;
    			if (changed.filters && (input37.value !== ctx.filters.order.value)) input37.value = ctx.filters.order.value;
    			if (changed.filters && (input38.value !== ctx.filters.family.value)) input38.value = ctx.filters.family.value;
    			if (changed.filters && (input39.value !== ctx.filters.subfamily.value)) input39.value = ctx.filters.subfamily.value;
    			if (changed.filters && (input40.value !== ctx.filters.genus.value)) input40.value = ctx.filters.genus.value;
    			if (changed.filters && (input41.value !== ctx.filters.species.value)) input41.value = ctx.filters.species.value;
    			if (changed.filters && (input42.value !== ctx.filters.subspecies.value)) input42.value = ctx.filters.subspecies.value;
    			if (changed.filters && (input43.value !== ctx.filters.breed.value)) input43.value = ctx.filters.breed.value;
    			if (changed.filters && (input44.value !== ctx.filters.continent_or_ocean.value)) input44.value = ctx.filters.continent_or_ocean.value;
    			if (changed.filters && (input45.value !== ctx.filters.country.value)) input45.value = ctx.filters.country.value;
    			if (changed.filters && (input46.value !== ctx.filters.state_or_province.value)) input46.value = ctx.filters.state_or_province.value;
    			if (changed.filters && (input47.value !== ctx.filters.city.value)) input47.value = ctx.filters.city.value;
    			if (changed.filters && (input48.value !== ctx.filters.county.value)) input48.value = ctx.filters.county.value;
    			if (changed.filters && (input49.value !== ctx.filters.exact_site.value)) input49.value = ctx.filters.exact_site.value;
    			if (changed.filters && (input50.value !== ctx.filters.latitude.value)) input50.value = ctx.filters.latitude.value;
    			if (changed.filters && (input51.value !== ctx.filters.longitude.value)) input51.value = ctx.filters.longitude.value;
    			if (changed.filters && (input52.value !== ctx.filters.elevation.value)) input52.value = ctx.filters.elevation.value;

    			if (!current || changed.totalNum) {
    				set_data(t181, ctx.totalNum);
    			}

    			if (changed.pageSize && (input53.value !== ctx.pageSize)) input53.value = ctx.pageSize;
    			if (changed.currentPage && (input54.value !== ctx.currentPage)) input54.value = ctx.currentPage;
    			if (changed.displayStore) input55.checked = ctx.displayStore;
    			if (changed.displayBackground) input56.checked = ctx.displayBackground;
    			if (changed.displayEvo) input57.checked = ctx.displayEvo;
    			if (changed.displayGeo) input58.checked = ctx.displayGeo;

    			var spagination0_changes = {};
    			if (changed.totalPages) spagination0_changes.totalPages = ctx.totalPages;
    			if (!updating_currentPage && changed.currentPage) {
    				spagination0_changes.currentPage = ctx.currentPage;
    			}
    			spagination0.$set(spagination0_changes);

    			if (ctx.displayStore) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t207.parentNode, t207);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (ctx.displayBackground) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t208.parentNode, t208);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (ctx.displayEvo) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t209.parentNode, t209);
    				}
    			} else if (if_block2) {
    				group_outros();
    				transition_out(if_block2, 1, () => {
    					if_block2 = null;
    				});
    				check_outros();
    			}

    			if (ctx.displayGeo) {
    				if (if_block3) {
    					if_block3.p(changed, ctx);
    					transition_in(if_block3, 1);
    				} else {
    					if_block3 = create_if_block$2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t210.parentNode, t210);
    				}
    			} else if (if_block3) {
    				group_outros();
    				transition_out(if_block3, 1, () => {
    					if_block3 = null;
    				});
    				check_outros();
    			}

    			var spagination1_changes = {};
    			if (changed.totalPages) spagination1_changes.totalPages = ctx.totalPages;
    			if (!updating_currentPage_1 && changed.currentPage) {
    				spagination1_changes.currentPage = ctx.currentPage;
    			}
    			spagination1.$set(spagination1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(spagination0.$$.fragment, local);

    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);

    			transition_in(spagination1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(spagination0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(spagination1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			detach(link0);
    			detach(link1);

    			if (detaching) {
    				detach(t0);
    				detach(div0);
    				detach(t4);
    				detach(div168);
    				detach(t179);
    				detach(div169);
    				detach(t183);
    				detach(form4);
    				detach(t205);
    				detach(div177);
    			}

    			destroy_component(spagination0, );

    			if (detaching) {
    				detach(t206);
    			}

    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach(t207);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(t208);
    			}

    			if (if_block2) if_block2.d(detaching);

    			if (detaching) {
    				detach(t209);
    			}

    			if (if_block3) if_block3.d(detaching);

    			if (detaching) {
    				detach(t210);
    			}

    			destroy_component(spagination1, detaching);

    			run_all(dispose);
    		}
    	};
    }

    const apiURL = "http://127.0.0.1:8000/api/samples/";

    function instance$4($$self, $$props, $$invalidate) {
    	

      //   import FilterSampleStore from "./FilterSampleStore.svelte";
      //   import FilterSampleBackground from "./FilterSampleBackground.svelte";
      //   import FilterSampleEvolution from "./FilterSampleEvolution.svelte";
      //   import FilterSampleGeo from "./FilterSampleGeo.svelte";

      let { name } = $$props;
      let data = [];
      let totalNum;
      onMount(async function() {
        const response = await fetch(apiURL);
        $$invalidate('data', data = await response.json());
        console.log(data);
      });

      let displayStore = true;
      let displayBackground = true;
      let displayEvo = true;
      let displayGeo = true;

      let filters = {
        sample_id: { value: "", keys: ["sample_id"] },
        head_chest_id: { value: "", keys: ["head_chest_id"] },
        head_chest_perserve_way: { value: "", keys: ["head_chest_preserve_way"] },
        abdomen_id: { value: "", keys: ["abdomen_id"] },
        abdomen_preserve_way: { value: "", keys: ["abdomen_preserve_way"] },
        gut_id: { value: "", keys: ["gut_id"] },
        gut_id_preserve_way: { value: "", keys: ["gut_id_preserve_way"] },
        isolated_strain_or_not: { value: "", keys: ["isolated_strain_or_not"] },
        leg_id: { value: "", keys: ["leg_id"] },
        leg_id_preserve_way: { value: "", keys: ["leg_id_preserve_way"] },
        used_or_not: { value: "", keys: ["used_or_not"] },
        dissection_state: { value: "", keys: ["dissection_state"] },
        multi_sample_one_tube_or_not: {
          value: "",
          keys: ["multi_sample_one_tube_or_not"]
        },
        sample_barcode: { value: "", keys: ["sample_barcode"] },
        box_id: { value: "", keys: ["box_id"] },
        sample_collector: { value: "", keys: ["sample_collector"] },
        sample_collection_date: { value: "", keys: ["sample_collection_date"] },
        bee_type: { value: "", keys: ["bee_type"] },
        life_style: { value: "", keys: ["life_style"] },
        life_stage: { value: "", keys: ["life_stage"] },
        beekeepers: { value: "", keys: ["beekeepers"] },
        filed_id: { value: "", keys: ["filed_id"] },
        field_box_id: { value: "", keys: ["field_box_id"] },
        bost_origin: { value: "", keys: ["bost_origin"] },
        frame_year: { value: "", keys: ["frame_year"] },
        decapping_frequency: { value: "", keys: ["decapping_frequency"] },
        sucrose_or_not: { value: "", keys: ["sucrose_or_not"] },
        sucroese_notes: { value: "", keys: ["sucroese_notes"] },
        habitat: { value: "", keys: ["habitat"] },
        presticide_or_not: { value: "", keys: ["presticide_or_not"] },
        flower_species: { value: "", keys: ["flower_species"] },
        identifier_name: { value: "", keys: ["identifier_name"] },
        identifier_email: { value: "", keys: ["identifier_email"] },
        identifier_institution: { value: "", keys: ["identifier_institution"] },
        phylum: { value: "", keys: ["phylum"] },
        class_evolution: { value: "", keys: ["class_evolution"] },
        order: { value: "", keys: ["order"] },
        family: { value: "", keys: ["family"] },
        subfamily: { value: "", keys: ["subfamily"] },
        genus: { value: "", keys: ["genus"] },
        species: { value: "", keys: ["species"] },
        subspecies: { value: "", keys: ["subspecies"] },
        breed: { value: "", keys: ["breed"] },
        continent_or_ocean: { value: "", keys: ["continent_or_ocean"] },
        country: { value: "", keys: ["country"] },
        state_or_province: { value: "", keys: ["state_or_province"] },
        city: { value: "", keys: ["city"] },
        county: { value: "", keys: ["county"] },
        exact_site: { value: "", keys: ["exact_site"] },
        latitude: { value: "", keys: ["latitude"] },
        longitude: { value: "", keys: ["longitude"] },
        elevation: { value: "", keys: ["elevation"] },
        sample_notes: { value: "", keys: ["sample_notes"] }
      };

      let pageSize = 5;
      let totalPages = 0;
      let currentPage = 1;

      function totalPagesChanged(e) {
        $$invalidate('totalPages', totalPages = e.detail);
      }

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		filters.sample_id.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input1_input_handler() {
    		filters.head_chest_id.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input2_input_handler() {
    		filters.head_chest_perserve_way.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input3_input_handler() {
    		filters.abdomen_id.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input4_input_handler() {
    		filters.abdomen_preserve_way.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input5_input_handler() {
    		filters.gut_id.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input6_input_handler() {
    		filters.gut_id_preserve_way.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input7_input_handler() {
    		filters.leg_id.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input8_input_handler() {
    		filters.leg_id_preserve_way.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input9_input_handler() {
    		filters.dissection_state.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input10_input_handler() {
    		filters.sample_barcode.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input11_input_handler() {
    		filters.box_id.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input12_input_handler() {
    		filters.sample_notes.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input13_input_handler() {
    		filters.isolated_strain_or_not.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input14_input_handler() {
    		filters.used_or_not.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input15_input_handler() {
    		filters.multi_sample_one_tube_or_not.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input16_input_handler() {
    		filters.bee_type.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input17_input_handler() {
    		filters.life_style.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input18_input_handler() {
    		filters.life_stage.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input19_input_handler() {
    		filters.beekeepers.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input20_input_handler() {
    		filters.filed_id.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input21_input_handler() {
    		filters.field_box_id.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input22_input_handler() {
    		filters.bost_origin.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input23_input_handler() {
    		filters.frame_year.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input24_input_handler() {
    		filters.decapping_frequency.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input25_input_handler() {
    		filters.sucroese_notes.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input26_input_handler() {
    		filters.habitat.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input27_input_handler() {
    		filters.flower_species.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input28_input_handler() {
    		filters.sucrose_or_not.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input29_input_handler() {
    		filters.presticide_or_not.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input30_input_handler() {
    		filters.sample_collector.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input31_input_handler() {
    		filters.sample_collection_date.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input32_input_handler() {
    		filters.identifier_name.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input33_input_handler() {
    		filters.identifier_email.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input34_input_handler() {
    		filters.identifier_institution.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input35_input_handler() {
    		filters.phylum.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input36_input_handler() {
    		filters.class_evolution.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input37_input_handler() {
    		filters.order.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input38_input_handler() {
    		filters.family.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input39_input_handler() {
    		filters.subfamily.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input40_input_handler() {
    		filters.genus.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input41_input_handler() {
    		filters.species.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input42_input_handler() {
    		filters.subspecies.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input43_input_handler() {
    		filters.breed.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input44_input_handler() {
    		filters.continent_or_ocean.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input45_input_handler() {
    		filters.country.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input46_input_handler() {
    		filters.state_or_province.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input47_input_handler() {
    		filters.city.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input48_input_handler() {
    		filters.county.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input49_input_handler() {
    		filters.exact_site.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input50_input_handler() {
    		filters.latitude.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input51_input_handler() {
    		filters.longitude.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input52_input_handler() {
    		filters.elevation.value = this.value;
    		$$invalidate('filters', filters);
    	}

    	function input53_input_handler() {
    		pageSize = this.value;
    		$$invalidate('pageSize', pageSize);
    	}

    	function input54_input_handler() {
    		currentPage = this.value;
    		$$invalidate('currentPage', currentPage);
    	}

    	function input55_change_handler() {
    		displayStore = this.checked;
    		$$invalidate('displayStore', displayStore);
    	}

    	function input56_change_handler() {
    		displayBackground = this.checked;
    		$$invalidate('displayBackground', displayBackground);
    	}

    	function input57_change_handler() {
    		displayEvo = this.checked;
    		$$invalidate('displayEvo', displayEvo);
    	}

    	function input58_change_handler() {
    		displayGeo = this.checked;
    		$$invalidate('displayGeo', displayGeo);
    	}

    	function spagination0_currentPage_binding(value) {
    		currentPage = value;
    		$$invalidate('currentPage', currentPage);
    	}

    	function spagination1_currentPage_binding(value_1) {
    		currentPage = value_1;
    		$$invalidate('currentPage', currentPage);
    	}

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	let filteredData;

    	$$self.$$.update = ($$dirty = { data: 1, filters: 1, filteredData: 1 }) => {
    		if ($$dirty.data || $$dirty.filters) { $$invalidate('filteredData', filteredData =
            data.length === 0
              ? []
              : typeof filters !== "object"
              ? data
              : doFilter(data, filters)); }
    		if ($$dirty.filteredData) { $$invalidate('totalNum', totalNum = filteredData.length); }
    		if ($$dirty.filteredData) { console.log(filteredData); }
    	};

    	return {
    		name,
    		data,
    		totalNum,
    		displayStore,
    		displayBackground,
    		displayEvo,
    		displayGeo,
    		filters,
    		pageSize,
    		totalPages,
    		currentPage,
    		totalPagesChanged,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_input_handler,
    		input12_input_handler,
    		input13_input_handler,
    		input14_input_handler,
    		input15_input_handler,
    		input16_input_handler,
    		input17_input_handler,
    		input18_input_handler,
    		input19_input_handler,
    		input20_input_handler,
    		input21_input_handler,
    		input22_input_handler,
    		input23_input_handler,
    		input24_input_handler,
    		input25_input_handler,
    		input26_input_handler,
    		input27_input_handler,
    		input28_input_handler,
    		input29_input_handler,
    		input30_input_handler,
    		input31_input_handler,
    		input32_input_handler,
    		input33_input_handler,
    		input34_input_handler,
    		input35_input_handler,
    		input36_input_handler,
    		input37_input_handler,
    		input38_input_handler,
    		input39_input_handler,
    		input40_input_handler,
    		input41_input_handler,
    		input42_input_handler,
    		input43_input_handler,
    		input44_input_handler,
    		input45_input_handler,
    		input46_input_handler,
    		input47_input_handler,
    		input48_input_handler,
    		input49_input_handler,
    		input50_input_handler,
    		input51_input_handler,
    		input52_input_handler,
    		input53_input_handler,
    		input54_input_handler,
    		input55_change_handler,
    		input56_change_handler,
    		input57_change_handler,
    		input58_change_handler,
    		spagination0_currentPage_binding,
    		spagination1_currentPage_binding
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["name"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console_1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "yanzx"
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
