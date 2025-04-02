import { DictForest, Opt, List, StrDict, LikedList, Vec2, exaustive, Dim2, AlRect2 } from 'ts_core';

class DisplayForest {
    constructor(id_fn) {
        this.id_fn = id_fn;
        this.dict_forest = new DictForest(id_fn);
    }
    copy(copy_fn) {
        let out = new DisplayForest(this.id_fn);
        for (let item of this.iter_depth_first()) {
            let item_copy = copy_fn(item.key, item.val.val);
            out.set(item_copy.key, item_copy.val, item.parent_opt.map(parent => parent.key), item.val.is_open);
        }
        return out;
    }
    clear(clear_fn) {
        this.dict_forest.clear((a, b) => clear_fn(a, b.val));
    }
    *iter_depth_first(key_opt = Opt.none()) {
        yield* this.dict_forest.iter_depth_first(key_opt);
    }
    *iter_depth_first_ordered(order_fn, key_opt = Opt.none()) {
        if (key_opt.is_some()) {
            let key = key_opt.value_unchecked();
            let node = this.get(key).value_or_throw();
            yield node;
            let children_values = node.children
                .map(node => ({ key: node.key, val: node.val }))
                .sort((node_a, node_b) => order_fn(node_a.val.val, node_b.val.val))
                .map(v => v.key);
            for (let key of children_values.iter()) {
                yield* this.iter_depth_first_ordered(order_fn, Opt.some(key));
            }
        }
        else {
            let root_keys = this.dict_forest
                .root_keys()
                .sort((key_a, key_b) => {
                let node_a = this.get(key_a).value_or_throw();
                let node_b = this.get(key_b).value_or_throw();
                return order_fn(node_a.val.val, node_b.val.val);
            });
            for (let key of root_keys.iter()) {
                this.iter_depth_first_ordered(order_fn, Opt.some(key));
            }
        }
    }
    list_keys_depth_first(key_opt = Opt.none()) {
        return this.dict_forest.list_keys_depth_first(key_opt);
    }
    *iter_depth_first_with_level(key_opt = Opt.none(), level) {
        yield* this.dict_forest.iter_depth_first_with_level(key_opt, level);
    }
    *iter_depth_first_ordered_with_level(order_fn, key_opt = Opt.none(), level = 0) {
        yield* this.dict_forest.iter_depth_first_ordered_with_level((a, b) => order_fn(a.val, b.val), key_opt, level);
    }
    list_keys_with_level_depth_first() {
        return this.dict_forest.list_keys_with_level_depth_first();
    }
    list_keys_with_level_depth_first_ordered() {
        return this.dict_forest.list_keys_with_level_depth_first();
    }
    contains_key(key) {
        return this.dict_forest.contains_key(key);
    }
    get(key) {
        return this.dict_forest.get(key);
    }
    set(key, val, parent_key_opt, is_open = true) {
        let item = {
            val: val,
            is_open: is_open,
            is_visible: true
        };
        if (parent_key_opt.is_some()) {
            let parent_key = parent_key_opt.value_unchecked();
            let parent = this.dict_forest.get(parent_key).value_unchecked().val;
            item.is_visible = parent.is_visible && parent.is_open;
        }
        this.dict_forest.set(key, item, parent_key_opt);
    }
    remove(key) {
        this.dict_forest.remove(key);
    }
    change_parent(key, new_parent_opt) {
        if (this.contains_key(key) === false) {
            throw new Error();
        }
        if (new_parent_opt.is_some()) {
            if (this.contains_key(new_parent_opt.value_unchecked()) === false) {
                throw new Error();
            }
        }
        let removed_node = this.dict_forest.remove(key).value_unchecked();
        this.dict_forest.append(removed_node, new_parent_opt);
    }
    open(key) {
        let item = this.dict_forest.get(key).value_unchecked().val;
        item.is_open = true;
        this.update_visibility();
    }
    close(key) {
        let item = this.dict_forest.get(key).value_unchecked().val;
        item.is_open = false;
        this.update_visibility();
    }
    keys_with_level(order_fn) {
        let output = new List();
        for (let iter_item of this.dict_forest.iter_depth_first_ordered_with_level((node_a, node_b) => order_fn(node_a.val, node_b.val))) {
            output.push({ key: iter_item.node.key, level: iter_item.level });
        }
        return output;
    }
    first_predescessor_such_that(key, fn) {
        for (let node of this.dict_forest.iter_predecessors(key)) {
            if (fn(node.key, node.val.val)) {
                let predecessor = {
                    key: node.key,
                    val: node.val.val,
                };
                return Opt.some(predecessor);
            }
        }
        return Opt.none();
    }
    update_visibility() {
        for (let node of this.iter_depth_first()) {
            if (node.parent_opt.is_some()) {
                let parent_node = node.parent_opt.value_unchecked();
                node.val.is_visible = parent_node.val.is_visible && parent_node.val.is_open;
            }
            else {
                node.val.is_visible = true;
            }
        }
    }
}

class FloatList {
    constructor(capacity = 32) {
        this.buffer = new Float32Array(capacity);
        this.capacity = capacity;
        this.size = 0;
    }
    get_size() { return this.size; }
    get_capacity() { return this.capacity; }
    clear() {
        this.size = 0;
    }
    push_array(values) {
        let new_size = this.size + values.length;
        if (new_size > this.capacity) {
            let new_capacity = 2 * this.capacity;
            while (new_capacity < new_size) {
                new_capacity = 2 * this.capacity;
            }
            this.resize(new_capacity);
        }
        for (let i = 0; i < values.length; i++) {
            this.push(values[i]);
        }
    }
    push(val) {
        this.buffer[this.size] = val;
        this.size += 1;
    }
    resize(new_capacity) {
        let new_buffer = new Float32Array(new_capacity);
        for (let i = 0; i < this.size; i++) {
            new_buffer[i] = this.buffer[i];
        }
        this.buffer = new_buffer;
        this.capacity = new_capacity;
    }
}

class ElemState {
    constructor(elem) {
        this.is_mouse_enter_start = false;
        this.is_mouse_enter = false;
        this.is_mouse_enter_end = false;
        this.is_mouse_hover_start = false;
        this.is_mouse_hover = false;
        this.is_mouse_hover_end = false;
        elem.addEventListener("mouseenter", ev => this.on_mouse_enter_start());
        elem.addEventListener("mouseleave", ev => this.on_mouse_enter_end());
        elem.addEventListener("mouseover", ev => this.on_mouse_hover_start());
        elem.addEventListener("mouseout", ev => this.on_mouse_hover_end());
    }
    clean_up() {
        if (this.is_mouse_enter_end) {
            this.is_mouse_enter = false;
        }
        this.is_mouse_enter_start = false;
        this.is_mouse_enter_end = false;
        if (this.is_mouse_hover_end) {
            this.is_mouse_hover = false;
        }
        this.is_mouse_hover_start = false;
        this.is_mouse_hover_end = false;
    }
    on_mouse_enter_start() {
        this.is_mouse_enter_start = true;
        this.is_mouse_enter = true;
    }
    on_mouse_enter_end() {
        this.is_mouse_enter_end = true;
    }
    on_mouse_hover_start() {
        this.is_mouse_hover_start = true;
        this.is_mouse_hover = true;
    }
    on_mouse_hover_end() {
        this.is_mouse_hover_end = true;
    }
}

class ElemStatePool {
    constructor() {
        this.map = new StrDict();
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach(node => {
                    let node_id = node.id;
                    this.map.remove(node_id);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    start(key, elem) {
        let state = new ElemState(elem);
        this.map.set(key.toString(), state);
    }
    remove(key) {
        this.map.remove(key.toString());
    }
    get(key) {
        return this.map.get(key.toString());
    }
    clean_up() {
        this.map.for_each((_, val) => val.clean_up());
    }
}

class InputState {
    constructor(elem) {
        this.is_change = false;
        this.is_focus_start = false;
        this.is_focus = false;
        this.is_focus_end = false;
        elem.addEventListener("input", ev => this.on_change());
        elem.addEventListener("change", ev => this.on_change());
        elem.addEventListener("focus", ev => this.on_focus_start());
        elem.addEventListener("blur", ev => this.on_focus_end());
    }
    on_change() {
        this.is_change = true;
    }
    on_focus_start() {
        this.is_focus_start = true;
        this.is_focus = true;
    }
    on_focus_end() {
        this.is_focus_end = true;
    }
    clean_up() {
        if (this.is_focus_end) {
            this.is_focus_start = false;
            this.is_focus = false;
        }
        this.is_change = false;
    }
}

class InputStatePool {
    constructor() {
        this.map = new StrDict();
    }
    start(key, elem) {
        let state = new InputState(elem);
        this.map.set(key.toString(), state);
    }
    remove(key) {
        this.map.remove(key.toString());
    }
    get(key) {
        return this.map.get(key.toString());
    }
    clean_up() {
        this.map.for_each((_, val) => val.clean_up());
    }
}

class KeyState {
    constructor() {
        this.press_start = false;
        this.press = false;
        this.press_end = false;
        this.press_start = false;
        this.press = false;
        this.press_end = false;
    }
    is_press_start() {
        return this.press_start;
    }
    is_pressed() {
        return this.press;
    }
    is_press_end() {
        return this.press_end;
    }
    do_press() {
        this.press_start = true;
        this.press = true;
    }
    do_release() {
        this.press_end = true;
    }
    clean() {
        this.press_start = false;
        if (this.press_end) {
            this.press = false;
        }
        this.press_end = false;
    }
}

class KeyboardState {
    constructor() {
        this.key_map = {
            Digit0: new KeyState(), Digit1: new KeyState(), Digit2: new KeyState(), Digit3: new KeyState(), Digit4: new KeyState(),
            Digit5: new KeyState(), Digit6: new KeyState(), Digit7: new KeyState(), Digit8: new KeyState(), Digit9: new KeyState(),
            KeyA: new KeyState(), KeyB: new KeyState(), KeyC: new KeyState(), KeyD: new KeyState(), KeyE: new KeyState(),
            KeyF: new KeyState(), KeyG: new KeyState(), KeyH: new KeyState(), KeyI: new KeyState(), KeyJ: new KeyState(),
            KeyK: new KeyState(), KeyL: new KeyState(), KeyM: new KeyState(), KeyN: new KeyState(), KeyO: new KeyState(),
            KeyP: new KeyState(), KeyQ: new KeyState(), KeyR: new KeyState(), KeyS: new KeyState(), KeyT: new KeyState(),
            KeyU: new KeyState(), KeyV: new KeyState(), KeyW: new KeyState(), KeyX: new KeyState(), KeyY: new KeyState(),
            KeyZ: new KeyState(),
            F1: new KeyState(), F2: new KeyState(), F3: new KeyState(), F4: new KeyState(), F5: new KeyState(),
            F6: new KeyState(), F7: new KeyState(), F8: new KeyState(), F9: new KeyState(), F10: new KeyState(),
            F11: new KeyState(), F12: new KeyState(), F13: new KeyState(), F14: new KeyState(), F15: new KeyState(),
            F16: new KeyState(), F17: new KeyState(), F18: new KeyState(), F19: new KeyState(), F20: new KeyState(),
            F21: new KeyState(), F22: new KeyState(), F23: new KeyState(), F24: new KeyState(),
            Numpad0: new KeyState(), Numpad1: new KeyState(), Numpad2: new KeyState(), Numpad3: new KeyState(),
            Numpad4: new KeyState(), Numpad5: new KeyState(), Numpad6: new KeyState(), Numpad7: new KeyState(),
            Numpad8: new KeyState(), Numpad9: new KeyState(),
            NumpadAdd: new KeyState(), NumpadSubtract: new KeyState(), NumpadMultiply: new KeyState(), NumpadDivide: new KeyState(),
            NumpadDecimal: new KeyState(), NumpadEnter: new KeyState(), NumpadEqual: new KeyState(),
            NumpadComma: new KeyState(), NumpadParenLeft: new KeyState(), NumpadParenRight: new KeyState(),
            ArrowUp: new KeyState(), ArrowDown: new KeyState(), ArrowLeft: new KeyState(), ArrowRight: new KeyState(),
            Backspace: new KeyState(), Tab: new KeyState(), Enter: new KeyState(), Escape: new KeyState(), Space: new KeyState(),
            ShiftLeft: new KeyState(), ShiftRight: new KeyState(), ControlLeft: new KeyState(), ControlRight: new KeyState(),
            AltLeft: new KeyState(), AltRight: new KeyState(), MetaLeft: new KeyState(), MetaRight: new KeyState(),
            CapsLock: new KeyState(), NumLock: new KeyState(), ScrollLock: new KeyState(),
            PrintScreen: new KeyState(), Pause: new KeyState(), Insert: new KeyState(), Delete: new KeyState(),
            Home: new KeyState(), End: new KeyState(), PageUp: new KeyState(), PageDown: new KeyState(),
            BracketLeft: new KeyState(), BracketRight: new KeyState(), Backslash: new KeyState(),
            Semicolon: new KeyState(), Quote: new KeyState(), Comma: new KeyState(), Period: new KeyState(), Slash: new KeyState(),
            Backquote: new KeyState(), Minus: new KeyState(), Equal: new KeyState(),
            ContextMenu: new KeyState(), IntlBackslash: new KeyState(), IntlRo: new KeyState(), IntlYen: new KeyState(),
            Convert: new KeyState(), NonConvert: new KeyState(), KanaMode: new KeyState(),
            Lang1: new KeyState(), Lang2: new KeyState(), Lang3: new KeyState(), Lang4: new KeyState(), Lang5: new KeyState(),
            Fn: new KeyState(), FnLock: new KeyState()
        };
        window.addEventListener("keydown", ev => {
            let target_key_state = this.key_map[ev.code];
            target_key_state.do_press();
        });
        window.addEventListener("keyup", ev => {
            let target_key_state = this.key_map[ev.code];
            target_key_state.do_release();
        });
    }
    clean_up() {
        for (let key in this.key_map) {
            this.key_map[key].clean();
        }
    }
    get_key_state(key) {
        return this.key_map[key];
    }
}

class PressHistory {
    constructor() {
        this.event_list = new LikedList();
    }
    push(item) {
        if (this.event_list.len() === 4) {
            this.event_list.pop_end();
        }
        this.event_list.push_start(item);
    }
    is_click() {
        if (this.event_list.len() === 0) {
            return false;
        }
        let last_event = this.event_list.start.value_unchecked().value;
        if (last_event.is_press === true) {
            return false;
        }
        let previous_event = this.event_list.start.value_unchecked().next.value_unchecked().value;
        let distance = last_event.pos.distance_to(previous_event.pos);
        let time_gap = last_event.timestamp - previous_event.timestamp;
        return (distance <= 10.0) && (time_gap <= 100.0);
    }
    is_double_click() {
        if (this.event_list.len() < 4) {
            return false;
        }
        let last_event = this.event_list.start.value_unchecked().value;
        let previous_event = this.event_list.end.value_unchecked().value;
        if (last_event.is_press === true || previous_event.is_press === false) {
            return false;
        }
        let distance = last_event.pos.distance_to(previous_event.pos);
        let time_gap = last_event.timestamp - previous_event.timestamp;
        return (distance <= 10.0) && (time_gap <= 250.0);
    }
}

class MouseButton {
    constructor(code) {
        this.press = false;
        this.down = false;
        this.release = false;
        this.click = false;
        this.double = false;
        this.pos = Vec2.zero();
        this.press_history = new PressHistory();
        this.code = code;
        window.addEventListener("mousemove", ev => {
            this.pos = new Vec2(ev.clientX, ev.clientY);
        });
        window.addEventListener("mousedown", ev => {
            if (ev.button === this.code) {
                this.press = true;
                this.down = true;
                this.press_history.push({ is_press: true, pos: this.pos, timestamp: Date.now() });
            }
        });
        window.addEventListener("mouseup", ev => {
            if (ev.button === this.code) {
                this.release = true;
                this.press_history.push({ is_press: false, pos: this.pos, timestamp: Date.now() });
                if (this.press_history.is_click()) {
                    this.click = true;
                }
                if (this.press_history.is_double_click()) {
                    this.double = true;
                }
            }
        });
    }
    clean_up() {
        this.press = false;
        if (this.release) {
            this.down = false;
        }
        this.release = false;
        this.click = false;
        this.double = false;
    }
    is_press() { return this.press; }
    is_down() { return this.down; }
    is_release() { return this.release; }
    is_click() { return this.click; }
    is_double_click() { return this.double; }
}

class MouseState {
    constructor() {
        this._pos = Vec2.zero();
        this._shift = Vec2.zero();
        this._scroll = 0.0;
        this._left_button = new MouseButton(0);
        this._center_button = new MouseButton(1);
        this._right_button = new MouseButton(2);
        window.addEventListener("mousemove", ev => {
            this._pos = new Vec2(ev.clientX, ev.clientY);
            this._shift = this._shift.add(new Vec2(ev.movementX, ev.movementY));
        });
        window.addEventListener("wheel", ev => this._scroll += ev.deltaY);
        // window.oncontextmenu = ev => {
        //     this.is_right_click = true
        // }
    }
    clean_up() {
        this._scroll = 0.0;
        this._shift = new Vec2(0.0, 0.0);
        this._left_button.clean_up();
        this._center_button.clean_up();
        this._right_button.clean_up();
    }
    pos() { return this._pos; }
    shift() { return this._shift; }
    scroll() { return this._scroll; }
    left_button() { return this._left_button; }
    center_button() { return this._center_button; }
    right_button() { return this._right_button; }
}

var HIState;
(function (HIState) {
    HIState.elem_pool = new ElemStatePool();
    HIState.input_pool = new InputStatePool();
    HIState.mouse = new MouseState();
    HIState.keyboard = new KeyboardState();
    function clean_up() {
        HIState.elem_pool.clean_up();
        HIState.input_pool.clean_up();
        HIState.mouse.clean_up();
        HIState.keyboard.clean_up();
    }
    HIState.clean_up = clean_up;
})(HIState || (HIState = {}));

class Style {
    constructor() {
        this.inline_map = new StrDict();
    }
    static gen() {
        return new Style();
    }
    as_str_map() {
        return this.inline_map;
    }
    merge(other) {
        other.as_str_map().for_each((key, val) => {
            this.inline_map.set(key, val);
        });
        return this;
    }
    position(val) {
        this.inline_map.set("position", val);
        return this;
    }
    width(val) {
        this.inline_map.set("width", val);
        return this;
    }
    min_width(val) {
        this.inline_map.set("min-width", val);
        return this;
    }
    height(val) {
        this.inline_map.set("height", val);
        return this;
    }
    min_height(val) {
        this.inline_map.set("min-height", val);
        return this;
    }
    display(val) {
        this.inline_map.set("display", val);
        return this;
    }
    justify(val) {
        this.inline_map.set("justify-content", val);
        return this;
    }
    align(val) {
        this.inline_map.set("align-items", val);
        return this;
    }
    direction(val) {
        this.inline_map.set("flex-direction", val);
        return this;
    }
    grow(val) {
        this.inline_map.set("flex-grow", val.toString());
        return this;
    }
    shrink(val) {
        this.inline_map.set("flex-shrink", val.toString());
        return this;
    }
    wrap(val) {
        this.inline_map.set("flex-wrap", val);
        return this;
    }
    gap(val) {
        this.inline_map.set("gap", val);
        return this;
    }
    padding(val) {
        this.inline_map.set("padding", val);
        return this;
    }
    margin(val) {
        this.inline_map.set("margin", val);
        return this;
    }
    margin_top(val) {
        this.inline_map.set("margin-top", val);
        return this;
    }
    margin_right(val) {
        this.inline_map.set("margin-right", val);
        return this;
    }
    margin_bottom(val) {
        this.inline_map.set("margin-bottom", val);
        return this;
    }
    margin_left(val) {
        this.inline_map.set("margin-left", val);
        return this;
    }
    writing_mode(val) {
        this.inline_map.set("writing-mode", val);
        return this;
    }
    border_style(val) {
        this.inline_map.set("border-style", val);
        return this;
    }
    border_color(val) {
        this.inline_map.set("border-color", val.to_css_string());
        return this;
    }
    border_width(val) {
        this.inline_map.set("border-width", val);
        return this;
    }
    border_radius(val) {
        this.inline_map.set("border-radius", val);
        return this;
    }
    top(val) {
        this.inline_map.set("top", val);
        return this;
    }
    left(val) {
        this.inline_map.set("left", val);
        return this;
    }
    background_color(val) {
        this.inline_map.set("background-color", val.to_css_string());
        return this;
    }
    color(val) {
        this.inline_map.set("color", val.to_css_string());
        return this;
    }
    backdrop_filter(val) {
        this.inline_map.set("backdrop-filter", val);
        return this;
    }
    font(val) {
        this.inline_map.set("font-family", val.familly);
        this.inline_map.set("font-weight", val.weight);
        this.inline_map.set("font-style", val.style);
        return this;
    }
    font_size(val) {
        this.inline_map.set("font-size", val);
        return this;
    }
    text_decoration(val) {
        this.inline_map.set("text-decoration", val);
        return this;
    }
    object_fit(val) {
        this.inline_map.set("object-fit", val);
        return this;
    }
    inline_string() {
        let values = [];
        this.inline_map.for_each((key, val) => {
            values.push(`${key}: ${val};`);
        });
        return values.join(" ");
    }
}

function to_style(style_obj) {
    let style = Style.gen();
    for (let raw_key in style_obj) {
        let key = raw_key;
        switch (key) {
            case 'position': {
                style.position(style_obj['position']);
                break;
            }
            case 'width': {
                style.width(style_obj['width']);
                break;
            }
            case 'min_width': {
                style.width(style_obj['min_width']);
                break;
            }
            case 'height': {
                style.height(style_obj['height']);
                break;
            }
            case 'min_height': {
                style.height(style_obj['min_height']);
                break;
            }
            case 'display': {
                style.display(style_obj['display']);
                break;
            }
            case 'justify': {
                style.justify(style_obj['justify']);
                break;
            }
            case 'align': {
                style.align(style_obj['align']);
                break;
            }
            case 'direction': {
                style.direction(style_obj['direction']);
                break;
            }
            case 'grow': {
                style.grow(style_obj['grow']);
                break;
            }
            case 'shrink': {
                style.shrink(style_obj['shrink']);
                break;
            }
            case 'wrap': {
                style.wrap(style_obj['wrap']);
                break;
            }
            case 'gap': {
                style.gap(style_obj['gap']);
                break;
            }
            case 'padding': {
                style.padding(style_obj['padding']);
                break;
            }
            case 'margin': {
                style.margin(style_obj['margin']);
                break;
            }
            case 'margin_top': {
                style.margin_top(style_obj['margin_top']);
                break;
            }
            case 'margin_right': {
                style.margin_right(style_obj['margin_right']);
                break;
            }
            case 'margin_bottom': {
                style.margin_bottom(style_obj['margin_bottom']);
                break;
            }
            case 'margin_left': {
                style.margin_left(style_obj['margin_left']);
                break;
            }
            case 'writing_mode': {
                style.writing_mode(style_obj['writing_mode']);
                break;
            }
            case 'border_style': {
                style.border_style(style_obj['border_style']);
                break;
            }
            case 'border_color': {
                style.border_color(style_obj['border_color']);
                break;
            }
            case 'border_width': {
                style.border_width(style_obj['border_width']);
                break;
            }
            case 'border_radius': {
                style.border_radius(style_obj['border_radius']);
                break;
            }
            case 'top': {
                style.top(style_obj['top']);
                break;
            }
            case 'left': {
                style.left(style_obj['left']);
                break;
            }
            case 'background_color': {
                style.background_color(style_obj['background_color']);
                break;
            }
            case 'color': {
                style.color(style_obj['color']);
                break;
            }
            case 'backdrop_filter': {
                style.backdrop_filter(style_obj['backdrop_filter']);
                break;
            }
            case 'font': {
                style.font(style_obj['font']);
                break;
            }
            case 'font_size': {
                style.font_size(style_obj['font_size']);
                break;
            }
            case 'text_decoration': {
                style.text_decoration(style_obj['text_decoration']);
                break;
            }
            case 'object_fit': {
                style.object_fit(style_obj['object_fit']);
                break;
            }
            default: exaustive(key);
        }
    }
    return style;
}

class UiAlRect {
    constructor(tl_vec, width, height) {
        this.tl_vec = tl_vec;
        this.width = width;
        this.height = height;
    }
    static unit() {
        return new UiAlRect(Vec2.zero(), 1.0, 1.0);
    }
    copy() {
        return new UiAlRect(this.tl_vec, this.width, this.height);
    }
    dim() {
        return new Dim2(this.width, this.height);
    }
    center() {
        return this.tl_vec.add_scalar(0.5 * this.width, 0.5 * this.height);
    }
    contains(vec) {
        let delta = this.tl_vec.delta_to(vec);
        return 0.0 <= delta.x && delta.x <= this.width
            && 0.0 <= delta.y && delta.y <= this.height;
    }
}

class Div {
    constructor(id) {
        this.id = id;
        let elem = document.getElementById(id.toString());
        if (elem === null || elem.tagName !== "DIV") {
            throw new Error();
        }
        this.dom_div = elem;
        HIState.elem_pool.start(id, elem);
    }
    remove() {
        HIState.elem_pool.remove(this.id);
        this.dom_div.remove();
    }
    set_inner_html(html) {
        this.dom_div.innerHTML = html;
    }
    insert_before_end(html) {
        this.dom_div.insertAdjacentHTML("beforeend", html);
    }
    state() {
        return HIState.elem_pool.get(this.id).value_or_throw();
    }
    merge_style(style) {
        style.as_str_map().for_each((key, val) => {
            this.dom_div.style.setProperty(key, val);
        });
    }
    merge_style_obj(style_obj) {
        let style = to_style(style_obj);
        this.merge_style(style);
    }
    set_style(style) {
        let text = style.inline_string();
        this.dom_div.style.cssText = text;
    }
    ui_al_rect() {
        let bcr = this.dom_div.getBoundingClientRect();
        return new UiAlRect(new Vec2(bcr.x, bcr.y), bcr.width, bcr.height);
    }
    dim() {
        return new Dim2(this.dom_div.clientWidth, this.dom_div.clientHeight);
    }
}

class DragAndDropMng {
    constructor(fn_obj) {
        this.fn_obj = fn_obj;
        this.drag_div = Opt.none();
        this.data = Opt.none();
    }
    update() {
        this.drag_div.if_some(drag_div => {
            if (HIState.mouse.left_button().is_down() === false) {
                drag_div.remove();
                this.drag_div = Opt.none();
                this.data = Opt.none();
            }
            else {
                let cursor_pos = HIState.mouse.pos();
                let style = Style.gen()
                    .left(`${cursor_pos.x}px`)
                    .top(`${cursor_pos.y}px`);
                drag_div.merge_style(style);
            }
        });
    }
    start_drag(data) {
        if (this.drag_div.is_some()) {
            throw new Error();
        }
        this.data = Opt.some(data);
        let { html, outer_div_id } = this.fn_obj.html_gen(data);
        document.body.insertAdjacentHTML("beforeend", html);
        this.drag_div = Opt.some(new Div(outer_div_id));
    }
    stop_drag() {
        this.drag_div.if_some(drag_div => drag_div.remove());
        this.drag_div = Opt.none();
        this.data = Opt.none();
    }
    get_data() {
        return this.data;
    }
}

class DragListener {
    constructor(div) {
        this.div = div;
        this.click_pos = Opt.none();
        this.drag_start = false;
        this.dragging = false;
    }
    udpate() {
        if (this.div.state().is_mouse_enter && HIState.mouse.left_button().is_press()) {
            this.click_pos = Opt.some(HIState.mouse.pos());
        }
        if (HIState.mouse.left_button().is_release()) {
            this.click_pos = Opt.none();
            this.drag_start = false;
            this.dragging = false;
        }
        if (this.dragging) {
            this.drag_start = false;
        }
        if (this.click_pos.is_some() && this.dragging === false) {
            let click_pos = this.click_pos.value_unchecked();
            let move_distance = click_pos.distance_to(HIState.mouse.pos());
            if (move_distance >= 20.0) {
                this.drag_start = true;
                this.dragging = true;
            }
        }
    }
    is_drag_start() {
        return this.drag_start;
    }
    is_dragging() {
        return this.dragging;
    }
}

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class NodeFile {
    constructor(path) {
        this.path = path;
    }
    exists_async() {
        return __awaiter$1(this, void 0, void 0, function* () {
            // return await G.node_interface().file_exists_async(this.path)
            throw new Error();
        });
    }
    file_name(path) {
        return path.split(/[/\\]/).pop() || '';
    }
    is_image() {
        // return G.node_interface().is_image(this.path)
        throw new Error();
    }
    image_type() {
        // let raw_img_type = G.node_interface().image_type(this.path)
        // switch (raw_img_type) {
        //     case "png":
        //     case "bmp":
        //     case "jpeg":
        //         return Opt.some(raw_img_type)
        //     default:
        //         return Opt.none()
        // }
        throw new Error();
    }
    image_dim_async() {
        return new Promise((res, rej) => {
            let image = new Image();
            image.src = this.path;
            image.onload = () => {
                res(new Dim2(image.width, image.height));
            };
            image.onerror = err => {
                rej(err);
            };
        });
    }
}

class FileType {
    constructor(tag) {
        this.tag = tag;
    }
    static of(tag) {
        return new FileType(tag);
    }
    text() {
        return this.tag;
    }
}
FileType.tags = {
    'png': null,
};
(function (FileType) {
    function list_all() {
        let output = new List();
        for (let key in FileType.tags) {
            let enum_val = FileType.of(key);
            output.push(enum_val);
        }
        return output;
    }
    FileType.list_all = list_all;
})(FileType || (FileType = {}));

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class BrowserFile {
    constructor(file) {
        this.file = file;
    }
    static file_dialog_async(opt) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                const input = document.createElement("input");
                input.type = "file";
                if (opt) {
                    if (opt.allow_dir_selection === true) {
                        input.setAttribute("webkitdirectory", "");
                        input.setAttribute("directory", "");
                    }
                }
                input.onchange = () => {
                    let output = new List();
                    if (input.files === null) {
                        res(output);
                    }
                    else {
                        for (let i = 0; i < input.files.length; i++) {
                            input.files[i].webkitRelativePath;
                            let ez_file = new BrowserFile(input.files[i]);
                            output.push(ez_file);
                        }
                        res(output);
                    }
                };
                input.oncancel = () => {
                    res(new List());
                };
                input.click();
            });
        });
    }
    file_name() {
        return this.file.name;
    }
    file_type() {
        let raw_type = this.file.type;
        switch (raw_type) {
            case "image/png": return FileType.of("png");
            default: throw new Error();
        }
    }
    is_image() {
        switch (this.file_type().tag) {
            case "png": return true;
            default: return false;
        }
    }
    buffer_async() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result);
                reader.onerror = () => rej(reader.error);
                reader.readAsArrayBuffer(this.file);
            });
        });
    }
}

class AlCam2 {
    constructor(canvas, rect) {
        this.canvas = canvas;
        this.rect = rect;
    }
    static unit() {
        return new AlCam2(UiAlRect.unit(), AlRect2.unit());
    }
    displace_with_cursor_shift() {
        let world_shift = this.cursor_scene_shift();
        let new_center = this.rect.center.sub(world_shift);
        this.rect = new AlRect2(new_center, this.rect.width, this.rect.height);
    }
    is_cursor_over_window() {
        let cursor_pos = HIState.mouse.pos();
        return this.canvas.contains(cursor_pos);
    }
    cursor_normal_pos() {
        let raw_pos = HIState.mouse.pos();
        let window_center = this.canvas.center();
        let window_pos = window_center.flip_y().delta_to(raw_pos.flip_y());
        return window_pos.div(this.canvas.dim().mul_scalar(0.5).to_vec2());
    }
    cursor_camera_pos() {
        return this
            .cursor_normal_pos()
            .mul(this.rect.dim().mul_scalar(0.5).to_vec2());
    }
    cursor_scene_pos() {
        return this.cursor_camera_pos().add(this.rect.center);
    }
    cursor_scene_shift() {
        let raw_shift = HIState.mouse.shift();
        return raw_shift
            .flip_y()
            .div(this.canvas.dim().to_vec2())
            .mul(this.rect.dim().to_vec2());
    }
    window_shift_to_scene_shift(window_shift) {
        let raw_shift = window_shift;
        return raw_shift
            .flip_y()
            .div(this.canvas.dim().to_vec2())
            .mul(this.rect.dim().to_vec2());
    }
    zoom(value) {
        let fixed_normal_vec = this.cursor_normal_pos();
        let fixed_world_vec = this.cursor_scene_pos();
        let new_camera_dim = this.rect.dim().mul_scalar(1.0 / value); // A zoom of 2.0 menas that the camera is 2 times smaller, this is why we divide.
        let new_shift_from_fixed_world_vec = new_camera_dim
            .to_vec2()
            .mul(fixed_normal_vec)
            .mul_scalar(-0.5);
        let new_center = fixed_world_vec.add(new_shift_from_fixed_world_vec);
        this.rect = new AlRect2(new_center, new_camera_dim.width, new_camera_dim.height);
    }
    zoom_by_scroll_amount(scroll) {
        let zoom_count = scroll / 100.0;
        let zoom = Math.pow(1.2, zoom_count);
        this.zoom(zoom);
    }
}

class Canvas {
    constructor(id) {
        this.id = id;
        let elem = document.getElementById(id.toString());
        if (elem === null || elem.tagName !== "CANVAS") {
            throw new Error();
        }
        this.dom_canvas = elem;
        HIState.elem_pool.start(id, elem);
    }
    remove() {
        HIState.elem_pool.remove(this.id);
        this.dom_canvas.remove();
    }
    state() {
        return HIState.elem_pool.get(this.id).value_or_throw();
    }
    merge_style(style) {
        style.as_str_map().for_each((key, val) => {
            this.dom_canvas.style.setProperty(key, val);
        });
    }
    merge_style_obj(style_obj) {
        let style = to_style(style_obj);
        style.as_str_map().for_each((key, val) => {
            this.dom_canvas.style.setProperty(key, val);
        });
    }
    set_style(style) {
        let text = style.inline_string();
        this.dom_canvas.style.cssText = text;
    }
    set_dim(dim) {
        this.dom_canvas.width = dim.width;
        this.dom_canvas.height = dim.height;
    }
    get_webgl2_context() {
        let gl = this.dom_canvas.getContext("webgl2");
        if (gl === null) {
            throw new Error();
        }
        return gl;
    }
    ui_al_rect() {
        let bcr = this.dom_canvas.getBoundingClientRect();
        return new UiAlRect(new Vec2(bcr.x, bcr.y), bcr.width, bcr.height);
    }
}

let Image$1 = class Image {
    constructor(id) {
        this.id = id;
        let elem = document.getElementById(id.toString());
        if (elem === null || elem.tagName !== "IMG") {
            throw new Error();
        }
        this.elem = elem;
        HIState.elem_pool.start(id, elem);
    }
    remove() {
        HIState.elem_pool.remove(this.id);
        this.elem.remove();
    }
    state() {
        return HIState.elem_pool.get(this.id).value_unchecked();
    }
    set_src(val) {
        this.elem.src = val;
    }
    merge_style(style) {
        style.as_str_map().for_each((key, val) => {
            this.elem.style.setProperty(key, val);
        });
    }
    merge_style_obj(style_obj) {
        let style = to_style(style_obj);
        style.as_str_map().for_each((key, val) => {
            this.elem.style.setProperty(key, val);
        });
    }
    set_style(style) {
        let text = style.inline_string();
        this.elem.style.cssText = text;
    }
};

class Input {
    constructor(id) {
        this.id = id;
        let elem = document.getElementById(id.toString());
        if (elem === null || elem.tagName !== "INPUT") {
            throw new Error();
        }
        this.elem = elem;
        HIState.elem_pool.start(id, elem);
        HIState.input_pool.start(id, elem);
    }
    remove() {
        HIState.elem_pool.remove(this.id);
        HIState.input_pool.remove(this.id);
        this.elem.remove();
    }
    state() {
        return HIState.elem_pool.get(this.id).value_or_throw();
    }
    input_state() {
        return HIState.input_pool.get(this.id).value_or_throw();
    }
    value() {
        return this.elem.value;
    }
    set_value(val) {
        this.elem.value = val;
    }
    select() {
        this.elem.select();
    }
    merge_style(style) {
        style.as_str_map().for_each((key, val) => {
            this.elem.style.setProperty(key, val);
        });
    }
    merge_style_obj(style_obj) {
        let style = to_style(style_obj);
        style.as_str_map().for_each((key, val) => {
            this.elem.style.setProperty(key, val);
        });
    }
    set_style(style) {
        let text = style.inline_string();
        this.elem.style.cssText = text;
    }
}

class Par {
    constructor(id) {
        this.id = id;
        let elem = document.getElementById(id.toString());
        if (elem === null || elem.tagName !== "P") {
            throw new Error();
        }
        this.dom_par = elem;
        HIState.elem_pool.start(id, elem);
    }
    remove() {
        HIState.elem_pool.remove(this.id);
        this.dom_par.remove();
    }
    set_text(text) {
        this.dom_par.innerHTML = text;
    }
    insert_before_end(html) {
        this.dom_par.insertAdjacentHTML("beforeend", html);
    }
    state() {
        return HIState.elem_pool.get(this.id).value_or_throw();
    }
    merge_style(style) {
        style.as_str_map().for_each((key, val) => {
            this.dom_par.style.setProperty(key, val);
        });
    }
    merge_style_obj(style_obj) {
        let style = to_style(style_obj);
        this.merge_style(style);
    }
    set_style(style) {
        let text = style.inline_string();
        this.dom_par.style.cssText = text;
    }
    ui_al_rect() {
        let bcr = this.dom_par.getBoundingClientRect();
        return new UiAlRect(new Vec2(bcr.x, bcr.y), bcr.width, bcr.height);
    }
    dim() {
        return new Dim2(this.dom_par.clientWidth, this.dom_par.clientHeight);
    }
}

class CssColor {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static gen(r, g, b, a) {
        return new CssColor(r, g, b, a);
    }
    static from_hex(hex) {
        let { r, g, b, } = this.hex_to_rgb(hex);
        return new CssColor(r / 255.0, g / 255.0, b / 255.0, 1.0);
    }
    static white() {
        return CssColor.gen(1.0, 1.0, 1.0, 1.0);
    }
    static black() {
        return CssColor.gen(0.0, 0.0, 0.0, 1.0);
    }
    static transparent() {
        return CssColor.white().with_alpha(0.0);
    }
    mul_scalar(scalar) {
        return new CssColor(scalar * this.r, scalar * this.g, scalar * this.b, this.a);
    }
    lighten(pct) {
        return new CssColor(pct + ((1.0 - pct) * this.r), pct + ((1.0 - pct) * this.g), pct + ((1.0 - pct) * this.b), this.a);
    }
    darken(pct) {
        return new CssColor(((1.0 - pct) * this.r), ((1.0 - pct) * this.g), ((1.0 - pct) * this.b), this.a);
    }
    with_alpha(alpha) {
        return new CssColor(this.r, this.g, this.b, alpha);
    }
    to_css_string() {
        return `rgba(${255.0 * this.r}, ${255.0 * this.g}, ${255.0 * this.b}, ${this.a})`;
    }
    // Method to return a hex string
    to_hex_string() {
        // Clamp values to the range 0-255 for RGB
        const r = Math.min(255, Math.max(0, 255.0 * this.r));
        const g = Math.min(255, Math.max(0, 255.0 * this.g));
        const b = Math.min(255, Math.max(0, 255.0 * this.b));
        // Convert RGB values to hex and pad with 0 if necessary
        const hex_r = this.toHexString(r);
        const hex_g = this.toHexString(g);
        const hex_b = this.toHexString(b);
        return `#${hex_r}${hex_g}${hex_b}`;
    }
    // Helper function to convert a number to a 2-digit hex string
    toHexString(value) {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    static hex_to_rgb(hex) {
        // Remove the leading '#' if present
        hex = hex.replace(/^#/, "");
        // Validate hex format
        if (!/^[0-9A-Fa-f]{3,6}$/.test(hex)) {
            throw new Error();
        }
        // Convert 3-digit hex to 6-digit hex
        if (hex.length === 3) {
            hex = hex.split("").map(char => char + char).join("");
        }
        // Parse hex values
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    }
}

var CssResset;
(function (CssResset) {
    function apply() {
        let style = `
        * {
            box-sizing: border-box;
            user-select: none;
        }
        body {
            width: 100vw;
            height: 100vh;
        }
        p {
            width: fit-content;
            height: fit-content;
        }
        input,
        select,
        textarea,
        button {
            border-style: none;
        }
        input:focus,
        select:focus,
        textarea:focus,
        button:focus {
            outline: none;
        }
        svg {
            width: 100%;
            height: 100%;
        }
        input { /* because flex-grow will not work on inputs unless this */
            min-width: 0px;
            width: 100%;
        }


        html, body, div, span, applet, object, iframe,
        h1, h2, h3, h4, h5, h6, p, blockquote, pre,
        a, abbr, acronym, address, big, cite, code,
        del, dfn, em, img, ins, kbd, q, s, samp,
        small, strike, strong, sub, sup, tt, var,
        b, u, i, center,
        dl, dt, dd, ol, ul, li,
        fieldset, form, label, legend,
        table, caption, tbody, tfoot, thead, tr, th, td,
        article, aside, canvas, details, embed, 
        figure, figcaption, footer, header, hgroup, 
        menu, nav, output, ruby, section, summary,
        time, mark, audio, video {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
        }
        /* HTML5 display-role reset for older browsers */
        article, aside, details, figcaption, figure, 
        footer, header, hgroup, menu, nav, section {
            display: block;
        }
        body {
            line-height: 1;
        }
        ol, ul {
            list-style: none;
        }
        blockquote, q {
            quotes: none;
        }
        blockquote:before, blockquote:after,
        q:before, q:after {
            content: '';
            content: none;
        }
        table {
            border-collapse: collapse;
            border-spacing: 0;
        }
        `;
        let tag = `<style>${style}</style>`;
        document.head.insertAdjacentHTML("beforeend", tag);
    }
    CssResset.apply = apply;
})(CssResset || (CssResset = {}));

class Font {
    constructor(familly, weight, style) {
        this.familly = familly;
        this.weight = weight;
        this.style = style;
    }
    append_to_head(path) {
        let text = `@font-face {
            font-family: '${this.familly}';
            src: url('${path}');
            font-weight: ${this.weight};
            font-style: ${this.style};
        }`;
        let style_tag = `<style> ${text} </style>`;
        document.head.insertAdjacentHTML("beforeend", style_tag);
    }
    weight_name() {
        switch (this.weight) {
            case "100": {
                return "thin";
            }
            case "200": {
                return "extra_light";
            }
            case "300": {
                return "light";
            }
            case "400": {
                return "regular";
            }
            case "500": {
                return "medium";
            }
            case "600": {
                return "semi_bold";
            }
            case "700": {
                return "bold";
            }
            case "800": {
                return "extra_bold";
            }
            case "900": {
                return "black";
            }
            default: exaustive(this.weight);
        }
    }
}

function div(id, style, class_names, children) {
    let id_portion = id === null ? "" : `id="${id}"`;
    let style_portion = style === null ? "" : `style="${style.inline_string()}"`;
    let class_names_portion = class_names === null ? "" : `class="${class_names.join(" ")}"`;
    let children_portion = children.join(" ");
    return `<div ${id_portion} ${style_portion} ${class_names_portion}> ${children_portion} </div>`;
}
function par(id, style, class_names, text) {
    let id_portion = id === null ? "" : `id="${id}"`;
    let style_portion = style === null ? "" : `style="${style.inline_string()}"`;
    let class_names_portion = class_names === null ? "" : `class="${class_names.join(" ")}"`;
    return `<p ${id_portion} ${style_portion} ${class_names_portion}> ${text} </p>`;
}
function input(id, style, class_names, placeholder = null) {
    let id_portion = id === null ? "" : `id="${id}"`;
    let style_portion = style === null ? "" : `style="${style.inline_string()}"`;
    let class_names_portion = class_names === null ? "" : `class="${class_names.join(" ")}"`;
    let palceholder_portion = placeholder === null ? "" : `placeholder="${placeholder}"`;
    return `<input type="text" ${id_portion} ${style_portion} ${class_names_portion} ${palceholder_portion}/>`;
}
function image(id, style, class_names, src) {
    let id_portion = id === null ? "" : `id="${id}"`;
    let style_portion = style === null ? "" : `style="${style.inline_string()}"`;
    let class_names_portion = class_names === null ? "" : `class="${class_names.join(" ")}"`;
    let src_portion = src === null ? "" : `src="${src}"`;
    return `<img ${id_portion} ${style_portion} ${class_names_portion} ${src_portion}>`;
}
function canvas(id, style, class_names) {
    let id_portion = id === null ? "" : `id="${id}"`;
    let style_portion = style === null ? "" : `style="${style.inline_string()}"`;
    let class_names_portion = class_names === null ? "" : `class="${class_names.join(" ")}"`;
    return `<canvas ${id_portion} ${style_portion} ${class_names_portion}></canvas>`;
}

class FloatListBuffer {
    constructor(capacity = 16) {
        this.buffer = new Float32Array(capacity);
        this.size = 0;
        this.capacity = capacity;
    }
    get_buffer() {
        return this.buffer;
    }
    len() {
        return this.size;
    }
    clear() {
        this.size = 0;
    }
    push(value) {
        if (this.size + 1 > this.capacity) {
            let new_buffer = new Float32Array(2 * this.capacity);
            for (let i = 0; i < this.size; i += 1) {
                new_buffer[i] = this.buffer[i];
            }
            this.buffer = new_buffer;
            this.capacity = 2 * this.capacity;
        }
        this.buffer[this.size] = value;
        this.size += 1;
    }
    push_many(values) {
        if (this.size + values.length > this.capacity) {
            let new_capacity = this.capacity;
            while (new_capacity < this.size + values.length) {
                new_capacity = 2 * new_capacity;
            }
            let new_buffer = new Float32Array(new_capacity);
            for (let i = 0; i < this.size; i += 1) {
                new_buffer[i] = this.buffer[i];
            }
            this.buffer = new_buffer;
            this.capacity = new_capacity;
        }
        for (let i = 0; i < values.length; i += 1) {
            this.buffer[this.size + i] = values[i];
        }
        this.size += values.length;
    }
}

var GlBufferTarget;
(function (GlBufferTarget) {
    GlBufferTarget[GlBufferTarget["BUFFER"] = 0] = "BUFFER";
})(GlBufferTarget || (GlBufferTarget = {}));
(function (GlBufferTarget) {
    function gl_enum(gl, target) {
        switch (target) {
            case GlBufferTarget.BUFFER: return gl.ARRAY_BUFFER;
            default: exaustive(target);
        }
    }
    GlBufferTarget.gl_enum = gl_enum;
})(GlBufferTarget || (GlBufferTarget = {}));

var GlBufferUsage;
(function (GlBufferUsage) {
    GlBufferUsage[GlBufferUsage["STATIC_DRAW"] = 0] = "STATIC_DRAW";
    GlBufferUsage[GlBufferUsage["DYNAMIC_DRAW"] = 1] = "DYNAMIC_DRAW";
    GlBufferUsage[GlBufferUsage["STREAM_DRAW"] = 2] = "STREAM_DRAW";
    GlBufferUsage[GlBufferUsage["STATIC_READ"] = 3] = "STATIC_READ";
    GlBufferUsage[GlBufferUsage["DYNAMIC_READ"] = 4] = "DYNAMIC_READ";
    GlBufferUsage[GlBufferUsage["STREAM_READ"] = 5] = "STREAM_READ";
    GlBufferUsage[GlBufferUsage["STATIC_COPY"] = 6] = "STATIC_COPY";
    GlBufferUsage[GlBufferUsage["DYNAMIC_COPY"] = 7] = "DYNAMIC_COPY";
    GlBufferUsage[GlBufferUsage["STREAM_COPY"] = 8] = "STREAM_COPY";
})(GlBufferUsage || (GlBufferUsage = {}));
(function (GlBufferUsage) {
    function gl_enum(gl, usage) {
        switch (usage) {
            case GlBufferUsage.STATIC_DRAW: return gl.STATIC_DRAW;
            case GlBufferUsage.DYNAMIC_DRAW: return gl.DYNAMIC_DRAW;
            case GlBufferUsage.STREAM_DRAW: return gl.STREAM_DRAW;
            case GlBufferUsage.STATIC_READ: return gl.STATIC_READ;
            case GlBufferUsage.DYNAMIC_READ: return gl.DYNAMIC_READ;
            case GlBufferUsage.STREAM_READ: return gl.STREAM_READ;
            case GlBufferUsage.STATIC_COPY: return gl.STATIC_COPY;
            case GlBufferUsage.DYNAMIC_COPY: return gl.DYNAMIC_COPY;
            case GlBufferUsage.STREAM_COPY: return gl.STREAM_COPY;
            default: exaustive(usage);
        }
    }
    GlBufferUsage.gl_enum = gl_enum;
})(GlBufferUsage || (GlBufferUsage = {}));

class GlBuffer {
    constructor(gl, target, usage) {
        this.gl = gl;
        this.webgl_buffer = gl.createBuffer();
        this.target = target;
        this.usage = usage;
    }
    drop() {
        this.gl.deleteBuffer(this.webgl_buffer);
    }
    bind() {
        let target = GlBufferTarget.gl_enum(this.gl, this.target);
        this.gl.bindBuffer(target, this.webgl_buffer);
    }
    unbind() {
        let target = GlBufferTarget.gl_enum(this.gl, this.target);
        this.gl.bindBuffer(target, null);
    }
    send_to_gl_float32array(buffer) {
        let target = GlBufferTarget.gl_enum(this.gl, this.target);
        let usage = GlBufferUsage.gl_enum(this.gl, this.usage);
        this.gl.bufferData(target, buffer, usage, 0, buffer.length);
    }
    send_to_gl_wasmf32buffer(wasm_memory, buffer_ptr, length) {
        let float_32_array = new Float32Array(wasm_memory.buffer, buffer_ptr, length);
        this.send_to_gl_float32array(float_32_array);
    }
}

const GlCtx = WebGL2RenderingContext;
function get_webgl_context(canvas_id) {
    let canvas = document.getElementById(canvas_id.toString());
    if (canvas === null) {
        throw new Error();
    }
    let ctx = canvas.getContext("webgl2");
    if (ctx === null) {
        throw new Error();
    }
    return ctx;
}

var GlShaderKind;
(function (GlShaderKind) {
    GlShaderKind[GlShaderKind["VERTEX"] = 0] = "VERTEX";
    GlShaderKind[GlShaderKind["FRAGMENT"] = 1] = "FRAGMENT";
})(GlShaderKind || (GlShaderKind = {}));
(function (GlShaderKind) {
    function gl_enum(gl, kind) {
        switch (kind) {
            case GlShaderKind.VERTEX: return gl.VERTEX_SHADER;
            case GlShaderKind.FRAGMENT: return gl.FRAGMENT_SHADER;
            default: exaustive(kind);
        }
    }
    GlShaderKind.gl_enum = gl_enum;
})(GlShaderKind || (GlShaderKind = {}));

class GlUniform {
    constructor(gl, webgl_program, uniform_name) {
        this.gl = gl;
        let location = gl.getUniformLocation(webgl_program, uniform_name);
        if (location === null) {
            throw new Error();
        }
        this.webgl_uniform = location;
    }
    data_4f(data) {
        this.gl.uniform4f(this.webgl_uniform, data.x(), data.y(), data.z(), data.w());
    }
}

var VertexPointerKind;
(function (VertexPointerKind) {
    VertexPointerKind[VertexPointerKind["FLOAT"] = 0] = "FLOAT";
})(VertexPointerKind || (VertexPointerKind = {}));
(function (VertexPointerKind) {
    function gl_enum(gl, kind) {
        switch (kind) {
            case VertexPointerKind.FLOAT: return gl.FLOAT;
            default: exaustive(kind);
        }
    }
    VertexPointerKind.gl_enum = gl_enum;
    function size_bytes(gl, kind) {
        switch (kind) {
            case VertexPointerKind.FLOAT: return 4;
            default: exaustive(kind);
        }
    }
    VertexPointerKind.size_bytes = size_bytes;
})(VertexPointerKind || (VertexPointerKind = {}));

class GlProgram {
    constructor(gl, vert_src, frag_src, pointers, uniform_names) {
        this.gl = gl;
        let program = GlProgram.create_program(gl, vert_src, frag_src);
        this.webgl_program = program;
        let vao = gl.createVertexArray();
        if (vao === null) {
            throw new Error();
        }
        this.vao = vao;
        this.uniform_map = new StrDict();
        this.bind();
        this.setup_pointers(pointers);
        uniform_names.forEach(unif_name => this.setup_uniform(unif_name));
    }
    drop() {
        this.gl.deleteProgram(this.webgl_program);
        this.gl.deleteVertexArray(this.vao);
    }
    bind() {
        this.gl.useProgram(this.webgl_program);
        this.gl.bindVertexArray(this.vao);
    }
    unbind() {
        this.gl.useProgram(null);
        this.gl.bindVertexArray(null);
    }
    get_uniform_mut(uniform_name) {
        return this.uniform_map.get(uniform_name).value_or_throw();
    }
    setup_uniform(uniform_name) {
        let uniform = new GlUniform(this.gl, this.webgl_program, uniform_name);
        this.uniform_map.set(uniform_name, uniform);
    }
    setup_pointers(pointers) {
        this.bind();
        let stride = 0;
        for (let pointer of pointers) {
            let pointer_size = VertexPointerKind.size_bytes(this.gl, pointer.kind);
            stride += pointer_size * pointer.components;
        }
        let offset = 0;
        for (let pointer of pointers) {
            let attrib = this.gl.getAttribLocation(this.webgl_program, pointer.name);
            this.gl.enableVertexAttribArray(attrib);
            let kind = VertexPointerKind.gl_enum(this.gl, pointer.kind);
            this.gl.vertexAttribPointer(attrib, pointer.components, kind, false, stride, offset);
            offset += VertexPointerKind.size_bytes(this.gl, pointer.kind) * pointer.components;
        }
    }
    static create_program(gl, vert_src, frag_src) {
        let vertex_shader = this.create_shader(gl, GlShaderKind.VERTEX, vert_src);
        let farg_shader = this.create_shader(gl, GlShaderKind.FRAGMENT, frag_src);
        let program = gl.createProgram();
        if (program === null) {
            throw new Error();
        }
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, farg_shader);
        gl.linkProgram(program);
        let success = gl
            .getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        else {
            let error = gl.getProgramInfoLog(program);
            console.log(error);
            gl.deleteProgram(program);
            throw new Error(error);
        }
    }
    static create_shader(gl, kind, src) {
        let gl_kind = GlShaderKind.gl_enum(gl, kind);
        let shader = gl.createShader(gl_kind);
        if (shader === null) {
            throw new Error();
        }
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        let success = gl
            .getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        else {
            let error = gl.getShaderInfoLog(shader);
            console.log(error);
            gl.deleteShader(shader);
            throw new Error(error);
        }
    }
}

var GlTextureFormat;
(function (GlTextureFormat) {
    GlTextureFormat[GlTextureFormat["RGBA"] = 0] = "RGBA";
    GlTextureFormat[GlTextureFormat["RGB"] = 1] = "RGB";
    GlTextureFormat[GlTextureFormat["LUMINANCE_ALPHA"] = 2] = "LUMINANCE_ALPHA";
    GlTextureFormat[GlTextureFormat["LUMINANCE"] = 3] = "LUMINANCE";
    GlTextureFormat[GlTextureFormat["ALPHA"] = 4] = "ALPHA";
})(GlTextureFormat || (GlTextureFormat = {}));
(function (GlTextureFormat) {
    function gl_enum(gl, format) {
        switch (format) {
            case GlTextureFormat.RGBA: return gl.RGBA;
            case GlTextureFormat.RGB: return gl.RGB;
            case GlTextureFormat.LUMINANCE_ALPHA: return gl.LUMINANCE_ALPHA;
            case GlTextureFormat.LUMINANCE: return gl.LUMINANCE;
            case GlTextureFormat.ALPHA: return gl.ALPHA;
            default: exaustive(format);
        }
    }
    GlTextureFormat.gl_enum = gl_enum;
})(GlTextureFormat || (GlTextureFormat = {}));

var GlTextureInternalFormat;
(function (GlTextureInternalFormat) {
    GlTextureInternalFormat[GlTextureInternalFormat["RGBA"] = 0] = "RGBA";
    GlTextureInternalFormat[GlTextureInternalFormat["RGB"] = 1] = "RGB";
    GlTextureInternalFormat[GlTextureInternalFormat["LUMINANCE_ALPHA"] = 2] = "LUMINANCE_ALPHA";
    GlTextureInternalFormat[GlTextureInternalFormat["LUMINANCE"] = 3] = "LUMINANCE";
    GlTextureInternalFormat[GlTextureInternalFormat["ALPHA"] = 4] = "ALPHA";
})(GlTextureInternalFormat || (GlTextureInternalFormat = {}));
(function (GlTextureInternalFormat) {
    function gl_enum(gl, internal_format) {
        switch (internal_format) {
            case GlTextureInternalFormat.RGBA: return gl.RGBA;
            case GlTextureInternalFormat.RGB: return gl.RGB;
            case GlTextureInternalFormat.LUMINANCE_ALPHA: return gl.LUMINANCE_ALPHA;
            case GlTextureInternalFormat.LUMINANCE: return gl.LUMINANCE;
            case GlTextureInternalFormat.ALPHA: return gl.ALPHA;
            default: exaustive(internal_format);
        }
    }
    GlTextureInternalFormat.gl_enum = gl_enum;
})(GlTextureInternalFormat || (GlTextureInternalFormat = {}));

var GlTextureTarget;
(function (GlTextureTarget) {
    GlTextureTarget[GlTextureTarget["TwoD"] = 0] = "TwoD";
    GlTextureTarget[GlTextureTarget["ThreeD"] = 1] = "ThreeD";
})(GlTextureTarget || (GlTextureTarget = {}));
(function (GlTextureTarget) {
    function gl_enum(gl, target) {
        switch (target) {
            case GlTextureTarget.TwoD: return gl.TEXTURE_2D;
            case GlTextureTarget.ThreeD: return gl.TEXTURE_3D;
            default: exaustive(target);
        }
    }
    GlTextureTarget.gl_enum = gl_enum;
})(GlTextureTarget || (GlTextureTarget = {}));

var MagFilter;
(function (MagFilter) {
    MagFilter[MagFilter["NEAREST"] = 0] = "NEAREST";
    MagFilter[MagFilter["LINEAR"] = 1] = "LINEAR";
})(MagFilter || (MagFilter = {}));
(function (MagFilter) {
    function gl_enum(gl, mag_filter) {
        switch (mag_filter) {
            case MagFilter.NEAREST: return gl.NEAREST;
            case MagFilter.LINEAR: return gl.LINEAR;
            default: exaustive(mag_filter);
        }
    }
    MagFilter.gl_enum = gl_enum;
})(MagFilter || (MagFilter = {}));

var MinFilter;
(function (MinFilter) {
    MinFilter[MinFilter["NEAREST"] = 0] = "NEAREST";
    MinFilter[MinFilter["LINEAR"] = 1] = "LINEAR";
    MinFilter[MinFilter["NEAREST_MIPMAP_NEAREST"] = 2] = "NEAREST_MIPMAP_NEAREST";
    MinFilter[MinFilter["LINEAR_MIPMAP_NEAREST"] = 3] = "LINEAR_MIPMAP_NEAREST";
    MinFilter[MinFilter["NEAREST_MIPMAP_LINEAR"] = 4] = "NEAREST_MIPMAP_LINEAR";
    MinFilter[MinFilter["LINEAR_MIPMAP_LINEAR"] = 5] = "LINEAR_MIPMAP_LINEAR";
    MinFilter[MinFilter["TEXTURE_MAG_FILTER"] = 6] = "TEXTURE_MAG_FILTER";
    MinFilter[MinFilter["TEXTURE_MIN_FILTER"] = 7] = "TEXTURE_MIN_FILTER";
})(MinFilter || (MinFilter = {}));
(function (MinFilter) {
    function gl_enum(gl, min_filter) {
        switch (min_filter) {
            case MinFilter.NEAREST: return gl.NEAREST;
            case MinFilter.LINEAR: return gl.LINEAR;
            case MinFilter.NEAREST_MIPMAP_NEAREST: return gl.NEAREST_MIPMAP_NEAREST;
            case MinFilter.LINEAR_MIPMAP_NEAREST: return gl.LINEAR_MIPMAP_NEAREST;
            case MinFilter.NEAREST_MIPMAP_LINEAR: return gl.NEAREST_MIPMAP_LINEAR;
            case MinFilter.LINEAR_MIPMAP_LINEAR: return gl.LINEAR_MIPMAP_LINEAR;
            case MinFilter.TEXTURE_MAG_FILTER: return gl.TEXTURE_MAG_FILTER;
            case MinFilter.TEXTURE_MIN_FILTER: return gl.TEXTURE_MIN_FILTER;
            default: exaustive(min_filter);
        }
    }
    MinFilter.gl_enum = gl_enum;
})(MinFilter || (MinFilter = {}));

class GlTexture {
    constructor(gl, target, min_filter, mag_filter) {
        let gl_tex = gl.createTexture();
        this.gl = gl;
        this.gl_tex = gl_tex;
        this.target = target;
        this.min_filter = min_filter;
        this.mag_filter = mag_filter;
    }
    drop() {
        this.gl.deleteTexture(this.gl_tex);
    }
    bind() {
        let target_gl_enum = GlTextureTarget.gl_enum(this.gl, this.target);
        let min_filter_gl_enum = MinFilter.gl_enum(this.gl, this.min_filter);
        let mag_filter_gl_enum = MagFilter.gl_enum(this.gl, this.mag_filter);
        this.gl.bindTexture(target_gl_enum, this.gl_tex);
        this.gl.texParameteri(target_gl_enum, this.gl.TEXTURE_MIN_FILTER, min_filter_gl_enum);
        this.gl.texParameteri(target_gl_enum, this.gl.TEXTURE_MAG_FILTER, mag_filter_gl_enum);
        this.gl.texParameteri(target_gl_enum, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(target_gl_enum, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }
    unbind() {
        let target_gl_enum = GlTextureTarget.gl_enum(this.gl, this.target);
        this.gl.bindTexture(target_gl_enum, null);
    }
    data_rgba_async(image_path) {
        return new Promise((res, rej) => {
            let target_gl_enum = GlTextureTarget.gl_enum(this.gl, this.target);
            let internal_format_gl_enum = GlTextureInternalFormat.gl_enum(this.gl, GlTextureInternalFormat.RGBA);
            let format_gl_enum = GlTextureFormat.gl_enum(this.gl, GlTextureFormat.RGBA);
            let image = new Image();
            image.onload = ev => {
                this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
                this.bind();
                this.gl.texImage2D(target_gl_enum, 0, internal_format_gl_enum, format_gl_enum, this.gl.UNSIGNED_BYTE, image);
                this.unbind();
                res();
            };
            image.onerror = err => rej(err);
            image.src = image_path;
        });
    }
}

const VERTEX_SRC$1 = `
attribute vec4 a_pos;
attribute vec4 a_color;

uniform vec4 u_camera;

varying vec4 v_color;

void main() {

    vec2 camera_corrected_pos = (a_pos.xy - u_camera.xy) / (0.5 * u_camera.zw);

    gl_Position = vec4(camera_corrected_pos, a_pos.z, a_pos.w);

    v_color = a_color;

}
`;
const FRAGMENT_SRC$1 = `
precision highp float;

varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
`;
class GeomRenderer {
    constructor(gl) {
        this.gl = gl;
        let buffer = new GlBuffer(gl, GlBufferTarget.BUFFER, GlBufferUsage.DYNAMIC_DRAW);
        buffer.bind();
        let program = new GlProgram(gl, VERTEX_SRC$1, FRAGMENT_SRC$1, [
            { name: "a_pos", kind: VertexPointerKind.FLOAT, components: 4 },
            { name: "a_color", kind: VertexPointerKind.FLOAT, components: 4 },
        ], ["u_camera",]);
        buffer.unbind();
        this.program = program;
        this.buffer = buffer;
        this.n_vertices = 0;
    }
    drop() {
        this.program.drop();
        this.buffer.drop();
    }
    bind() {
        this.buffer.bind();
        this.program.bind();
    }
    unbind() {
        this.buffer.unbind();
        this.program.unbind();
    }
    set_camera(al_cam) {
        this.program
            .get_uniform_mut("u_camera")
            .data_4f(al_cam);
    }
    draw(buffer) {
        this.buffer.send_to_gl_float32array(buffer);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, buffer.length / 8);
    }
}

const VERTEX_SRC = `
uniform vec4 u_camera; 

attribute vec4 a_pos;
attribute vec4 a_color;
attribute vec2 a_tex;

varying vec4 v_color;
varying vec2 v_tex;

void main() {

    vec2 camera_corrected_pos = (a_pos.xy - u_camera.xy) / (0.5 * u_camera.zw);

    gl_Position = vec4(camera_corrected_pos, a_pos.z, a_pos.w);

    v_color = a_color;
    v_tex = a_tex;

}
`;
const FRAGMENT_SRC = `
precision highp float;

uniform sampler2D u_sampler;

varying vec4 v_color;
varying vec2 v_tex;

void main() {
    vec4 tex_color = texture2D(u_sampler, v_tex);
    gl_FragColor = v_color * tex_color;
}
`;
class TexRenderer {
    constructor(gl) {
        this.gl = gl;
        let buffer = new GlBuffer(gl, GlBufferTarget.BUFFER, GlBufferUsage.DYNAMIC_DRAW);
        buffer.bind();
        let program = new GlProgram(gl, VERTEX_SRC, FRAGMENT_SRC, [
            { name: "a_pos", kind: VertexPointerKind.FLOAT, components: 4 },
            { name: "a_color", kind: VertexPointerKind.FLOAT, components: 4 },
            { name: "a_tex", kind: VertexPointerKind.FLOAT, components: 2 },
        ], ["u_camera",]);
        buffer.unbind();
        this.program = program;
        this.buffer = buffer;
    }
    drop() {
        this.program.drop();
        this.buffer.drop();
    }
    bind() {
        this.buffer.bind();
        this.program.bind();
    }
    unbind() {
        this.buffer.unbind();
        this.program.unbind();
    }
    set_camera(al_cam) {
        this.program
            .get_uniform_mut("u_camera")
            .data_4f(al_cam);
    }
    draw(buffer) {
        this.buffer.send_to_gl_float32array(buffer);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, buffer.length / 10);
    }
}

export { AlCam2, BrowserFile, Canvas, CssColor, CssResset, DisplayForest, Div, DragAndDropMng, DragListener, ElemState, ElemStatePool, FileType, FloatList, FloatListBuffer, Font, GeomRenderer, GlBuffer, GlBufferTarget, GlBufferUsage, GlCtx, GlProgram, GlShaderKind, GlTexture, GlTextureFormat, GlTextureInternalFormat, GlTextureTarget, GlUniform, HIState, Image$1 as Image, Input, InputState, InputStatePool, KeyState, KeyboardState, MagFilter, MinFilter, MouseButton, MouseState, NodeFile, Par, PressHistory, Style, TexRenderer, UiAlRect, VertexPointerKind, canvas, div, get_webgl_context, image, input, par, to_style };
