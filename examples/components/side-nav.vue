<style lang="scss">
  .side-nav {
    width: 100%;
    box-sizing: border-box;
    padding-right: 30px;
    transition: opacity .3s;
    &.is-fade {
      transition: opacity 3s;
    }

    li {
      list-style: none;
    }

    ul {
      padding: 0;
      margin: 0;
      overflow: hidden;
    }
    
    > ul > .nav-item > a {
      margin-top: 15px;
    }

    > ul > .nav-item:nth-child(-n + 4) > a {
      margin-top: 0;
    }

    .nav-item {
      a {
        font-size: 16px;
        color: #333;
        line-height: 40px;
        height: 40px;
        margin: 0;
        padding: 0;
        text-decoration: none;
        display: block;
        position: relative;
        transition: .15s ease-out;
        font-weight: bold;

        &.active {
          color: #409EFF;
        }
      }

      .nav-item {
        a {
          display: block;
          height: 40px;
          color: #444;
          line-height: 40px;
          font-size: 14px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: normal;

          &:hover,
          &.active {
            color: #409EFF;
          }
        }
      }
  
      // v2.14.1 版本之前，侧边栏顶部有个赞助图标。
      &.sponsors {
        & > .sub-nav {
          margin-top: -10px;
        }
        
        & > a {
          color: #777;
          font-weight: 300;
          font-size: 14px;
        }
        
        .nav-item {
          display: inline-block;
        
          a {
            height: auto;
            display: inline-block;
            vertical-align: middle;
            margin: 8px 12px 12px 0;

            img {
              width: 42px;
            }
          }

          &:first-child a img {
            width: 36px;
          }
        }
      }
    }

    .nav-group__title {
      font-size: 12px;
      color: #999;
      line-height: 26px;
      margin-top: 15px;
    }

    #code-sponsor-widget {
      margin: 0 0 0 -20px;
    }
  }
  .nav-dropdown-list {
    width: 120px;
    margin-top: -8px;
    li {
      font-size: 14px;
    }
  }
</style>
<template>
  <div
    class="side-nav"
    @mouseenter="isFade = false"
    :class="{ 'is-fade': isFade }"
    :style="navStyle">
    <ul>
      <li
        class="nav-item"
        v-for="(item, key) in data"
        :key="key">
        <!-- 组件和开发指南，这2个1级菜单 -->
        <a v-if="!item.path && !item.href" @click="expandMenu">{{item.name}}</a>
        <!-- Element React 和 Element Angular 外链-->
        <a v-if="item.href" :href="item.href" target="_blank">{{item.name}}</a>
        <!-- 更新日志内链 -->
        <router-link
          v-if="item.path"
          active-class="active"
          :to="base + item.path"
          exact
          v-text="item.title || item.name">
        </router-link>
        <!-- 开发指南下的2级菜单 -->
        <ul class="pure-menu-list sub-nav" v-if="item.children">
          <li
            class="nav-item"
            v-for="(navItem, key) in item.children"
            :key="key">
            <router-link
              class=""
              active-class="active"
              :to="base + navItem.path"
              exact
              v-text="navItem.title || navItem.name">
            </router-link>
          </li>
        </ul>
        <!-- 组件下的3级菜单，对应具体组件。 -->
        <template v-if="item.groups">
          <div
            class="nav-group"
            v-for="(group, key) in item.groups"
            :key="key"
            >
            <div class="nav-group__title" @click="expandMenu">{{group.groupName}}</div>
            <ul class="pure-menu-list">
              <li
                class="nav-item"
                v-for="(navItem, key) in group.list"
                v-show="!navItem.disabled"
                :key="key">
                <router-link
                  active-class="active"
                  :to="base + navItem.path"
                  exact
                  v-text="navItem.title"></router-link>
              </li>
            </ul>
          </div>
        </template>
      </li>
    </ul>
    <!--<div id="code-sponsor-widget"></div>-->
  </div>
</template>
<script>
  import bus from '../bus';
  import compoLang from '../i18n/component.json';

  export default {
    props: {
      data: Array,
      base: {
        type: String,
        default: '' // /zh-CN/component
      }
    },
    data() {
      return {
        highlights: [], // 未用到。
        navState: [], // 未用到。
        isSmallScreen: false,
        isFade: false
      };
    },
    watch: {
      '$route.path'() {
        this.handlePathChange();
      },
      isFade(val) {
        bus.$emit('navFade', val);
      }
    },
    computed: {
      navStyle() {
        const style = {};
        if (this.isSmallScreen) {
          style.paddingBottom = '60px';
        }
        style.opacity = this.isFade ? '0.5' : '1';
        return style;
      },
      lang() {
        return this.$route.meta.lang;
      },
      langConfig() {
        return compoLang.filter(config => config.lang === this.lang)[0]['nav'];
      }
    },
    methods: {
      handleResize() {
        this.isSmallScreen = document.documentElement.clientWidth < 768;
        this.handlePathChange();
      },
      /* 
        menu 相关的，都是组件相关的List
        组件
        basic
        Layout 布局
        ...
        From
        Radio 单选框
        ...
        
        隐藏和展示menu，目标都是三级菜单。
      */
      handlePathChange() {
        if (!this.isSmallScreen) {
          this.expandAllMenu();
          return;
        }
        this.$nextTick(() => {
          this.hideAllMenu();
          // 当前选中的tab
          let activeAnchor = this.$el.querySelector('a.active');
          let ul = activeAnchor.parentNode;
          // ul > li > a，所以得逐级向上查询。
          while (ul.tagName !== 'UL') {
            ul = ul.parentNode;
          }
          ul.style.height = 'auto';
        });
      },
      hideAllMenu() {
        // Nodelist 现已支持 forEach
        this.$el.querySelectorAll('.pure-menu-list').forEach(ul => {
          ul.style.height = '0';
        });
        // [].forEach.call(this.$el.querySelectorAll('.pure-menu-list'), ul => {
        //   ul.style.height = '0';
        // });
      },
      expandAllMenu() {
        [].forEach.call(this.$el.querySelectorAll('.pure-menu-list'), ul => {
          ul.style.height = 'auto';
        });
      },
      /* 
        展开当前的 menu
        div
          div // currentTarget
          ul // 要展开的 menu
      */
      expandMenu(event) {
        if (!this.isSmallScreen) return;
        let target = event.currentTarget;
        if (!target.nextElementSibling || target.nextElementSibling.tagName !== 'UL') return; // 过滤掉组件这个一级菜单
        this.hideAllMenu();
        event.currentTarget.nextElementSibling.style.height = 'auto';
      }
    },
    created() {
      /* 
        整体思路，examples/pages/template/component.tpl 下面简写 component.tpl
        1，在当前组件的 watch 中触发 navFade 事件，该事件在 component.tpl 的 created 监听
        3，在滚动侧边栏时，在 component.tpl 中触发 fadeNav 事件，该事件在下面监听。

        最终想实现的效果：在选中某组件后，滚动组件页面右侧内容时侧边栏 opacity = 0.5。当再次选择组件时，侧边栏opacity = 1
      */
      bus.$on('fadeNav', () => {
        this.isFade = true;
      });
    },
    mounted() {
      this.handleResize();
      window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
    }
  };
</script>
