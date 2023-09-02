let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
*/
export class Engine {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Engine.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_engine_free(ptr);
    }
    /**
    * @param {number} mines
    * @returns {Engine}
    */
    static new(mines) {
        const ret = wasm.engine_new(mines);
        return Engine.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    score() {
        const ret = wasm.engine_score(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Array<any>}
    */
    get_scores() {
        const ret = wasm.engine_get_scores(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {number} visible
    * @param {number} time
    */
    add_move(visible, time) {
        wasm.engine_add_move(this.__wbg_ptr, visible, time);
    }
    /**
    * @returns {Array<any>}
    */
    times() {
        const ret = wasm.engine_times(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {number}
    */
    time() {
        const ret = wasm.engine_time(this.__wbg_ptr);
        return ret >>> 0;
    }
}
/**
*/
export class Minefield {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Minefield.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_minefield_free(ptr);
    }
    /**
    * @returns {Engine}
    */
    get engine() {
        const ret = wasm.__wbg_get_minefield_engine(this.__wbg_ptr);
        return Engine.__wrap(ret);
    }
    /**
    * @param {Engine} arg0
    */
    set engine(arg0) {
        _assertClass(arg0, Engine);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_minefield_engine(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {number} width
    * @param {number} height
    * @param {number} mines
    * @returns {Minefield}
    */
    static new(width, height, mines) {
        const ret = wasm.minefield_new(width, height, mines);
        return Minefield.__wrap(ret);
    }
    /**
    * @param {number} col
    * @param {number} row
    * @param {number} i
    * @returns {number}
    */
    gen_loop(col, row, i) {
        const ret = wasm.minefield_gen_loop(this.__wbg_ptr, col, row, i);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    length() {
        const ret = wasm.minefield_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} col
    * @param {number} row
    * @returns {boolean}
    */
    mine_at(col, row) {
        const ret = wasm.minefield_mine_at(this.__wbg_ptr, col, row);
        return ret !== 0;
    }
    /**
    * @param {number} index
    * @returns {boolean}
    */
    mine_index(index) {
        const ret = wasm.minefield_mine_index(this.__wbg_ptr, index);
        return ret !== 0;
    }
    /**
    * @returns {number}
    */
    width() {
        const ret = wasm.minefield_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    height() {
        const ret = wasm.minefield_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Array<any>}
    */
    cells() {
        const ret = wasm.minefield_cells(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    minemap() {
        const ret = wasm.minefield_minemap(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {number} col
    * @param {number} row
    * @returns {number}
    */
    minemap_at(col, row) {
        const ret = wasm.minefield_minemap_at(this.__wbg_ptr, col, row);
        return ret;
    }
    /**
    * @returns {Array<any>}
    */
    visible() {
        const ret = wasm.minefield_visible(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {number} col
    * @param {number} row
    * @returns {boolean}
    */
    visible_at(col, row) {
        const ret = wasm.minefield_visible_at(this.__wbg_ptr, col, row);
        return ret !== 0;
    }
    /**
    * @param {number} col
    * @param {number} row
    * @returns {Array<any>}
    */
    reveal(col, row) {
        const ret = wasm.minefield_reveal(this.__wbg_ptr, col, row);
        return takeObject(ret);
    }
    /**
    * @returns {number}
    */
    turns() {
        const ret = wasm.minefield_turns(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {boolean}
    */
    is_finished() {
        const ret = wasm.minefield_is_finished(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {number} col
    * @param {number} row
    * @returns {number}
    */
    xy_to_index(col, row) {
        const ret = wasm.minefield_xy_to_index(this.__wbg_ptr, col, row);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Array<any>}
    */
    index_to_xy(index) {
        const ret = wasm.minefield_index_to_xy(this.__wbg_ptr, index);
        return takeObject(ret);
    }
    /**
    * @param {number} col
    * @param {number} row
    */
    flag(col, row) {
        wasm.minefield_flag(this.__wbg_ptr, col, row);
    }
    /**
    * @param {number} col
    * @param {number} row
    * @returns {boolean}
    */
    flag_at(col, row) {
        const ret = wasm.minefield_flag_at(this.__wbg_ptr, col, row);
        return ret !== 0;
    }
    /**
    * @returns {Array<any>}
    */
    flags() {
        const ret = wasm.minefield_flags(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {number} row
    * @param {number} col
    * @returns {number}
    */
    nearby_flags(row, col) {
        const ret = wasm.minefield_nearby_flags(this.__wbg_ptr, row, col);
        return ret;
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_crypto_c48a774b022d20ac = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_process_298734cf255a885d = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_e2e78e134e3e5d01 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_1cd7a5d853dbea79 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_msCrypto_bcb970640f50a1e8 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_8f08ceecec0f4fee = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_37fa2ca9e4e07fab = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_dc1e9a60c158336d = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_new_898a68150f225f2e = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_581967eacc0e2604 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_cb65541d95d71282 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_1ff1d729e9aae938 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_5f4faef6c12b79ec = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_1d39714405582d3c = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_651f05c6a0944d1c = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_push_ca1c26067ef907ac = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_call_01734de55d61e11d = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getTime_5e2054f832d82ec9 = function(arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_new0_c0be7df4b6bd481f = function() {
        const ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_085ec1f694018c4f = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_6da8e527659b86aa = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8125e318e6245eed = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_5cf90238115182c3 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_newwithlength_e5d69174d6984cd7 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    }