import{q as e,g as n,l as a,K as t,j as o}from"./common-1984dd55.js";const r='{"title":"【源码第二期】Vue3-20个工具函数","frontmatter":{"date":"2021-11-04","title":"【源码第二期】Vue3-20个工具函数","tags":["源码"],"describe":"浅析 Vue3-20个工具函数"},"headers":[{"level":3,"title":"1.可以收获什么?","slug":"_1-可以收获什么"},{"level":3,"title":"2.开始调试","slug":"_2-开始调试"},{"level":3,"title":"3. 工具🔧函数","slug":"_3-工具🔧函数"},{"level":3,"title":"4.总结","slug":"_4-总结"}],"relativePath":"docs/soundCode/vue20tools.md","lastUpdated":1646063815125.8818}';var s={};const i=t('<blockquote><p>第二期源码阅读活动</p><p>咕咕了一星期的文档</p><p>依旧很感谢若川大哥组织的源码阅读活动，以下为原文：<a href="https://juejin.cn/post/6994976281053888519" target="_blank" rel="noopener noreferrer">https://juejin.cn/post/6994976281053888519</a></p></blockquote><h3 id="_1-可以收获什么"><a class="header-anchor" href="#_1-可以收获什么" aria-hidden="true">#</a> 1.可以收获什么?</h3><p>本次阅读的是Vue3源码中的一小部分内容—— <em><strong>工具函数</strong></em>。一共20个，虽然看起来十分简单，但却可以学到</p><ul><li>通过build获得一份ts转js的文档</li><li>通过生成SourceMap，在浏览器中调试代码</li></ul>',4),l=t('<ul><li>非常基础但很有用的数据类型属性使用方法（尤其是Object）</li></ul><p>在开始前，需要准备：</p><ul><li>目标代码库：<code>https://github.com/vuejs/vue-next</code></li><li>也许会需要用到的翻译插件（彩云小译），翻译出来的效果如下图</li></ul><h3 id="_2-开始调试"><a class="header-anchor" href="#_2-开始调试" aria-hidden="true">#</a> 2.开始调试</h3><p>首先可以在<code>contributing.md</code>中找到如何参与项目的开发、调试，了解当前项目的目录结构等详细的前期准备操作。</p><h4 id="_2-1-安装依赖，打包构建"><a class="header-anchor" href="#_2-1-安装依赖，打包构建" aria-hidden="true">#</a> 2.1 安装依赖，打包构建</h4><p>正常情况下，我们可以直接在目录<code>packages/shared/src/index</code>中找到我们需要阅读的ts版本的源码文件。</p><p>但为了方便阅读，也可以通过<code>yarn build</code>进行打包构建，在完成打包构建后，会在<code>packages/shared/dist/</code>中发现以下三个文件：</p><p><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7196d7ad3794403a88588bc081895a68~tplv-k3u1fbpfcp-zoom-1.image" alt=""></p><p>他们都是打包产物：唯一的区别在于<code>cjs、esm</code>的区别：</p><ul><li><code>cjs</code>是通过require方式加载读取依赖，并且只能在Node中运行，不可在浏览器中运行</li><li><code>esm</code>是用过import方式加载读取依赖，浏览器和Node都可以读取并加载。</li></ul><h4 id="_2-2-生成sourcemap调试源码"><a class="header-anchor" href="#_2-2-生成sourcemap调试源码" aria-hidden="true">#</a> 2.2 生成SourceMap调试源码</h4><p>这步实现起来较为简单，只需要在<code>package.json</code> 下的scripts对象中dev声明后追加 <code>--scourcemap</code>即可生成，生成的地址会在控制台中输出：</p><p><img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04ecefe5735d419796e2c76d865efe14~tplv-k3u1fbpfcp-zoom-1.image" alt=""></p><p>此时随便找一个页面将该文件引入，启动服务之后即可在控制台中进行打点阅读源码的操作。</p><h3 id="_3-工具🔧函数"><a class="header-anchor" href="#_3-工具🔧函数" aria-hidden="true">#</a> 3. 工具🔧函数</h3><p>本次阅读的重头戏工具函数源码部分。</p><p>这次选择阅读ts版本，想通过阅读这部分的源码加深ts的认识。</p><p>开干！</p><h4 id="_3-1-babelparserdefaultplugins-babel默认插件"><a class="header-anchor" href="#_3-1-babelparserdefaultplugins-babel默认插件" aria-hidden="true">#</a> 3.1 babelParserDefaultPlugins babel默认插件</h4><div class="language-"><pre><code>/**\n * List of @babel/parser plugins that are used for template expression\n * transforms and SFC script transforms. By default we enable proposals slated\n * for ES2020. This will need to be updated as the spec moves forward.\n * Full list at https://babeljs.io/docs/en/next/babel-parser#plugins\n */\n/*\n*用于模板表达式的@babel/parser插件列表转换和SFC脚本转换\n*/\nexport const babelParserDefaultPlugins = [\n  &#39;bigInt&#39;,\n  &#39;optionalChaining&#39;,\n  &#39;nullishCoalescingOperator&#39;\n] as const\n</code></pre></div><p>这部分的<code>as const</code>是const断言，作用跟接下来会常出现的<code>readonly</code>功能类似，只不过这样使用时可以创建一个完整的readonly对象（会为对象中的每一个属性前都加上readonly），具体文章可以参考<a href="https://segmentfault.com/a/1190000019239979?utm_source=tag-newest" target="_blank" rel="noopener noreferrer">const断言</a>。</p><h4 id="_3-2-empty-obj-空对象-empty-arr-空数组-noop-空函数-no-永远返回-false-的函数"><a class="header-anchor" href="#_3-2-empty-obj-空对象-empty-arr-空数组-noop-空函数-no-永远返回-false-的函数" aria-hidden="true">#</a> 3.2 EMPTY_OBJ 空对象 EMPTY_ARR 空数组 NOOP 空函数 NO 永远返回 false 的函数</h4><div class="language-"><pre><code>export const EMPTY_OBJ: { readonly [key: string]: any } = __DEV__\n  ? Object.freeze({})\n  : {}\n\n\nexport const EMPTY_ARR = __DEV__ ? Object.freeze([]) : []\n\n\n\nexport const NOOP = () =&gt; {}\n\n/**\n * Always return false.\n */\nexport const NO = () =&gt; false\n</code></pre></div><p>这四部分声明都比较简单和短小</p><p>首先空对象和空数组会在操作前判断当前所处的环境，是开发环境还是生产环境。</p><p><code>Object.freeze</code>是一个冻结对象的操作，被冻结的对象无法被修改或添加新属性。</p><p>空函数则是使用该属性时相当于使用了一个空的函数，可以用在判断或return</p><p>永远返回false，顾名思义了</p><h4 id="_3-3-ison-判断字符串是否以on开头，且on后首字母为大写字母"><a class="header-anchor" href="#_3-3-ison-判断字符串是否以on开头，且on后首字母为大写字母" aria-hidden="true">#</a> 3.3 isOn 判断字符串是否以on开头，且on后首字母为大写字母</h4><div class="language-"><pre><code>const onRE = /^on[^a-z]/\nexport const isOn = (key: string) =&gt; onRE.test(key)\n\n// ex\nisOn(&#39;onClick&#39;) // true\nisOn(&#39;onclick&#39;) // false\n</code></pre></div><p>这部分涉及到简单的正则表达式：</p><ul><li><code>^</code>符号在开头，表示为以什么东西开头，在其他地方是指非。同时<code>$</code>在结尾时，表示以什么东西结尾。</li><li><code>[^a-z]</code>就为不是a-z的小写字母</li></ul><h4 id="_3-4-ismodellistener-监听器"><a class="header-anchor" href="#_3-4-ismodellistener-监听器" aria-hidden="true">#</a> 3.4 isModelListener 监听器</h4><div class="language-"><pre><code>export const isModelListener = (key: string) =&gt; key.startsWith(&#39;onUpdate:&#39;)\n</code></pre></div><p>这个方法为判断字符串是否以<code>onUpdate:</code>为开头</p><p><code>.startsWith</code>为ES6新增方法</p><h4 id="_3-5-extend-合并"><a class="header-anchor" href="#_3-5-extend-合并" aria-hidden="true">#</a> 3.5 extend 合并</h4><div class="language-"><pre><code>export const extend = Object.assign\n</code></pre></div><p>其实只是对对象合并的方法进行了一个封装</p><h4 id="_3-6-remove-去除"><a class="header-anchor" href="#_3-6-remove-去除" aria-hidden="true">#</a> 3.6 remove 去除</h4><div class="language-"><pre><code>export const remove = &lt;T&gt;(arr: T[], el: T) =&gt; {\n  const i = arr.indexOf(el)\n  if (i &gt; -1) {\n    arr.splice(i, 1)\n  }\n}\n</code></pre></div><p>传入一个数组和一个元素，判断该元素是否存在数组中，若存在，则删除</p><p>Tips: 使用splice虽然可以很方便的进行数组元素的删除，但删除后会将其他的元素位置进行移动，若要处理很庞大的数组项目时，则会造成性能的大量消耗。因此在这部分可以考虑将移除改为置为<code>NULL</code></p><h4 id="_3-7-hasown-判断是否为本身所拥有的属性"><a class="header-anchor" href="#_3-7-hasown-判断是否为本身所拥有的属性" aria-hidden="true">#</a> 3.7 hasOwn 判断是否为本身所拥有的属性</h4><div class="language-"><pre><code>const hasOwnProperty = Object.prototype.hasOwnProperty\nexport const hasOwn = (\n  val: object,\n  key: string | symbol\n): key is keyof typeof val =&gt; hasOwnProperty.call(val, key)\n</code></pre></div><p>通过对象自带的<code>hasOwnProperty</code> API判断当前传入的key是否为obj本身的属性</p><p>这部分当中还涉及到我不认识的ts语法 <code>is keyof typeof</code></p><p>通过参考同组的纪年小姐姐文档后，发现这是三个ts语法<code>is</code>、<code>keyof</code>、<code>typeof</code>，万能的百度告诉我：</p><ul><li>is: 类型保护，可以通过is进一步缩小变量的类型</li><li>keyof: 返回一个类型的所有key组成的联合类型</li></ul>',50),c=t('<ul><li>typeof: 获取一个变量或者对象的类型</li></ul><h4 id="_3-8-is…-判断是否为某种类型"><a class="header-anchor" href="#_3-8-is…-判断是否为某种类型" aria-hidden="true">#</a> 3.8 is… 判断是否为某种类型</h4><div class="language-"><pre><code>// 判断是否为数组\nexport const isArray = Array.isArray\n\n// 判断是否为Map对象\nexport const isMap = (val: unknown): val is Map&lt;any, any&gt; =&gt;\n  toTypeString(val) === &#39;[object Map]&#39;\n\n// 判断是否为Set对象 \nexport const isSet = (val: unknown): val is Set&lt;any&gt; =&gt;\n  toTypeString(val) === &#39;[object Set]&#39;\n\n// 判断是否为Date对象\nexport const isDate = (val: unknown): val is Date =&gt; val instanceof Date\n\n// 判断是否为函数\nexport const isFunction = (val: unknown): val is Function =&gt;\n  typeof val === &#39;function&#39;\n\n// 判断是否为字符串\nexport const isString = (val: unknown): val is string =&gt; typeof val === &#39;string&#39;\n\n// 判断是否为Symbol\nexport const isSymbol = (val: unknown): val is symbol =&gt; typeof val === &#39;symbol&#39;\n\n// 判断是否为对象(不包括null)\nexport const isObject = (val: unknown): val is Record&lt;any, any&gt; =&gt;\n  val !== null &amp;&amp; typeof val === &#39;object&#39;\n\n// 判断是否为Promise\nexport const isPromise = &lt;T = any&gt;(val: unknown): val is Promise&lt;T&gt; =&gt; {\n  return isObject(val) &amp;&amp; isFunction(val.then) &amp;&amp; isFunction(val.catch)\n}\n</code></pre></div><h4 id="_3-9-totypestring-对象转字符串，以及附带的判断函数"><a class="header-anchor" href="#_3-9-totypestring-对象转字符串，以及附带的判断函数" aria-hidden="true">#</a> 3.9 toTypeString 对象转字符串，以及附带的判断函数</h4><div class="language-"><pre><code>// 对象转字符串\nexport const objectToString = Object.prototype.toString\nexport const toTypeString = (value: unknown): string =&gt;\n  objectToString.call(value)\n\n// 对象转字符串并截取第八位开始到最后一位\n//这个函数的作用为可以判断更多的类型种类\nexport const toRawType = (value: unknown): string =&gt; {\n  // extract &quot;RawType&quot; from strings like &quot;[object RawType]&quot;\n  return toTypeString(value).slice(8, -1)\n}\n\n// 判断是否为纯纯的对象\nexport const isPlainObject = (val: unknown): val is object =&gt;\n  toTypeString(val) === &#39;[object Object]&#39;\n</code></pre></div><h4 id="_3-10-isintegerkey-判断是否为数字型的字符串key"><a class="header-anchor" href="#_3-10-isintegerkey-判断是否为数字型的字符串key" aria-hidden="true">#</a> 3.10 isIntegerKey 判断是否为数字型的字符串key</h4><div class="language-"><pre><code>export const isIntegerKey = (key: unknown) =&gt;\n  isString(key) &amp;&amp;\n  key !== &#39;NaN&#39; &amp;&amp;\n  key[0] !== &#39;-&#39; &amp;&amp;\n  &#39;&#39; + parseInt(key, 10) === key\n</code></pre></div><p>首先判断key是否为字符串类型，接着排除key不为NaN值，继续排除负值，最后将key通过parseInt方式转换为数字并与通过+隐式转换为字符串，最后与原本的key做对比</p><h4 id="_3-11-判断是否为保留属性"><a class="header-anchor" href="#_3-11-判断是否为保留属性" aria-hidden="true">#</a> 3.11 判断是否为保留属性</h4><div class="language-"><pre><code>/**\n * Make a map and return a function for checking if a key\n * is in that map.\n * IMPORTANT: all calls of this function must be prefixed with\n * /*#__PURE__*/\n * So that rollup can tree-shake them if necessary.\n */\nexport function makeMap(\n  str: string,\n  expectsLowerCase?: boolean\n): (key: string) =&gt; boolean {\n  const map: Record&lt;string, boolean&gt; = Object.create(null)\n  const list: Array&lt;string&gt; = str.split(&#39;,&#39;)\n  for (let i = 0; i &lt; list.length; i++) {\n    map[list[i]] = true\n  }\n  return expectsLowerCase ? val =&gt; !!map[val.toLowerCase()] : val =&gt; !!map[val]\n\n\nexport const isReservedProp = /*#__PURE__*/ makeMap(\n  // the leading comma is intentional so empty string &quot;&quot; is also included\n  &#39;,key,ref,&#39; +\n    &#39;onVnodeBeforeMount,onVnodeMounted,&#39; +\n    &#39;onVnodeBeforeUpdate,onVnodeUpdated,&#39; +\n    &#39;onVnodeBeforeUnmount,onVnodeUnmounted&#39;\n)\n</code></pre></div><p>这里的操作逻辑为，传入一个以逗号分隔的字符串，通过makeMap函数将字符串转化为数组，创建一个空对象，并且循环将这个key赋值进空对象中，最后返回一个包含参数val的值，检查参数val是否存在在字符串中</p><h4 id="_3-12-cachestringfunction-缓存字符串函数"><a class="header-anchor" href="#_3-12-cachestringfunction-缓存字符串函数" aria-hidden="true">#</a> 3.12 cacheStringFunction 缓存字符串函数</h4><div class="language-"><pre><code>// 缓存的主函数，实现效果与makeMap类似\nconst cacheStringFunction = &lt;T extends (str: string) =&gt; string&gt;(fn: T): T =&gt; {\n  const cache: Record&lt;string, string&gt; = Object.create(null)\n  return ((str: string) =&gt; {\n    const hit = cache[str]\n    return hit || (cache[str] = fn(str))\n  }) as any\n}\n\n// 连字符 - 转换为小驼峰 \nconst camelizeRE = /-(\\w)/g\n/**\n * @private\n */\nexport const camelize = cacheStringFunction((str: string): string =&gt; {\n  return str.replace(camelizeRE, (_, c) =&gt; (c ? c.toUpperCase() : &#39;&#39;))\n})\n\n// 大写字母转化为 - 连字符\nconst hyphenateRE = /\\B([A-Z])/g\n/**\n * @private\n */\nexport const hyphenate = cacheStringFunction((str: string) =&gt;\n  str.replace(hyphenateRE, &#39;-$1&#39;).toLowerCase()\n)\n\n\n// 首字母转大写\n/**\n * @private\n */\nexport const capitalize = cacheStringFunction(\n  (str: string) =&gt; str.charAt(0).toUpperCase() + str.slice(1)\n)\n\n// 给输入的字符串前加入on，并将输入的第一个字符串改为大写\n/**\n * @private\n */\nexport const toHandlerKey = cacheStringFunction((str: string) =&gt;\n  str ? `on${capitalize(str)}` : ``\n)\n</code></pre></div><h4 id="_3-14-haschanged-判断是否有变化"><a class="header-anchor" href="#_3-14-haschanged-判断是否有变化" aria-hidden="true">#</a> 3.14 hasChanged 判断是否有变化</h4><div class="language-"><pre><code>// compare whether a value has changed, accounting for NaN.\nexport const hasChanged = (value: any, oldValue: any): boolean =&gt;\n  !Object.is(value, oldValue)\n</code></pre></div><p><a href="http://Object.is" target="_blank" rel="noopener noreferrer">Object.is</a> 为输入两个值，返回这两个值是否为同一个值的</p><h4 id="_3-15-invokearrayfns-执行数组中的函数"><a class="header-anchor" href="#_3-15-invokearrayfns-执行数组中的函数" aria-hidden="true">#</a> 3.15 invokeArrayFns 执行数组中的函数</h4><div class="language-"><pre><code>export const invokeArrayFns = (fns: Function[], arg?: any) =&gt; {\n  for (let i = 0; i &lt; fns.length; i++) {\n    fns[i](arg)\n  }\n}\n</code></pre></div><p>可以实现一次执行多个函数的操作</p><h4 id="_3-16-def-定义一个不可枚举的对象"><a class="header-anchor" href="#_3-16-def-定义一个不可枚举的对象" aria-hidden="true">#</a> 3.16 def 定义一个不可枚举的对象</h4><div class="language-"><pre><code>export const def = (obj: object, key: string | symbol, value: any) =&gt; {\n  Object.defineProperty(obj, key, {\n    configurable: true,\n    enumerable: false,\n    value\n  })\n}\n</code></pre></div><h4 id="_3-17-tonumber-转换为数字"><a class="header-anchor" href="#_3-17-tonumber-转换为数字" aria-hidden="true">#</a> 3.17 toNumber 转换为数字</h4><div class="language-"><pre><code>export const toNumber = (val: any): any =&gt; {\n  const n = parseFloat(val)\n  return isNaN(n) ? val : n\n}\n</code></pre></div><h4 id="_3-18-getglobalthis-全局对象"><a class="header-anchor" href="#_3-18-getglobalthis-全局对象" aria-hidden="true">#</a> 3.18 getGlobalThis 全局对象</h4><div class="language-"><pre><code>let _globalThis: any\nexport const getGlobalThis = (): any =&gt; {\n  return (\n    _globalThis ||\n    (_globalThis =\n      typeof globalThis !== &#39;undefined&#39;\n        ? globalThis\n        : typeof self !== &#39;undefined&#39;\n        ? self\n        : typeof window !== &#39;undefined&#39;\n        ? window\n        : typeof global !== &#39;undefined&#39;\n        ? global\n        : {})\n  )\n}\n</code></pre></div><p>简单来说就是根据不同的环境，采用不同的参数指向全局<code>this</code></p><p>大佬的解释：</p><p>获取全局 this 指向。</p><p>初次执行肯定是 _globalThis 是 undefined。所以会执行后面的赋值语句。</p><p>如果存在 globalThis 就用 globalThis。<a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis" target="_blank" rel="noopener noreferrer">MDN globalThis</a></p><p>如果存在self，就用self。在 Web Worker 中不能访问到 window 对象，但是我们却能通过 self 访问到 Worker 环境中的全局对象。</p><p>如果存在window，就用window。</p><p>如果存在global，就用global。Node环境下，使用global。</p><p>如果都不存在，使用空对象。可能是微信小程序环境下。</p><p>下次执行就直接返回 _globalThis，不需要第二次继续判断了。这种写法值得我们学习。</p><h3 id="_4-总结"><a class="header-anchor" href="#_4-总结" aria-hidden="true">#</a> 4.总结</h3><ul><li>通过这些工具函数，对vue的模板语法解析有了一点点点的了解</li><li>工具函数除了达到满足开发需求、提升开发效率外，还可以达到优化性能的目的</li></ul>',37),d=o("ul",null,[o("li",null,"学习到了没了解过的TS语法，以及对象的语法")],-1);s.render=function(t,o,r,s,p,h){return e(),n("div",null,[i,a(""),l,a(""),c,a(""),d])};export{r as __pageData,s as default};
