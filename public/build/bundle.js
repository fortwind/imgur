
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
        const component = get_current_component();
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
    const seen_callbacks = new Set();
    function flush() {
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
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
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

    /* src\Background.svelte generated by Svelte v3.18.1 */

    const file = "src\\Background.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (7:1) {#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as layer}
    function create_each_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "transform", "translate(0," + -/*y*/ ctx[0] * /*layer*/ ctx[4] / (/*layers*/ ctx[1].length - 1) + "px)");
    			if (img.src !== (img_src_value = "https://gitee.com/fortwind/images/raw/master/info/bg/parallax" + /*layer*/ ctx[4] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "parallax layer " + /*layer*/ ctx[4]);
    			attr_dev(img, "class", "svelte-13mntrs");
    			add_location(img, file, 7, 2, 167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*y*/ 1) {
    				set_style(img, "transform", "translate(0," + -/*y*/ ctx[0] * /*layer*/ ctx[4] / (/*layers*/ ctx[1].length - 1) + "px)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(7:1) {#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as layer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let t0;
    	let div2;
    	let span;
    	let t1;
    	let t2;
    	let div1;
    	let current;
    	let each_value = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    	let each_blocks = [];

    	for (let i = 0; i < 9; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < 9; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div2 = element("div");
    			span = element("span");
    			t1 = text("fortwind");
    			t2 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "parallax-container svelte-13mntrs");
    			add_location(div0, file, 5, 0, 84);
    			set_style(span, "opacity", 1 - Math.min(/*y*/ ctx[0], 40) / 40);
    			attr_dev(span, "class", "svelte-13mntrs");
    			add_location(span, file, 16, 1, 411);
    			attr_dev(div1, "class", "foreground svelte-13mntrs");
    			add_location(div1, file, 20, 1, 488);
    			attr_dev(div2, "class", "content svelte-13mntrs");
    			add_location(div2, file, 15, 0, 387);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < 9; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span);
    			append_dev(span, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y, layers*/ 3) {
    				each_value = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    				let i;

    				for (i = 0; i < 9; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < 9; i += 1) {
    					each_blocks[i].d(1);
    				}
    			}

    			if (!current || dirty & /*y*/ 1) {
    				set_style(span, "opacity", 1 - Math.min(/*y*/ ctx[0], 40) / 40);
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
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
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const layers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    	let { y } = $$props;
    	const writable_props = ["y"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("y" in $$props) $$invalidate(0, y = $$props.y);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { y };
    	};

    	$$self.$inject_state = $$props => {
    		if ("y" in $$props) $$invalidate(0, y = $$props.y);
    	};

    	return [y, layers, $$scope, $$slots];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { y: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*y*/ ctx[0] === undefined && !("y" in props)) {
    			console.warn("<Background> was created without expected prop 'y'");
    		}
    	}

    	get y() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Image.svelte generated by Svelte v3.18.1 */
    const file$1 = "src\\Image.svelte";

    function create_fragment$1(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let img_1;
    	let img_1_class_value;
    	let t0;
    	let div0;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			img_1 = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(/*name*/ ctx[1]);
    			attr_dev(img_1, "class", img_1_class_value = "img" + decorate_class + " svelte-dnx0pm");
    			attr_dev(img_1, "data-src", /*src*/ ctx[0]);
    			attr_dev(img_1, "alt", "img");
    			add_location(img_1, file$1, 24, 6, 574);
    			attr_dev(div0, "class", "name svelte-dnx0pm");
    			add_location(div0, file$1, 25, 6, 656);
    			attr_dev(div1, "class", "img-container svelte-dnx0pm");
    			add_location(div1, file$1, 22, 4, 399);
    			attr_dev(div2, "class", "image svelte-dnx0pm");
    			add_location(div2, file$1, 21, 2, 356);
    			attr_dev(div3, "class", "image-container svelte-dnx0pm");
    			add_location(div3, file$1, 20, 0, 323);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img_1);
    			/*img_1_binding*/ ctx[6](img_1);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			dispose = listen_dev(div2, "click", /*getBig*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 1) {
    				attr_dev(img_1, "data-src", /*src*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*img_1_binding*/ ctx[6](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const decorate_class = ""; // 否则.img.load样式不加载

    function instance$1($$self, $$props, $$invalidate) {
    	let { src } = $$props;
    	let { name } = $$props;
    	let { node } = $$props;
    	let img;
    	const dispatch = createEventDispatcher();

    	function getBig() {
    		dispatch("getBig", src);
    	}

    	onMount(() => {
    		$$invalidate(4, node = img);
    	});

    	const writable_props = ["src", "name", "node"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	function img_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, img = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("node" in $$props) $$invalidate(4, node = $$props.node);
    	};

    	$$self.$capture_state = () => {
    		return { src, name, node, img };
    	};

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("node" in $$props) $$invalidate(4, node = $$props.node);
    		if ("img" in $$props) $$invalidate(2, img = $$props.img);
    	};

    	return [src, name, img, getBig, node, dispatch, img_1_binding];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { src: 0, name: 1, node: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<Image> was created without expected prop 'src'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<Image> was created without expected prop 'name'");
    		}

    		if (/*node*/ ctx[4] === undefined && !("node" in props)) {
    			console.warn("<Image> was created without expected prop 'node'");
    		}
    	}

    	get src() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get node() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set node(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Fancy.svelte generated by Svelte v3.18.1 */

    const { console: console_1 } = globals;
    const file$2 = "src\\Fancy.svelte";

    function create_fragment$2(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let img;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let div2;
    	let button;
    	let div3_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			img = element("img");
    			t1 = space();
    			span = element("span");
    			t2 = text("Loading...");
    			t3 = space();
    			div2 = element("div");
    			button = element("button");
    			attr_dev(div0, "class", "fancy-mask svelte-pfuuos");
    			add_location(div0, file$2, 53, 2, 1180);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "fancy-img");
    			set_style(img, "display", /*node*/ ctx[1].loading ? "none" : "");
    			set_style(img, "height", /*node*/ ctx[1].h + "px");
    			set_style(img, "width", /*node*/ ctx[1].w + "px");
    			add_location(img, file$2, 55, 4, 1280);
    			set_style(span, "display", /*node*/ ctx[1].loading ? "" : "none");
    			add_location(span, file$2, 56, 4, 1449);
    			attr_dev(div1, "class", "fancy-imgbox svelte-pfuuos");
    			add_location(div1, file$2, 54, 2, 1248);
    			attr_dev(button, "class", "button closebtn svelte-pfuuos");
    			add_location(button, file$2, 59, 4, 1563);
    			attr_dev(div2, "class", "fancy-close svelte-pfuuos");
    			add_location(div2, file$2, 58, 2, 1532);
    			attr_dev(div3, "class", div3_class_value = "fancy" + /*animate_class*/ ctx[4] + " svelte-pfuuos");
    			set_style(div3, "visibility", /*visible*/ ctx[3] ? "visible" : "hidden");
    			add_location(div3, file$2, 52, 0, 1071);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			/*img_binding*/ ctx[9](img);
    			append_dev(div1, t1);
    			append_dev(div1, span);
    			append_dev(span, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			/*div3_binding*/ ctx[11](div3);

    			dispose = [
    				listen_dev(div0, "click", /*click_handler*/ ctx[8], false, false, false),
    				listen_dev(img, "mousewhell", scrollHandle, false, false, false),
    				listen_dev(button, "click", /*click_handler_1*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*node*/ 2) {
    				set_style(img, "display", /*node*/ ctx[1].loading ? "none" : "");
    			}

    			if (dirty & /*node*/ 2) {
    				set_style(img, "height", /*node*/ ctx[1].h + "px");
    			}

    			if (dirty & /*node*/ 2) {
    				set_style(img, "width", /*node*/ ctx[1].w + "px");
    			}

    			if (dirty & /*node*/ 2) {
    				set_style(span, "display", /*node*/ ctx[1].loading ? "" : "none");
    			}

    			if (dirty & /*animate_class*/ 16 && div3_class_value !== (div3_class_value = "fancy" + /*animate_class*/ ctx[4] + " svelte-pfuuos")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (dirty & /*visible*/ 8) {
    				set_style(div3, "visibility", /*visible*/ ctx[3] ? "visible" : "hidden");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*img_binding*/ ctx[9](null);
    			/*div3_binding*/ ctx[11](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function scrollHandle() {
    	console.log(999);
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { show } = $$props;
    	let { src } = $$props;
    	let node = { loading: false, w: "", h: "" };
    	let fancy;
    	let visible = false;
    	let animate_class = "";

    	function fancyLoad(show, src) {
    		const { img } = node;

    		if (show) {
    			$$invalidate(3, visible = show);
    			img.src = src;
    			$$invalidate(4, animate_class = " animatein");
    			$$invalidate(1, node.loading = true, node);
    			const { width, height } = fancy.getBoundingClientRect();

    			img.onload = () => {
    				$$invalidate(1, node.loading = false, node);
    				const iw = img.width;
    				const ih = img.height;
    				const sw = width * 0.7;
    				const sh = height * 0.7;
    				const scaleW = sw / iw;
    				const scaleH = sh / ih;

    				if (scaleH > scaleW) {
    					$$invalidate(1, node.w = sw, node);
    					$$invalidate(1, node.h = ih * scaleW, node); // < ih * scaleH = sh // 直接设置img.height 就固定了，后面获取不会改
    				} else {
    					$$invalidate(1, node.w = iw * scaleH, node);
    					$$invalidate(1, node.h = sh, node);
    				}
    			};
    		} else {
    			fancyClose();
    		}
    	}

    	function fancyClose() {
    		$$invalidate(4, animate_class = "");

    		setTimeout(
    			() => {
    				$$invalidate(3, visible = false);
    			},
    			500
    		);
    	}

    	const writable_props = ["show", "src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Fancy> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, show = false);
    	};

    	function img_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			node.img = $$value;
    			$$invalidate(1, node);
    		});
    	}

    	const click_handler_1 = () => {
    		$$invalidate(0, show = false);
    	};

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, fancy = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("src" in $$props) $$invalidate(5, src = $$props.src);
    	};

    	$$self.$capture_state = () => {
    		return {
    			show,
    			src,
    			node,
    			fancy,
    			visible,
    			animate_class
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("src" in $$props) $$invalidate(5, src = $$props.src);
    		if ("node" in $$props) $$invalidate(1, node = $$props.node);
    		if ("fancy" in $$props) $$invalidate(2, fancy = $$props.fancy);
    		if ("visible" in $$props) $$invalidate(3, visible = $$props.visible);
    		if ("animate_class" in $$props) $$invalidate(4, animate_class = $$props.animate_class);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*show, src*/ 33) {
    			 {
    				fancyLoad(show, src);
    			}
    		}
    	};

    	return [
    		show,
    		node,
    		fancy,
    		visible,
    		animate_class,
    		src,
    		fancyLoad,
    		fancyClose,
    		click_handler,
    		img_binding,
    		click_handler_1,
    		div3_binding
    	];
    }

    class Fancy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { show: 0, src: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fancy",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*show*/ ctx[0] === undefined && !("show" in props)) {
    			console_1.warn("<Fancy> was created without expected prop 'show'");
    		}

    		if (/*src*/ ctx[5] === undefined && !("src" in props)) {
    			console_1.warn("<Fancy> was created without expected prop 'src'");
    		}
    	}

    	get show() {
    		throw new Error("<Fancy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Fancy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<Fancy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Fancy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const fancyEntry = (props = { show: false }) => new Fancy({
      target: document.body,
      props
    });

    // const fancy = new Fancy({
    //   target: document.body,
    //   props: { display: 'none' }
    // })

    // export default fancy // 这样只有一个实例

    /* src\Imgur.svelte generated by Svelte v3.18.1 */

    const file$3 = "src\\Imgur.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i].path;
    	child_ctx[11] = list[i].name;
    	child_ctx[12] = list[i].target;
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (83:2) {#each imgs_path as { path, name, target }
    function create_each_block$1(ctx) {
    	let updating_node;
    	let current;

    	function image_node_binding(value) {
    		/*image_node_binding*/ ctx[8].call(null, value, /*target*/ ctx[12]);
    	}

    	function getBig_handler(...args) {
    		return /*getBig_handler*/ ctx[9](/*i*/ ctx[14], ...args);
    	}

    	let image_props = {
    		src: `https://gitee.com/${owner}/${repo}/raw/${sha}/${/*path*/ ctx[10]}`,
    		name: /*name*/ ctx[11]
    	};

    	if (/*target*/ ctx[12].node !== void 0) {
    		image_props.node = /*target*/ ctx[12].node;
    	}

    	const image = new Image({ props: image_props, $$inline: true });
    	binding_callbacks.push(() => bind(image, "node", image_node_binding));
    	image.$on("getBig", getBig_handler);

    	const block = {
    		c: function create() {
    			create_component(image.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(image, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const image_changes = {};
    			if (dirty & /*imgs_path*/ 1) image_changes.src = `https://gitee.com/${owner}/${repo}/raw/${sha}/${/*path*/ ctx[10]}`;
    			if (dirty & /*imgs_path*/ 1) image_changes.name = /*name*/ ctx[11];

    			if (!updating_node && dirty & /*imgs_path*/ 1) {
    				updating_node = true;
    				image_changes.node = /*target*/ ctx[12].node;
    				add_flush_callback(() => updating_node = false);
    			}

    			image.$set(image_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(image, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(83:2) {#each imgs_path as { path, name, target }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let each_value = /*imgs_path*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "images svelte-9813fh");
    			add_location(div0, file$3, 81, 2, 2144);
    			attr_dev(div1, "class", "imgur svelte-9813fh");
    			add_location(div1, file$3, 80, 0, 2121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*owner, repo, sha, imgs_path, getBig*/ 3) {
    				each_value = /*imgs_path*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const owner = "fortwind";
    const repo = "images";
    const sha = "master";

    function instance$3($$self, $$props, $$invalidate) {
    	let { scrolly } = $$props;
    	let fancy;
    	let imgs_path = [];
    	let imgs_path_backup = [];
    	const getPath = () => fetch(`https://gitee.com/api/v5/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`).then(response => response.json()).catch(err => err);

    	function fillImgs(tree) {
    		const type = ["jpg", "png", "jpeg"];
    		const regex_tree = /^info\/(\w+\/)*(\w+\.\w+)$/;

    		imgs_path_backup = $$invalidate(0, imgs_path = tree.map(v => {
    			const val = regex_tree.exec(v.path);
    			const valsplit = val ? val[2].split(".") : [false];

    			if (valsplit[0] && type.includes(valsplit[1].toLowerCase())) {
    				v.name = val[2];
    				v.target = { node: undefined, load: false, lazy: true };
    				return v;
    			}

    			return undefined;
    		}).filter(k => k));
    	} // imgs_path = [imgs_path[0]]

    	function imgLoad(y) {
    		if (imgs_path_backup.length < 1 || !imgs_path_backup[0]) return false;
    		let temp = [];

    		imgs_path_backup.map(v => {
    			const { load, node, top, lazy } = v.target;
    			if (load) return false;

    			const setsrc = () => {
    				node.src = node.getAttribute("data-src");
    				node.classList.add("load");
    				v.target.load = true; // 并无法监听target.node改变并赋值给子组件，所以直接设置src
    			};

    			if (lazy) {
    				y + 660 > top ? setsrc() : temp.push(v);
    			} else {
    				setsrc();
    			}
    		});

    		imgs_path_backup = temp; // lazy true && load false
    	}

    	function getBig(i, e) {
    		fancy.$set({ show: true, src: e.detail });
    	}

    	onMount(async () => {
    		const res = await getPath();
    		res && res.tree && fillImgs(res.tree);
    		await tick();
    		fancy = fancyEntry();

    		// console.log(document.documentElement.scrollTop, '=---')
    		const { scrollTop } = document.documentElement; // 绑定的值都会有一定延迟，直接获取快

    		imgs_path.map(({ target }) => {
    			target.top = target.node.getBoundingClientRect().top + scrollTop;
    		});
    	});

    	const writable_props = ["scrolly"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Imgur> was created with unknown prop '${key}'`);
    	});

    	function image_node_binding(value, target) {
    		target.node = value;
    		$$invalidate(0, imgs_path);
    	}

    	const getBig_handler = (i, e) => getBig(i, e);

    	$$self.$set = $$props => {
    		if ("scrolly" in $$props) $$invalidate(2, scrolly = $$props.scrolly);
    	};

    	$$self.$capture_state = () => {
    		return {
    			scrolly,
    			fancy,
    			imgs_path,
    			imgs_path_backup
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("scrolly" in $$props) $$invalidate(2, scrolly = $$props.scrolly);
    		if ("fancy" in $$props) fancy = $$props.fancy;
    		if ("imgs_path" in $$props) $$invalidate(0, imgs_path = $$props.imgs_path);
    		if ("imgs_path_backup" in $$props) imgs_path_backup = $$props.imgs_path_backup;
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*scrolly*/ 4) {
    			 {
    				imgLoad(scrolly);
    			} // 这样只会监听scrolly，不会监听到别的参数
    		}
    	};

    	return [
    		imgs_path,
    		getBig,
    		scrolly,
    		fancy,
    		imgs_path_backup,
    		getPath,
    		fillImgs,
    		imgLoad,
    		image_node_binding,
    		getBig_handler
    	];
    }

    class Imgur extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { scrolly: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Imgur",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*scrolly*/ ctx[2] === undefined && !("scrolly" in props)) {
    			console.warn("<Imgur> was created without expected prop 'scrolly'");
    		}
    	}

    	get scrolly() {
    		throw new Error("<Imgur>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrolly(value) {
    		throw new Error("<Imgur>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Navgation.svelte generated by Svelte v3.18.1 */
    const file$4 = "src\\Navgation.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let header_1;
    	let nav;
    	let a0;
    	let t1;
    	let ul;
    	let li0;
    	let t3;
    	let li1;
    	let a1;
    	let svg0;
    	let path0;
    	let t4;
    	let span0;
    	let t6;
    	let li2;
    	let a2;
    	let svg1;
    	let path1;
    	let t7;
    	let span1;
    	let header_1_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			header_1 = element("header");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Fortwind";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Menu";
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t4 = space();
    			span0 = element("span");
    			span0.textContent = "项目地址1";
    			t6 = space();
    			li2 = element("li");
    			a2 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t7 = space();
    			span1 = element("span");
    			span1.textContent = "项目地址2";
    			attr_dev(a0, "href", "http://fortwind.gitee.io/blog/");
    			attr_dev(a0, "class", "home svelte-hx2xa6");
    			add_location(a0, file$4, 17, 6, 404);
    			attr_dev(li0, "class", "li menu svelte-hx2xa6");
    			add_location(li0, file$4, 19, 8, 503);
    			attr_dev(path0, "d", "M512 1024C229.2224 1024 0 794.7776 0 512S229.2224 0 512 0s512 229.2224 512 512-229.2224 512-512 512z m259.1488-568.8832H480.4096a25.2928 25.2928 0 0 0-25.2928 25.2928l-0.0256 63.2064c0 13.952 11.3152 25.2928 25.2672 25.2928h177.024c13.9776 0 25.2928 11.3152 25.2928 25.2672v12.6464a75.8528 75.8528 0 0 1-75.8528 75.8528H366.592a25.2928 25.2928 0 0 1-25.2672-25.2928v-240.1792a75.8528 75.8528 0 0 1 75.8272-75.8528h353.9456a25.2928 25.2928 0 0 0 25.2672-25.2928l0.0768-63.2064a25.2928 25.2928 0 0 0-25.2672-25.2928H417.152a189.6192 189.6192 0 0 0-189.6192 189.6448v353.9456c0 13.9776 11.3152 25.2928 25.2928 25.2928h372.9408a170.6496 170.6496 0 0 0 170.6496-170.6496v-145.408a25.2928 25.2928 0 0 0-25.2928-25.2672z");
    			attr_dev(path0, "fill", "#C71D23");
    			attr_dev(path0, "p-id", "956");
    			add_location(path0, file$4, 23, 14, 795);
    			attr_dev(svg0, "t", "1582197687311");
    			attr_dev(svg0, "class", "icon svelte-hx2xa6");
    			attr_dev(svg0, "viewBox", "0 0 1024 1024");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "p-id", "955");
    			attr_dev(svg0, "width", "20");
    			attr_dev(svg0, "height", "20");
    			add_location(svg0, file$4, 22, 12, 636);
    			attr_dev(span0, "class", "svelte-hx2xa6");
    			add_location(span0, file$4, 25, 12, 1586);
    			attr_dev(a1, "href", "https://gitee.com/fortwind/imgur");
    			attr_dev(a1, "class", "svelte-hx2xa6");
    			add_location(a1, file$4, 21, 10, 579);
    			attr_dev(li1, "class", "li minscreen svelte-hx2xa6");
    			add_location(li1, file$4, 20, 8, 542);
    			attr_dev(path1, "d", "M511.966 0C229.239 0 0 229.239 0 512.034 0 738.236 146.705 930.133 350.174 997.82c25.6 4.71 34.918-11.094 34.918-24.679 0-12.151-0.409-44.339-0.682-87.074-142.405 30.959-172.476-68.642-172.476-68.642-23.279-59.119-56.832-74.888-56.832-74.888-46.49-31.744 3.516-31.13 3.516-31.13 51.37 3.618 78.438 52.77 78.438 52.77 45.67 78.268 119.808 55.672 148.992 42.564 4.642-33.109 17.886-55.671 32.495-68.471-113.698-12.903-233.199-56.832-233.199-253.031 0-55.91 19.934-101.614 52.702-137.386-5.291-12.971-22.835-65.024 5.017-135.51 0 0 42.974-13.755 140.8 52.498a490.07 490.07 0 0 1 128.171-17.238 490.836 490.836 0 0 1 128.171 17.238c97.758-66.253 140.663-52.498 140.663-52.498 27.921 70.486 10.343 122.539 5.086 135.51 32.836 35.772 52.634 81.476 52.634 137.386 0 196.677-119.706 239.958-233.779 252.655 18.397 15.804 34.781 47.036 34.781 94.789 0 68.471-0.648 123.699-0.648 140.458 0 13.688 9.25 29.628 35.225 24.645C877.431 929.929 1024 738.167 1024 512.034 1024 229.239 794.726 0 511.966 0");
    			attr_dev(path1, "fill", "#C71D23");
    			attr_dev(path1, "p-id", "2016");
    			add_location(path1, file$4, 31, 14, 1900);
    			attr_dev(svg1, "t", "1582199407161");
    			attr_dev(svg1, "class", "icon svelte-hx2xa6");
    			attr_dev(svg1, "viewBox", "0 0 1024 1024");
    			attr_dev(svg1, "version", "1.1");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "p-id", "2015");
    			attr_dev(svg1, "width", "20");
    			attr_dev(svg1, "height", "20");
    			add_location(svg1, file$4, 30, 12, 1740);
    			attr_dev(span1, "class", "svelte-hx2xa6");
    			add_location(span1, file$4, 33, 12, 2966);
    			attr_dev(a2, "href", "https://github.com/fortwind/imgur");
    			attr_dev(a2, "class", "svelte-hx2xa6");
    			add_location(a2, file$4, 29, 10, 1682);
    			attr_dev(li2, "class", "li minscreen svelte-hx2xa6");
    			add_location(li2, file$4, 28, 8, 1645);
    			attr_dev(ul, "class", "ul svelte-hx2xa6");
    			add_location(ul, file$4, 18, 6, 478);
    			attr_dev(nav, "class", "nav svelte-hx2xa6");
    			add_location(nav, file$4, 16, 4, 379);

    			attr_dev(header_1, "class", header_1_class_value = "header" + (/*scrolly*/ ctx[0] > /*stickpos*/ ctx[2]
    			? " sticky"
    			: "") + " svelte-hx2xa6");

    			add_location(header_1, file$4, 15, 2, 311);
    			attr_dev(div, "class", "header-container svelte-hx2xa6");
    			add_location(div, file$4, 14, 0, 258);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, header_1);
    			append_dev(header_1, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, svg0);
    			append_dev(svg0, path0);
    			append_dev(a1, t4);
    			append_dev(a1, span0);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, svg1);
    			append_dev(svg1, path1);
    			append_dev(a2, t7);
    			append_dev(a2, span1);
    			/*div_binding*/ ctx[3](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrolly, stickpos*/ 5 && header_1_class_value !== (header_1_class_value = "header" + (/*scrolly*/ ctx[0] > /*stickpos*/ ctx[2]
    			? " sticky"
    			: "") + " svelte-hx2xa6")) {
    				attr_dev(header_1, "class", header_1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[3](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { scrolly } = $$props;
    	let header;
    	let stickpos;

    	onMount(() => {
    		const { top } = header.getBoundingClientRect();
    		const { scrollTop } = document.documentElement;
    		$$invalidate(2, stickpos = top + scrollTop);
    	});

    	const writable_props = ["scrolly"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navgation> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, header = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("scrolly" in $$props) $$invalidate(0, scrolly = $$props.scrolly);
    	};

    	$$self.$capture_state = () => {
    		return { scrolly, header, stickpos };
    	};

    	$$self.$inject_state = $$props => {
    		if ("scrolly" in $$props) $$invalidate(0, scrolly = $$props.scrolly);
    		if ("header" in $$props) $$invalidate(1, header = $$props.header);
    		if ("stickpos" in $$props) $$invalidate(2, stickpos = $$props.stickpos);
    	};

    	return [scrolly, header, stickpos, div_binding];
    }

    class Navgation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { scrolly: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navgation",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*scrolly*/ ctx[0] === undefined && !("scrolly" in props)) {
    			console.warn("<Navgation> was created without expected prop 'scrolly'");
    		}
    	}

    	get scrolly() {
    		throw new Error("<Navgation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrolly(value) {
    		throw new Error("<Navgation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.18.1 */
    const file$5 = "src\\App.svelte";

    // (11:1) <Background y={scrolly}>
    function create_default_slot(ctx) {
    	let t;
    	let current;

    	const navgation = new Navgation({
    			props: { scrolly: /*scrolly*/ ctx[0] },
    			$$inline: true
    		});

    	const imgur = new Imgur({
    			props: { scrolly: /*scrolly*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navgation.$$.fragment);
    			t = space();
    			create_component(imgur.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navgation, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(imgur, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navgation_changes = {};
    			if (dirty & /*scrolly*/ 1) navgation_changes.scrolly = /*scrolly*/ ctx[0];
    			navgation.$set(navgation_changes);
    			const imgur_changes = {};
    			if (dirty & /*scrolly*/ 1) imgur_changes.scrolly = /*scrolly*/ ctx[0];
    			imgur.$set(imgur_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navgation.$$.fragment, local);
    			transition_in(imgur.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navgation.$$.fragment, local);
    			transition_out(imgur.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navgation, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(imgur, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(11:1) <Background y={scrolly}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let current;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[1]);

    	const background = new Background({
    			props: {
    				y: /*scrolly*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(background.$$.fragment);
    			attr_dev(div, "id", "app");
    			attr_dev(div, "class", "svelte-ckhc3z");
    			add_location(div, file$5, 9, 0, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(background, div, null);
    			current = true;

    			dispose = listen_dev(window, "scroll", () => {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    				/*onwindowscroll*/ ctx[1]();
    			});
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrolly*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrolly*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			const background_changes = {};
    			if (dirty & /*scrolly*/ 1) background_changes.y = /*scrolly*/ ctx[0];

    			if (dirty & /*$$scope, scrolly*/ 5) {
    				background_changes.$$scope = { dirty, ctx };
    			}

    			background.$set(background_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(background);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let scrolly = 0;

    	function onwindowscroll() {
    		$$invalidate(0, scrolly = window.pageYOffset);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("scrolly" in $$props) $$invalidate(0, scrolly = $$props.scrolly);
    	};

    	return [scrolly, onwindowscroll];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
