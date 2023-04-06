import Popper from "element-ui/src/utils/vue-popper";
import debounce from "throttle-debounce/debounce";
import { addClass, removeClass, on, off } from "element-ui/src/utils/dom";
import { generateId } from "element-ui/src/utils/util";
import Vue from "vue";

export default {
  name: "ElTooltip",

  mixins: [Popper],

  props: {
    openDelay: {
      type: Number,
      default: 0,
    },
    disabled: Boolean,
    manual: Boolean, // 手动控制模式，设置为 true 后，mouseenter 和 mouseleave 事件将不会生效
    effect: {
      // 主题
      type: String,
      default: "dark",
    },
    arrowOffset: {
      // 后来的版本取消该配置了，
      type: Number,
      default: 0,
    },
    popperClass: String,
    content: String,
    visibleArrow: {
      // 是否显示 Tooltip 箭头
      default: true,
    },
    transition: {
      type: String,
      default: "el-fade-in-linear",
    },
    popperOptions: {
      default() {
        return {
          boundariesPadding: 10, // 用于定义边界和 popper 之间的最小距离的像素数量
          gpuAcceleration: false,
        };
      },
    },
    enterable: {
      // 鼠标是否可进入到 tooltip 中（鼠标进入后是否关闭 tooltip）
      type: Boolean,
      default: true,
    },
    hideAfter: {
      // Tooltip 出现后自动隐藏延时，单位毫秒，为 0 则不会自动隐藏
      type: Number,
      default: 0,
    },
    tabindex: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      tooltipId: `el-tooltip-${generateId()}`,
      timeoutPending: null,
      focusing: false, // class 类名
    };
  },
  beforeCreate() {
    if (this.$isServer) return;

    // 参考 https://v2.cn.vuejs.org/v2/api/#vm-mount
    // 不设置 el 属性，并且 $mount() 也没有指定 DOM 元素，则在文档之外渲染并且随后挂载，
    // 比如 document.getElementById('app').appendChild(this.popperVM.$el)
    // 最终会把这个创建的这个 popper 在 vue-popper 中添加到 body 上。
    this.popperVM = new Vue({
      data: { node: "" },
      render(h) {
        return this.node;
      },
    }).$mount();

    this.debounceClose = debounce(200, () => this.handleClosePopper());
  },

  render(h) {
    if (this.popperVM) {
      this.popperVM.node = (
        <transition name={this.transition} onAfterLeave={this.doDestroy}>
          <div
            onMouseleave={() => {
              this.setExpectedState(false);
              this.debounceClose();
            }}
            onMouseenter={() => {
              this.setExpectedState(true);
            }}
            ref="popper"
            role="tooltip"
            id={this.tooltipId}
            aria-hidden={this.disabled || !this.showPopper ? "true" : "false"}
            v-show={!this.disabled && this.showPopper}
            class={[
              "el-tooltip__popper",
              "is-" + this.effect,
              this.popperClass,
            ]}
          >
            {this.$slots.content || this.content}
          </div>
        </transition>
      );
    }

    const firstElement = this.getFirstElement();
    if (!firstElement) return null;

    const data = (firstElement.data = firstElement.data || {});
    // 元素的 class（string）
    data.staticClass = this.addTooltipClass(data.staticClass);

    return firstElement;
  },

  mounted() {
    // 注意，this.$el 是指 render 返回的 VNode，也就是 <el-tooltip><button></button></el-tooltip> 中的button
    // 而且必须是元素节点。否则不展示。
    this.referenceElm = this.$el;
    if (this.$el.nodeType === 1) {
      this.$el.setAttribute("aria-describedby", this.tooltipId);
      this.$el.setAttribute("tabindex", this.tabindex);
      on(this.referenceElm, "mouseenter", this.show);
      on(this.referenceElm, "mouseleave", this.hide);
      on(this.referenceElm, "focus", () => {
        // this.$slots.default 不就是 firstElement，也就是 this.referenceElm，那下面这个语句应该不会执行吧。
        if (!this.$slots.default || !this.$slots.default.length) {
          this.handleFocus();
          return;
        }
        // 当 <el-tooltip>...</el-tooltip>包裹的是组件时，就变成判断该组件实例是否聚焦了。
        const instance = this.$slots.default[0].componentInstance;
        if (instance && instance.focus) {
          instance.focus();
        } else {
          this.handleFocus();
        }
      });
      on(this.referenceElm, "blur", this.handleBlur);
      on(this.referenceElm, "click", this.removeFocusing);
    }
    // fix issue https://github.com/ElemeFE/element/issues/14424
    // issue 的表现: 如果直接设置 value = true，但 tooltip 一开始不显示的问题。
    if (this.value && this.popperVM) {
      this.popperVM.$nextTick(() => {
        if (this.value) {
          this.updatePopper();
        }
      });
    }
  },
  watch: {
    focusing(val) {
      if (val) {
        addClass(this.referenceElm, "focusing");
      } else {
        removeClass(this.referenceElm, "focusing");
      }
    },
  },
  methods: {
    show() {
      this.setExpectedState(true);
      this.handleShowPopper();
    },

    hide() {
      this.setExpectedState(false);
      this.debounceClose();
    },
    // 聚焦展示，失焦关闭
    handleFocus() {
      this.focusing = true;
      this.show();
    },
    handleBlur() {
      this.focusing = false;
      this.hide();
    },
    removeFocusing() {
      this.focusing = false;
    },

    // 可以看到，el-tooltip 这个类名是加到 referenceElm 上的。
    // popper 上的类名是 el-tooltip__popper
    addTooltipClass(prev) {
      if (!prev) {
        return "el-tooltip";
      } else {
        return "el-tooltip " + prev.replace("el-tooltip", "");
      }
    },

    handleShowPopper() {
      if (!this.expectedState || this.manual) return;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.showPopper = true;
      }, this.openDelay);

      if (this.hideAfter > 0) {
        this.timeoutPending = setTimeout(() => {
          this.showPopper = false;
        }, this.hideAfter);
      }
    },

    handleClosePopper() {
      if ((this.enterable && this.expectedState) || this.manual) return;
      clearTimeout(this.timeout);

      if (this.timeoutPending) {
        clearTimeout(this.timeoutPending);
      }
      this.showPopper = false;

      if (this.disabled) {
        this.doDestroy();
      }
    },

    setExpectedState(expectedState) {
      if (expectedState === false) {
        clearTimeout(this.timeoutPending);
      }
      this.expectedState = expectedState;
    },

    getFirstElement() {
      const slots = this.$slots.default;
      if (!Array.isArray(slots)) return null;
      let element = null;
      for (let index = 0; index < slots.length; index++) {
        if (slots[index] && slots[index].tag) {
          element = slots[index];
          break;
        }
      }
      return element;
    },
  },

  beforeDestroy() {
    this.popperVM && this.popperVM.$destroy();
  },

  destroyed() {
    const reference = this.referenceElm;
    if (reference.nodeType === 1) {
      off(reference, "mouseenter", this.show);
      off(reference, "mouseleave", this.hide);
      off(reference, "focus", this.handleFocus);
      off(reference, "blur", this.handleBlur);
      off(reference, "click", this.removeFocusing);
    }
  },
};
