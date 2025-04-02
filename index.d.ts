import { Opt, DictTreeNode, List, StrDict, Vec2, Dim2, Prm, AlRect2, Vec4 } from 'ts_core';

type DisplayForestItem<Val> = {
    val: Val;
    is_open: boolean;
    is_visible: boolean;
};

declare class DisplayForest<Key, Val> {
    private id_fn;
    private dict_forest;
    constructor(id_fn: (key: Key) => string);
    copy(copy_fn: (key: Key, val: Val) => {
        key: Key;
        val: Val;
    }): DisplayForest<Key, Val>;
    clear(clear_fn: (key: Key, val: Val) => void): void;
    iter_depth_first(key_opt?: Opt<Key>): Generator<DictTreeNode<Key, DisplayForestItem<Val>>, void, any>;
    iter_depth_first_ordered(order_fn: (a: Val, b: Val) => number, key_opt?: Opt<Key>): Generator<DictTreeNode<Key, DisplayForestItem<Val>>>;
    list_keys_depth_first(key_opt?: Opt<Key>): List<Key>;
    iter_depth_first_with_level(key_opt: Opt<Key> | undefined, level: number): Generator<{
        node: DictTreeNode<Key, DisplayForestItem<Val>>;
        level: number;
    }, void, any>;
    iter_depth_first_ordered_with_level(order_fn: (a: Val, b: Val) => number, key_opt?: Opt<Key>, level?: number): Generator<{
        node: DictTreeNode<Key, DisplayForestItem<Val>>;
        level: number;
    }, void, any>;
    list_keys_with_level_depth_first(): List<{
        key: Key;
        level: number;
    }>;
    list_keys_with_level_depth_first_ordered(): List<{
        key: Key;
        level: number;
    }>;
    contains_key(key: Key): boolean;
    get(key: Key): Opt<DictTreeNode<Key, DisplayForestItem<Val>>>;
    set(key: Key, val: Val, parent_key_opt: Opt<Key>, is_open?: boolean): void;
    remove(key: Key): void;
    change_parent(key: Key, new_parent_opt: Opt<Key>): void;
    open(key: Key): void;
    close(key: Key): void;
    keys_with_level(order_fn: (a: Val, b: Val) => number): List<{
        key: Key;
        level: number;
    }>;
    first_predescessor_such_that(key: Key, fn: (key: Key, val: Val) => boolean): Opt<{
        key: Key;
        val: Val;
    }>;
    private update_visibility;
}

declare class FloatList {
    buffer: Float32Array;
    private size;
    private capacity;
    constructor(capacity?: number);
    get_size(): number;
    get_capacity(): number;
    clear(): void;
    push_array(values: number[]): void;
    private push;
    private resize;
}

declare class DragAndDropMng<Data> {
    private readonly fn_obj;
    private drag_div;
    private data;
    constructor(fn_obj: {
        html_gen: (data: Data) => {
            html: string;
            outer_div_id: number;
        };
    });
    update(): void;
    start_drag(data: Data): void;
    stop_drag(): void;
    get_data(): Opt<Data>;
}

declare class ElemState {
    is_mouse_enter_start: boolean;
    is_mouse_enter: boolean;
    is_mouse_enter_end: boolean;
    is_mouse_hover_start: boolean;
    is_mouse_hover: boolean;
    is_mouse_hover_end: boolean;
    constructor(elem: HTMLElement);
    clean_up(): void;
    private on_mouse_enter_start;
    private on_mouse_enter_end;
    private on_mouse_hover_start;
    private on_mouse_hover_end;
}

declare class Font {
    readonly familly: string;
    readonly weight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    readonly style: "normal" | "italic";
    constructor(familly: string, weight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900', style: "normal" | "italic");
    append_to_head(path: string): void;
    weight_name(): string;
}

declare class CssColor {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a: number);
    static gen(r: number, g: number, b: number, a: number): CssColor;
    static from_hex(hex: string): CssColor;
    static white(): CssColor;
    static black(): CssColor;
    static transparent(): CssColor;
    mul_scalar(scalar: number): CssColor;
    lighten(pct: number): CssColor;
    darken(pct: number): CssColor;
    with_alpha(alpha: number): CssColor;
    to_css_string(): string;
    to_hex_string(): string;
    private toHexString;
    private static hex_to_rgb;
}

type Position = "static" | "relative" | "absolute" | "fixed" | "sticky";
type Display = "none" | "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid" | "inline-grid" | "flow-root";
type JustifyContent = "center" | "start" | "end" | "flex-start" | "flex-end" | "left" | "right" | "normal" | "space-between" | "space-around" | "space-evenly" | "stretch";
type AlignItems = "normal" | "stretch" | "center" | "start" | "end" | "flex-start" | "flex-end" | "self-start" | "self-end" | "anchor-center" | "baseline";
type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
type WritingMode = "horizontal-tb" | "vertical-rl" | "vertical-lr";
type BorderStyle = "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset" | "none" | "hidden";
type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

declare class Style {
    private inline_map;
    private constructor();
    static gen(): Style;
    as_str_map(): StrDict<string>;
    merge(other: Style): Style;
    position(val: Position): Style;
    width(val: string): Style;
    min_width(val: string): Style;
    height(val: string): Style;
    min_height(val: string): Style;
    display(val: Display): Style;
    justify(val: JustifyContent): Style;
    align(val: AlignItems): Style;
    direction(val: FlexDirection): Style;
    grow(val: string | number): Style;
    shrink(val: string | number): Style;
    wrap(val: FlexWrap): Style;
    gap(val: string): Style;
    padding(val: string): Style;
    margin(val: string): Style;
    margin_top(val: string): Style;
    margin_right(val: string): Style;
    margin_bottom(val: string): Style;
    margin_left(val: string): Style;
    writing_mode(val: WritingMode): Style;
    border_style(val: BorderStyle): Style;
    border_color(val: CssColor): Style;
    border_width(val: string): Style;
    border_radius(val: string): Style;
    top(val: string): Style;
    left(val: string): Style;
    background_color(val: CssColor): Style;
    color(val: CssColor): Style;
    backdrop_filter(val: string): Style;
    font(val: Font): Style;
    font_size(val: string): Style;
    text_decoration(val: string): Style;
    object_fit(val: ObjectFit): Style;
    inline_string(): string;
}

type StyleObj = {
    position?: Position;
    width?: string;
    min_width?: string;
    height?: string;
    min_height?: string;
    display?: Display;
    justify?: JustifyContent;
    align?: AlignItems;
    direction?: FlexDirection;
    grow?: number | string;
    shrink?: number | string;
    wrap?: FlexWrap;
    gap?: string;
    padding?: string;
    margin?: string;
    margin_top?: string;
    margin_right?: string;
    margin_bottom?: string;
    margin_left?: string;
    writing_mode?: WritingMode;
    border_style?: BorderStyle;
    border_color?: CssColor;
    border_width?: string;
    border_radius?: string;
    top?: string;
    left?: string;
    background_color?: CssColor;
    color?: CssColor;
    backdrop_filter?: string;
    font?: Font;
    font_size?: string;
    text_decoration?: string;
    object_fit?: ObjectFit;
};
declare function to_style(style_obj: StyleObj): Style;

declare class UiAlRect {
    readonly tl_vec: Vec2;
    readonly width: number;
    readonly height: number;
    constructor(tl_vec: Vec2, width: number, height: number);
    static dft(): UiAlRect;
    copy(): UiAlRect;
    dim(): Dim2;
    center(): Vec2;
    contains(vec: Vec2): boolean;
}

declare class Div {
    private id;
    dom_div: HTMLDivElement;
    constructor(id: string | number);
    remove(): void;
    set_inner_html(html: string): void;
    insert_before_end(html: string): void;
    state(): ElemState;
    merge_style(style: Style): void;
    merge_style_obj(style_obj: StyleObj): void;
    set_style(style: Style): void;
    ui_al_rect(): UiAlRect;
    dim(): Dim2;
}

declare class DragListener {
    private div;
    private click_pos;
    private drag_start;
    private dragging;
    constructor(div: Div);
    udpate(): void;
    is_drag_start(): boolean;
    is_dragging(): boolean;
}

declare class NodeFile {
    readonly path: string;
    constructor(path: string);
    exists_async(): Prm<boolean>;
    file_name(path: string): string;
    is_image(): boolean;
    image_type(): Opt<"png" | "bmp" | "jpeg">;
    image_dim_async(): Prm<Dim2>;
}

type NodeInterface = {
    delete_file: (file_path: string) => void;
    read_file_to_string: (file_path: string) => string;
    read_file_to_buffer: (file_path: string) => Uint8Array;
    read_dir: (dir_path: string, recursive: boolean) => string[];
    mkdir: (dir_path: string) => Promise<void>;
    write_string_to_file: (file_path: string, content: string) => void;
    write_buffer_to_file: (file_path: string, content: Uint8Array) => void;
    is_image: (file_path: string) => boolean;
    image_type: (file_path: string) => "png" | "jpeg" | "bmp" | "gif" | null;
    delete_file_async: (file_path: string) => Promise<void>;
    read_file_to_string_async: (file_path: string) => Promise<string>;
    read_file_to_buffer_async: (file_path: string) => Promise<Uint8Array>;
    read_dir_async: (dir_path: string, recursive: boolean) => Promise<string[]>;
    mkdir_async: (dir_path: string) => Promise<void>;
    write_string_to_file_async: (file_path: string, content: string) => Promise<void>;
    write_buffer_to_file_async: (file_path: string, content: any) => Promise<void>;
    file_exists_async: (file_path: string) => Promise<boolean>;
    sqlite_open_async: (path: string) => any;
    sqlite_close_async: () => void;
    sqlite_run_async: (sql: string, params: (string | number | null)[]) => Prm<number>;
    sqlite_insert_async: (table_name: string, insert_rows: any[]) => Prm<number[]>;
    sqlite_update_async: (table_name: string, values: any[]) => Prm<void>;
    sqlite_fetch_async: (sql: string, params: (string | number | null)[]) => Prm<any[]>;
    file_dialog_open_async: () => Promise<string[]>;
    directory_dialog_open_async: () => Promise<string[]>;
};

declare class FileType {
    readonly tag: keyof typeof FileType.tags;
    static readonly tags: {
        readonly png: null;
    };
    private constructor();
    static of(tag: keyof typeof FileType.tags): FileType;
    text(): string;
}
declare namespace FileType {
    type Tag = keyof typeof FileType.tags;
    function list_all(): List<FileType>;
}

declare class BrowserFile {
    private file;
    constructor(file: File);
    static file_dialog_async(opt?: {
        allow_dir_selection?: boolean;
    }): Promise<List<BrowserFile>>;
    file_name(): string;
    file_type(): FileType;
    is_image(): boolean;
    buffer_async(): Promise<ArrayBuffer>;
}

declare class AlCam2 {
    window: UiAlRect;
    rect: AlRect2;
    constructor(window: UiAlRect, rect: AlRect2);
    static dft(): AlCam2;
    displace_with_cursor_shift(): void;
    is_cursor_over_window(): boolean;
    cursor_normal_pos(): Vec2;
    cursor_camera_pos(): Vec2;
    cursor_world_pos(): Vec2;
    cursor_world_shift(): Vec2;
    window_shift_to_world_shift(window_shift: Vec2): Vec2;
    zoom(value: number): void;
    zoom_by_scroll_amount(scroll: number): void;
}

type GL = WebGL2RenderingContext;
declare const GlCtx: {
    new (): WebGL2RenderingContext;
    prototype: WebGL2RenderingContext;
    readonly READ_BUFFER: 3074;
    readonly UNPACK_ROW_LENGTH: 3314;
    readonly UNPACK_SKIP_ROWS: 3315;
    readonly UNPACK_SKIP_PIXELS: 3316;
    readonly PACK_ROW_LENGTH: 3330;
    readonly PACK_SKIP_ROWS: 3331;
    readonly PACK_SKIP_PIXELS: 3332;
    readonly COLOR: 6144;
    readonly DEPTH: 6145;
    readonly STENCIL: 6146;
    readonly RED: 6403;
    readonly RGB8: 32849;
    readonly RGB10_A2: 32857;
    readonly TEXTURE_BINDING_3D: 32874;
    readonly UNPACK_SKIP_IMAGES: 32877;
    readonly UNPACK_IMAGE_HEIGHT: 32878;
    readonly TEXTURE_3D: 32879;
    readonly TEXTURE_WRAP_R: 32882;
    readonly MAX_3D_TEXTURE_SIZE: 32883;
    readonly UNSIGNED_INT_2_10_10_10_REV: 33640;
    readonly MAX_ELEMENTS_VERTICES: 33000;
    readonly MAX_ELEMENTS_INDICES: 33001;
    readonly TEXTURE_MIN_LOD: 33082;
    readonly TEXTURE_MAX_LOD: 33083;
    readonly TEXTURE_BASE_LEVEL: 33084;
    readonly TEXTURE_MAX_LEVEL: 33085;
    readonly MIN: 32775;
    readonly MAX: 32776;
    readonly DEPTH_COMPONENT24: 33190;
    readonly MAX_TEXTURE_LOD_BIAS: 34045;
    readonly TEXTURE_COMPARE_MODE: 34892;
    readonly TEXTURE_COMPARE_FUNC: 34893;
    readonly CURRENT_QUERY: 34917;
    readonly QUERY_RESULT: 34918;
    readonly QUERY_RESULT_AVAILABLE: 34919;
    readonly STREAM_READ: 35041;
    readonly STREAM_COPY: 35042;
    readonly STATIC_READ: 35045;
    readonly STATIC_COPY: 35046;
    readonly DYNAMIC_READ: 35049;
    readonly DYNAMIC_COPY: 35050;
    readonly MAX_DRAW_BUFFERS: 34852;
    readonly DRAW_BUFFER0: 34853;
    readonly DRAW_BUFFER1: 34854;
    readonly DRAW_BUFFER2: 34855;
    readonly DRAW_BUFFER3: 34856;
    readonly DRAW_BUFFER4: 34857;
    readonly DRAW_BUFFER5: 34858;
    readonly DRAW_BUFFER6: 34859;
    readonly DRAW_BUFFER7: 34860;
    readonly DRAW_BUFFER8: 34861;
    readonly DRAW_BUFFER9: 34862;
    readonly DRAW_BUFFER10: 34863;
    readonly DRAW_BUFFER11: 34864;
    readonly DRAW_BUFFER12: 34865;
    readonly DRAW_BUFFER13: 34866;
    readonly DRAW_BUFFER14: 34867;
    readonly DRAW_BUFFER15: 34868;
    readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: 35657;
    readonly MAX_VERTEX_UNIFORM_COMPONENTS: 35658;
    readonly SAMPLER_3D: 35679;
    readonly SAMPLER_2D_SHADOW: 35682;
    readonly FRAGMENT_SHADER_DERIVATIVE_HINT: 35723;
    readonly PIXEL_PACK_BUFFER: 35051;
    readonly PIXEL_UNPACK_BUFFER: 35052;
    readonly PIXEL_PACK_BUFFER_BINDING: 35053;
    readonly PIXEL_UNPACK_BUFFER_BINDING: 35055;
    readonly FLOAT_MAT2x3: 35685;
    readonly FLOAT_MAT2x4: 35686;
    readonly FLOAT_MAT3x2: 35687;
    readonly FLOAT_MAT3x4: 35688;
    readonly FLOAT_MAT4x2: 35689;
    readonly FLOAT_MAT4x3: 35690;
    readonly SRGB: 35904;
    readonly SRGB8: 35905;
    readonly SRGB8_ALPHA8: 35907;
    readonly COMPARE_REF_TO_TEXTURE: 34894;
    readonly RGBA32F: 34836;
    readonly RGB32F: 34837;
    readonly RGBA16F: 34842;
    readonly RGB16F: 34843;
    readonly VERTEX_ATTRIB_ARRAY_INTEGER: 35069;
    readonly MAX_ARRAY_TEXTURE_LAYERS: 35071;
    readonly MIN_PROGRAM_TEXEL_OFFSET: 35076;
    readonly MAX_PROGRAM_TEXEL_OFFSET: 35077;
    readonly MAX_VARYING_COMPONENTS: 35659;
    readonly TEXTURE_2D_ARRAY: 35866;
    readonly TEXTURE_BINDING_2D_ARRAY: 35869;
    readonly R11F_G11F_B10F: 35898;
    readonly UNSIGNED_INT_10F_11F_11F_REV: 35899;
    readonly RGB9_E5: 35901;
    readonly UNSIGNED_INT_5_9_9_9_REV: 35902;
    readonly TRANSFORM_FEEDBACK_BUFFER_MODE: 35967;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: 35968;
    readonly TRANSFORM_FEEDBACK_VARYINGS: 35971;
    readonly TRANSFORM_FEEDBACK_BUFFER_START: 35972;
    readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: 35973;
    readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: 35976;
    readonly RASTERIZER_DISCARD: 35977;
    readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: 35978;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: 35979;
    readonly INTERLEAVED_ATTRIBS: 35980;
    readonly SEPARATE_ATTRIBS: 35981;
    readonly TRANSFORM_FEEDBACK_BUFFER: 35982;
    readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: 35983;
    readonly RGBA32UI: 36208;
    readonly RGB32UI: 36209;
    readonly RGBA16UI: 36214;
    readonly RGB16UI: 36215;
    readonly RGBA8UI: 36220;
    readonly RGB8UI: 36221;
    readonly RGBA32I: 36226;
    readonly RGB32I: 36227;
    readonly RGBA16I: 36232;
    readonly RGB16I: 36233;
    readonly RGBA8I: 36238;
    readonly RGB8I: 36239;
    readonly RED_INTEGER: 36244;
    readonly RGB_INTEGER: 36248;
    readonly RGBA_INTEGER: 36249;
    readonly SAMPLER_2D_ARRAY: 36289;
    readonly SAMPLER_2D_ARRAY_SHADOW: 36292;
    readonly SAMPLER_CUBE_SHADOW: 36293;
    readonly UNSIGNED_INT_VEC2: 36294;
    readonly UNSIGNED_INT_VEC3: 36295;
    readonly UNSIGNED_INT_VEC4: 36296;
    readonly INT_SAMPLER_2D: 36298;
    readonly INT_SAMPLER_3D: 36299;
    readonly INT_SAMPLER_CUBE: 36300;
    readonly INT_SAMPLER_2D_ARRAY: 36303;
    readonly UNSIGNED_INT_SAMPLER_2D: 36306;
    readonly UNSIGNED_INT_SAMPLER_3D: 36307;
    readonly UNSIGNED_INT_SAMPLER_CUBE: 36308;
    readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: 36311;
    readonly DEPTH_COMPONENT32F: 36012;
    readonly DEPTH32F_STENCIL8: 36013;
    readonly FLOAT_32_UNSIGNED_INT_24_8_REV: 36269;
    readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: 33296;
    readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: 33297;
    readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: 33298;
    readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: 33299;
    readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: 33300;
    readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: 33301;
    readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: 33302;
    readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: 33303;
    readonly FRAMEBUFFER_DEFAULT: 33304;
    readonly UNSIGNED_INT_24_8: 34042;
    readonly DEPTH24_STENCIL8: 35056;
    readonly UNSIGNED_NORMALIZED: 35863;
    readonly DRAW_FRAMEBUFFER_BINDING: 36006;
    readonly READ_FRAMEBUFFER: 36008;
    readonly DRAW_FRAMEBUFFER: 36009;
    readonly READ_FRAMEBUFFER_BINDING: 36010;
    readonly RENDERBUFFER_SAMPLES: 36011;
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: 36052;
    readonly MAX_COLOR_ATTACHMENTS: 36063;
    readonly COLOR_ATTACHMENT1: 36065;
    readonly COLOR_ATTACHMENT2: 36066;
    readonly COLOR_ATTACHMENT3: 36067;
    readonly COLOR_ATTACHMENT4: 36068;
    readonly COLOR_ATTACHMENT5: 36069;
    readonly COLOR_ATTACHMENT6: 36070;
    readonly COLOR_ATTACHMENT7: 36071;
    readonly COLOR_ATTACHMENT8: 36072;
    readonly COLOR_ATTACHMENT9: 36073;
    readonly COLOR_ATTACHMENT10: 36074;
    readonly COLOR_ATTACHMENT11: 36075;
    readonly COLOR_ATTACHMENT12: 36076;
    readonly COLOR_ATTACHMENT13: 36077;
    readonly COLOR_ATTACHMENT14: 36078;
    readonly COLOR_ATTACHMENT15: 36079;
    readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: 36182;
    readonly MAX_SAMPLES: 36183;
    readonly HALF_FLOAT: 5131;
    readonly RG: 33319;
    readonly RG_INTEGER: 33320;
    readonly R8: 33321;
    readonly RG8: 33323;
    readonly R16F: 33325;
    readonly R32F: 33326;
    readonly RG16F: 33327;
    readonly RG32F: 33328;
    readonly R8I: 33329;
    readonly R8UI: 33330;
    readonly R16I: 33331;
    readonly R16UI: 33332;
    readonly R32I: 33333;
    readonly R32UI: 33334;
    readonly RG8I: 33335;
    readonly RG8UI: 33336;
    readonly RG16I: 33337;
    readonly RG16UI: 33338;
    readonly RG32I: 33339;
    readonly RG32UI: 33340;
    readonly VERTEX_ARRAY_BINDING: 34229;
    readonly R8_SNORM: 36756;
    readonly RG8_SNORM: 36757;
    readonly RGB8_SNORM: 36758;
    readonly RGBA8_SNORM: 36759;
    readonly SIGNED_NORMALIZED: 36764;
    readonly COPY_READ_BUFFER: 36662;
    readonly COPY_WRITE_BUFFER: 36663;
    readonly COPY_READ_BUFFER_BINDING: 36662;
    readonly COPY_WRITE_BUFFER_BINDING: 36663;
    readonly UNIFORM_BUFFER: 35345;
    readonly UNIFORM_BUFFER_BINDING: 35368;
    readonly UNIFORM_BUFFER_START: 35369;
    readonly UNIFORM_BUFFER_SIZE: 35370;
    readonly MAX_VERTEX_UNIFORM_BLOCKS: 35371;
    readonly MAX_FRAGMENT_UNIFORM_BLOCKS: 35373;
    readonly MAX_COMBINED_UNIFORM_BLOCKS: 35374;
    readonly MAX_UNIFORM_BUFFER_BINDINGS: 35375;
    readonly MAX_UNIFORM_BLOCK_SIZE: 35376;
    readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: 35377;
    readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: 35379;
    readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: 35380;
    readonly ACTIVE_UNIFORM_BLOCKS: 35382;
    readonly UNIFORM_TYPE: 35383;
    readonly UNIFORM_SIZE: 35384;
    readonly UNIFORM_BLOCK_INDEX: 35386;
    readonly UNIFORM_OFFSET: 35387;
    readonly UNIFORM_ARRAY_STRIDE: 35388;
    readonly UNIFORM_MATRIX_STRIDE: 35389;
    readonly UNIFORM_IS_ROW_MAJOR: 35390;
    readonly UNIFORM_BLOCK_BINDING: 35391;
    readonly UNIFORM_BLOCK_DATA_SIZE: 35392;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: 35394;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: 35395;
    readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: 35396;
    readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: 35398;
    readonly INVALID_INDEX: 4294967295;
    readonly MAX_VERTEX_OUTPUT_COMPONENTS: 37154;
    readonly MAX_FRAGMENT_INPUT_COMPONENTS: 37157;
    readonly MAX_SERVER_WAIT_TIMEOUT: 37137;
    readonly OBJECT_TYPE: 37138;
    readonly SYNC_CONDITION: 37139;
    readonly SYNC_STATUS: 37140;
    readonly SYNC_FLAGS: 37141;
    readonly SYNC_FENCE: 37142;
    readonly SYNC_GPU_COMMANDS_COMPLETE: 37143;
    readonly UNSIGNALED: 37144;
    readonly SIGNALED: 37145;
    readonly ALREADY_SIGNALED: 37146;
    readonly TIMEOUT_EXPIRED: 37147;
    readonly CONDITION_SATISFIED: 37148;
    readonly WAIT_FAILED: 37149;
    readonly SYNC_FLUSH_COMMANDS_BIT: 1;
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR: 35070;
    readonly ANY_SAMPLES_PASSED: 35887;
    readonly ANY_SAMPLES_PASSED_CONSERVATIVE: 36202;
    readonly SAMPLER_BINDING: 35097;
    readonly RGB10_A2UI: 36975;
    readonly INT_2_10_10_10_REV: 36255;
    readonly TRANSFORM_FEEDBACK: 36386;
    readonly TRANSFORM_FEEDBACK_PAUSED: 36387;
    readonly TRANSFORM_FEEDBACK_ACTIVE: 36388;
    readonly TRANSFORM_FEEDBACK_BINDING: 36389;
    readonly TEXTURE_IMMUTABLE_FORMAT: 37167;
    readonly MAX_ELEMENT_INDEX: 36203;
    readonly TEXTURE_IMMUTABLE_LEVELS: 33503;
    readonly TIMEOUT_IGNORED: -1;
    readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: 37447;
    readonly DEPTH_BUFFER_BIT: 256;
    readonly STENCIL_BUFFER_BIT: 1024;
    readonly COLOR_BUFFER_BIT: 16384;
    readonly POINTS: 0;
    readonly LINES: 1;
    readonly LINE_LOOP: 2;
    readonly LINE_STRIP: 3;
    readonly TRIANGLES: 4;
    readonly TRIANGLE_STRIP: 5;
    readonly TRIANGLE_FAN: 6;
    readonly ZERO: 0;
    readonly ONE: 1;
    readonly SRC_COLOR: 768;
    readonly ONE_MINUS_SRC_COLOR: 769;
    readonly SRC_ALPHA: 770;
    readonly ONE_MINUS_SRC_ALPHA: 771;
    readonly DST_ALPHA: 772;
    readonly ONE_MINUS_DST_ALPHA: 773;
    readonly DST_COLOR: 774;
    readonly ONE_MINUS_DST_COLOR: 775;
    readonly SRC_ALPHA_SATURATE: 776;
    readonly FUNC_ADD: 32774;
    readonly BLEND_EQUATION: 32777;
    readonly BLEND_EQUATION_RGB: 32777;
    readonly BLEND_EQUATION_ALPHA: 34877;
    readonly FUNC_SUBTRACT: 32778;
    readonly FUNC_REVERSE_SUBTRACT: 32779;
    readonly BLEND_DST_RGB: 32968;
    readonly BLEND_SRC_RGB: 32969;
    readonly BLEND_DST_ALPHA: 32970;
    readonly BLEND_SRC_ALPHA: 32971;
    readonly CONSTANT_COLOR: 32769;
    readonly ONE_MINUS_CONSTANT_COLOR: 32770;
    readonly CONSTANT_ALPHA: 32771;
    readonly ONE_MINUS_CONSTANT_ALPHA: 32772;
    readonly BLEND_COLOR: 32773;
    readonly ARRAY_BUFFER: 34962;
    readonly ELEMENT_ARRAY_BUFFER: 34963;
    readonly ARRAY_BUFFER_BINDING: 34964;
    readonly ELEMENT_ARRAY_BUFFER_BINDING: 34965;
    readonly STREAM_DRAW: 35040;
    readonly STATIC_DRAW: 35044;
    readonly DYNAMIC_DRAW: 35048;
    readonly BUFFER_SIZE: 34660;
    readonly BUFFER_USAGE: 34661;
    readonly CURRENT_VERTEX_ATTRIB: 34342;
    readonly FRONT: 1028;
    readonly BACK: 1029;
    readonly FRONT_AND_BACK: 1032;
    readonly CULL_FACE: 2884;
    readonly BLEND: 3042;
    readonly DITHER: 3024;
    readonly STENCIL_TEST: 2960;
    readonly DEPTH_TEST: 2929;
    readonly SCISSOR_TEST: 3089;
    readonly POLYGON_OFFSET_FILL: 32823;
    readonly SAMPLE_ALPHA_TO_COVERAGE: 32926;
    readonly SAMPLE_COVERAGE: 32928;
    readonly NO_ERROR: 0;
    readonly INVALID_ENUM: 1280;
    readonly INVALID_VALUE: 1281;
    readonly INVALID_OPERATION: 1282;
    readonly OUT_OF_MEMORY: 1285;
    readonly CW: 2304;
    readonly CCW: 2305;
    readonly LINE_WIDTH: 2849;
    readonly ALIASED_POINT_SIZE_RANGE: 33901;
    readonly ALIASED_LINE_WIDTH_RANGE: 33902;
    readonly CULL_FACE_MODE: 2885;
    readonly FRONT_FACE: 2886;
    readonly DEPTH_RANGE: 2928;
    readonly DEPTH_WRITEMASK: 2930;
    readonly DEPTH_CLEAR_VALUE: 2931;
    readonly DEPTH_FUNC: 2932;
    readonly STENCIL_CLEAR_VALUE: 2961;
    readonly STENCIL_FUNC: 2962;
    readonly STENCIL_FAIL: 2964;
    readonly STENCIL_PASS_DEPTH_FAIL: 2965;
    readonly STENCIL_PASS_DEPTH_PASS: 2966;
    readonly STENCIL_REF: 2967;
    readonly STENCIL_VALUE_MASK: 2963;
    readonly STENCIL_WRITEMASK: 2968;
    readonly STENCIL_BACK_FUNC: 34816;
    readonly STENCIL_BACK_FAIL: 34817;
    readonly STENCIL_BACK_PASS_DEPTH_FAIL: 34818;
    readonly STENCIL_BACK_PASS_DEPTH_PASS: 34819;
    readonly STENCIL_BACK_REF: 36003;
    readonly STENCIL_BACK_VALUE_MASK: 36004;
    readonly STENCIL_BACK_WRITEMASK: 36005;
    readonly VIEWPORT: 2978;
    readonly SCISSOR_BOX: 3088;
    readonly COLOR_CLEAR_VALUE: 3106;
    readonly COLOR_WRITEMASK: 3107;
    readonly UNPACK_ALIGNMENT: 3317;
    readonly PACK_ALIGNMENT: 3333;
    readonly MAX_TEXTURE_SIZE: 3379;
    readonly MAX_VIEWPORT_DIMS: 3386;
    readonly SUBPIXEL_BITS: 3408;
    readonly RED_BITS: 3410;
    readonly GREEN_BITS: 3411;
    readonly BLUE_BITS: 3412;
    readonly ALPHA_BITS: 3413;
    readonly DEPTH_BITS: 3414;
    readonly STENCIL_BITS: 3415;
    readonly POLYGON_OFFSET_UNITS: 10752;
    readonly POLYGON_OFFSET_FACTOR: 32824;
    readonly TEXTURE_BINDING_2D: 32873;
    readonly SAMPLE_BUFFERS: 32936;
    readonly SAMPLES: 32937;
    readonly SAMPLE_COVERAGE_VALUE: 32938;
    readonly SAMPLE_COVERAGE_INVERT: 32939;
    readonly COMPRESSED_TEXTURE_FORMATS: 34467;
    readonly DONT_CARE: 4352;
    readonly FASTEST: 4353;
    readonly NICEST: 4354;
    readonly GENERATE_MIPMAP_HINT: 33170;
    readonly BYTE: 5120;
    readonly UNSIGNED_BYTE: 5121;
    readonly SHORT: 5122;
    readonly UNSIGNED_SHORT: 5123;
    readonly INT: 5124;
    readonly UNSIGNED_INT: 5125;
    readonly FLOAT: 5126;
    readonly DEPTH_COMPONENT: 6402;
    readonly ALPHA: 6406;
    readonly RGB: 6407;
    readonly RGBA: 6408;
    readonly LUMINANCE: 6409;
    readonly LUMINANCE_ALPHA: 6410;
    readonly UNSIGNED_SHORT_4_4_4_4: 32819;
    readonly UNSIGNED_SHORT_5_5_5_1: 32820;
    readonly UNSIGNED_SHORT_5_6_5: 33635;
    readonly FRAGMENT_SHADER: 35632;
    readonly VERTEX_SHADER: 35633;
    readonly MAX_VERTEX_ATTRIBS: 34921;
    readonly MAX_VERTEX_UNIFORM_VECTORS: 36347;
    readonly MAX_VARYING_VECTORS: 36348;
    readonly MAX_COMBINED_TEXTURE_IMAGE_UNITS: 35661;
    readonly MAX_VERTEX_TEXTURE_IMAGE_UNITS: 35660;
    readonly MAX_TEXTURE_IMAGE_UNITS: 34930;
    readonly MAX_FRAGMENT_UNIFORM_VECTORS: 36349;
    readonly SHADER_TYPE: 35663;
    readonly DELETE_STATUS: 35712;
    readonly LINK_STATUS: 35714;
    readonly VALIDATE_STATUS: 35715;
    readonly ATTACHED_SHADERS: 35717;
    readonly ACTIVE_UNIFORMS: 35718;
    readonly ACTIVE_ATTRIBUTES: 35721;
    readonly SHADING_LANGUAGE_VERSION: 35724;
    readonly CURRENT_PROGRAM: 35725;
    readonly NEVER: 512;
    readonly LESS: 513;
    readonly EQUAL: 514;
    readonly LEQUAL: 515;
    readonly GREATER: 516;
    readonly NOTEQUAL: 517;
    readonly GEQUAL: 518;
    readonly ALWAYS: 519;
    readonly KEEP: 7680;
    readonly REPLACE: 7681;
    readonly INCR: 7682;
    readonly DECR: 7683;
    readonly INVERT: 5386;
    readonly INCR_WRAP: 34055;
    readonly DECR_WRAP: 34056;
    readonly VENDOR: 7936;
    readonly RENDERER: 7937;
    readonly VERSION: 7938;
    readonly NEAREST: 9728;
    readonly LINEAR: 9729;
    readonly NEAREST_MIPMAP_NEAREST: 9984;
    readonly LINEAR_MIPMAP_NEAREST: 9985;
    readonly NEAREST_MIPMAP_LINEAR: 9986;
    readonly LINEAR_MIPMAP_LINEAR: 9987;
    readonly TEXTURE_MAG_FILTER: 10240;
    readonly TEXTURE_MIN_FILTER: 10241;
    readonly TEXTURE_WRAP_S: 10242;
    readonly TEXTURE_WRAP_T: 10243;
    readonly TEXTURE_2D: 3553;
    readonly TEXTURE: 5890;
    readonly TEXTURE_CUBE_MAP: 34067;
    readonly TEXTURE_BINDING_CUBE_MAP: 34068;
    readonly TEXTURE_CUBE_MAP_POSITIVE_X: 34069;
    readonly TEXTURE_CUBE_MAP_NEGATIVE_X: 34070;
    readonly TEXTURE_CUBE_MAP_POSITIVE_Y: 34071;
    readonly TEXTURE_CUBE_MAP_NEGATIVE_Y: 34072;
    readonly TEXTURE_CUBE_MAP_POSITIVE_Z: 34073;
    readonly TEXTURE_CUBE_MAP_NEGATIVE_Z: 34074;
    readonly MAX_CUBE_MAP_TEXTURE_SIZE: 34076;
    readonly TEXTURE0: 33984;
    readonly TEXTURE1: 33985;
    readonly TEXTURE2: 33986;
    readonly TEXTURE3: 33987;
    readonly TEXTURE4: 33988;
    readonly TEXTURE5: 33989;
    readonly TEXTURE6: 33990;
    readonly TEXTURE7: 33991;
    readonly TEXTURE8: 33992;
    readonly TEXTURE9: 33993;
    readonly TEXTURE10: 33994;
    readonly TEXTURE11: 33995;
    readonly TEXTURE12: 33996;
    readonly TEXTURE13: 33997;
    readonly TEXTURE14: 33998;
    readonly TEXTURE15: 33999;
    readonly TEXTURE16: 34000;
    readonly TEXTURE17: 34001;
    readonly TEXTURE18: 34002;
    readonly TEXTURE19: 34003;
    readonly TEXTURE20: 34004;
    readonly TEXTURE21: 34005;
    readonly TEXTURE22: 34006;
    readonly TEXTURE23: 34007;
    readonly TEXTURE24: 34008;
    readonly TEXTURE25: 34009;
    readonly TEXTURE26: 34010;
    readonly TEXTURE27: 34011;
    readonly TEXTURE28: 34012;
    readonly TEXTURE29: 34013;
    readonly TEXTURE30: 34014;
    readonly TEXTURE31: 34015;
    readonly ACTIVE_TEXTURE: 34016;
    readonly REPEAT: 10497;
    readonly CLAMP_TO_EDGE: 33071;
    readonly MIRRORED_REPEAT: 33648;
    readonly FLOAT_VEC2: 35664;
    readonly FLOAT_VEC3: 35665;
    readonly FLOAT_VEC4: 35666;
    readonly INT_VEC2: 35667;
    readonly INT_VEC3: 35668;
    readonly INT_VEC4: 35669;
    readonly BOOL: 35670;
    readonly BOOL_VEC2: 35671;
    readonly BOOL_VEC3: 35672;
    readonly BOOL_VEC4: 35673;
    readonly FLOAT_MAT2: 35674;
    readonly FLOAT_MAT3: 35675;
    readonly FLOAT_MAT4: 35676;
    readonly SAMPLER_2D: 35678;
    readonly SAMPLER_CUBE: 35680;
    readonly VERTEX_ATTRIB_ARRAY_ENABLED: 34338;
    readonly VERTEX_ATTRIB_ARRAY_SIZE: 34339;
    readonly VERTEX_ATTRIB_ARRAY_STRIDE: 34340;
    readonly VERTEX_ATTRIB_ARRAY_TYPE: 34341;
    readonly VERTEX_ATTRIB_ARRAY_NORMALIZED: 34922;
    readonly VERTEX_ATTRIB_ARRAY_POINTER: 34373;
    readonly VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: 34975;
    readonly IMPLEMENTATION_COLOR_READ_TYPE: 35738;
    readonly IMPLEMENTATION_COLOR_READ_FORMAT: 35739;
    readonly COMPILE_STATUS: 35713;
    readonly LOW_FLOAT: 36336;
    readonly MEDIUM_FLOAT: 36337;
    readonly HIGH_FLOAT: 36338;
    readonly LOW_INT: 36339;
    readonly MEDIUM_INT: 36340;
    readonly HIGH_INT: 36341;
    readonly FRAMEBUFFER: 36160;
    readonly RENDERBUFFER: 36161;
    readonly RGBA4: 32854;
    readonly RGB5_A1: 32855;
    readonly RGBA8: 32856;
    readonly RGB565: 36194;
    readonly DEPTH_COMPONENT16: 33189;
    readonly STENCIL_INDEX8: 36168;
    readonly DEPTH_STENCIL: 34041;
    readonly RENDERBUFFER_WIDTH: 36162;
    readonly RENDERBUFFER_HEIGHT: 36163;
    readonly RENDERBUFFER_INTERNAL_FORMAT: 36164;
    readonly RENDERBUFFER_RED_SIZE: 36176;
    readonly RENDERBUFFER_GREEN_SIZE: 36177;
    readonly RENDERBUFFER_BLUE_SIZE: 36178;
    readonly RENDERBUFFER_ALPHA_SIZE: 36179;
    readonly RENDERBUFFER_DEPTH_SIZE: 36180;
    readonly RENDERBUFFER_STENCIL_SIZE: 36181;
    readonly FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: 36048;
    readonly FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: 36049;
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: 36050;
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: 36051;
    readonly COLOR_ATTACHMENT0: 36064;
    readonly DEPTH_ATTACHMENT: 36096;
    readonly STENCIL_ATTACHMENT: 36128;
    readonly DEPTH_STENCIL_ATTACHMENT: 33306;
    readonly NONE: 0;
    readonly FRAMEBUFFER_COMPLETE: 36053;
    readonly FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 36054;
    readonly FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 36055;
    readonly FRAMEBUFFER_INCOMPLETE_DIMENSIONS: 36057;
    readonly FRAMEBUFFER_UNSUPPORTED: 36061;
    readonly FRAMEBUFFER_BINDING: 36006;
    readonly RENDERBUFFER_BINDING: 36007;
    readonly MAX_RENDERBUFFER_SIZE: 34024;
    readonly INVALID_FRAMEBUFFER_OPERATION: 1286;
    readonly UNPACK_FLIP_Y_WEBGL: 37440;
    readonly UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37441;
    readonly CONTEXT_LOST_WEBGL: 37442;
    readonly UNPACK_COLORSPACE_CONVERSION_WEBGL: 37443;
    readonly BROWSER_DEFAULT_WEBGL: 37444;
};
declare function get_webgl_context(canvas_id: string | number): GL;

declare class Canvas {
    private id;
    dom_canvas: HTMLCanvasElement;
    constructor(id: string | number);
    remove(): void;
    state(): ElemState;
    merge_style(style: Style): void;
    merge_style_obj(style_obj: StyleObj): void;
    set_style(style: Style): void;
    set_dim(dim: Dim2): void;
    get_webgl2_context(): GL;
    ui_al_rect(): UiAlRect;
}

declare class Image {
    private id;
    private elem;
    constructor(id: string | number);
    remove(): void;
    state(): ElemState;
    set_src(val: string): void;
    merge_style(style: Style): void;
    merge_style_obj(style_obj: StyleObj): void;
    set_style(style: Style): void;
}

declare class InputState {
    is_change: boolean;
    is_focus_start: boolean;
    is_focus: boolean;
    is_focus_end: boolean;
    constructor(elem: HTMLInputElement);
    on_change(): void;
    on_focus_start(): void;
    on_focus_end(): void;
    clean_up(): void;
}

declare class Input {
    private id;
    private elem;
    constructor(id: string | number);
    remove(): void;
    state(): ElemState;
    input_state(): InputState;
    value(): string;
    set_value(val: string): void;
    select(): void;
    merge_style(style: Style): void;
    merge_style_obj(style_obj: StyleObj): void;
    set_style(style: Style): void;
}

declare class Par {
    private id;
    dom_par: HTMLParagraphElement;
    constructor(id: string | number);
    remove(): void;
    set_text(text: string): void;
    insert_before_end(html: string): void;
    state(): ElemState;
    merge_style(style: Style): void;
    merge_style_obj(style_obj: StyleObj): void;
    set_style(style: Style): void;
    ui_al_rect(): UiAlRect;
    dim(): Dim2;
}

declare namespace CssResset {
    function apply(): void;
}

declare function div(id: string | number | null, style: Style | null, class_names: string[] | null, children: string[]): string;
declare function par(id: string | number | null, style: Style | null, class_names: string[] | null, text: string): string;
declare function input(id: string | number | null, style: Style | null, class_names: string[] | null, placeholder?: string | null): string;
declare function image(id: string | number | null, style: Style | null, class_names: string[] | null, src: string | null): string;
declare function canvas(id: string | number | null, style: Style | null, class_names: string[] | null): string;

declare class ElemStatePool {
    private map;
    constructor();
    start(key: string | number, elem: HTMLElement): void;
    remove(key: string | number): void;
    get(key: string | number): Opt<ElemState>;
    clean_up(): void;
}

declare class InputStatePool {
    private map;
    constructor();
    start(key: string | number, elem: HTMLInputElement): void;
    remove(key: string | number): void;
    get(key: string | number): Opt<InputState>;
    clean_up(): void;
}

type KeyCode = 'Digit0' | 'Digit1' | 'Digit2' | 'Digit3' | 'Digit4' | 'Digit5' | 'Digit6' | 'Digit7' | 'Digit8' | 'Digit9' | 'KeyA' | 'KeyB' | 'KeyC' | 'KeyD' | 'KeyE' | 'KeyF' | 'KeyG' | 'KeyH' | 'KeyI' | 'KeyJ' | 'KeyK' | 'KeyL' | 'KeyM' | 'KeyN' | 'KeyO' | 'KeyP' | 'KeyQ' | 'KeyR' | 'KeyS' | 'KeyT' | 'KeyU' | 'KeyV' | 'KeyW' | 'KeyX' | 'KeyY' | 'KeyZ' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' | 'F13' | 'F14' | 'F15' | 'F16' | 'F17' | 'F18' | 'F19' | 'F20' | 'F21' | 'F22' | 'F23' | 'F24' | 'Numpad0' | 'Numpad1' | 'Numpad2' | 'Numpad3' | 'Numpad4' | 'Numpad5' | 'Numpad6' | 'Numpad7' | 'Numpad8' | 'Numpad9' | 'NumpadAdd' | 'NumpadSubtract' | 'NumpadMultiply' | 'NumpadDivide' | 'NumpadDecimal' | 'NumpadEnter' | 'NumpadEqual' | 'NumpadComma' | 'NumpadParenLeft' | 'NumpadParenRight' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Backspace' | 'Tab' | 'Enter' | 'Escape' | 'Space' | 'ShiftLeft' | 'ShiftRight' | 'ControlLeft' | 'ControlRight' | 'AltLeft' | 'AltRight' | 'MetaLeft' | 'MetaRight' | 'CapsLock' | 'NumLock' | 'ScrollLock' | 'PrintScreen' | 'Pause' | 'Insert' | 'Delete' | 'Home' | 'End' | 'PageUp' | 'PageDown' | 'BracketLeft' | 'BracketRight' | 'Backslash' | 'Semicolon' | 'Quote' | 'Comma' | 'Period' | 'Slash' | 'Backquote' | 'Minus' | 'Equal' | 'ContextMenu' | 'IntlBackslash' | 'IntlRo' | 'IntlYen' | 'Convert' | 'NonConvert' | 'KanaMode' | 'Lang1' | 'Lang2' | 'Lang3' | 'Lang4' | 'Lang5' | 'Fn' | 'FnLock';

declare class KeyState {
    private press_start;
    private press;
    private press_end;
    constructor();
    is_press_start(): boolean;
    is_pressed(): boolean;
    is_press_end(): boolean;
    do_press(): void;
    do_release(): void;
    clean(): void;
}

declare class KeyboardState {
    key_map: Record<KeyCode, KeyState>;
    constructor();
    clean_up(): void;
    get_key_state(key: KeyCode): KeyState;
}

declare class MouseButton {
    private code;
    private press;
    private down;
    private release;
    private click;
    private double;
    private pos;
    private press_history;
    constructor(code: number);
    clean_up(): void;
    is_press(): boolean;
    is_down(): boolean;
    is_release(): boolean;
    is_click(): boolean;
    is_double_click(): boolean;
}

declare class MouseState {
    private _pos;
    private _shift;
    private _scroll;
    private _left_button;
    private _center_button;
    private _right_button;
    constructor();
    clean_up(): void;
    pos(): Vec2;
    shift(): Vec2;
    scroll(): number;
    left_button(): MouseButton;
    center_button(): MouseButton;
    right_button(): MouseButton;
}

type Item = {
    is_press: boolean;
    timestamp: number;
    pos: Vec2;
};
declare class PressHistory {
    private event_list;
    constructor();
    push(item: Item): void;
    is_click(): boolean;
    is_double_click(): boolean;
}

declare namespace HIState {
    const elem_pool: ElemStatePool;
    const input_pool: InputStatePool;
    const mouse: MouseState;
    const keyboard: KeyboardState;
    function clean_up(): void;
}

declare class FloatListBuffer {
    private buffer;
    private size;
    private capacity;
    constructor(capacity?: number);
    get_buffer(): Float32Array;
    len(): number;
    clear(): void;
    push(value: number): void;
    push_many(values: number[]): void;
}

declare enum GlBufferTarget {
    BUFFER = 0
}
declare namespace GlBufferTarget {
    function gl_enum(gl: GL, target: GlBufferTarget): 34962;
}

declare enum GlBufferUsage {
    STATIC_DRAW = 0,
    DYNAMIC_DRAW = 1,
    STREAM_DRAW = 2,
    STATIC_READ = 3,
    DYNAMIC_READ = 4,
    STREAM_READ = 5,
    STATIC_COPY = 6,
    DYNAMIC_COPY = 7,
    STREAM_COPY = 8
}
declare namespace GlBufferUsage {
    function gl_enum(gl: GL, usage: GlBufferUsage): 35044 | 35048 | 35040 | 35045 | 35049 | 35041 | 35046 | 35050 | 35042;
}

declare class GlBuffer {
    gl: GL;
    webgl_buffer: WebGLBuffer;
    target: GlBufferTarget;
    usage: GlBufferUsage;
    constructor(gl: GL, target: GlBufferTarget, usage: GlBufferUsage);
    drop(): void;
    bind(): void;
    unbind(): void;
    send_to_gl_float32array(buffer: Float32Array): void;
    send_to_gl_wasmf32buffer(wasm_memory: WebAssembly.Memory, buffer_ptr: number, length: number): void;
}

declare class GlUniform {
    private gl;
    private webgl_uniform;
    constructor(gl: GL, webgl_program: WebGLProgram, uniform_name: string);
    data_4f(data: Vec4): void;
}

declare enum VertexPointerKind {
    FLOAT = 0
}
declare namespace VertexPointerKind {
    function gl_enum(gl: GL, kind: VertexPointerKind): 5126;
    function size_bytes(gl: GL, kind: VertexPointerKind): number;
}

type VertexPointer = {
    name: string;
    kind: VertexPointerKind;
    components: number;
};

declare class GlProgram {
    private gl;
    webgl_program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    uniform_map: StrDict<GlUniform>;
    constructor(gl: GL, vert_src: string, frag_src: string, pointers: VertexPointer[], uniform_names: [string]);
    drop(): void;
    bind(): void;
    unbind(): void;
    get_uniform_mut(uniform_name: string): GlUniform;
    private setup_uniform;
    private setup_pointers;
    private static create_program;
    private static create_shader;
}

declare enum GlShaderKind {
    VERTEX = 0,
    FRAGMENT = 1
}
declare namespace GlShaderKind {
    function gl_enum(gl: GL, kind: GlShaderKind): 35633 | 35632;
}

declare enum GlTextureTarget {
    TwoD = 0,
    ThreeD = 1
}
declare namespace GlTextureTarget {
    function gl_enum(gl: GL, target: GlTextureTarget): 3553 | 32879;
}

declare enum MagFilter {
    NEAREST = 0,
    LINEAR = 1
}
declare namespace MagFilter {
    function gl_enum(gl: GL, mag_filter: MagFilter): 9728 | 9729;
}

declare enum MinFilter {
    NEAREST = 0,
    LINEAR = 1,
    NEAREST_MIPMAP_NEAREST = 2,
    LINEAR_MIPMAP_NEAREST = 3,
    NEAREST_MIPMAP_LINEAR = 4,
    LINEAR_MIPMAP_LINEAR = 5,
    TEXTURE_MAG_FILTER = 6,
    TEXTURE_MIN_FILTER = 7
}
declare namespace MinFilter {
    function gl_enum(gl: GL, min_filter: MinFilter): 9728 | 9729 | 9984 | 9985 | 9986 | 9987 | 10240 | 10241;
}

declare class GlTexture {
    gl: GL;
    gl_tex: WebGLTexture;
    target: GlTextureTarget;
    min_filter: MinFilter;
    mag_filter: MagFilter;
    constructor(gl: GL, target: GlTextureTarget, min_filter: MinFilter, mag_filter: MagFilter);
    drop(): void;
    bind(): void;
    unbind(): void;
    data_rgba_async(image_path: string): Prm<void>;
}

declare enum GlTextureFormat {
    RGBA = 0,
    RGB = 1,
    LUMINANCE_ALPHA = 2,
    LUMINANCE = 3,
    ALPHA = 4
}
declare namespace GlTextureFormat {
    function gl_enum(gl: GL, format: GlTextureFormat): 6408 | 6407 | 6410 | 6409 | 6406;
}

declare enum GlTextureInternalFormat {
    RGBA = 0,
    RGB = 1,
    LUMINANCE_ALPHA = 2,
    LUMINANCE = 3,
    ALPHA = 4
}
declare namespace GlTextureInternalFormat {
    function gl_enum(gl: GL, internal_format: GlTextureInternalFormat): 6408 | 6407 | 6410 | 6409 | 6406;
}

export { AlCam2, type AlignItems, type BorderStyle, BrowserFile, Canvas, CssColor, CssResset, type Display, DisplayForest, type DisplayForestItem, Div, DragAndDropMng, DragListener, ElemState, ElemStatePool, FileType, type FlexDirection, type FlexWrap, FloatList, FloatListBuffer, Font, type GL, GlBuffer, GlBufferTarget, GlBufferUsage, GlCtx, GlProgram, GlShaderKind, GlTexture, GlTextureFormat, GlTextureInternalFormat, GlTextureTarget, GlUniform, HIState, Image, Input, InputState, InputStatePool, type JustifyContent, type KeyCode, KeyState, KeyboardState, MagFilter, MinFilter, MouseButton, MouseState, NodeFile, type NodeInterface, type ObjectFit, Par, type Position, PressHistory, Style, type StyleObj, UiAlRect, type VertexPointer, VertexPointerKind, type WritingMode, canvas, div, get_webgl_context, image, input, par, to_style };
