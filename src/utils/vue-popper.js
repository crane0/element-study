import Vue from "vue";
import { PopupManager } from "element-ui/src/utils/popup";

// popperjs 2.x 中文教程 https://www.jiyik.com/w/popperjs/popper-basic-play
// 但是引入的这个 Popper 是 1.x 版本的。英文官网 https://popper.js.org/docs/v1/
const PopperJS = Vue.prototype.$isServer ? function() {} : require("./popper");
const stop = (e) => e.stopPropagation();

/**
 * @param {HTMLElement} [reference=$refs.reference] - The reference element used to position the popper.
 * @param {HTMLElement} [popper=$refs.popper] - The HTML element used as popper, or a configuration used to generate the popper.
 * @param {String} [placement=button] - Placement of the popper accepted values: top(-start, -end), right(-start, -end), bottom(-start, -end), left(-start, -end)
 * @param {Number} [offset=0] - Amount of pixels the popper will be shifted (can be negative).
 * @param {Boolean} [visible=false] Visibility of the popup element.
 * @param {Boolean} [visible-arrow=false] Visibility of the arrow, no style.
 */
export default {
  props: {
    transformOrigin: {
      // 元素进行 transform 的原点位置
      type: [Boolean, String],
      default: true,
    },
    placement: {
      // 展示位置
      type: String,
      default: "bottom",
    },
    boundariesPadding: {
      // 应该作为 popperOptions 的属性，但这里没有用到。
      // 用于定义边界和 popper 之间的最小距离的像素数量
      type: Number,
      default: 5,
    },
    reference: {},
    popper: {},
    offset: {
      default: 0,
    },
    value: Boolean,
    visibleArrow: Boolean, // 是否显示 Tooltip 箭头
    arrowOffset: {
      type: Number,
      default: 35,
    },
    appendToBody: {
      type: Boolean,
      default: true,
    },
    popperOptions: {
      // popper.js 的参数
      type: Object,
      default() {
        return {
          gpuAcceleration: false,
        };
      },
    },
  },

  data() {
    return {
      showPopper: false,
      currentPlacement: "",
    };
  },

  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.showPopper = val;
        this.$emit("input", val);
      },
    },

    showPopper(val) {
      if (this.disabled) return;
      val ? this.updatePopper() : this.destroyPopper();
      this.$emit("input", val);
    },
  },

  methods: {
    createPopper() {
      if (this.$isServer) return;
      this.currentPlacement = this.currentPlacement || this.placement;
      if (
        !/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)
      ) {
        return;
      }

      /* 
        创建 PopperJS 实例时，其实是调用了 Popper.createPopper 构造函数。
        createPopper(reference, popper, options);
        reference 是触发 Popper 的元素，比如可以是一个 button。
        popper 是存放提示信息的元素。
        options 是配置项。

        其中 reference 和 popper 可能是同一个元素。
      */
      const options = this.popperOptions;
      // 链式赋值，假设 a b c 都已初始化，则 a = b = c 结果：a 和 b 都为 c 的值。
      // this.$refs.popper，使用该 mixin 的组件的根元素，一般会设置该 ref
      const popper = (this.popperElm =
        this.popperElm || this.popper || this.$refs.popper);
      // this.referenceElm，使用该 mixin 的组件中会定义，一般为 $el
      let reference = (this.referenceElm =
        this.referenceElm || this.reference || this.$refs.reference);

      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm;
      }

      if (!popper || !reference) return;
      if (this.visibleArrow) this.appendArrow(popper);
      // 这行代码是必须的（因为没有 else），不设置将无法挂载 popper
      if (this.appendToBody) document.body.appendChild(this.popperElm);
      if (this.popperJS && this.popperJS.destroy) {
        this.popperJS.destroy();
      }

      options.placement = this.currentPlacement;
      options.offset = this.offset; // 出现位置的偏移量
      options.arrowOffset = this.arrowOffset;
      this.popperJS = new PopperJS(reference, popper, options);
      this.popperJS.onCreate((_) => {
        this.$emit("created", this);
        this.resetTransformOrigin();
        this.$nextTick(this.updatePopper);
      });
      if (typeof options.onUpdate === "function") {
        // onUpdate的回调函数，也就是这里的 options.onUpdate 不会在 popper 的初始化/创建时调用，而只会在后续更新时调用。
        this.popperJS.onUpdate(options.onUpdate);
      }
      // 每个 Popper 的 z-index 统一管理
      this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
      // 点击出现的提示信息元素，阻止冒泡
      this.popperElm.addEventListener("click", stop);
    },

    // watch showPopper 来调用 updatePopper，再判断是 create 还是 update
    updatePopper() {
      const popperJS = this.popperJS;
      if (popperJS) {
        // 更新 popper 的位置，计算新的偏移量并应用新的样式。并且如果传入了 onUpdate，会在最后执行。
        popperJS.update();
        if (popperJS._popper) {
          popperJS._popper.style.zIndex = PopupManager.nextZIndex();
        }
      } else {
        this.createPopper();
      }
    },

    doDestroy(forceDestroy) {
      /* istanbul ignore if */
      if (!this.popperJS || (this.showPopper && !forceDestroy)) return;
      this.popperJS.destroy();
      this.popperJS = null;
    },

    destroyPopper() {
      if (this.popperJS) {
        this.resetTransformOrigin();
      }
    },

    resetTransformOrigin() {
      if (!this.transformOrigin) return;
      let placementMap = {
        top: "bottom",
        bottom: "top",
        left: "right",
        right: "left",
      };
      // x-placement 就是 placement，取值包括 top/top-start/top-end/bottom...
      let placement = this.popperJS._popper
        .getAttribute("x-placement")
        .split("-")[0];
      let origin = placementMap[placement];
      this.popperJS._popper.style.transformOrigin =
        typeof this.transformOrigin === "string"
          ? this.transformOrigin
          : ["top", "bottom"].indexOf(placement) > -1
          ? `center ${origin}`
          : `${origin} center`;
    },

    appendArrow(element) {
      let hash;
      if (this.appended) {
        return;
      }

      this.appended = true;

      // 可直接用 for...of 遍历
      for (let item in element.attributes) {
        if (/^_v-/.test(element.attributes[item].name)) {
          hash = element.attributes[item].name;
          break;
        }
      }

      const arrow = document.createElement("div");

      if (hash) {
        arrow.setAttribute(hash, "");
      }
      // 在 examples\components\theme\components-preview.vue 中有例子，
      // 对应的在线链接 https://element.eleme.io/#/zh-CN/theme/preview 中，可以检查元素看看效果。
      arrow.setAttribute("x-arrow", "");
      arrow.className = "popper__arrow";
      element.appendChild(arrow);
    },
  },

  beforeDestroy() {
    this.doDestroy(true);
    if (this.popperElm && this.popperElm.parentNode === document.body) {
      this.popperElm.removeEventListener("click", stop);
      document.body.removeChild(this.popperElm);
    }
  },

  // vue的生命周期，被 keep-alive 缓存的组件失活时调用。
  // https://v2.cn.vuejs.org/v2/api/index.html#deactivated
  deactivated() {
    this.$options.beforeDestroy[0].call(this);
  },
};
