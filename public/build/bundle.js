
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.40.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Spinner.svelte generated by Svelte v3.40.0 */

    const file$1 = "src\\components\\Spinner.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			attr_dev(span, "class", "spinner spinner-round");
    			add_location(span, file$1, 0, 23, 23);
    			attr_dev(div, "class", "preloader");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Spinner', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\components\App.svelte generated by Svelte v3.40.0 */
    const file = "src\\components\\App.svelte";

    // (161:0) {#if !ready}
    function create_if_block(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(161:0) {#if !ready}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div7;
    	let header;
    	let div6;
    	let div5;
    	let div4;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div2;
    	let a1;
    	let div1;
    	let span0;
    	let t2;
    	let div3;
    	let nav;
    	let ul0;
    	let li0;
    	let a2;
    	let t4;
    	let li1;
    	let a3;
    	let t6;
    	let li2;
    	let a4;
    	let t8;
    	let li3;
    	let a5;
    	let t10;
    	let li4;
    	let a6;
    	let t12;
    	let li5;
    	let a7;
    	let t14;
    	let ul1;
    	let li6;
    	let a8;
    	let span1;
    	let t16;
    	let br0;
    	let br1;
    	let br2;
    	let br3;
    	let br4;
    	let br5;
    	let br6;
    	let br7;
    	let t17;
    	let div13;
    	let p0;
    	let t18;
    	let span2;
    	let t20;
    	let div12;
    	let div8;
    	let span3;
    	let t21;
    	let t22;
    	let span4;
    	let t24;
    	let div9;
    	let span5;
    	let t25_value = /*hours*/ ctx[4].toString().padStart(2, '0') + "";
    	let t25;
    	let t26;
    	let span6;
    	let t28;
    	let div10;
    	let span7;
    	let t29;
    	let t30;
    	let span8;
    	let t32;
    	let div11;
    	let span9;
    	let t33;
    	let t34;
    	let span10;
    	let t36;
    	let br8;
    	let br9;
    	let br10;
    	let t37;
    	let footer;
    	let div21;
    	let div20;
    	let div19;
    	let div18;
    	let div17;
    	let div16;
    	let div15;
    	let ul2;
    	let li7;
    	let a9;
    	let em0;
    	let t38;
    	let li8;
    	let a10;
    	let em1;
    	let t39;
    	let li9;
    	let a11;
    	let em2;
    	let t40;
    	let li10;
    	let a12;
    	let em3;
    	let t41;
    	let div14;
    	let p1;
    	let span11;
    	let t42;
    	let a13;
    	let t44;
    	let if_block_anchor;
    	let current;
    	let if_block = !/*ready*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			header = element("header");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div2 = element("div");
    			a1 = element("a");
    			div1 = element("div");
    			span0 = element("span");
    			t2 = space();
    			div3 = element("div");
    			nav = element("nav");
    			ul0 = element("ul");
    			li0 = element("li");
    			a2 = element("a");
    			a2.textContent = "About";
    			t4 = space();
    			li1 = element("li");
    			a3 = element("a");
    			a3.textContent = "Tokenomics";
    			t6 = space();
    			li2 = element("li");
    			a4 = element("a");
    			a4.textContent = "Roadmap";
    			t8 = space();
    			li3 = element("li");
    			a5 = element("a");
    			a5.textContent = "News";
    			t10 = space();
    			li4 = element("li");
    			a6 = element("a");
    			a6.textContent = "RU RDY?";
    			t12 = space();
    			li5 = element("li");
    			a7 = element("a");
    			a7.textContent = "Wrap $BUNNY";
    			t14 = space();
    			ul1 = element("ul");
    			li6 = element("li");
    			a8 = element("a");
    			span1 = element("span");
    			span1.textContent = "ROCKET DROP";
    			t16 = space();
    			br0 = element("br");
    			br1 = element("br");
    			br2 = element("br");
    			br3 = element("br");
    			br4 = element("br");
    			br5 = element("br");
    			br6 = element("br");
    			br7 = element("br");
    			t17 = space();
    			div13 = element("div");
    			p0 = element("p");
    			t18 = text("ARE YOU READY? ON ");
    			span2 = element("span");
    			span2.textContent = `${`${/*date*/ ctx[6].getDate()} ${/*date*/ ctx[6].toLocaleString('default', { month: 'short' })} ${/*date*/ ctx[6].getFullYear()}`}`;
    			t20 = space();
    			div12 = element("div");
    			div8 = element("div");
    			span3 = element("span");
    			t21 = text(/*days*/ ctx[5]);
    			t22 = space();
    			span4 = element("span");
    			span4.textContent = "days";
    			t24 = space();
    			div9 = element("div");
    			span5 = element("span");
    			t25 = text(t25_value);
    			t26 = space();
    			span6 = element("span");
    			span6.textContent = "hours";
    			t28 = space();
    			div10 = element("div");
    			span7 = element("span");
    			t29 = text(/*minutes*/ ctx[3]);
    			t30 = space();
    			span8 = element("span");
    			span8.textContent = "min";
    			t32 = space();
    			div11 = element("div");
    			span9 = element("span");
    			t33 = text(/*seconds*/ ctx[2]);
    			t34 = space();
    			span10 = element("span");
    			span10.textContent = "sec";
    			t36 = space();
    			br8 = element("br");
    			br9 = element("br");
    			br10 = element("br");
    			t37 = space();
    			footer = element("footer");
    			div21 = element("div");
    			div20 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			div15 = element("div");
    			ul2 = element("ul");
    			li7 = element("li");
    			a9 = element("a");
    			em0 = element("em");
    			t38 = space();
    			li8 = element("li");
    			a10 = element("a");
    			em1 = element("em");
    			t39 = space();
    			li9 = element("li");
    			a11 = element("a");
    			em2 = element("em");
    			t40 = space();
    			li10 = element("li");
    			a12 = element("a");
    			em3 = element("em");
    			t41 = space();
    			div14 = element("div");
    			p1 = element("p");
    			span11 = element("span");
    			t42 = text("Copyright © 2021, ");
    			a13 = element("a");
    			a13.textContent = "ROCKET BUNNY";
    			t44 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(img0, "class", "logo-dark");
    			if (!src_url_equal(img0.src, img0_src_value = "images/logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "srcset", "images/logo2x.png 2x");
    			attr_dev(img0, "alt", "logo");
    			add_location(img0, file, 40, 16, 1342);
    			attr_dev(img1, "class", "logo-light");
    			if (!src_url_equal(img1.src, img1_src_value = "images/logo-white.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "srcset", "images/logo-white2x.png 2x");
    			attr_dev(img1, "alt", "logo");
    			add_location(img1, file, 41, 16, 1448);
    			attr_dev(a0, "href", "./");
    			attr_dev(a0, "class", "logo-link");
    			add_location(a0, file, 39, 14, 1293);
    			attr_dev(div0, "class", "header-logo logo animated");
    			attr_dev(div0, "data-animate", "fadeInDown");
    			attr_dev(div0, "data-delay", ".65");
    			add_location(div0, file, 38, 12, 1195);
    			add_location(span0, file, 50, 18, 1884);
    			attr_dev(div1, "class", "toggle-line");
    			add_location(div1, file, 49, 16, 1839);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "navbar-toggle");
    			attr_dev(a1, "data-menu-toggle", "example-menu-04");
    			add_location(a1, file, 48, 14, 1752);
    			attr_dev(div2, "class", "header-nav-toggle");
    			add_location(div2, file, 46, 12, 1644);
    			attr_dev(a2, "class", "menu-link nav-link");
    			attr_dev(a2, "href", "#ico");
    			add_location(a2, file, 59, 40, 2252);
    			attr_dev(li0, "class", "menu-item");
    			add_location(li0, file, 59, 18, 2230);
    			attr_dev(a3, "class", "menu-link nav-link");
    			attr_dev(a3, "href", "#token");
    			add_location(a3, file, 60, 40, 2350);
    			attr_dev(li1, "class", "menu-item");
    			add_location(li1, file, 60, 18, 2328);
    			attr_dev(a4, "class", "menu-link nav-link");
    			attr_dev(a4, "href", "#roadmap");
    			add_location(a4, file, 61, 40, 2455);
    			attr_dev(li2, "class", "menu-item");
    			add_location(li2, file, 61, 18, 2433);
    			attr_dev(a5, "class", "menu-link nav-link");
    			attr_dev(a5, "href", "#news");
    			add_location(a5, file, 62, 40, 2559);
    			attr_dev(li3, "class", "menu-item");
    			add_location(li3, file, 62, 18, 2537);
    			attr_dev(a6, "class", "menu-link nav-link");
    			attr_dev(a6, "href", "#news");
    			add_location(a6, file, 63, 40, 2657);
    			attr_dev(li4, "class", "menu-item");
    			add_location(li4, file, 63, 18, 2635);
    			attr_dev(a7, "class", "menu-link nav-link");
    			attr_dev(a7, "href", "https://pbom.rocketbunny.io/wrap.html");
    			add_location(a7, file, 65, 20, 2780);
    			attr_dev(li5, "class", "menu-item");
    			add_location(li5, file, 64, 18, 2736);
    			attr_dev(ul0, "class", "menu menu-s2 animated");
    			attr_dev(ul0, "data-animate", "fadeInDown");
    			attr_dev(ul0, "data-delay", ".75");
    			add_location(ul0, file, 58, 16, 2133);
    			add_location(span1, file, 73, 93, 3251);
    			attr_dev(a8, "href", "https://drop.rocketbunny.io/");
    			attr_dev(a8, "target", "_blank");
    			attr_dev(a8, "class", "btn btn-rg btn-auto btn-outline btn-grad on-bg-theme btn-round");
    			add_location(a8, file, 70, 20, 3056);
    			add_location(li6, file, 69, 18, 3030);
    			attr_dev(ul1, "class", "menu-btns animated");
    			attr_dev(ul1, "data-animate", "fadeInDown");
    			attr_dev(ul1, "data-delay", ".85");
    			add_location(ul1, file, 68, 16, 2936);
    			attr_dev(nav, "class", "header-menu");
    			attr_dev(nav, "id", "example-menu-04");
    			add_location(nav, file, 57, 14, 2069);
    			attr_dev(div3, "class", "header-navbar header-navbar-s1");
    			add_location(div3, file, 56, 12, 2009);
    			attr_dev(div4, "class", "header-wrap");
    			add_location(div4, file, 36, 10, 1126);
    			attr_dev(div5, "class", "header-container container svelte-snzn18");
    			add_location(div5, file, 35, 8, 1074);
    			attr_dev(div6, "class", "header-main");
    			add_location(div6, file, 34, 6, 1039);
    			attr_dev(header, "class", "nk-header page-header is-transparent is-sticky is-shrink is-dark");
    			attr_dev(header, "id", "header");
    			add_location(header, file, 32, 4, 912);
    			attr_dev(div7, "class", "nk-wrap");
    			add_location(div7, file, 31, 0, 885);
    			add_location(br0, file, 86, 0, 3508);
    			add_location(br1, file, 86, 4, 3512);
    			add_location(br2, file, 86, 8, 3516);
    			add_location(br3, file, 86, 12, 3520);
    			add_location(br4, file, 86, 16, 3524);
    			add_location(br5, file, 86, 20, 3528);
    			add_location(br6, file, 86, 24, 3532);
    			add_location(br7, file, 86, 28, 3536);
    			attr_dev(span2, "class", "svelte-snzn18");
    			add_location(span2, file, 91, 25, 3614);
    			attr_dev(p0, "class", "svelte-snzn18");
    			add_location(p0, file, 91, 4, 3593);
    			attr_dev(span3, "class", "number svelte-snzn18");
    			add_location(span3, file, 94, 12, 3802);
    			attr_dev(span4, "class", "label svelte-snzn18");
    			add_location(span4, file, 95, 12, 3850);
    			attr_dev(div8, "class", "cell svelte-snzn18");
    			add_location(div8, file, 93, 8, 3770);
    			attr_dev(span5, "class", "number svelte-snzn18");
    			add_location(span5, file, 99, 12, 3941);
    			attr_dev(span6, "class", "label svelte-snzn18");
    			add_location(span6, file, 100, 12, 4018);
    			attr_dev(div9, "class", "cell svelte-snzn18");
    			add_location(div9, file, 98, 8, 3909);
    			attr_dev(span7, "class", "number svelte-snzn18");
    			add_location(span7, file, 104, 12, 4110);
    			attr_dev(span8, "class", "label svelte-snzn18");
    			add_location(span8, file, 105, 12, 4161);
    			attr_dev(div10, "class", "cell svelte-snzn18");
    			add_location(div10, file, 103, 8, 4078);
    			attr_dev(span9, "class", "number svelte-snzn18");
    			add_location(span9, file, 109, 12, 4251);
    			attr_dev(span10, "class", "label svelte-snzn18");
    			add_location(span10, file, 110, 12, 4302);
    			attr_dev(div11, "class", "cell svelte-snzn18");
    			add_location(div11, file, 108, 8, 4219);
    			attr_dev(div12, "class", "time-wrapper svelte-snzn18");
    			add_location(div12, file, 92, 4, 3734);
    			attr_dev(div13, "class", "container svelte-snzn18");
    			toggle_class(div13, "alt", /*alt*/ ctx[0]);
    			add_location(div13, file, 89, 0, 3546);
    			add_location(br8, file, 114, 0, 4370);
    			add_location(br9, file, 114, 4, 4374);
    			add_location(br10, file, 114, 8, 4378);
    			attr_dev(em0, "class", "social-icon fab fa-telegram");
    			add_location(em0, file, 127, 24, 5006);
    			attr_dev(a9, "href", "https://t.me/RocketBunnyChat");
    			attr_dev(a9, "target", "_blank");
    			add_location(a9, file, 126, 22, 4925);
    			add_location(li7, file, 125, 20, 4897);
    			attr_dev(em1, "class", "social-icon fab fa-twitter");
    			add_location(em1, file, 132, 24, 5244);
    			attr_dev(a10, "href", "https://twitter.com/RocketBunny2021");
    			attr_dev(a10, "target", "_blank");
    			add_location(a10, file, 131, 22, 5156);
    			add_location(li8, file, 130, 20, 5128);
    			attr_dev(em2, "class", "social-icon fab fa-medium-m");
    			add_location(em2, file, 137, 24, 5477);
    			attr_dev(a11, "href", "https://rocketbunny.medium.com/");
    			attr_dev(a11, "target", "_blank");
    			add_location(a11, file, 136, 22, 5393);
    			add_location(li9, file, 135, 20, 5365);
    			attr_dev(em3, "class", "social-icon fab fa-youtube");
    			add_location(em3, file, 142, 24, 5736);
    			attr_dev(a12, "href", "https://www.youtube.com/channel/UCyaV80BMsZPoT_bxPZ_rg4Q");
    			attr_dev(a12, "target", "_blank");
    			add_location(a12, file, 141, 22, 5627);
    			add_location(li10, file, 140, 20, 5599);
    			attr_dev(ul2, "class", "social pdb-m justify-content-center");
    			add_location(ul2, file, 124, 18, 4827);
    			attr_dev(a13, "href", "./");
    			add_location(a13, file, 147, 71, 6005);
    			attr_dev(span11, "class", "d-sm-block svelte-snzn18");
    			add_location(span11, file, 147, 23, 5957);
    			attr_dev(p1, "class", "svelte-snzn18");
    			add_location(p1, file, 147, 20, 5954);
    			attr_dev(div14, "class", "copyright-text copyright-text-s3 pdt-m");
    			add_location(div14, file, 146, 18, 5880);
    			attr_dev(div15, "class", "wgs wgs-text text-center mb-3");
    			add_location(div15, file, 123, 16, 4764);
    			attr_dev(div16, "class", "col");
    			add_location(div16, file, 122, 14, 4729);
    			attr_dev(div17, "class", "row");
    			add_location(div17, file, 121, 12, 4696);
    			attr_dev(div18, "class", "nk-block block-footer");
    			add_location(div18, file, 120, 10, 4647);
    			attr_dev(div19, "class", "container svelte-snzn18");
    			add_location(div19, file, 118, 8, 4583);
    			attr_dev(div20, "class", "section section-footer section-s tc-light bg-transparent");
    			add_location(div20, file, 117, 6, 4503);
    			attr_dev(div21, "class", "section section-m pb-0 tc-light ov-h");
    			add_location(div21, file, 116, 4, 4445);
    			attr_dev(footer, "class", "nk-footer bg-theme-alt section-connect");
    			add_location(footer, file, 115, 0, 4384);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, header);
    			append_dev(header, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(a0, t0);
    			append_dev(a0, img1);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, a1);
    			append_dev(a1, div1);
    			append_dev(div1, span0);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, nav);
    			append_dev(nav, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a2);
    			append_dev(ul0, t4);
    			append_dev(ul0, li1);
    			append_dev(li1, a3);
    			append_dev(ul0, t6);
    			append_dev(ul0, li2);
    			append_dev(li2, a4);
    			append_dev(ul0, t8);
    			append_dev(ul0, li3);
    			append_dev(li3, a5);
    			append_dev(ul0, t10);
    			append_dev(ul0, li4);
    			append_dev(li4, a6);
    			append_dev(ul0, t12);
    			append_dev(ul0, li5);
    			append_dev(li5, a7);
    			append_dev(nav, t14);
    			append_dev(nav, ul1);
    			append_dev(ul1, li6);
    			append_dev(li6, a8);
    			append_dev(a8, span1);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div13, anchor);
    			append_dev(div13, p0);
    			append_dev(p0, t18);
    			append_dev(p0, span2);
    			append_dev(div13, t20);
    			append_dev(div13, div12);
    			append_dev(div12, div8);
    			append_dev(div8, span3);
    			append_dev(span3, t21);
    			append_dev(div8, t22);
    			append_dev(div8, span4);
    			append_dev(div12, t24);
    			append_dev(div12, div9);
    			append_dev(div9, span5);
    			append_dev(span5, t25);
    			append_dev(div9, t26);
    			append_dev(div9, span6);
    			append_dev(div12, t28);
    			append_dev(div12, div10);
    			append_dev(div10, span7);
    			append_dev(span7, t29);
    			append_dev(div10, t30);
    			append_dev(div10, span8);
    			append_dev(div12, t32);
    			append_dev(div12, div11);
    			append_dev(div11, span9);
    			append_dev(span9, t33);
    			append_dev(div11, t34);
    			append_dev(div11, span10);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, br9, anchor);
    			insert_dev(target, br10, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div21);
    			append_dev(div21, div20);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, ul2);
    			append_dev(ul2, li7);
    			append_dev(li7, a9);
    			append_dev(a9, em0);
    			append_dev(ul2, t38);
    			append_dev(ul2, li8);
    			append_dev(li8, a10);
    			append_dev(a10, em1);
    			append_dev(ul2, t39);
    			append_dev(ul2, li9);
    			append_dev(li9, a11);
    			append_dev(a11, em2);
    			append_dev(ul2, t40);
    			append_dev(ul2, li10);
    			append_dev(li10, a12);
    			append_dev(a12, em3);
    			append_dev(div15, t41);
    			append_dev(div15, div14);
    			append_dev(div14, p1);
    			append_dev(p1, span11);
    			append_dev(span11, t42);
    			append_dev(span11, a13);
    			insert_dev(target, t44, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*days*/ 32) set_data_dev(t21, /*days*/ ctx[5]);
    			if ((!current || dirty & /*hours*/ 16) && t25_value !== (t25_value = /*hours*/ ctx[4].toString().padStart(2, '0') + "")) set_data_dev(t25, t25_value);
    			if (!current || dirty & /*minutes*/ 8) set_data_dev(t29, /*minutes*/ ctx[3]);
    			if (!current || dirty & /*seconds*/ 4) set_data_dev(t33, /*seconds*/ ctx[2]);

    			if (dirty & /*alt*/ 1) {
    				toggle_class(div13, "alt", /*alt*/ ctx[0]);
    			}

    			if (!/*ready*/ ctx[1]) {
    				if (if_block) {
    					if (dirty & /*ready*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
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
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(br10);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(footer);
    			if (detaching) detach_dev(t44);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let ready = false;

    	onMount(() => {
    		setTimeout(
    			() => {
    				$$invalidate(1, ready = true);
    			},
    			2000
    		);
    	});

    	let { alt = false } = $$props;
    	let date = new Date();
    	date.setDate(date.getDate() + 15);
    	date.setHours(date.getHours() + 7);
    	date.setMinutes(date.getMinutes() + 56);
    	date.setSeconds(date.getSeconds() + 15);
    	let seconds;
    	let minutes;
    	let hours;
    	let days;

    	function countdown() {
    		let timeLeft = date - new Date();
    		$$invalidate(2, seconds = Math.floor(timeLeft / 1000 % 60));
    		$$invalidate(3, minutes = Math.floor(timeLeft / 1000 / 60 % 60));
    		$$invalidate(4, hours = Math.floor(timeLeft / (1000 * 60 * 60) % 24));
    		$$invalidate(5, days = Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
    	}

    	countdown();
    	setInterval(countdown, 1000);
    	const writable_props = ['alt'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('alt' in $$props) $$invalidate(0, alt = $$props.alt);
    	};

    	$$self.$capture_state = () => ({
    		Spinner,
    		onMount,
    		ready,
    		alt,
    		date,
    		seconds,
    		minutes,
    		hours,
    		days,
    		countdown
    	});

    	$$self.$inject_state = $$props => {
    		if ('ready' in $$props) $$invalidate(1, ready = $$props.ready);
    		if ('alt' in $$props) $$invalidate(0, alt = $$props.alt);
    		if ('date' in $$props) $$invalidate(6, date = $$props.date);
    		if ('seconds' in $$props) $$invalidate(2, seconds = $$props.seconds);
    		if ('minutes' in $$props) $$invalidate(3, minutes = $$props.minutes);
    		if ('hours' in $$props) $$invalidate(4, hours = $$props.hours);
    		if ('days' in $$props) $$invalidate(5, days = $$props.days);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [alt, ready, seconds, minutes, hours, days, date];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { alt: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get alt() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
